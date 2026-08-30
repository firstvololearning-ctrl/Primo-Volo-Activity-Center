"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = {
  console,
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};
context.window = context;
context.__PRIMO_VOLO_CONCRETE_STARTING_CHECK_TEST__ = true;

const source = [
  fs.readFileSync(path.join(root, "js/core/data.js"), "utf8"),
  fs.readFileSync(path.join(root, "js/starting-checks/concrete-vocabulary-starting-checks.js"), "utf8")
].join("\n");
vm.runInNewContext(source, context, { filename: "concrete-vocabulary-starting-checks.bundle.js" });

const hooks = context.__concreteStartingCheckTestHooks;
assert(hooks, "shared Starting Check test hooks should load");

const expected = {
  food: { total: 20, gate: 14 },
  clothing: { total: 20, gate: 14 },
  family: { total: 6, gate: 4 },
  animals: { total: 20, gate: 14 },
  bodyParts: { total: 17, gate: 12 }
};

function recognitionFixture(tasks, correctCount) {
  return tasks.map((task, index) => ({
    itemId: task.item.id,
    italian: task.item.italian,
    english: task.item.english,
    taskType: "italian-to-picture",
    stage: "recognition",
    selectedItemId: index < correctCount ? task.item.id : "wrong",
    correct: index < correctCount
  }));
}

Object.entries(expected).forEach(([topicKey, limits]) => {
  const config = hooks.CONFIGS[topicKey];
  assert(config, `${topicKey}: config exists`);
  assert.strictEqual(config.expectedCount, limits.total, `${topicKey}: exact total`);
  assert.strictEqual(config.productionGate, limits.gate, `${topicKey}: exact gate`);
  assert.strictEqual(hooks.validateConfig(config).errors.length, 0, `${topicKey}: canonical metadata validation`);

  const items = hooks.resolvedItems(config);
  assert.strictEqual(items.length, limits.total, `${topicKey}: complete canonical coverage`);
  assert.strictEqual(new Set(items.map(item => item.id)).size, limits.total, `${topicKey}: unique IDs`);
  assert.strictEqual(new Set(items.map(item => item.italian)).size, limits.total, `${topicKey}: unique targets`);
  items.forEach(item => {
    assert.strictEqual(item.distractorIds.length, 3, `${topicKey}/${item.id}: three distractors`);
    assert.strictEqual(new Set(item.distractorIds).size, 3, `${topicKey}/${item.id}: unique distractors`);
    assert(!item.distractorIds.includes(item.id), `${topicKey}/${item.id}: no self distractor`);
    assert(fs.existsSync(path.join(root, item.image)), `${topicKey}/${item.id}: target image exists`);
    item.distractorIds.forEach(id => {
      const distractor = items.find(candidate => candidate.id === id);
      assert(distractor, `${topicKey}/${item.id}: distractor ${id} resolves`);
      assert(fs.existsSync(path.join(root, distractor.image)), `${topicKey}/${item.id}: distractor ${id} image exists`);
    });

    assert.strictEqual(hooks.classifyProduction(item.italian, item), "produced-canonical", `${topicKey}/${item.id}: canonical accepted`);
    assert.strictEqual(hooks.classifyProduction(item.acceptedProductionAlternatives[0], item), "produced-acceptable-alternative", `${topicKey}/${item.id}: explicit bare form accepted`);
    const isPlural = /^(?:i|gli|le)\s/i.test(item.italian);
    assert.strictEqual(item.acceptedProductionAlternatives.length, isPlural ? 1 : 2, `${topicKey}/${item.id}: indefinite policy is explicit`);
    if (!isPlural) {
      assert.strictEqual(hooks.classifyProduction(item.acceptedProductionAlternatives[1], item), "produced-acceptable-alternative", `${topicKey}/${item.id}: explicit indefinite form accepted`);
    }
    assert(hooks.classifyProduction(`  ${item.italian.toUpperCase()}...  `, item), `${topicKey}/${item.id}: mechanics normalized`);
    assert.strictEqual(hooks.classifyProduction(`wrong ${item.italian}`, item), null, `${topicKey}/${item.id}: arbitrary response rejected`);
    if (!item.acceptedProductionAlternatives.some(value => hooks.normalizeAnswer(value) === hooks.normalizeAnswer(item.english))) {
      assert.strictEqual(hooks.classifyProduction(item.english, item), null, `${topicKey}/${item.id}: English rejected`);
    }
  });

  const tasks = hooks.buildRecognitionTasks(config, () => 0.37);
  assert.strictEqual(tasks.length, limits.total, `${topicKey}: one recognition task per target`);
  assert.strictEqual(new Set(tasks.map(task => task.item.id)).size, limits.total, `${topicKey}: targets occur once`);
  tasks.forEach(task => {
    assert.strictEqual(task.options.length, 4, `${topicKey}/${task.item.id}: four choices`);
    assert.strictEqual(new Set(task.options.map(option => option.id)).size, 4, `${topicKey}/${task.item.id}: four unique choices`);
  });

  const below = recognitionFixture(tasks, limits.gate - 1);
  const atGate = recognitionFixture(tasks, limits.gate);
  const full = recognitionFixture(tasks, limits.total);
  assert.strictEqual(hooks.shouldAdministerProduction(config, limits.gate - 1), false, `${topicKey}: one below gate skips production`);
  assert.strictEqual(hooks.shouldAdministerProduction(config, limits.gate), true, `${topicKey}: gate administers production`);
  assert.strictEqual(hooks.shouldAdministerProduction(config, limits.total), true, `${topicKey}: full recognition administers production`);
  assert.strictEqual(hooks.buildProductionTasks(tasks, below, () => 0.37).length, limits.gate - 1, `${topicKey}: recognized routing remains exact below gate fixture`);
  assert.strictEqual(hooks.buildProductionTasks(tasks, atGate, () => 0.37).length, limits.gate, `${topicKey}: gate routes only recognized targets`);
  assert.strictEqual(hooks.buildProductionTasks(tasks, full, () => 0.37).length, limits.total, `${topicKey}: full recognition routes all targets`);

  const nonAdministered = hooks.buildSavedAttempt(config, {
    id: `${topicKey}-below`,
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:01:00.000Z",
    recognitionTasks: tasks,
    recognitionResults: below,
    productionAdministered: false,
    productionTasks: [],
    productionResults: []
  });
  assert.strictEqual(nonAdministered.version, 3, `${topicKey}: version 3`);
  assert.strictEqual(nonAdministered.topicKey, topicKey, `${topicKey}: topic stored`);
  assert.strictEqual(nonAdministered.itemStatuses.length, limits.total, `${topicKey}: every target has evidence`);
  assert(nonAdministered.itemStatuses.every(item => item.productionStatus === "not-administered"), `${topicKey}: non-administered production is not failure`);
});

