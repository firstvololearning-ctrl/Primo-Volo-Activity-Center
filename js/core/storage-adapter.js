"use strict";

/*
  Primo Volo local-first storage boundary.
  No cloud connection is made here.
  A future Supabase bridge can hydrate this cache and listen for
  primo-volo-storage-change events without rewriting learning features.
*/
(function initializePrimoVoloStorage() {
  if (window.PrimoVoloStorage) return;

  const APP_ID = "primo-volo";
  const SCHEMA_VERSION = 1;

  const KEYS = Object.freeze({
    students: "primoVoloStudentsV1",
    currentStudent: "primoVoloCurrentStudentV1",
    progress: "primoVoloActivityCenterProgress",
    practice: "primoVoloFlightPathPractice",
    journey: "primoVoloCityJourneyV1",
    legacyPassport: "primoVoloPassportAchievements"
  });

  const DOMAINS = Object.freeze([
    { id: "students", baseKey: KEYS.students, scope: "account", cloudCandidate: true },
    { id: "current-student", baseKey: KEYS.currentStudent, scope: "device", cloudCandidate: false },
    { id: "progress", baseKey: KEYS.progress, scope: "student", cloudCandidate: true },
    { id: "practice", baseKey: KEYS.practice, scope: "student", cloudCandidate: true },
    { id: "journey", baseKey: KEYS.journey, scope: "student", cloudCandidate: true },
    { id: "legacy-passport", baseKey: KEYS.legacyPassport, scope: "student", cloudCandidate: false, legacy: true }
  ].map(item => Object.freeze({ ...item, schemaVersion: 1 })));

  function currentStudentId() {
    return window.localStorage.getItem(KEYS.currentStudent) || "";
  }

  function studentKey(baseKey, studentId = currentStudentId()) {
    return studentId ? `${baseKey}:student:${studentId}` : baseKey;
  }

  function describeKey(key) {
    const exact = DOMAINS.find(domain => domain.baseKey === key);

    if (exact) {
      return {
        ...exact,
        appId: APP_ID,
        appSchemaVersion: SCHEMA_VERSION,
        localKey: key,
        studentId: null,
        storageScope: exact.scope === "student" ? "device-fallback" : exact.scope,
        cloudCandidate: exact.scope === "student" ? false : exact.cloudCandidate
      };
    }

    for (const domain of DOMAINS) {
      if (domain.scope !== "student") continue;
      const prefix = `${domain.baseKey}:student:`;

      if (key.startsWith(prefix)) {
        return {
          ...domain,
          appId: APP_ID,
          appSchemaVersion: SCHEMA_VERSION,
          localKey: key,
          studentId: key.slice(prefix.length),
          storageScope: "student"
        };
      }
    }

    return {
      id: "unregistered",
      appId: APP_ID,
      appSchemaVersion: SCHEMA_VERSION,
      localKey: key,
      studentId: null,
      scope: "unknown",
      storageScope: "unknown",
      cloudCandidate: false,
      schemaVersion: null
    };
  }

  function getItem(key) {
    return window.localStorage.getItem(key);
  }

  function emitChange(operation, key, value, source = "local") {
    window.dispatchEvent(
      new CustomEvent("primo-volo-storage-change", {
        detail: {
          appId: APP_ID,
          appSchemaVersion: SCHEMA_VERSION,
          operation,
          key,
          value,
          source,
          descriptor: describeKey(key),
          changedAt: new Date().toISOString()
        }
      })
    );
  }

  function setItem(key, value, options = {}) {
    const stringValue = String(value);
    window.localStorage.setItem(key, stringValue);
    emitChange("set", key, stringValue, options.source || "local");
  }

  function removeItem(key, options = {}) {
    window.localStorage.removeItem(key);
    emitChange("remove", key, null, options.source || "local");
  }

  function getJSON(key, fallback = null) {
    const raw = getItem(key);
    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`Primo Volo storage could not parse ${key}.`, error);
      return fallback;
    }
  }

  function setJSON(key, value, options = {}) {
    setItem(key, JSON.stringify(value), options);
  }

  function removeStudentData(studentId, options = {}) {
    if (!studentId) return;

    DOMAINS
      .filter(domain => domain.scope === "student")
      .forEach(domain => {
        removeItem(studentKey(domain.baseKey, studentId), options);
      });
  }

  function exportSnapshot() {
    const students = getJSON(KEYS.students, []);
    const ids = Array.isArray(students)
      ? students.map(student => student?.id).filter(Boolean)
      : [];

    const byStudent = {};

    ids.forEach(studentId => {
      byStudent[studentId] = {};

      DOMAINS
        .filter(domain => domain.scope === "student")
        .forEach(domain => {
          const key = studentKey(domain.baseKey, studentId);
          byStudent[studentId][domain.id] = {
            key,
            descriptor: describeKey(key),
            value: getJSON(key, getItem(key))
          };
        });
    });

    return {
      appId: APP_ID,
      appSchemaVersion: SCHEMA_VERSION,
      provider: "localStorage",
      mode: "local-first",
      exportedAt: new Date().toISOString(),
      currentStudentId: currentStudentId(),
      students,
      byStudent
    };
  }

  function getStatus() {
    return {
      appId: APP_ID,
      appSchemaVersion: SCHEMA_VERSION,
      provider: "localStorage",
      mode: "local-first",
      cloudConfigured: false,
      currentStudentId: currentStudentId(),
      registeredDomains: DOMAINS.map(domain => ({
        id: domain.id,
        scope: domain.scope,
        cloudCandidate: domain.cloudCandidate,
        legacy: Boolean(domain.legacy)
      }))
    };
  }

  function audit() {
    const rows = DOMAINS.map(domain => {
      const key = domain.scope === "student"
        ? studentKey(domain.baseKey)
        : domain.baseKey;

      return {
        domain: domain.id,
        scope: domain.scope,
        currentKey: key,
        hasData: getItem(key) !== null,
        cloudCandidate: domain.cloudCandidate
      };
    });

    if (typeof console.table === "function") console.table(rows);
    else console.log(rows);

    return { status: getStatus(), rows };
  }

  window.PrimoVoloStorage = Object.freeze({
    appId: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    keys: KEYS,
    domains: DOMAINS,
    currentStudentId,
    studentKey,
    getItem,
    setItem,
    removeItem,
    getJSON,
    setJSON,
    describeKey,
    removeStudentData,
    exportSnapshot,
    getStatus,
    audit
  });
})();
