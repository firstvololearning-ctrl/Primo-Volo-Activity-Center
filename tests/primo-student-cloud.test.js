"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const merge = require("../js/core/primo-student-cloud-merge.js");

const cloudSource = fs.readFileSync(
  path.join(__dirname, "../js/core/primo-student-cloud.js"),
  "utf8"
);

const STORE_KEYS = Object.freeze({
  progress: "progress",
  practice: "practice",
  startingChecks: "starting-checks",
  journey: "journey"
});

const studentKey = (baseKey) => `${baseKey}:student:test-student`;
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function progress(overrides = {}) {
  return {
    schemaVersion: 1,
    attempts: 3,
    correct: 2,
    byTopic: { food: { attempts: 3, correct: 2 } },
    byActivity: { choose: { attempts: 3, correct: 2 } },
    sessions: [{ eventId: "event-1", date: "2026-01-01T00:00:00.000Z", topic: "food", activity: "choose", correct: true }],
    ...overrides
  };
}

function reorderedProgress() {
  return {
    correct: 2,
    attempts: 3,
    sessions: [{ correct: true, activity: "choose", topic: "food", date: "2026-01-01T00:00:00.000Z", eventId: "event-1" }],
    byTopic: { food: { correct: 2, attempts: 3 } },
    byActivity: { choose: { correct: 2, attempts: 3 } },
    schemaVersion: 1
  };
}

function createHarness({ localProgress = null, cloudProgress = null, saveImplementation = null } = {}) {
  const values = new Map();
  const listeners = new Map();
  const saves = [];
  const reads = [];

  if (localProgress != null) {
    values.set(studentKey(STORE_KEYS.progress), JSON.stringify(localProgress));
  }

  const window = {
    PrimoVoloAccess: {
      status: "authorized",
      mode: "student",
      user: { is_anonymous: true },
      studentContext: { student_id: "test-student" }
    },
    PrimoVoloStudentCloudAutoEnable: true,
    PrimoVoloStudentCloudMerge: merge,
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value))
    },
    addEventListener(type, listener) {
      const registered = listeners.get(type) || [];
      registered.push(listener);
      listeners.set(type, registered);
    },
    dispatchEvent(event) {
      (listeners.get(event.type) || []).forEach((listener) => listener(event));
    },
    location: { hostname: "example.test" },
    crypto: { randomUUID: () => `write-${saves.length + 1}` }
  };

  const storage = {
    keys: STORE_KEYS,
    studentKey,
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value, options = {}) {
      values.set(key, String(value));
      window.dispatchEvent({
        type: "primo-volo-storage-change",
        detail: {
          source: options.source || "local",
          descriptor: { scope: "student", id: Object.entries(STORE_KEYS).find(([, base]) => studentKey(base) === key)?.[0]?.replace("startingChecks", "starting-checks") || "progress" }
        }
      });
    }
  };
  window.PrimoVoloStorage = storage;

  const transport = {
    async get(storeKey) {
      reads.push(storeKey);
      if (storeKey === "progress" && cloudProgress != null) {
        return { state_exists: true, data: cloudProgress, updated_at: "2026-01-01T00:00:00.000Z" };
      }
      return { state_exists: false, data: null, updated_at: null };
    },
    async save(storeKey, data, baseUpdatedAt, writeId) {
      const call = { storeKey, data, baseUpdatedAt, writeId };
      saves.push(call);
      if (saveImplementation) return saveImplementation(call, saves.length);
      return {
        write_applied: true,
        conflict: false,
        already_current: false,
        data,
        updated_at: `2026-01-01T00:00:0${saves.length}.000Z`
      };
    }
  };
  window.PrimoVoloStudentCloudRpc = transport;

  vm.runInNewContext(cloudSource, {
    window,
    console,
    JSON,
    setTimeout,
    clearTimeout
  }, { filename: "primo-student-cloud.js" });

  return {
    window,
    storage,
    reads,
    saves,
    localProgress: () => JSON.parse(values.get(studentKey(STORE_KEYS.progress)) || "null"),
    ready: window.PrimoVoloStudentCloud.ready,
    stop: () => window.PrimoVoloStudentCloud.invalidate()
  };
}