const food = hooks.resolvedItems(hooks.CONFIGS.food);
const clothing = hooks.resolvedItems(hooks.CONFIGS.clothing);
const family = hooks.resolvedItems(hooks.CONFIGS.family);
const animals = hooks.resolvedItems(hooks.CONFIGS.animals);
const bodyParts = hooks.resolvedItems(hooks.CONFIGS.bodyParts);

function item(items, italian) {
  return items.find(candidate => candidate.italian === italian);
}

[
  [item(food, "la mela"), "il mela"],
  [item(food, "l'uva"), "uve"],
  [item(food, "il succo d'arancia"), "succo"],
  [item(clothing, "i pantaloni"), "pantalone"],
  [item(clothing, "i calzini"), "calzino"],
  [item(clothing, "il costume da bagno"), "costume"],
  [item(family, "la mamma"), "madre"],
  [item(family, "il papà"), "padre"],
  [item(animals, "il cane"), "la cane"],
  [item(animals, "il cane"), "cani"],
  [item(bodyParts, "le labbra"), "labbro"]
].forEach(([target, rejected]) => assert.strictEqual(hooks.classifyProduction(rejected, target), null, `${target.italian}: rejects ${rejected}`));
assert(hooks.classifyProduction("PAPA!", item(family, "il papà")), "papà normalization accepted");
assert(hooks.classifyProduction("  succo   d’arancia. ", item(food, "il succo d'arancia")), "apostrophe and spacing normalized");
assert(hooks.classifyProduction("linsalata", item(food, "l'insalata")), "missing apostrophe in l'insalata accepted");
assert(hooks.classifyProduction("larancia", item(food, "l'arancia")), "missing apostrophe in l'arancia accepted");
assert(hooks.classifyProduction("succo darancia", item(food, "il succo d'arancia")), "missing apostrophe in d'arancia accepted");
assert.strictEqual(hooks.classifyProduction("un mela", item(food, "la mela")), null, "wrong indefinite gender is rejected");
assert.strictEqual(hooks.classifyProduction("la pomodoro", item(food, "il pomodoro")), null, "wrong definite gender is rejected");

