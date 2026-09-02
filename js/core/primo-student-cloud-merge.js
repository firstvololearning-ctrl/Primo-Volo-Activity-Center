"use strict";

(function initializePrimoStudentCloudMerge(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PrimoVoloStudentCloudMerge = Object.freeze(api);
})(typeof window !== "undefined" ? window : globalThis, function createMergeHelpers() {
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const array = value => Array.isArray(value) ? value : [];
  const timestamp = value => Number.isFinite(Date.parse(value || "")) ? value : null;
  const latestTimestamp = (...values) => values.filter(timestamp).sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;
  const stableValue = value => Array.isArray(value)
    ? value.map(stableValue)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]))
      : value;
  const stableString = value => JSON.stringify(stableValue(value));
  const same = (left, right) => stableString(left) === stableString(right);
  const unique = values => [...new Set(values.filter(value => typeof value === "string" && value))].sort();

  function canonicalEvent(event) {
    const value = object(event);
    const parsedDate = Date.parse(value.date || "");
    return Object.fromEntries(
      ["eventId", "date", "topic", "activity", "correct", "targetItalian", "targetEnglish"]
        .filter(key => key in value)
        .map(key => [key, key === "date" && Number.isFinite(parsedDate)
          ? new Date(parsedDate).toISOString()
          : value[key]])
    );
  }

  function eventKey(event) {
    const canonical = canonicalEvent(event);
    return canonical.eventId || [canonical.date, canonical.topic, canonical.activity, canonical.correct, canonical.targetItalian, canonical.targetEnglish]
      .map(value => value == null ? "" : String(value)).join("\u001f");
  }

  function mergeEvents(...collections) {
    const byKey = new Map();
    const conflicts = [];
    collections.flatMap(array).forEach(event => {
      const key = eventKey(event);
      if (!key) return;
      if (byKey.has(key) && event?.eventId && !same(canonicalEvent(byKey.get(key)), canonicalEvent(event))) {
        conflicts.push({ eventId: event.eventId });
        return;
      }
      if (!byKey.has(key)) byKey.set(key, clone(event));
    });
    return {
      events: [...byKey.values()]
        .sort((a, b) => (Date.parse(a?.date || "") || 0) - (Date.parse(b?.date || "") || 0))
        .slice(-500),
      conflicts
    };
  }

  function mergeCounter(baseValue, localValue, serverValue) {
    const base = Math.max(0, Number(baseValue) || 0);
    const local = Math.max(0, Number(localValue) || 0);
    const server = Math.max(0, Number(serverValue) || 0);
    return server + Math.max(0, local - base);
  }

  function mergeAggregateMap(baseMap, localMap, serverMap) {
    const result = {};
    const keys = new Set([...Object.keys(object(baseMap)), ...Object.keys(object(localMap)), ...Object.keys(object(serverMap))]);
    keys.forEach(key => {
      const attempts = mergeCounter(baseMap?.[key]?.attempts, localMap?.[key]?.attempts, serverMap?.[key]?.attempts);
      const correct = Math.min(attempts, mergeCounter(baseMap?.[key]?.correct, localMap?.[key]?.correct, serverMap?.[key]?.correct));
      result[key] = { attempts, correct };
    });
    return result;
  }

  function mergeProgress(base, local, server) {
    base = object(base); local = object(local); server = object(server);
    const attempts = mergeCounter(base.attempts, local.attempts, server.attempts);
    const eventMerge = mergeEvents(server.sessions, local.sessions);
    return { data: {
      schemaVersion: 1,
      attempts,
      correct: Math.min(attempts, mergeCounter(base.correct, local.correct, server.correct)),
      byTopic: mergeAggregateMap(base.byTopic, local.byTopic, server.byTopic),
      byActivity: mergeAggregateMap(base.byActivity, local.byActivity, server.byActivity),
      sessions: eventMerge.events
    }, conflicts: eventMerge.conflicts };
  }

  function normalizeMode(mode) {
    return mode === "conversation-choice" || mode === "conversation-write" ? "conversation-practice" : mode;
  }

  function mergePractice(_base, local, server) {
    local = object(local); server = object(server);
    const byTopic = {};
    new Set([...Object.keys(object(local.byTopic)), ...Object.keys(object(server.byTopic))]).forEach(topic => {
      const left = object(local.byTopic?.[topic]);
      const right = object(server.byTopic?.[topic]);
      byTopic[topic] = {
        practiced: unique([...array(right.practiced), ...array(left.practiced)].map(normalizeMode)),
        available: unique([...array(right.available), ...array(left.available)].map(normalizeMode)),
        updatedAt: latestTimestamp(left.updatedAt, right.updatedAt),
        availabilityUpdatedAt: latestTimestamp(left.availabilityUpdatedAt, right.availabilityUpdatedAt)
      };
    });
    return { schemaVersion: 1, version: 1, byTopic };
  }

  function checkId(check) {
    return typeof check?.id === "string" && check.id ? check.id : `legacy:${stableString(check)}`;
  }

  function mergeStartingChecks(_base, local, server) {
    local = object(local); server = object(server);
    const byTopic = {};
    const conflicts = [];
    new Set([...Object.keys(object(local.byTopic)), ...Object.keys(object(server.byTopic))]).forEach(topic => {
      const combined = new Map();
      [...array(server.byTopic?.[topic]?.history), ...array(local.byTopic?.[topic]?.history)].forEach(check => {
        const id = checkId(check);
        if (combined.has(id) && !same(combined.get(id), check)) conflicts.push({ topic, checkId: id });
        else if (!combined.has(id)) combined.set(id, clone(check));
      });
      const history = [...combined.values()]
        .sort((a, b) => (Date.parse(a?.completedAt || a?.startedAt || "") || 0) - (Date.parse(b?.completedAt || b?.startedAt || "") || 0))
        .slice(-10);
      byTopic[topic] = { latest: history[history.length - 1] || null, history };
    });
    return { data: { schemaVersion: 1, version: Math.max(Number(local.version) || 1, Number(server.version) || 1), byTopic }, conflicts };
  }

  function mergeJourney(_base, local, server) {
    local = object(local); server = object(server);
    const exploredTopics = {};
    new Set([...Object.keys(object(local.exploredTopics)), ...Object.keys(object(server.exploredTopics))]).forEach(topic => {
      const left = object(local.exploredTopics?.[topic]);
      const right = object(server.exploredTopics?.[topic]);
      const earnedAt = [left.earnedAt, right.earnedAt].filter(timestamp).sort((a, b) => Date.parse(a) - Date.parse(b))[0] || null;
      const merged = { ...right, ...left };
      if (earnedAt) merged.earnedAt = earnedAt;
      ["practicedCount", "availableCount", "requiredAtAward"].forEach(key => {
        if (key in left || key in right) merged[key] = Math.max(Number(left[key]) || 0, Number(right[key]) || 0);
      });
      exploredTopics[topic] = merged;
    });
    return {
      schemaVersion: 1,
      version: 1,
      exploredTopics,
      celebratedCities: unique([...array(server.celebratedCities), ...array(local.celebratedCities)]),
      migratedPassport: Boolean(local.migratedPassport || server.migratedPassport)
    };
  }

  function mergeStore(storeKey, base, local, server) {
    if (storeKey === "progress") return mergeProgress(base, local, server);
    if (storeKey === "practice") return { data: mergePractice(base, local, server), conflicts: [] };
    if (storeKey === "starting-checks") return mergeStartingChecks(base, local, server);
    if (storeKey === "journey") return { data: mergeJourney(base, local, server), conflicts: [] };
    throw new Error(`Unsupported Primo student cloud store: ${storeKey}`);
  }

  return { eventKey, mergeEvents, mergeStore, sameDocument: same };
});
