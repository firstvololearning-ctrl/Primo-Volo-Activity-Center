"use strict";

const assert = require("node:assert/strict");
const { mergeEvents, mergeStore, sameDocument } = require("../js/core/primo-student-cloud-merge.js");

const event = (eventId, date = "2026-01-01T00:00:00Z") => ({ eventId, date, topic: "food", activity: "choose", correct: true });

// New events use eventId as their primary identity.
assert.equal(mergeEvents([event("a")], [event("a")]).events.length, 1);
assert.equal(mergeEvents([event("a", "2026-01-01T00:00:00.000Z")], [event("a", "2026-01-01T00:00:00.000000Z")]).conflicts.length, 0);
assert.equal(mergeEvents([event("a")], [{ ...event("a"), correct: false }]).conflicts.length, 1);
assert.equal(mergeEvents([event("a")], [event("b")]).events.length, 2);

// Legacy evidence falls back to its full reporting fingerprint.
const legacyOne = { ...event(undefined, "2026-01-01T00:00:00Z") };
delete legacyOne.eventId;
const legacyTwo = { ...legacyOne, date: "2026-01-01T00:00:01Z" };
assert.equal(mergeEvents([legacyOne], [legacyTwo]).events.length, 2);
assert.equal(mergeEvents([legacyOne], [legacyOne]).events.length, 1);
assert.equal(sameDocument({ sessions: [event("a")] }, { sessions: [event("a")] }), true);
assert.equal(sameDocument({ sessions: [event("a")] }, { sessions: [event("a"), event("b")] }), false);

const progress = mergeStore("progress",
  { attempts: 4, correct: 3, byTopic: { food: { attempts: 4, correct: 3 } }, byActivity: {}, sessions: [event("a", "2026-01-01")] },
  { attempts: 5, correct: 4, byTopic: { food: { attempts: 5, correct: 4 } }, byActivity: {}, sessions: [event("a", "2026-01-01"), event("b", "2026-01-02")] },
  { attempts: 6, correct: 4, byTopic: { food: { attempts: 6, correct: 4 } }, byActivity: {}, sessions: [event("a", "2026-01-01"), event("c", "2026-01-03")] }
).data;
assert.equal(progress.attempts, 7);
assert.equal(progress.correct, 5);
assert.deepEqual(progress.sessions.map(item => item.eventId), ["a", "b", "c"]);

// Exact BASE/LOCAL/SERVER delta cases for totals and grouped aggregates.
const aggregate = (attempts, correct) => ({
  attempts, correct,
  byTopic: { food: { attempts, correct } },
  byActivity: { choose: { attempts, correct } },
  sessions: []
});
const delta = mergeStore("progress", aggregate(5, 3), aggregate(7, 4), aggregate(8, 5)).data;
assert.equal(delta.attempts, 10); // A
assert.equal(delta.correct, 6); // B
assert.deepEqual(delta.byTopic.food, { attempts: 10, correct: 6 });
assert.deepEqual(delta.byActivity.choose, { attempts: 10, correct: 6 });

const serverOnly = mergeStore("progress", aggregate(5, 3), aggregate(5, 3), aggregate(8, 5)).data;
assert.deepEqual(serverOnly.byTopic.food, { attempts: 8, correct: 5 }); // C

const localOnly = mergeStore("progress", aggregate(5, 3), aggregate(7, 4), aggregate(5, 3)).data;
assert.deepEqual(localOnly.byActivity.choose, { attempts: 7, correct: 4 }); // D

// After a conflict the authoritative server result becomes the next base.
const retry = mergeStore("progress", aggregate(8, 5), delta, aggregate(8, 5)).data;
assert.equal(retry.attempts, 10); // E: no second addition
assert.equal(retry.correct, 6);

// Reloading after adoption of the successful canonical write has no delta.
const reload = mergeStore("progress", aggregate(10, 6), aggregate(10, 6), aggregate(10, 6)).data;
assert.deepEqual(reload.byTopic.food, { attempts: 10, correct: 6 }); // F: no inflation

const regressed = mergeStore("progress", aggregate(5, 3), aggregate(4, 2), aggregate(8, 5)).data;
assert.equal(regressed.attempts, 8);
assert.equal(regressed.correct, 5);

const repeatedEventRetry = mergeStore("progress", aggregate(1, 1),
  { ...aggregate(2, 2), sessions: [event("retry-event")] },
  { ...aggregate(1, 1), sessions: [] }
).data;
const repeatedAgain = mergeStore("progress", aggregate(1, 1), repeatedEventRetry, aggregate(1, 1)).data;
assert.equal(repeatedAgain.sessions.filter(item => item.eventId === "retry-event").length, 1);

const practice = mergeStore("practice", null,
  { byTopic: { food: { practiced: ["conversation-write"], available: ["choose"], updatedAt: "2026-01-02T00:00:00Z" } } },
  { byTopic: { food: { practiced: ["match-word"], available: ["match-word"], updatedAt: "2026-01-01T00:00:00Z" } } }
).data;
assert.deepEqual(practice.byTopic.food.practiced, ["conversation-practice", "match-word"]);

const checkA = { id: "check-1", completedAt: "2026-01-01T00:00:00Z", recognitionCorrect: 1 };
const checkConflict = mergeStore("starting-checks", null,
  { byTopic: { food: { history: [{ ...checkA, recognitionCorrect: 0 }] } } },
  { byTopic: { food: { history: [checkA] } } }
);
assert.equal(checkConflict.conflicts.length, 1);

const journey = mergeStore("journey", null,
  { exploredTopics: { food: { earnedAt: "2026-01-02T00:00:00Z", practicedCount: 5 } }, celebratedCities: ["roma"], migratedPassport: false },
  { exploredTopics: { food: { earnedAt: "2026-01-01T00:00:00Z", practicedCount: 4 } }, celebratedCities: ["milano"], migratedPassport: true }
).data;
assert.equal(journey.exploredTopics.food.earnedAt, "2026-01-01T00:00:00Z");
assert.equal(journey.exploredTopics.food.practicedCount, 5);
assert.deepEqual(journey.celebratedCities, ["milano", "roma"]);
assert.equal(journey.migratedPassport, true);

console.log("Primo student cloud merge tests passed.");