Object.values(hooks.CONFIGS).forEach(config => {
  assert.strictEqual(hooks.recommendationFor(config, config.productionGate - 1, 0).primaryMode, "learn", `${config.topicKey}: below gate recommends learn`);
  assert.strictEqual(hooks.recommendationFor(config, config.productionGate, Math.ceil(config.productionGate * 0.75) - 1).primaryMode, "assemble-sentences", `${config.topicKey}: below 75% production recommends assemble`);
  assert.strictEqual(hooks.recommendationFor(config, config.productionGate, Math.ceil(config.productionGate * 0.75)).primaryMode, "complete", `${config.topicKey}: 75% production recommends complete`);
});

const submittedKeys = new Set();
assert.strictEqual(hooks.claimSubmissionKey(submittedKeys, "production:0", "production:0"), true, "first Enter/click submission advances");
assert.strictEqual(hooks.claimSubmissionKey(submittedKeys, "production:0", "production:0"), false, "rapid duplicate submission is blocked");
assert.strictEqual(hooks.claimSubmissionKey(submittedKeys, "production:0", "production:1"), false, "stale form cannot submit next item");
assert.strictEqual(hooks.claimSubmissionKey(submittedKeys, "production:1", "production:1"), true, "next item submits once");

const familyConfig = hooks.CONFIGS.family;
const familyTasks = hooks.buildRecognitionTasks(familyConfig, () => 0.37);
const familyRecognition = recognitionFixture(familyTasks, familyConfig.productionGate);
const familyProductionTasks = hooks.buildProductionTasks(familyTasks, familyRecognition, () => 0.37);
const originalResponse = "  risposta originale  ";
const administered = hooks.buildSavedAttempt(familyConfig, {
  id: "family-administered",
  startedAt: "2026-01-01T00:00:00.000Z",
  completedAt: "2026-01-01T00:01:00.000Z",
  recognitionTasks: familyTasks,
  recognitionResults: familyRecognition,
  productionAdministered: true,
  productionTasks: familyProductionTasks,
  productionResults: [{
    itemId: familyProductionTasks[0].item.id,
    italian: familyProductionTasks[0].item.italian,
    english: familyProductionTasks[0].item.english,
    taskType: "independent-production",
    stage: "production",
    typedAnswer: originalResponse,
    productionStatus: null,
    correct: false
  }]
});
assert.strictEqual(administered.itemStatuses.find(item => item.itemId === familyProductionTasks[0].item.id).typedAnswer, originalResponse, "original incorrect response is preserved");
assert.strictEqual(administered.productionCorrect, 0, "incorrect administered production is counted without changing the response");

const progressSource = fs.readFileSync(path.join(root, "js/progress/progress-v2.js"), "utf8");
Object.keys(expected).forEach(topicKey => {
  assert(progressSource.includes(`buildStartingCheckSection("${topicKey}", studentId)`), `${topicKey}: represented in Progress`);
});
assert(progressSource.includes("Number(attempt?.version) === 3"), "Progress requires modern version compatibility");
assert(progressSource.includes("attempt.itemStatuses.length === total"), "Progress requires exact target-row compatibility");
assert(progressSource.includes("new Date(right.completedAt).getTime()"), "Progress sorts history newest first");

console.log("Concrete-vocabulary Starting Checks: all Batch 1 tests passed.");
