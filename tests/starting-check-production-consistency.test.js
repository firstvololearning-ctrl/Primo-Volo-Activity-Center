"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dataSource = fs.readFileSync(path.join(root, "js/core/data.js"), "utf8");

function loadModule(file, flag) {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    localStorage: { getItem: () => null, setItem: () => {} },
    document: {
      readyState: "loading",
      addEventListener: () => {},
      querySelector: () => null,
      getElementById: () => null
    }
  };
  context.window = context;
  context.addEventListener = () => {};
  context.PrimoVoloAudio = { speak: () => {} };
  context[flag] = true;
  vm.runInNewContext(`${dataSource}\n${fs.readFileSync(path.join(root, file), "utf8")}`, context, { filename: file });
  return context;
}

const suppliesHooks = loadModule("js/starting-checks/supplies-starting-check.js", "__PRIMO_VOLO_SUPPLIES_STARTING_CHECK_TEST__").__suppliesStartingCheckTestHooks;
const concreteHooks = (() => {
  const context = loadModule("js/starting-checks/concrete-vocabulary-starting-checks.js", "__PRIMO_VOLO_CONCRETE_STARTING_CHECK_TEST__");
  return context.__concreteStartingCheckTestHooks;
})();

const progressSource = fs.readFileSync(path.join(root, "js/progress/progress-v2.js"), "utf8");
assert(progressSource.includes('"produced-acceptable-alternative"'), "Progress maps acceptable alternatives");
assert(progressSource.includes('"Acceptable alternative"'), "Progress labels acceptable alternatives");
assert(progressSource.includes('typeof item.typedAnswer === "string"'), "Progress preserves submitted responses");

assert(suppliesHooks, "School Supplies scoring hooks load");
assert(concreteHooks, "Batch 1 scoring hooks load");

function checkNounSet(label, items, classify, alternatives, cases) {
  items.forEach(item => {
    const canonical = item.italian;
    const bare = alternatives(item)[0];
    assert.strictEqual(classify(canonical, item), "produced-canonical", `${label}/${canonical}: canonical`);
    assert.strictEqual(classify(bare, item), "produced-acceptable-alternative", `${label}/${canonical}: bare`);
    if (alternatives(item).length > 1) {
      assert.strictEqual(classify(alternatives(item)[1], item), "produced-acceptable-alternative", `${label}/${canonical}: indefinite`);
    }
    assert(classify(` ${canonical.toUpperCase()}... `, item), `${label}/${canonical}: superficial mechanics`);
  });
  cases.forEach(([input, target, expected]) => {
    assert.strictEqual(classify(input, target), expected, `${label}: ${input}`);
  });
}

const supplies = suppliesHooks.getItems();
checkNounSet(
  "supplies",
  supplies,
  (answer, item) => suppliesHooks.classifyProduction(answer, item.italian),
  item => suppliesHooks.productionAlternatives[item.italian] || [],
  [
    ["un foglio", supplies.find(item => item.italian === "il foglio"), "produced-acceptable-alternative"],
    ["uno zaino", supplies.find(item => item.italian === "lo zaino"), "produced-acceptable-alternative"],
    ["un forbici", supplies.find(item => item.italian === "le forbici"), null],
    ["il matita", supplies.find(item => item.italian === "la matita"), null],
    ["fogli", supplies.find(item => item.italian === "il foglio"), null]
  ]
);

const configs = concreteHooks.CONFIGS;
Object.entries(configs).forEach(([topicKey, config]) => {
  const items = concreteHooks.resolvedItems(config);
  checkNounSet(
    topicKey,
    items,
    concreteHooks.classifyProduction,
    item => item.acceptedProductionAlternatives,
    []
  );
});

const food = concreteHooks.resolvedItems(configs.food);
const clothing = concreteHooks.resolvedItems(configs.clothing);
const family = concreteHooks.resolvedItems(configs.family);
const animals = concreteHooks.resolvedItems(configs.animals);
const bodyParts = concreteHooks.resolvedItems(configs.bodyParts);

[
  ["una mela", food, "la mela"],
  ["un pomodoro", food, "il pomodoro"],
  ["un'arancia", food, "l'arancia"],
  ["unarancia", food, "l'arancia"],
  ["succo darancia", food, "il succo d'arancia"],
  ["una maglietta", clothing, "la maglietta"],
  ["un cappotto", clothing, "il cappotto"],
  ["pantaloni", clothing, "i pantaloni"],
  ["una mamma", family, "la mamma"],
  ["un papà", family, "il papà"],
  ["papa", family, "il papà"],
  ["un cane", animals, "il cane"],
  ["una mucca", animals, "la mucca"],
  ["cane", animals, "il cane"],
  ["un braccio", bodyParts, "il braccio"],
  ["una mano", bodyParts, "la mano"],
  ["labbra", bodyParts, "le labbra"]
].forEach(([input, items, target]) => assert(concreteHooks.classifyProduction(input, items.find(item => item.italian === target)), `${target}: ${input} accepted`));

[
  ["il mela", food, "la mela"], ["un mela", food, "la mela"], ["la pomodoro", food, "il pomodoro"],
  ["le banane", food, "la banana"], ["uve", food, "l'uva"], ["succo", food, "il succo d'arancia"],
  ["un pantalone", clothing, "i pantaloni"], ["dei pantaloni", clothing, "i pantaloni"],
  ["pantalone", clothing, "i pantaloni"], ["padre", family, "il papà"],
  ["cagna", animals, "il cane"], ["cani", animals, "il cane"], ["labbro", bodyParts, "le labbra"],
  ["d'arancia", food, "il succo d'arancia"], ["aranca", food, "l'arancia"], ["insalatta", food, "l'insalata"]
].forEach(([input, items, target]) => assert.strictEqual(concreteHooks.classifyProduction(input, items.find(item => item.italian === target)), null, `${target}: ${input} rejected`));

const unchanged = [
  ["js/starting-checks/numbers-starting-check.js", "__PRIMO_VOLO_NUMBERS_STARTING_CHECK_TEST__", "numbers"],
  ["js/starting-checks/colors-starting-check.js", "__PRIMO_VOLO_COLORS_STARTING_CHECK_TEST__", "colors"],
  ["js/starting-checks/days-starting-check.js", "__PRIMO_VOLO_DAYS_STARTING_CHECK_TEST__", "days"],
  ["js/starting-checks/weather-starting-check.js", "__PRIMO_VOLO_STARTING_CHECK_TEST__", "weather"],
  ["js/starting-checks/seasons-starting-check.js", "__PRIMO_VOLO_SEASONS_STARTING_CHECK_TEST__", "seasons"]
];
unchanged.forEach(([file, flag, topic]) => {
  const context = loadModule(file, flag);
  const hooks = Object.values(context).find(value => value && typeof value === "object" && (value.classifyProduction || value.getItems));
  assert(hooks, `${topic}: modern scoring hooks load`);
  const items = hooks.getItems ? hooks.getItems() : [];
  if (items.length) {
    const item = items[0];
    const canonical = item.italian || item.response?.canonical || item.number;
    if (typeof canonical === "string") {
      assert(hooks.classifyProduction(canonical, item), `${topic}: canonical remains accepted`);
      assert.strictEqual(hooks.classifyProduction(`un ${canonical}`, item), null, `${topic}: no invented indefinite alternative`);
    }
  }
});

console.log("System-wide modern Starting Check production-scoring tests passed.");
