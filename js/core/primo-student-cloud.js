"use strict";

(function initializePrimoStudentCloud() {
  if (window.PrimoVoloStudentCloud) return;

  const storage = window.PrimoVoloStorage;
  const merge = window.PrimoVoloStudentCloudMerge;
  const stores = Object.freeze(["progress", "practice", "starting-checks", "journey"]);
  const baseKeys = Object.freeze({
    progress: storage?.keys?.progress,
    practice: storage?.keys?.practice,
    "starting-checks": storage?.keys?.startingChecks,
    journey: storage?.keys?.journey
  });
  const states = new Map(stores.map(storeKey => [storeKey, {
    baseData: null, revision: null, inFlight: false, queued: false, timer: null
  }]));
  let generation = 0;
  let transport = null;

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const array = value => Array.isArray(value) ? value : [];
  const parse = raw => { try { return raw == null ? null : JSON.parse(raw); } catch { return null; } };
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const authorized = () => {
    const access = window.PrimoVoloAccess;
    return Boolean(access?.status === "authorized" && access.mode === "student" &&
      access.user?.is_anonymous === true && access.studentContext?.student_id);
  };
  const localKey = storeKey => storage.studentKey(baseKeys[storeKey]);
  const localData = storeKey => parse(storage.getItem(localKey(storeKey)));
  const writeLocal = (storeKey, data) => storage.setItem(localKey(storeKey), JSON.stringify(data), { source: "student-cloud" });
  const metadataKey = () => `primoVoloStudentCloudBasesV1:product:primo-volo:student:${window.PrimoVoloAccess.studentContext.student_id}`;

  function restoreMetadata() {
    const saved = parse(window.localStorage.getItem(metadataKey())) || {};
    stores.forEach(storeKey => {
      const value = saved[storeKey];
      if (!value || typeof value !== "object") return;
      states.get(storeKey).baseData = clone(value.data);
      states.get(storeKey).revision = value.updated_at || null;
    });
  }

  function persistMetadata() {
    if (!authorized()) return;
    window.localStorage.setItem(metadataKey(), JSON.stringify(Object.fromEntries(
      stores.map(storeKey => {
        const state = states.get(storeKey);
        return [storeKey, { data: state.baseData, updated_at: state.revision }];
      })
    )));
  }

  function sanitizeOutgoing(storeKey, value) {
    if (value == null) return null;
    const data = object(value);
    if (storeKey === "progress") {
      return {
        schemaVersion: 1,
        attempts: data.attempts,
        correct: data.correct,
        byTopic: data.byTopic,
        byActivity: data.byActivity,
        sessions: array(data.sessions).map(event => {
          const clean = {};
          ["date", "topic", "activity", "correct", "eventId", "targetItalian", "targetEnglish"]
            .forEach(key => { if (key in object(event)) clean[key] = event[key]; });
          return clean;
        })
      };
    }
    if (storeKey === "practice") return { schemaVersion: 1, version: data.version, byTopic: data.byTopic };
    if (storeKey === "starting-checks") return { schemaVersion: 1, version: data.version, byTopic: data.byTopic };
    return {
      schemaVersion: 1,
      version: data.version,
      exploredTopics: data.exploredTopics,
      celebratedCities: data.celebratedCities,
      migratedPassport: data.migratedPassport
    };
  }

  function invalidate() {
    generation += 1;
    states.forEach(state => {
      clearTimeout(state.timer);
      state.timer = null;
      state.inFlight = false;
      state.queued = false;
      state.baseData = null;
      state.revision = null;
    });
  }

  function adopt(storeKey, data, revision, writeThrough = true) {
    const state = states.get(storeKey);
    state.baseData = clone(data);
    state.revision = revision || null;
    persistMetadata();
    if (writeThrough && data != null && !same(localData(storeKey), data)) writeLocal(storeKey, data);
  }

  async function readStore(storeKey, activeGeneration) {
    const result = await transport.get(storeKey);
    if (activeGeneration !== generation || !authorized()) return;
    if (!result?.state_exists) {
      states.get(storeKey).baseData = null;
      states.get(storeKey).revision = null;
      if (localData(storeKey) != null) schedule(storeKey, 0);
      return;
    }
    const local = localData(storeKey);
    if (local == null) return adopt(storeKey, result.data, result.updated_at);
    const merged = merge.mergeStore(storeKey, states.get(storeKey).baseData || result.data, local, result.data);
    adopt(storeKey, result.data, result.updated_at, false);
    if (!merged.conflicts.length && !merge.sameDocument(merged.data, result.data)) {
      writeLocal(storeKey, merged.data);
      schedule(storeKey, 0);
    } else if (!merged.conflicts.length) {
      adopt(storeKey, result.data, result.updated_at);
    }
  }

  async function bootstrap() {
    if (!transport || !authorized()) return false;
    restoreMetadata();
    const activeGeneration = ++generation;
    try {
      await Promise.all(stores.map(storeKey => readStore(storeKey, activeGeneration)));
      return activeGeneration === generation;
    } catch (error) {
      console.warn("Primo student cloud read is unavailable; local saving remains active.", error);
      return false;
    }
  }

  function schedule(storeKey, delay = 500) {
    if (!transport || !authorized() || !states.has(storeKey)) return;
    const state = states.get(storeKey);
    state.queued = true;
    clearTimeout(state.timer);
    state.timer = setTimeout(() => flush(storeKey), delay);
  }

  async function flush(storeKey) {
    const state = states.get(storeKey);
    if (!transport || !authorized() || state.inFlight) return;
    const activeGeneration = generation;
    state.inFlight = true;
    state.queued = false;
    try {
      let retries = 0;
      while (retries < 2 && activeGeneration === generation && authorized()) {
        const outgoing = sanitizeOutgoing(storeKey, localData(storeKey));
        if (outgoing == null) return;
        const result = await transport.save(storeKey, outgoing, state.revision, window.crypto.randomUUID());
        if (activeGeneration !== generation || !authorized()) return;
        if (result?.write_applied || result?.already_current) {
          const current = sanitizeOutgoing(storeKey, localData(storeKey));
          const localChangedAfterSubmit = !merge.sameDocument(current, outgoing);
          adopt(storeKey, result.data, result.updated_at, !localChangedAfterSubmit);
          if (localChangedAfterSubmit) state.queued = true;
          return;
        }
        if (!result?.conflict) throw new Error(`Unexpected Primo ${storeKey} save response.`);
        const merged = merge.mergeStore(storeKey, state.baseData, outgoing, result.data);
        adopt(storeKey, result.data, result.updated_at, false);
        if (merged.conflicts.length) {
          console.warn(`Primo ${storeKey} conflict needs review; local evidence was preserved.`, merged.conflicts);
          return;
        }
        writeLocal(storeKey, merged.data);
        retries += 1;
      }
      if (retries >= 2) {
        console.warn(`Primo ${storeKey} remained conflicted after the bounded retry; local evidence was preserved.`);
      }
    } catch (error) {
      console.warn(`Primo student cloud save is unavailable for ${storeKey}; local saving remains active.`, error);
    } finally {
      state.inFlight = false;
      if (state.queued && activeGeneration === generation) schedule(storeKey, 250);
    }
  }

  function onStorageChange(event) {
    const detail = event.detail || {};
    if (detail.source === "student-cloud" || detail.descriptor?.scope !== "student") return;
    if (stores.includes(detail.descriptor?.id)) schedule(detail.descriptor.id);
  }

  function enable(nextTransport) {
    if (!nextTransport?.get || !nextTransport?.save) throw new Error("A narrow Primo student cloud test transport is required.");
    transport = nextTransport;
    return bootstrap();
  }

  function enableForLocalQa(nextTransport) {
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      throw new Error("Primo student cloud QA can only be enabled on a local preview.");
    }
    return enable(nextTransport);
  }

  window.addEventListener("primo-volo-storage-change", onStorageChange);
  const ready = window.PrimoVoloStudentCloudAutoEnable === true
    ? enable(window.PrimoVoloStudentCloudRpc)
    : Promise.resolve(false);
  window.PrimoVoloStudentCloud = Object.freeze({
    stores,
    ready,
    bootstrap,
    invalidate,
    enableForLocalQa: nextTransport => enableForLocalQa(nextTransport || window.PrimoVoloStudentCloudRpc),
    getStatus: () => ({ enabled: Boolean(transport), authorized: authorized(), generation,
      stores: Object.fromEntries([...states].map(([key, value]) => [key, {
        revision: value.revision, hasBase: value.baseData != null, inFlight: value.inFlight, queued: value.queued
      }])) })
  });
})();
