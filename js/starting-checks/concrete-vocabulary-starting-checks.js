"use strict";

/*
  Shared concrete-vocabulary Starting Checks.
  Diagnostic only: this module writes only version-3 Starting Check evidence.
*/
(() => {
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";

  const rows = {
    food: [
      ["01", "la mela", "images/food/food-01.png", "mela", ["02", "03", "15"]],
      ["02", "l'arancia", "images/food/food-02.png", "arancia", ["01", "03", "07"]],
      ["03", "la banana", "images/food/food-03.png", "banana", ["01", "02", "15"]],
      ["04", "il pane", "images/food/food-04.png", "pane", ["05", "06", "20"]],
      ["05", "il formaggio", "images/food/food-05.png", "formaggio", ["04", "06", "09"]],
      ["06", "l'uovo", "images/food/food-06.png", "uovo", ["04", "05", "19"]],
      ["07", "l'uva", "images/food/food-07.png", "uva", ["01", "02", "15"]],
      ["08", "il succo d'arancia", "images/food/food-08.png", "succo d'arancia", ["02", "09", "10"]],
      ["09", "il latte", "images/food/food-09.png", "latte", ["08", "10", "18"]],
      ["10", "l'acqua", "images/food/food-10.png", "acqua", ["08", "09", "18"]],
      ["11", "il pollo", "images/food/food-11.png", "pollo", ["12", "05", "06"]],
      ["12", "il pesce", "images/food/food-12.png", "pesce", ["11", "05", "06"]],
      ["13", "l'insalata", "images/food/food-13.png", "insalata", ["14", "16", "17"]],
      ["14", "il pomodoro", "images/food/food-14.png", "pomodoro", ["13", "16", "17"]],
      ["15", "la fragola", "images/food/food-15.png", "fragola", ["01", "02", "07"]],
      ["16", "la carota", "images/food/food-16.png", "carota", ["14", "17", "13"]],
      ["17", "la patata", "images/food/food-17.png", "patata", ["14", "16", "13"]],
      ["18", "la zuppa", "images/food/food-18.png", "zuppa", ["13", "19", "20"]],
      ["19", "il biscotto", "images/food/food-19.png", "biscotto", ["04", "18", "20"]],
      ["20", "il riso", "images/food/food-20.png", "riso", ["04", "18", "19"]]
    ],
    clothing: [
      ["01", "il pigiama", "images/clothing/clothes-01.png", "pigiama", ["17", "19", "02"]],
      ["02", "la maglietta", "images/clothing/clothes-02.png", "maglietta", ["03", "04", "05"]],
      ["03", "la camicia", "images/clothing/clothes-03.png", "camicia", ["02", "04", "07"]],
      ["04", "la felpa", "images/clothing/clothes-04.png", "felpa", ["05", "06", "07"]],
      ["05", "il maglione", "images/clothing/clothes-05.png", "maglione", ["04", "06", "07"]],
      ["06", "il cappotto", "images/clothing/clothes-06.png", "cappotto", ["07", "04", "05"]],
      ["07", "la giacca", "images/clothing/clothes-07.png", "giacca", ["06", "04", "05"]],
      ["08", "i pantaloncini", "images/clothing/clothes-08.png", "pantaloncini", ["20", "09", "01"]],
      ["09", "la gonna", "images/clothing/clothes-09.png", "gonna", ["08", "19", "20"]],
      ["10", "i calzini", "images/clothing/clothes-10.png", "calzini", ["12", "15", "16"]],
      ["11", "la sciarpa", "images/clothing/clothes-11.png", "sciarpa", ["12", "13", "18"]],
      ["12", "i guanti", "images/clothing/clothes-12.png", "guanti", ["10", "11", "13"]],
      ["13", "il cappello", "images/clothing/clothes-13.png", "cappello", ["11", "12", "14"]],
      ["14", "gli occhiali", "images/clothing/clothes-14.png", "occhiali", ["11", "13", "18"]],
      ["15", "le scarpe", "images/clothing/clothes-15.png", "scarpe", ["16", "10", "12"]],
      ["16", "gli stivali", "images/clothing/clothes-16.png", "stivali", ["15", "10", "12"]],
      ["17", "il costume da bagno", "images/clothing/clothes-17.png", "costume da bagno", ["01", "08", "19"]],
      ["18", "la cintura", "images/clothing/clothes-18.png", "cintura", ["11", "13", "14"]],
      ["19", "il vestito", "images/clothing/clothes-19.png", "vestito", ["09", "01", "17"]],
      ["20", "i pantaloni", "images/clothing/clothes-20.png", "pantaloni", ["08", "09", "01"]]
    ],
    family: [
      ["01", "la nonna", "images/family/family-01.png", "nonna", ["02", "03", "06"]],
      ["02", "il nonno", "images/family/family-02.png", "nonno", ["01", "04", "05"]],
      ["03", "la mamma", "images/family/family-03.png", "mamma", ["01", "04", "06"]],
      ["04", "il papà", "images/family/family-04.png", "papà", ["02", "03", "05"]],
      ["05", "il fratello", "images/family/family-05.png", "fratello", ["02", "04", "06"]],
      ["06", "la sorella", "images/family/family-06.png", "sorella", ["01", "03", "05"]]
    ],
    animals: [
      ["01", "il cane", "images/animals/animals-01.png", "cane", ["09", "10", "02"]],
      ["02", "il gatto", "images/animals/animals-02.png", "gatto", ["01", "12", "18"]],
      ["03", "la mucca", "images/animals/animals-03.png", "mucca", ["08", "13", "06"]],
      ["04", "l'uccello", "images/animals/animals-04.png", "uccello", ["05", "14", "15"]],
      ["05", "la gallina", "images/animals/animals-05.png", "gallina", ["04", "14", "15"]],
      ["06", "il maiale", "images/animals/animals-06.png", "maiale", ["03", "08", "13"]],
      ["07", "il cavallo", "images/animals/animals-07.png", "cavallo", ["16", "17", "03"]],
      ["08", "la capra", "images/animals/animals-08.png", "capra", ["03", "13", "06"]],
      ["09", "il lupo", "images/animals/animals-09.png", "lupo", ["01", "10", "17"]],
      ["10", "la volpe", "images/animals/animals-10.png", "volpe", ["01", "09", "17"]],
      ["11", "il serpente", "images/animals/animals-11.png", "serpente", ["19", "20", "18"]],
      ["12", "il coniglio", "images/animals/animals-12.png", "coniglio", ["18", "02", "19"]],
      ["13", "la pecora", "images/animals/animals-13.png", "pecora", ["03", "08", "06"]],
      ["14", "l'anatra", "images/animals/animals-14.png", "anatra", ["04", "05", "15"]],
      ["15", "il tacchino", "images/animals/animals-15.png", "tacchino", ["04", "05", "14"]],
      ["16", "l'asino", "images/animals/animals-16.png", "asino", ["07", "17", "03"]],
      ["17", "il cervo", "images/animals/animals-17.png", "cervo", ["07", "16", "09"]],
      ["18", "il riccio", "images/animals/animals-18.png", "riccio", ["12", "19", "02"]],
      ["19", "la rana", "images/animals/animals-19.png", "rana", ["11", "18", "20"]],
      ["20", "il pesce", "images/animals/animals-20.png", "pesce", ["11", "19", "14"]]
    ],
    bodyParts: [
      ["01", "il braccio", "images/body/body-01.png", "braccio", ["09", "12", "02"]],
      ["02", "la gamba", "images/body/body-02.png", "gamba", ["04", "05", "01"]],
      ["03", "la mano", "images/body/body-03.png", "mano", ["04", "01", "09"]],
      ["04", "il piede", "images/body/body-04.png", "piede", ["03", "02", "05"]],
      ["05", "il ginocchio", "images/body/body-05.png", "ginocchio", ["02", "04", "09"]],
      ["06", "l'occhio", "images/body/body-06.png", "occhio", ["07", "08", "10"]],
      ["07", "l'orecchio", "images/body/body-07.png", "orecchio", ["06", "08", "10"]],
      ["08", "il naso", "images/body/body-08.png", "naso", ["06", "07", "10"]],
      ["09", "il gomito", "images/body/body-09.png", "gomito", ["01", "12", "05"]],
      ["10", "la bocca", "images/body/body-10.png", "bocca", ["14", "15", "08"]],
      ["11", "il collo", "images/body/body-11.png", "collo", ["12", "13", "17"]],
      ["12", "la spalla", "images/body/body-12.png", "spalla", ["01", "09", "11"]],
      ["13", "la testa", "images/body/body-13.png", "testa", ["11", "16", "17"]],
      ["14", "la lingua", "images/body/body-14.png", "lingua", ["10", "15", "08"]],
      ["15", "le labbra", "images/body/body-15.png", "labbra", ["10", "14", "08"]],
      ["16", "la pancia", "images/body/body-16.png", "pancia", ["17", "11", "13"]],
      ["17", "la schiena", "images/body/body-17.png", "schiena", ["16", "11", "13"]]
    ]
  };

  /* Explicit indefinite alternatives for singular targets only.
     Plural targets intentionally have no partitive/plural-indefinite forms. */
  const indefiniteForms = {
    food: {
      "01": "una mela", "02": "un'arancia", "03": "una banana", "04": "un pane", "05": "un formaggio",
      "06": "un uovo", "07": "un'uva", "08": "un succo d'arancia", "09": "un latte", "10": "un'acqua",
      "11": "un pollo", "12": "un pesce", "13": "un'insalata", "14": "un pomodoro", "15": "una fragola",
      "16": "una carota", "17": "una patata", "18": "una zuppa", "19": "un biscotto", "20": "un riso"
    },
    clothing: {
      "01": "un pigiama", "02": "una maglietta", "03": "una camicia", "04": "una felpa", "05": "un maglione",
      "06": "un cappotto", "07": "una giacca", "09": "una gonna", "11": "una sciarpa", "13": "un cappello",
      "17": "un costume da bagno", "18": "una cintura", "19": "un vestito"
    },
    family: {
      "01": "una nonna", "02": "un nonno", "03": "una mamma", "04": "un papà", "05": "un fratello", "06": "una sorella"
    },
    animals: {
      "01": "un cane", "02": "un gatto", "03": "una mucca", "04": "un uccello", "05": "una gallina",
      "06": "un maiale", "07": "un cavallo", "08": "una capra", "09": "un lupo", "10": "una volpe",
      "11": "un serpente", "12": "un coniglio", "13": "una pecora", "14": "un'anatra", "15": "un tacchino",
      "16": "un asino", "17": "un cervo", "18": "un riccio", "19": "una rana", "20": "un pesce"
    },
    bodyParts: {
      "01": "un braccio", "02": "una gamba", "03": "una mano", "04": "un piede", "05": "un ginocchio",
      "06": "un occhio", "07": "un orecchio", "08": "un naso", "09": "un gomito", "10": "una bocca",
      "11": "un collo", "12": "una spalla", "13": "una testa", "14": "una lingua", "16": "una pancia", "17": "una schiena"
    }
  };

  function itemsFor(topicKey) {
    return rows[topicKey].map(([id, expectedItalian, expectedImage, bare, distractorIds]) => ({
      id,
      expectedItalian,
      expectedImage,
      acceptedProductionAlternatives: [bare, ...(indefiniteForms[topicKey]?.[id] ? [indefiniteForms[topicKey][id]] : [])],
      distractorIds
    }));
  }

  const CONFIGS = {
    food: { topicKey: "food", source: () => typeof food !== "undefined" ? food : [], expectedCount: 20, icon: "🍎", title: "Food & Drinks Starting Check", subtitle: "Il cibo e le bevande · Food & Drinks", itemLabel: "food or drink", productionGate: 14, items: itemsFor("food") },
    clothing: { topicKey: "clothing", source: () => typeof clothing !== "undefined" ? clothing : [], expectedCount: 20, icon: "👕", title: "Clothing Starting Check", subtitle: "L’abbigliamento · Clothing", itemLabel: "clothing item", productionGate: 14, items: itemsFor("clothing") },
    family: { topicKey: "family", source: () => typeof family !== "undefined" ? family : [], expectedCount: 6, icon: "👨‍👩‍👧", title: "Family Starting Check", subtitle: "La famiglia · Family", itemLabel: "family member", productionGate: 4, items: itemsFor("family") },
    animals: { topicKey: "animals", source: () => typeof animals !== "undefined" ? animals : [], expectedCount: 20, icon: "🐶", title: "Animals Starting Check", subtitle: "Gli animali · Animals", itemLabel: "animal", productionGate: 14, items: itemsFor("animals") },
    bodyParts: { topicKey: "bodyParts", source: () => typeof body !== "undefined" ? body : [], expectedCount: 17, icon: "🧍", title: "Body Parts Starting Check", subtitle: "Le parti del corpo · Body Parts", itemLabel: "body part", productionGate: 12, items: itemsFor("bodyParts") }
  };

  let modal = null;
  let modalBody = null;
  let session = null;
  const cards = new Map();

  function shuffle(values, random = Math.random) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function normalizeAnswer(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`´]/g, "'")
      .replace(/\s*'\s*/g, "'")
      .replace(/'/g, "")
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function classifyProduction(answer, item) {
    const normalized = normalizeAnswer(answer);
    if (normalized === normalizeAnswer(item.italian)) return "produced-canonical";
    if (item.acceptedProductionAlternatives.some(value => normalized === normalizeAnswer(value))) {
      return "produced-acceptable-alternative";
    }
    return null;
  }

  function validateConfig(config) {
    const errors = [];
    const source = config.source();
    if (!Array.isArray(source) || source.length !== config.expectedCount) errors.push("canonical source count");
    if (config.items.length !== config.expectedCount) errors.push("configured item count");
    const ids = new Set();
    const italian = new Set();
    config.items.forEach((meta, index) => {
      const canonical = source[index];
      const expectedId = String(index + 1).padStart(2, "0");
      if (meta.id !== expectedId) errors.push(`ID position ${meta.id}:${expectedId}`);
      if (ids.has(meta.id)) errors.push(`duplicate id ${meta.id}`);
      ids.add(meta.id);
      if (italian.has(meta.expectedItalian)) errors.push(`duplicate target ${meta.expectedItalian}`);
      italian.add(meta.expectedItalian);
      if (!canonical || canonical.italian !== meta.expectedItalian) errors.push(`Italian mismatch ${meta.id}`);
      if (!canonical || canonical.image !== meta.expectedImage) errors.push(`image mismatch ${meta.id}`);
      if (!Array.isArray(meta.distractorIds) || meta.distractorIds.length !== 3 || new Set(meta.distractorIds).size !== 3) errors.push(`distractors ${meta.id}`);
      if (meta.distractorIds.includes(meta.id)) errors.push(`self distractor ${meta.id}`);
      meta.distractorIds.forEach(id => {
        if (!config.items.some(candidate => candidate.id === id)) errors.push(`unknown distractor ${meta.id}:${id}`);
      });
      if (!Array.isArray(meta.acceptedProductionAlternatives) || (meta.acceptedProductionAlternatives.length !== 1 && meta.acceptedProductionAlternatives.length !== 2)) errors.push(`alternatives ${meta.id}`);
    });
    return { valid: errors.length === 0, errors };
  }

  function resolvedItems(config) {
    const validation = validateConfig(config);
    if (!validation.valid) throw new Error(`${config.topicKey}: ${validation.errors.join(", ")}`);
    return config.items.map((meta, index) => ({
      ...meta,
      italian: config.source()[index].italian,
      english: config.source()[index].english,
      image: config.source()[index].image
    }));
  }

  function buildRecognitionTasks(config, random = Math.random) {
    const items = resolvedItems(config);
    const byId = new Map(items.map(item => [item.id, item]));
    return shuffle(items, random).map(item => ({
      item,
      taskType: "italian-to-picture",
      options: shuffle([item, ...item.distractorIds.map(id => byId.get(id))], random)
    }));
  }

  function buildProductionTasks(recognitionTasks, recognitionResults, random = Math.random) {
    const recognized = new Set(recognitionResults.filter(result => result.correct).map(result => result.itemId));
    return shuffle(recognitionTasks.filter(task => recognized.has(task.item.id)).map(task => ({ item: task.item, taskType: "independent-production" })), random);
  }

  function shouldAdministerProduction(config, recognitionCorrect) {
    return recognitionCorrect >= config.productionGate;
  }

  function canonicalModes(topicKey) {
    return window.PrimoVoloActivityAvailability?.getCanonicalModes?.(topicKey) || ["learn", "choose", "match-word", "match-sound", "assemble-sentences", "complete", "write"];
  }

  function activityLabel(mode) {
    return { learn: "Impara", choose: "Scegli", "match-word": "Abbina", "match-sound": "Ascolta", "assemble-sentences": "Assembla", complete: "Completa", write: "Scrivi" }[mode] || mode;
  }

  function recommendationFor(config, recognitionCorrect, productionCorrect, availableModes = canonicalModes(config.topicKey)) {
    let primaryMode;
    let groups;
    let message;
    if (recognitionCorrect < config.productionGate) {
      primaryMode = "learn";
      groups = [["learn"], ["choose"], ["match-word", "match-sound"]];
      message = "Costruiamo prima il riconoscimento. · Let's build recognition first.";
    } else if (productionCorrect * 4 < recognitionCorrect * 3) {
      primaryMode = "assemble-sentences";
      groups = [["assemble-sentences"], ["complete"]];
      message = "Ora esercitiamoci a produrre le parole. · Now let's practice producing the words.";
    } else {
      primaryMode = "complete";
      groups = [["complete"], ["write"]];
      message = "Sei pronto per una pratica più indipendente. · You're ready for more independent practice.";
    }
    const available = new Set(availableModes);
    const sequence = groups.map(group => group.filter(mode => available.has(mode))).filter(group => group.length);
    const selectedPrimary = available.has(primaryMode) ? primaryMode : sequence[0]?.[0] || null;
    return { primaryMode: selectedPrimary, primaryLabel: activityLabel(selectedPrimary), sequence, message };
  }

  function buildSavedAttempt(config, activeSession) {
    const recognitionCorrect = activeSession.recognitionResults.filter(result => result.correct).length;
    const productionCorrect = activeSession.productionResults.filter(result => result.correct).length;
    const recommendation = recommendationFor(config, recognitionCorrect, productionCorrect);
    const saved = {
      id: activeSession.id,
      topicKey: config.topicKey,
      version: 3,
      startedAt: activeSession.startedAt,
      completedAt: activeSession.completedAt,
      recognitionCorrect,
      recognitionTotal: config.expectedCount,
      productionAdministered: activeSession.productionAdministered,
      productionCorrect,
      productionTotal: activeSession.productionTasks.length,
      recommendation: { primary: recommendation.primaryMode, primaryLabel: recommendation.primaryLabel },
      recognitionResults: activeSession.recognitionResults.map(result => ({ ...result })),
      productionResults: activeSession.productionResults.map(result => ({ ...result })),
      results: [...activeSession.recognitionResults, ...activeSession.productionResults].map(result => ({ ...result }))
    };
    saved.itemStatuses = resolvedItems(config).map(item => {
      const recognition = activeSession.recognitionResults.find(result => result.itemId === item.id);
      const production = activeSession.productionResults.find(result => result.itemId === item.id);
      const recognized = recognition?.correct === true;
      return {
        itemId: item.id,
        italian: item.italian,
        english: item.english,
        typedAnswer: production ? production.typedAnswer : null,
        recognitionStatus: recognized ? "recognized" : "not-yet-recognized",
        productionStatus: production?.productionStatus || (recognized && !activeSession.productionAdministered ? "not-administered" : recognized ? "not-yet-produced" : "not-administered"),
        status: production?.productionStatus || (recognized && !activeSession.productionAdministered ? "recognized-production-not-administered" : recognized ? "recognized-not-yet-produced" : "not-yet-recognized")
      };
    });
    return saved;
  }

  function storageKey() {
    const storage = window.PrimoVoloStorage;
    const base = storage?.keys?.startingChecks || STORAGE_FALLBACK_KEY;
    if (storage?.studentKey) return storage.studentKey(base);
    const studentId = window.localStorage.getItem("primoVoloCurrentStudentV1") || "";
    return studentId ? `${base}:student:${studentId}` : base;
  }

  function loadStore() {
    try {
      const storage = window.PrimoVoloStorage;
      const parsed = storage?.getJSON ? storage.getJSON(storageKey(), null) : JSON.parse(window.localStorage.getItem(storageKey()) || "null");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { version: Number(parsed.version) || 3, byTopic: parsed.byTopic && typeof parsed.byTopic === "object" ? parsed.byTopic : {} } : { version: 3, byTopic: {} };
    } catch (error) {
      console.warn("Concrete-vocabulary Starting Check data could not load.", error);
      return { version: 3, byTopic: {} };
    }
  }

  function saveAttempt(config, activeSession) {
    const saved = buildSavedAttempt(config, activeSession);
    const data = loadStore();
    const topic = data.byTopic[config.topicKey] || { latest: null, history: [] };
    topic.latest = saved;
    topic.history = [...(Array.isArray(topic.history) ? topic.history : []), saved].slice(-10);
    data.version = 3;
    data.byTopic[config.topicKey] = topic;
    const storage = window.PrimoVoloStorage;
    try {
      if (storage?.setJSON) storage.setJSON(storageKey(), data);
      else window.localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (error) {
      console.warn("Concrete-vocabulary Starting Check data could not save.", error);
    }
    return saved;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  }

  function speak(text) {
    if (typeof speakItalian === "function") speakItalian(text);
    else window.PrimoVoloAudio?.speak?.(text);
  }

  function preloadImages(items) {
    if (typeof Image === "undefined") return Promise.resolve(true);
    return Promise.all(items.map(item => new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = item.image;
    }))).then(results => results.every(Boolean));
  }

  function ensureStyles() {
    if (document.getElementById("concreteStartingCheckStyles")) return;
    const style = document.createElement("style");
    style.id = "concreteStartingCheckStyles";
    style.textContent = `
      .concrete-starting-check{width:min(980px,calc(100% - 32px));margin:18px auto 8px;padding:18px 20px;border:1px solid #d9e2ef;border-radius:20px;background:#f8fbff;box-shadow:0 8px 24px rgba(39,75,132,.07)}
      .concrete-starting-check[hidden],.concrete-check-modal[hidden]{display:none!important}.concrete-check-row{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}.concrete-check-copy{flex:1 1 520px}.concrete-check-kicker{color:#337a4d;font-size:.82rem;font-weight:900;text-transform:uppercase}.concrete-starting-check h3{margin:4px 0;color:#274b84}.concrete-starting-check p{margin:6px 0;color:#5f6f86}.concrete-check-button,.concrete-check-submit,.concrete-check-audio{border:0;border-radius:999px;padding:11px 16px;color:#fff;background:#337a4d;font:inherit;font-weight:850;cursor:pointer}.concrete-check-button:disabled,.concrete-check-submit:disabled{opacity:.55;cursor:wait}.concrete-check-modal{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:rgba(24,39,63,.58)}.concrete-check-dialog{position:relative;width:min(820px,100%);max-height:min(760px,94vh);overflow:auto;padding:28px;border-radius:24px;background:#fff;box-shadow:0 20px 70px rgba(24,39,63,.28)}.concrete-check-close{position:absolute;top:12px;right:14px;border:0;color:#274b84;background:transparent;font-size:1.7rem;cursor:pointer}.concrete-check-question{text-align:center}.concrete-check-progress,.concrete-check-part{display:block;margin:0 0 6px;color:#5f6f86;font-size:.88rem;font-weight:800}.concrete-check-question h2{color:#274b84}.concrete-check-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.concrete-check-option{min-height:160px;padding:10px;border:2px solid #d9e2ef;border-radius:16px;background:#fff;cursor:pointer}.concrete-check-option:disabled{opacity:.72;cursor:wait}.concrete-check-option img{display:block;width:100%;height:130px;object-fit:contain}.concrete-check-cue{display:block;width:min(300px,72vw);height:260px;object-fit:contain;margin:12px auto;border-radius:18px;background:#f7f9fc}.concrete-check-input{width:min(560px,100%);margin:12px auto;padding:13px 15px;border:2px solid #d9e2ef;border-radius:12px;font:inherit;font-size:1.05rem}.concrete-check-result{margin:12px 0;padding:14px;border-radius:14px;background:#f3f6fb}.concrete-check-result strong{display:block;color:#274b84;font-size:1.8rem}.concrete-check-details{text-align:left}.concrete-check-detail-row{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;padding:8px 10px;border-radius:9px;background:#f3f6fb;margin:6px 0}@media(max-width:620px){.concrete-check-dialog{padding:24px 14px}.concrete-check-option{min-height:125px}.concrete-check-option img{height:100px}}
    `;
    document.head.append(style);
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "concrete-check-modal";
    modal.hidden = true;
    modal.innerHTML = `<div class="concrete-check-dialog" role="dialog" aria-modal="true"><button type="button" class="concrete-check-close" aria-label="Close Starting Check">×</button><div data-role="body"></div></div>`;
    modalBody = modal.querySelector('[data-role="body"]');
    modal.querySelector(".concrete-check-close").addEventListener("click", closeCheck);
    document.body.append(modal);
  }

  function closeCheck() {
    window.PrimoVoloAudio?.stop?.();
    modal.hidden = true;
    session = null;
  }

  function buildCard(config) {
    const card = document.createElement("section");
    card.className = "concrete-starting-check";
    card.dataset.concreteStartingCheck = "";
    card.dataset.topic = config.topicKey;
    card.hidden = true;
    card.innerHTML = `<div class="concrete-check-row"><div class="concrete-check-copy"><span class="concrete-check-kicker">Prima di iniziare · Starting point</span><h3>${config.icon} Prova iniziale · ${escapeHtml(config.title)}</h3><p>Prima riconosci tutte le parole. Se sei pronto, prova a nominare solo quelle riconosciute. <span lang="en">First recognize every target. If ready, name only the targets you recognized.</span></p><p><strong>${config.expectedCount} obiettivi · ${config.expectedCount} targets</strong> · Produzione da ${config.productionGate}/${config.expectedCount}</p><div data-role="latest"></div></div><button type="button" class="concrete-check-button" data-action="start">▶ Inizia · Start</button></div>`;
    document.querySelector(".activity-menu")?.parentNode?.insertBefore(card, document.querySelector(".activity-menu"));
    card.querySelector('[data-action="start"]').addEventListener("click", () => startCheck(config));
    cards.set(config.topicKey, card);
  }

  function refreshCard(config) {
    const card = cards.get(config.topicKey);
    if (!card) return;
    const latest = loadStore().byTopic?.[config.topicKey]?.latest;
    card.querySelector('[data-role="latest"]').innerHTML = latest?.version === 3 ? `<p><strong>Ultima prova · Latest:</strong> Riconoscimento ${Number(latest.recognitionCorrect) || 0}/${config.expectedCount}</p>` : "";
  }

  function updateVisibility() {
    const topic = document.getElementById("topicSelect")?.value;
    Object.values(CONFIGS).forEach(config => {
      const card = cards.get(config.topicKey);
      if (!card) return;
      card.hidden = topic !== config.topicKey;
      if (!card.hidden) refreshCard(config);
    });
  }

  async function startCheck(config) {
    const button = cards.get(config.topicKey)?.querySelector('[data-action="start"]');
    if (button) button.disabled = true;
    try {
      const items = resolvedItems(config);
      if (!(await preloadImages(items))) throw new Error("one or more canonical images could not load");
      ensureModal();
      session = { id: `${config.topicKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, config, startedAt: new Date().toISOString(), completedAt: null, stage: "recognition", index: 0, submittedKeys: new Set(), recognitionTasks: buildRecognitionTasks(config), recognitionResults: [], productionTasks: [], productionResults: [], productionAdministered: false };
      modal.setAttribute("aria-label", config.title);
      modal.hidden = false;
      renderCurrent();
    } catch (error) {
      console.error(error);
      window.alert(`${config.title} could not load safely. No evidence was saved.`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function currentTasks() {
    return session.stage === "production" ? session.productionTasks : session.recognitionTasks;
  }

  function renderCurrent() {
    if (!session || !modalBody) return;
    const task = currentTasks()[session.index];
    if (!task) return;
    const config = session.config;
    const submissionKey = `${session.stage}:${session.index}`;
    const part = session.stage === "recognition" ? "Parte 1 · Riconoscimento · Recognition" : "Parte 2 · Produzione indipendente · Independent production";
    const base = `<p class="concrete-check-progress">${session.index + 1} / ${currentTasks().length}</p><div class="concrete-check-question"><span class="concrete-check-part">${part}</span>`;
    if (session.stage === "recognition") {
      modalBody.innerHTML = `${base}<h2>${escapeHtml(task.item.italian)}</h2><p><button type="button" class="concrete-check-audio" data-action="replay">🔊 Ascolta · Listen</button></p><p>Scegli l'immagine. · Choose the matching image.</p><div class="concrete-check-options">${task.options.map(option => `<button type="button" class="concrete-check-option" data-choice="${option.id}" aria-label="Image choice"><img src="${escapeHtml(option.image)}" alt=""></button>`).join("")}</div></div>`;
      modalBody.querySelector('[data-action="replay"]').addEventListener("click", () => speak(task.item.italian));
      modalBody.querySelectorAll(".concrete-check-option").forEach(button => button.addEventListener("click", () => submitRecognition(button.dataset.choice, submissionKey)));
      return;
    }
    modalBody.innerHTML = `${base}<img class="concrete-check-cue" src="${escapeHtml(task.item.image)}" alt="${escapeHtml(config.itemLabel)} to name in Italian"><h2>Come si dice in italiano?</h2><form data-action="production"><label class="sr-only" for="concreteCheckInput">Write the Italian target</label><input id="concreteCheckInput" class="concrete-check-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false"><p><button type="submit" class="concrete-check-submit">Invia · Submit</button></p></form></div>`;
    modalBody.querySelector('[data-action="production"]').addEventListener("submit", event => { event.preventDefault(); submitProduction(modalBody.querySelector("#concreteCheckInput").value, submissionKey); });
    modalBody.querySelector("#concreteCheckInput").focus();
  }

  function claimSubmissionKey(usedKeys, expectedKey, currentKey) {
    if (expectedKey !== currentKey || usedKeys.has(expectedKey)) return false;
    usedKeys.add(expectedKey);
    return true;
  }

  function claimSubmission(expectedKey) {
    const currentKey = session ? `${session.stage}:${session.index}` : "";
    if (!session || !claimSubmissionKey(session.submittedKeys, expectedKey, currentKey)) return false;
    modalBody?.querySelectorAll("button,input").forEach(element => { element.disabled = true; });
    return true;
  }

  function submitRecognition(selectedItemId, submissionKey) {
    if (!claimSubmission(submissionKey)) return false;
    const task = currentTasks()[session.index];
    session.recognitionResults.push({ itemId: task.item.id, italian: task.item.italian, english: task.item.english, taskType: task.taskType, stage: "recognition", selectedItemId, correct: selectedItemId === task.item.id });
    advance();
    return true;
  }

  function submitProduction(typedAnswer, submissionKey) {
    if (!claimSubmission(submissionKey)) return false;
    const task = currentTasks()[session.index];
    const productionStatus = classifyProduction(typedAnswer, task.item);
    session.productionResults.push({ itemId: task.item.id, italian: task.item.italian, english: task.item.english, taskType: task.taskType, stage: "production", typedAnswer, productionStatus, correct: productionStatus !== null });
    advance();
    return true;
  }

  function advance() {
    session.index += 1;
    if (session.index < currentTasks().length) { renderCurrent(); return; }
    if (session.stage === "recognition") {
      const correct = session.recognitionResults.filter(result => result.correct).length;
      if (!shouldAdministerProduction(session.config, correct)) { finishCheck(); return; }
      session.productionAdministered = true;
      session.productionTasks = buildProductionTasks(session.recognitionTasks, session.recognitionResults);
      session.stage = "production";
      session.index = 0;
      renderProductionIntro();
      return;
    }
    finishCheck();
  }

  function renderProductionIntro() {
    const submissionKey = "production-intro:0";
    session.stage = "production-intro";
    session.index = 0;
    modalBody.innerHTML = `<div class="concrete-check-question"><span class="concrete-check-part">Parte 2 · Produzione indipendente</span><h2>Ora prova da solo!</h2><p>Scrivi solo le parole che hai riconosciuto. · Write only the words you recognized.</p><button type="button" class="concrete-check-submit" data-action="continue">Continua · Continue →</button></div>`;
    modalBody.querySelector('[data-action="continue"]').addEventListener("click", () => {
      if (!claimSubmission(submissionKey)) return;
      session.stage = "production";
      renderCurrent();
    });
  }

  function finishCheck() {
    session.completedAt = new Date().toISOString();
    const saved = saveAttempt(session.config, session);
    const recommendation = recommendationFor(session.config, saved.recognitionCorrect, saved.productionCorrect);
    const sequence = recommendation.sequence.map(group => group.map(activityLabel).join(" / ")).join(" → ");
    refreshCard(session.config);
    modalBody.innerHTML = `<div class="concrete-check-question"><span class="concrete-check-part">Prova completata · Check complete</span><h2>Punto di partenza · Starting point</h2><div class="concrete-check-result"><strong>${saved.recognitionCorrect} / ${saved.recognitionTotal}</strong><span>Riconoscimento · Recognition</span></div><div class="concrete-check-result"><strong>${saved.productionAdministered ? `${saved.productionCorrect} / ${saved.productionTotal}` : "Non somministrata · Not administered"}</strong><span>Produzione indipendente · Independent production</span></div><details class="concrete-check-details"><summary>Dettagli del vocabolario · Vocabulary details</summary>${saved.itemStatuses.map(item => `<div class="concrete-check-detail-row"><strong>${escapeHtml(item.italian)}</strong><span>${item.recognitionStatus === "recognized" ? "Riconosciuta · Recognized" : "Non ancora riconosciuta · Not yet recognized"}<br>${item.productionStatus === "not-administered" ? "Non somministrata · Not administered" : item.productionStatus === "produced-canonical" || item.productionStatus === "produced-acceptable-alternative" ? "Prodotta · Produced" : "Da esercitare · Ready to practice"}</span></div>`).join("")}</details><p>Questa è una fotografia di partenza, non un voto. · This is a starting-point snapshot, not a grade.</p><p>${escapeHtml(recommendation.message)}</p><p><strong>Inizia con · Start with:</strong> ${escapeHtml(recommendation.primaryLabel)}<br><strong>Sequenza suggerita · Suggested sequence:</strong> ${escapeHtml(sequence)}</p><button type="button" class="concrete-check-submit" data-action="close">Chiudi · Close</button></div>`;
    modalBody.querySelector('[data-action="close"]').addEventListener("click", closeCheck);
  }

  function initialize() {
    if (!document.querySelector(".activity-menu")) return;
    ensureStyles();
    Object.values(CONFIGS).forEach(config => buildCard(config));
    updateVisibility();
    document.getElementById("topicSelect")?.addEventListener("change", updateVisibility);
    window.addEventListener("primo-volo-student-changed", () => Object.values(CONFIGS).forEach(refreshCard));
  }

  const testHooks = { CONFIGS, validateConfig, resolvedItems, buildRecognitionTasks, buildProductionTasks, shouldAdministerProduction, normalizeAnswer, classifyProduction, recommendationFor, buildSavedAttempt, claimSubmissionKey };
  window.PrimoVoloConcreteStartingChecks = { configs: CONFIGS, validateConfig };
  if (window.__PRIMO_VOLO_CONCRETE_STARTING_CHECK_TEST__) window.__concreteStartingCheckTestHooks = testHooks;
  if (!window.__PRIMO_VOLO_CONCRETE_STARTING_CHECK_TEST__) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
    else initialize();
  }
})();
