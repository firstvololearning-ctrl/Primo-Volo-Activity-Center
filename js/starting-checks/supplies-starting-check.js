"use strict";

/*
  SCHOOL SUPPLIES STARTING CHECK
  Adaptive recognition and lexical production using canonical Supplies data.
  Diagnostic only: it does not record ordinary practice.
*/
(() => {
  const TOPIC_KEY = "supplies";
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";
  const RECOGNITION_TOTAL = 14;
  const PRODUCTION_GATE = 10;
  const LANGUAGE_PATTERN_TOTAL = 6;
  const LANGUAGE_PATTERN_IDS = ["piace", "ho", "vedo"];
  const LANGUAGE_PATTERN_SUPPLY_IDS = ["04", "05", "08", "09", "13", "14"];
  /* Explicit noun-vocabulary alternatives. Plural forbici intentionally has
     no invented partitive/plural-indefinite form. */
  const PRODUCTION_ALTERNATIVES = Object.freeze({
    "il foglio": Object.freeze(["foglio", "un foglio"]),
    "le forbici": Object.freeze(["forbici"]),
    "la colla": Object.freeze(["colla", "una colla"]),
    "la matita": Object.freeze(["matita", "una matita"]),
    "la penna": Object.freeze(["penna", "una penna"]),
    "la matita colorata": Object.freeze(["matita colorata", "una matita colorata"]),
    "il gesso": Object.freeze(["gesso", "un gesso"]),
    "il pennarello": Object.freeze(["pennarello", "un pennarello"]),
    "il righello": Object.freeze(["righello", "un righello"]),
    "la spillatrice": Object.freeze(["spillatrice", "una spillatrice"]),
    "il nastro adesivo": Object.freeze(["nastro adesivo", "un nastro adesivo"]),
    "la gomma": Object.freeze(["gomma", "una gomma"]),
    "lo zaino": Object.freeze(["zaino", "uno zaino"]),
    "il quaderno": Object.freeze(["quaderno", "un quaderno"])
  });
  const RECOGNITION_TASK_TYPES = [
    "italian-to-picture",
    "italian-to-picture",
    "italian-to-picture",
    "italian-to-picture",
    "italian-to-picture",
    "listen-to-picture",
    "listen-to-picture",
    "listen-to-picture",
    "listen-to-picture",
    "picture-to-italian",
    "picture-to-italian",
    "picture-to-italian",
    "picture-to-italian",
    "picture-to-italian"
  ];

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let session = null;

  function getItems() {
    const source =
      typeof supplies !== "undefined" && Array.isArray(supplies)
        ? supplies
        : [];

    return source.slice(0, RECOGNITION_TOTAL).map((item, index) => ({
      id: String(index + 1).padStart(2, "0"),
      italian: item.italian,
      english: item.english,
      image: item.image || ""
    }));
  }

  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(random() * (index + 1));
      [result[index], result[randomIndex]] =
        [result[randomIndex], result[index]];
    }
    return result;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function speak(text) {
    if (typeof speakItalian === "function") {
      speakItalian(text);
      return;
    }
    window.PrimoVoloAudio?.speak?.(text);
  }

  function normalizeAnswer(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`´]/g, "'")
      .replace(/\s*'\s*/g, "'")
      .replace(/'/g, "")
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function classifyProduction(typedAnswer, canonicalItalian) {
    const normalizedAnswer = normalizeAnswer(typedAnswer);
    const normalizedCanonical = normalizeAnswer(canonicalItalian);

    if (normalizedAnswer === normalizedCanonical) {
      return "produced-canonical";
    }

    const alternatives = PRODUCTION_ALTERNATIVES[canonicalItalian] || [];
    if (alternatives.some(alternative =>
      normalizedAnswer === normalizeAnswer(alternative)
    )) {
      return "produced-acceptable-alternative";
    }

    return null;
  }

  function getLanguagePatterns() {
    const source = Array.isArray(window.carrierPhrases?.[TOPIC_KEY])
      ? window.carrierPhrases[TOPIC_KEY]
      : [];
    return LANGUAGE_PATTERN_IDS
      .map(id => source.find(pattern => pattern.id === id))
      .filter(Boolean);
  }

  function languagePatternSentence(pattern, item) {
    const stem = String(pattern?.italian || "")
      .replace(/[.…]+$/u, "")
      .trim();
    return `${stem} ${item.italian}.`;
  }

  function storageKey() {
    const storage = window.PrimoVoloStorage;
    const baseKey = storage?.keys?.startingChecks || STORAGE_FALLBACK_KEY;
    if (storage?.studentKey) return storage.studentKey(baseKey);

    const studentId =
      window.localStorage.getItem("primoVoloCurrentStudentV1") || "";
    return studentId ? `${baseKey}:student:${studentId}` : baseKey;
  }

  function loadStore() {
    const storage = window.PrimoVoloStorage;
    try {
      const parsed = storage?.getJSON
        ? storage.getJSON(storageKey(), null)
        : JSON.parse(window.localStorage.getItem(storageKey()) || "null");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          version: Number(parsed.version) || 3,
          byTopic:
            parsed.byTopic && typeof parsed.byTopic === "object"
              ? parsed.byTopic
              : {}
        };
      }
    } catch (error) {
      console.warn("Supplies Starting Check data could not load.", error);
    }
    return { version: 3, byTopic: {} };
  }

  function saveStore(data) {
    const storage = window.PrimoVoloStorage;
    try {
      if (storage?.setJSON) storage.setJSON(storageKey(), data);
      else window.localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (error) {
      console.warn("Supplies Starting Check data could not save.", error);
    }
  }

  function latestResult() {
    const latest = loadStore().byTopic?.[TOPIC_KEY]?.latest;
    return Array.isArray(latest?.itemStatuses) ? latest : null;
  }

  function canonicalModes() {
    const availability = window.PrimoVoloActivityAvailability;
    return availability?.getCanonicalModes
      ? availability.getCanonicalModes(TOPIC_KEY)
      : [
          "learn", "choose", "match-word", "match-sound", "memory",
          "words-in-action", "assemble-sentences", "complete", "write"
        ];
  }

  function activityLabel(mode) {
    return {
      learn: "Impara",
      choose: "Scegli",
      "match-word": "Abbina",
      "match-sound": "Ascolta",
      "assemble-sentences": "Assembla",
      complete: "Completa",
      write: "Scrivi"
    }[mode] || mode;
  }

  function recommendationFor(
    recognitionCorrect,
    productionCorrect,
    availableModes = canonicalModes()
  ) {
    let primaryMode;
    let sequenceGroups;
    let message;

    if (recognitionCorrect < PRODUCTION_GATE) {
      primaryMode = "learn";
      sequenceGroups = [
        ["learn"],
        ["choose"],
        ["match-word", "match-sound"]
      ];
      message =
        "Costruiamo prima il riconoscimento. · Let's build recognition first.";
    } else if (productionCorrect * 4 < recognitionCorrect * 3) {
      primaryMode = "assemble-sentences";
      sequenceGroups = [["assemble-sentences"], ["complete"]];
      message =
        "Ora esercitiamoci a produrre le parole. · Now let's practice producing the words.";
    } else {
      primaryMode = "complete";
      sequenceGroups = [["complete"], ["write"]];
      message =
        "Sei pronto per una pratica più indipendente. · You're ready for more independent practice.";
    }

    const available = new Set(availableModes);
    const sequence = sequenceGroups
      .map(group => group.filter(mode => available.has(mode)))
      .filter(group => group.length);
    const selectedPrimary = available.has(primaryMode)
      ? primaryMode
      : sequence[0]?.[0] || null;

    return {
      primaryMode: selectedPrimary,
      primaryLabel: activityLabel(selectedPrimary),
      sequence,
      message
    };
  }

  function itemOptions(item, items = getItems(), random = Math.random) {
    const others = items.filter(option => option.id !== item.id);
    return shuffle(
      [item, ...shuffle(others, random).slice(0, 3)],
      random
    );
  }

  function buildRecognitionTasks(items = getItems(), random = Math.random) {
    const taskTypes = shuffle(RECOGNITION_TASK_TYPES, random);
    return shuffle(items, random).map((item, index) => ({
      item,
      taskType: taskTypes[index],
      options: itemOptions(item, items, random)
    }));
  }

  function buildLanguagePatternTasks(
    items = getItems(),
    patterns = getLanguagePatterns(),
    random = Math.random
  ) {
    if (patterns.length !== LANGUAGE_PATTERN_IDS.length) return [];
    const itemById = new Map(items.map(item => [item.id, item]));
    const cueItems = shuffle(
      LANGUAGE_PATTERN_SUPPLY_IDS.map(id => itemById.get(id)).filter(Boolean),
      random
    );
    const targets = shuffle(
      patterns.flatMap(pattern => [pattern, pattern]),
      random
    );
    return targets.map((pattern, index) => ({
      item: cueItems[index],
      pattern,
      taskType: "carrier-meaning",
      options: shuffle(patterns, random)
    }));
  }

  function buildProductionTasks(
    recognitionTasks,
    recognitionResults,
    random = Math.random
  ) {
    const recognizedIds = new Set(
      recognitionResults
        .filter(result => result.correct)
        .map(result => result.itemId)
    );
    return shuffle(
      recognitionTasks
        .filter(task => recognizedIds.has(task.item.id))
        .map(task => ({
          item: task.item,
          taskType: "independent-production"
        })),
      random
    );
  }

  function shouldAdministerProduction(recognitionCorrect) {
    return recognitionCorrect >= PRODUCTION_GATE;
  }

  function saveSession(activeSession = session) {
    const recognitionCorrect = activeSession.recognitionResults.filter(
      result => result.correct
    ).length;
    const productionCorrect = activeSession.productionResults.filter(
      result => result.correct
    ).length;
    const recommendation = recommendationFor(
      recognitionCorrect,
      productionCorrect
    );
    const saved = {
      id: activeSession.id,
      version: 3,
      startedAt: activeSession.startedAt,
      completedAt: activeSession.completedAt,
      recognitionTotal: RECOGNITION_TOTAL,
      recognitionCorrect,
      productionAdministered: activeSession.productionAdministered,
      productionTotal: activeSession.productionTasks.length,
      productionCorrect,
      languagePatterns: buildLanguagePatternSummary(
        activeSession.languagePatternResults
      ),
      recommendation: {
        primary: recommendation.primaryMode,
        primaryLabel: recommendation.primaryLabel
      },
      results: activeSession.results
        .filter(result => result.section !== "language-patterns")
        .map(result => ({
          itemId: result.itemId,
          italian: result.italian,
          english: result.english,
          taskType: result.taskType,
          stage: result.stage,
          selectedItemId: result.selectedItemId || null,
          typedAnswer: result.typedAnswer || null,
          productionStatus: result.productionStatus || null,
          status: result.correct ? "correct" : "incorrect"
        }))
    };

    saved.itemStatuses = activeSession.recognitionTasks.map(task => {
      const recognized = activeSession.recognitionResults.find(
        result => result.itemId === task.item.id
      )?.correct === true;
      const productionResult = activeSession.productionResults.find(
        result => result.itemId === task.item.id
      );
      return {
        itemId: task.item.id,
        italian: task.item.italian,
        english: task.item.english,
        typedAnswer: productionResult?.typedAnswer || null,
        status: productionResult?.productionStatus
          ? productionResult.productionStatus
          : recognized
            ? activeSession.productionAdministered
              ? "recognized-not-yet-produced"
              : "recognized-production-not-administered"
            : "not-yet-recognized"
      };
    });

    const data = loadStore();
    const topicData = data.byTopic[TOPIC_KEY] || { latest: null, history: [] };
    topicData.latest = saved;
    topicData.history = [
      ...(Array.isArray(topicData.history) ? topicData.history : []),
      saved
    ].slice(-10);
    data.version = 3;
    data.byTopic[TOPIC_KEY] = topicData;
    saveStore(data);
    return saved;
  }

  function buildLanguagePatternSummary(results) {
    const byPattern = {};
    getLanguagePatterns().forEach(pattern => {
      const patternResults = results.filter(
        result => result.patternId === pattern.id
      );
      byPattern[pattern.italian] = {
        correct: patternResults.filter(result => result.correct).length,
        total: patternResults.length
      };
    });
    return {
      total: results.length,
      correct: results.filter(result => result.correct).length,
      byPattern,
      results: results.map(result => ({ ...result }))
    };
  }

  function ensureStyles() {
    if (document.getElementById("suppliesStartingCheckStyles")) return;
    const style = document.createElement("style");
    style.id = "suppliesStartingCheckStyles";
    style.textContent = `
      .supplies-starting-check { width:min(980px,calc(100% - 32px)); margin:18px auto 8px; padding:18px 20px; border:1px solid #d9e2ef; border-radius:20px; background:#f8fbff; box-shadow:0 8px 24px rgba(39,75,132,.07); }
      .supplies-starting-check[hidden], .supplies-check-modal[hidden] { display:none !important; }
      .supplies-check-row { display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; }
      .supplies-check-copy { flex:1 1 520px; }
      .supplies-check-kicker { display:inline-block; margin-bottom:4px; color:#337a4d; font-size:.82rem; font-weight:900; text-transform:uppercase; }
      .supplies-starting-check h3 { margin:0; color:#274b84; font-size:1.2rem; }
      .supplies-starting-check p { margin:6px 0 0; color:#5f6f86; line-height:1.45; }
      .supplies-check-summary { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .supplies-check-chip { padding:6px 10px; border-radius:999px; color:#274b84; background:#eaf2fb; font-size:.86rem; font-weight:800; }
      .supplies-check-latest { margin-top:10px; }
      .supplies-check-button, .supplies-check-next, .supplies-check-audio { border:0; border-radius:999px; padding:11px 16px; color:white; background:#337a4d; font:inherit; font-weight:850; cursor:pointer; }
      .supplies-check-next:disabled { opacity:.48; cursor:not-allowed; }
      .supplies-check-modal { position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:18px; background:rgba(24,39,63,.58); }
      .supplies-check-dialog { position:relative; width:min(820px,100%); max-height:min(740px,94vh); overflow:auto; padding:28px; border-radius:24px; background:#fff; box-shadow:0 20px 70px rgba(24,39,63,.28); }
      .supplies-check-close { position:absolute; top:12px; right:14px; border:0; color:#274b84; background:transparent; font-size:1.7rem; cursor:pointer; }
      .supplies-check-progress, .supplies-check-part, .supplies-check-task { display:block; margin:0 0 6px; color:#5f6f86; font-size:.88rem; font-weight:800; }
      .supplies-check-question { text-align:center; }
      .supplies-check-question h2 { margin:8px 0 2px; color:#274b84; }
      .supplies-check-note { margin:0 0 14px; color:#5f6f86; }
      .supplies-check-cue { display:block; width:min(260px,70vw); aspect-ratio:1; object-fit:contain; margin:10px auto; border-radius:18px; background:#f7f9fc; }
      .supplies-check-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:16px; }
      .supplies-check-option { min-height:150px; padding:10px; border:2px solid #d9e2ef; border-radius:16px; color:#274b84; background:#fff; font:inherit; font-weight:800; cursor:pointer; }
      .supplies-check-option:hover, .supplies-check-option.is-selected { border-color:#337a4d; background:#eff9f1; }
      .supplies-check-option img { display:block; width:100%; height:120px; object-fit:contain; }
      .supplies-check-options.is-word-choice .supplies-check-option { min-height:64px; }
      .supplies-language-composite { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:8px; }
      .supplies-language-composite img { width:100%; height:100px; object-fit:contain; }
      .supplies-language-plus { color:#64748b; font-size:1.4rem; font-weight:900; }
      .supplies-language-scores { display:grid; gap:8px; margin:14px auto; max-width:520px; text-align:left; }
      .supplies-language-score { display:flex; justify-content:space-between; gap:18px; padding:9px 12px; border-radius:10px; background:#f3f6fb; }
      .supplies-vocabulary-detail { margin-top:14px; text-align:left; }
      .supplies-vocabulary-detail > summary { color:#274b84; font-weight:850; cursor:pointer; }
      .supplies-vocabulary-detail-list { display:grid; gap:7px; margin-top:10px; }
      .supplies-vocabulary-detail-row { display:grid; grid-template-columns:minmax(130px,1fr) minmax(150px,1.2fr); gap:10px; padding:9px 11px; border-radius:10px; background:#f3f6fb; color:#52657e; }
      .supplies-check-input { width:min(560px,100%); margin:12px auto; padding:13px 15px; border:2px solid #d9e2ef; border-radius:12px; font:inherit; font-size:1.05rem; }
      .supplies-check-footer { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-top:20px; }
      .supplies-check-footer span { color:#5f6f86; font-size:.9rem; }
      .supplies-check-result { margin-top:14px; padding:16px; border-radius:16px; background:#f3f6fb; }
      .supplies-check-result strong { display:block; color:#274b84; font-size:2rem; }
      @media (max-width:620px) { .supplies-check-dialog { padding:24px 16px; } .supplies-check-options { grid-template-columns:1fr 1fr; } .supplies-check-option { min-height:120px; } .supplies-check-option img { height:90px; } .supplies-check-footer { align-items:stretch; flex-direction:column; } }
    `;
    document.head.append(style);
  }

  function buildCard() {
    const card = document.createElement("section");
    card.className = "supplies-starting-check";
    card.hidden = true;
    card.innerHTML = `
      <div class="supplies-check-row">
        <div class="supplies-check-copy">
          <span class="supplies-check-kicker">Prima di iniziare · Starting point</span>
          <h3>✏️ Prova iniziale · School Supplies Starting Check</h3>
          <p>Prima riconosci gli oggetti. Se sei pronto, prova a nominarli. Poi ascolta alcune frasi utili. <span lang="en">First see which school-supply words you recognize. If you're ready, try naming them. Then check a few useful language patterns.</span></p>
          <div class="supplies-check-summary">
            <span class="supplies-check-chip">14 oggetti · 14 items</span>
            <span class="supplies-check-chip">6 frasi utili · 6 useful-language trials</span>
          </div>
          <div class="supplies-check-latest" data-role="latest"></div>
        </div>
        <button type="button" class="supplies-check-button" data-action="start">▶ Inizia · Start</button>
      </div>
    `;
    const menu = document.querySelector(".activity-menu");
    if (menu?.parentNode) menu.parentNode.insertBefore(card, menu);
    card.querySelector('[data-action="start"]')?.addEventListener("click", startCheck);
    return card;
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "supplies-check-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="supplies-check-dialog" role="dialog" aria-modal="true" aria-label="School Supplies Starting Check">
        <button type="button" class="supplies-check-close" aria-label="Close Starting Check">×</button>
        <div data-role="body"></div>
      </div>
    `;
    modalBody = modal.querySelector('[data-role="body"]');
    modal.querySelector(".supplies-check-close")?.addEventListener("click", () => {
      modal.hidden = true;
      session = null;
    });
    document.body.append(modal);
  }

  function refreshLatest() {
    if (!checkCard) return;
    const holder = checkCard.querySelector('[data-role="latest"]');
    const latest = latestResult();
    if (!holder) return;
    holder.innerHTML = latest
      ? `<p><strong>Ultima prova · Latest:</strong> Riconoscimento · Recognition ${latest.recognitionCorrect ?? 0} / ${latest.recognitionTotal ?? RECOGNITION_TOTAL}</p>`
      : "";
  }

  function updateVisibility() {
    if (!checkCard) return;
    checkCard.hidden = document.getElementById("topicSelect")?.value !== TOPIC_KEY;
    if (!checkCard.hidden) refreshLatest();
  }

  function startCheck() {
    const recognitionTasks = buildRecognitionTasks();
    const languagePatternTasks = buildLanguagePatternTasks();
    if (
      recognitionTasks.length !== RECOGNITION_TOTAL ||
      languagePatternTasks.length !== LANGUAGE_PATTERN_TOTAL
    ) {
      window.alert("The School Supplies Starting Check could not load all required items.");
      return;
    }
    ensureModal();
    session = {
      id: `supplies-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: new Date().toISOString(),
      completedAt: null,
      stage: "recognition",
      index: 0,
      selected: null,
      recognitionTasks,
      productionTasks: [],
      productionAdministered: false,
      recognitionResults: [],
      productionResults: [],
      languagePatternTasks,
      languagePatternResults: [],
      results: []
    };
    modal.hidden = false;
    renderCurrent();
  }

  function currentTask() {
    const tasks = session?.stage === "production"
      ? session.productionTasks
      : session?.stage === "language-patterns"
        ? session.languagePatternTasks
        : session?.recognitionTasks;
    return tasks?.[session.index] || null;
  }

  function renderCurrent() {
    const task = currentTask();
    if (!task || !modalBody) return;
    session.selected = null;
    const isRecognition = session.stage === "recognition";
    const isProduction = session.stage === "production";
    const tasks = isRecognition
      ? session.recognitionTasks
      : isProduction
        ? session.productionTasks
        : session.languagePatternTasks;
    const base = `
      <p class="supplies-check-progress">${session.index + 1} / ${tasks.length}</p>
      <div class="supplies-check-question">
        <span class="supplies-check-part">Prova iniziale · Starting Check</span>
        <span class="supplies-check-task">${isRecognition
          ? "Parte 1 · Riconoscimento · Recognition"
          : isProduction
            ? "Parte 2 · Produzione indipendente · Independent production"
            : "Parte finale · Frasi utili · Useful language"}</span>
    `;

    if (isRecognition) {
      const pictureToItalian = task.taskType === "picture-to-italian";
      const listening = task.taskType === "listen-to-picture";
      modalBody.innerHTML = `${base}
        ${pictureToItalian
          ? `<img class="supplies-check-cue" src="${escapeHtml(task.item.image)}" alt="School supply">`
          : `<h2>${listening ? "Ascolta · Listen" : escapeHtml(task.item.italian)}</h2>`}
        <p class="supplies-check-note">${pictureToItalian
          ? "Scegli la parola italiana. · Choose the Italian word."
          : "Scegli l'immagine. · Choose the correct picture."}</p>
        ${pictureToItalian ? "" : `<p><button type="button" class="supplies-check-audio" data-action="replay">🔊 Ascolta · Listen</button></p>`}
        <div class="supplies-check-options${pictureToItalian ? " is-word-choice" : ""}">
          ${task.options.map(option => `
            <button type="button" class="supplies-check-option" data-choice="${escapeHtml(option.id)}" aria-label="Picture choice">
              ${pictureToItalian
                ? escapeHtml(option.italian)
                : `<img src="${escapeHtml(option.image)}" alt="">`}
            </button>
          `).join("")}
        </div>
        <div class="supplies-check-footer"><span>Nessun suggerimento · No hints</span><button type="button" class="supplies-check-next" data-action="next" disabled>Avanti · Next →</button></div>
      </div>`;
      const buttons = [...modalBody.querySelectorAll(".supplies-check-option")];
      const next = modalBody.querySelector('[data-action="next"]');
      buttons.forEach(button => button.addEventListener("click", () => {
        buttons.forEach(choice => choice.classList.toggle("is-selected", choice === button));
        session.selected = button.dataset.choice;
        if (next) next.disabled = false;
      }));
      next?.addEventListener("click", recordChoice);
      modalBody.querySelector('[data-action="replay"]')?.addEventListener("click", () => speak(task.item.italian));
      if (listening) window.setTimeout(() => speak(task.item.italian), 150);
      return;
    }

    if (!isProduction) {
      const sentence = languagePatternSentence(task.pattern, task.item);
      modalBody.innerHTML = `${base}
        <h2>Ascolta la frase. Quale immagine mostra il significato?</h2>
        <p><button type="button" class="supplies-check-audio" data-action="replay">🔊 Ascolta di nuovo · Listen again</button></p>
        <p class="supplies-check-note">L'oggetto è lo stesso in ogni risposta. <span lang="en">The school-supply picture is the same in every choice.</span></p>
        <div class="supplies-check-options">
          ${task.options.map(pattern => `
            <button type="button" class="supplies-check-option" data-choice="${escapeHtml(pattern.id)}" aria-label="Useful-language picture choice">
              <span class="supplies-language-composite">
                <img src="${escapeHtml(pattern.image)}" alt="">
                <span class="supplies-language-plus" aria-hidden="true">+</span>
                <img src="${escapeHtml(task.item.image)}" alt="">
              </span>
            </button>`).join("")}
        </div>
        <div class="supplies-check-footer"><span>Nessun suggerimento · No hints</span><button type="button" class="supplies-check-next" data-action="next" disabled>Avanti · Next →</button></div>
      </div>`;
      const buttons = [...modalBody.querySelectorAll(".supplies-check-option")];
      const next = modalBody.querySelector('[data-action="next"]');
      buttons.forEach(button => button.addEventListener("click", () => {
        buttons.forEach(choice => choice.classList.toggle("is-selected", choice === button));
        session.selected = button.dataset.choice;
        if (next) next.disabled = false;
      }));
      next?.addEventListener("click", recordLanguagePatternChoice);
      modalBody.querySelector('[data-action="replay"]')?.addEventListener("click", () => speak(sentence));
      window.setTimeout(() => speak(sentence), 150);
      return;
    }

    modalBody.innerHTML = `${base}
      <img class="supplies-check-cue" src="${escapeHtml(task.item.image)}" alt="School supply to name in Italian">
      <h2>Come si dice in italiano?</h2>
      <p class="supplies-check-note">What is this in Italian?</p>
      <form data-action="recall">
        <label class="sr-only" for="suppliesCheckInput">Name the item in Italian</label>
        <input id="suppliesCheckInput" class="supplies-check-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Name the item in Italian">
        <div class="supplies-check-footer"><span>Nessun suggerimento · No hints</span><button type="submit" class="supplies-check-next">Controlla · Check</button></div>
      </form>
    </div>`;
    modalBody.querySelector('[data-action="recall"]')?.addEventListener("submit", event => {
      event.preventDefault();
      recordRecall();
    });
    modalBody.querySelector("#suppliesCheckInput")?.focus();
  }

  function recordChoice() {
    if (!session || session.selected === null) return;
    const task = currentTask();
    const result = {
      itemId: task.item.id,
      italian: task.item.italian,
      english: task.item.english,
      taskType: task.taskType,
      stage: "recognition",
      selectedItemId: session.selected,
      correct: session.selected === task.item.id
    };
    session.recognitionResults.push(result);
    session.results.push(result);
    advance();
  }

  function recordRecall() {
    const typedAnswer = modalBody.querySelector("#suppliesCheckInput")?.value || "";
    const task = currentTask();
    const productionStatus = classifyProduction(typedAnswer, task.item.italian);
    const result = {
      itemId: task.item.id,
      italian: task.item.italian,
      english: task.item.english,
      taskType: task.taskType,
      stage: "production",
      typedAnswer,
      productionStatus,
      correct: productionStatus !== null
    };
    session.productionResults.push(result);
    session.results.push(result);
    advance();
  }

  function recordLanguagePatternChoice() {
    if (!session || session.selected === null) return;
    const task = currentTask();
    const result = {
      section: "language-patterns",
      stage: "language-patterns",
      itemId: task.item.id,
      italian: task.item.italian,
      english: task.item.english,
      taskType: task.taskType,
      patternId: task.pattern.id,
      patternItalian: task.pattern.italian,
      selectedPatternId: session.selected,
      correct: session.selected === task.pattern.id
    };
    session.languagePatternResults.push(result);
    session.results.push(result);
    advance();
  }

  function advance() {
    session.index += 1;
    const tasks = session.stage === "recognition"
      ? session.recognitionTasks
      : session.stage === "production"
        ? session.productionTasks
        : session.languagePatternTasks;
    if (session.index < tasks.length) {
      renderCurrent();
      return;
    }

    if (session.stage === "recognition") {
      const recognitionCorrect = session.recognitionResults.filter(
        result => result.correct
      ).length;
      if (!shouldAdministerProduction(recognitionCorrect)) {
        beginLanguagePatterns();
        return;
      }
      session.productionAdministered = true;
      session.productionTasks = buildProductionTasks(
        session.recognitionTasks,
        session.recognitionResults
      );
      session.stage = "production";
      session.index = 0;
      renderProductionIntro();
      return;
    }
    if (session.stage === "production") {
      beginLanguagePatterns();
      return;
    }
    finishCheck();
  }

  function renderProductionIntro() {
    modalBody.innerHTML = `
      <div class="supplies-check-question">
        <span class="supplies-check-part">Parte 2 · Produzione indipendente</span>
        <h2>Ora prova da solo!</h2>
        <p>Ora prova gli oggetti che hai riconosciuto. <span lang="en">Now try the items you recognized on your own.</span></p>
        <button type="button" class="supplies-check-next" data-action="continue">Continua · Continue →</button>
      </div>`;
    modalBody.querySelector('[data-action="continue"]')?.addEventListener("click", renderCurrent);
  }

  function beginLanguagePatterns() {
    session.stage = "language-patterns";
    session.index = 0;
    session.selected = null;
    modalBody.innerHTML = `
      <div class="supplies-check-question">
        <span class="supplies-check-part">Parte finale · Frasi utili</span>
        <h2>Ascolta le frasi utili.</h2>
        <p>L'oggetto rimane uguale. Scegli l'immagine che mostra il significato. <span lang="en">The item stays the same. Choose the picture that shows the useful-language meaning.</span></p>
        <div class="supplies-check-summary">
          <span class="supplies-check-chip">Mi piace…</span>
          <span class="supplies-check-chip">Io ho…</span>
          <span class="supplies-check-chip">Io vedo…</span>
        </div>
        <button type="button" class="supplies-check-next" data-action="continue">Continua · Continue →</button>
      </div>`;
    modalBody.querySelector('[data-action="continue"]')?.addEventListener("click", renderCurrent);
  }

  function finishCheck() {
    session.completedAt = new Date().toISOString();
    const saved = saveSession();
    const recommendation = recommendationFor(
      saved.recognitionCorrect,
      saved.productionCorrect
    );
    const sequenceText = recommendation.sequence
      .map(group => group.map(activityLabel).join(" / "))
      .join(" → ");
    const patternRows = Object.entries(saved.languagePatterns.byPattern)
      .map(([pattern, score]) => `<div class="supplies-language-score"><span>${escapeHtml(pattern)}</span><strong>${score.correct} / ${score.total}</strong></div>`)
      .join("");
    const vocabularyRows = saved.itemStatuses.map(item => {
      const recognized = item.status !== "not-yet-recognized";
      let productionLabel = "Non testata · Not tested";
      if (!saved.productionAdministered) {
        productionLabel = "Non somministrata · Not administered";
      } else if (
        item.status === "produced-canonical" ||
        item.status === "produced-acceptable-alternative"
      ) {
        productionLabel = "Prodotta · Produced";
      } else if (recognized) {
        productionLabel = "Da esercitare · Ready to practice";
      }
      return `<div class="supplies-vocabulary-detail-row"><strong>${escapeHtml(item.italian)}</strong><span>${recognized ? "Riconosciuta · Recognized" : "Non ancora riconosciuta · Not yet recognized"}<br>${productionLabel}</span></div>`;
    }).join("");
    refreshLatest();
    modalBody.innerHTML = `
      <div class="supplies-check-question">
        <span class="supplies-check-part">Prova completata · Check complete</span>
        <h2>Punto di partenza · Starting point</h2>
        <div class="supplies-check-result"><strong>${saved.recognitionCorrect} / ${saved.recognitionTotal}</strong><span>Riconoscimento · Recognition</span></div>
        <div class="supplies-check-result"><strong>${saved.productionAdministered
          ? `${saved.productionCorrect} / ${saved.productionTotal}`
          : "Non somministrata · Not administered"}</strong><span>Produzione indipendente · Independent production</span></div>
        <div class="supplies-check-result"><strong>${saved.languagePatterns.correct} / ${saved.languagePatterns.total}</strong><span>Frasi utili · Useful language</span></div>
        <div class="supplies-language-scores">${patternRows}</div>
        <details class="supplies-vocabulary-detail">
          <summary>Dettagli del vocabolario · Vocabulary details</summary>
          <div class="supplies-vocabulary-detail-list">${vocabularyRows}</div>
        </details>
        <p>Questa è una fotografia di partenza, non un voto. <span lang="en">This is a starting-point snapshot, not a grade.</span></p>
        <p>${escapeHtml(recommendation.message)}</p>
        <p><strong>Inizia con · Start with:</strong> ${escapeHtml(recommendation.primaryLabel)}<br><strong>Sequenza suggerita · Suggested sequence:</strong> ${escapeHtml(sequenceText)}</p>
        <button type="button" class="supplies-check-next" data-action="close">Chiudi · Close</button>
      </div>`;
    modalBody.querySelector('[data-action="close"]')?.addEventListener("click", () => {
      modal.hidden = true;
      session = null;
    });
  }

  function initialize() {
    if (!document.querySelector(".activity-menu")) return;
    ensureStyles();
    checkCard = buildCard();
    updateVisibility();
    document.getElementById("topicSelect")?.addEventListener("change", updateVisibility);
    window.addEventListener("primo-volo-student-changed", refreshLatest);
  }

  if (window.__PRIMO_VOLO_SUPPLIES_STARTING_CHECK_TEST__) {
    window.__suppliesStartingCheckTestHooks = {
      getItems,
      buildRecognitionTasks,
      buildProductionTasks,
      buildLanguagePatternTasks,
      buildLanguagePatternSummary,
      languagePatternSentence,
      shouldAdministerProduction,
      classifyProduction,
      normalizeAnswer,
      productionAlternatives: PRODUCTION_ALTERNATIVES,
      recommendationFor,
      saveSession,
      storageKey,
      loadStore
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