async function settleBoot(harness) {
  await harness.ready;
  await pause(30);
}

test("same document with the same key order does not save during boot", async () => {
  const state = progress();
  const harness = createHarness({ localProgress: state, cloudProgress: state });
  await settleBoot(harness);
  assert.deepEqual(harness.reads.sort(), ["journey", "practice", "progress", "starting-checks"]);
  assert.equal(harness.saves.length, 0);
  harness.stop();
});

test("same document with reordered top-level keys does not save during boot", async () => {
  const harness = createHarness({ localProgress: progress(), cloudProgress: reorderedProgress() });
  await settleBoot(harness);
  assert.equal(harness.saves.length, 0);
  harness.stop();
});

test("same document with reordered nested keys does not save during boot", async () => {
  const cloud = progress({ byTopic: { food: { correct: 2, attempts: 3 } } });
  const harness = createHarness({ localProgress: progress(), cloudProgress: cloud });
  await settleBoot(harness);
  assert.equal(harness.saves.length, 0);
  harness.stop();
});

test("sameDocument preserves array order semantics", () => {
  assert.equal(merge.sameDocument({ values: [1, 2] }, { values: [1, 2] }), true);
  assert.equal(merge.sameDocument({ values: [1, 2] }, { values: [2, 1] }), false);
});

test("genuine local evidence produces exactly one reconciliation save", async () => {
  const local = progress({
    attempts: 4,
    correct: 3,
    byTopic: { food: { attempts: 4, correct: 3 } },
    byActivity: { choose: { attempts: 4, correct: 3 } },
    sessions: [...progress().sessions, { eventId: "event-2", date: "2026-01-02T00:00:00.000Z", topic: "food", activity: "choose", correct: true }]
  });
  const harness = createHarness({ localProgress: local, cloudProgress: progress() });
  await settleBoot(harness);
  assert.equal(harness.saves.length, 1);
  assert.equal(harness.saves[0].data.attempts, 4);
  assert.equal(harness.saves[0].baseUpdatedAt, "2026-01-01T00:00:00.000Z");
  harness.stop();
});

test("cloud-only state hydrates locally without a write-back", async () => {
  const cloud = reorderedProgress();
  const harness = createHarness({ cloudProgress: cloud });
  await settleBoot(harness);
  assert.equal(harness.saves.length, 0);
  assert.equal(merge.sameDocument(harness.localProgress(), cloud), true);
  harness.stop();
});

test("a genuine progress change after hydration still saves", async () => {
  const state = progress();
  const harness = createHarness({ localProgress: state, cloudProgress: state });
  await settleBoot(harness);
  harness.storage.setItem(studentKey(STORE_KEYS.progress), JSON.stringify(progress({ attempts: 4, correct: 3 })));
  await pause(650);
  assert.equal(harness.saves.length, 1);
  assert.equal(harness.saves[0].data.attempts, 4);
  harness.stop();
});

test("base revision and bounded conflict retry behavior remain unchanged", async () => {
  const local = progress({ attempts: 4, correct: 3 });
  const serverAfterConflict = progress({ attempts: 5, correct: 4 });
  const harness = createHarness({
    localProgress: local,
    cloudProgress: progress(),
    saveImplementation(call, count) {
      if (count === 1) {
        return {
          write_applied: false,
          conflict: true,
          already_current: false,
          data: serverAfterConflict,
          updated_at: "2026-01-01T00:00:02.000Z"
        };
      }
      return {
        write_applied: true,
        conflict: false,
        already_current: false,
        data: call.data,
        updated_at: "2026-01-01T00:00:03.000Z"
      };
    }
  });
  await settleBoot(harness);
  assert.equal(harness.saves.length, 2);
  assert.equal(harness.saves[0].baseUpdatedAt, "2026-01-01T00:00:00.000Z");
  assert.equal(harness.saves[1].baseUpdatedAt, "2026-01-01T00:00:02.000Z");
  harness.stop();
});
