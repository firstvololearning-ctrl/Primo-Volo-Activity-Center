"use strict";

/*
  DAYS STARTING CHECK
  Adaptive recognition and independent-production check using canonical Days
  vocabulary. Diagnostic only: it does not record ordinary practice.
*/
(() => {
  const TOPIC_KEY = "days";
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";
  const RECOGNITION_TOTAL = 7;

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let session = null;

  function getItems() {
    const source =
      typeof days !== "undefined" && Array.isArray(days)
        ? days
        : [];

    return source.slice(0, RECOGNITION_TOTAL).map((item, index) => ({
      id: String(index + 1).padStart(2, "0"),
      italian: item.italian,
      english: item.english
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

    if (window.PrimoVoloAudio?.speak) {
      window.PrimoVoloAudio.speak(text);
    }
  }

  function normalizeAnswer(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function classifyProduction(typedAnswer, canonicalItalian) {
    const normalizedAnswer = normalizeAnswer(typedAnswer);
    const normalizedCanonical = normalizeAnswer(canonicalItalian);

    if (normalizedAnswer === normalizedCanonical) {
      return "produced-canonical";
    }

    if (
      normalizedCanonical === "la domenica" &&
      normalizedAnswer === "domenica"
    ) {
      return "produced-acceptable-alternative";
    }

    return null;
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
      console.warn("Days Starting Check data could not load.", error);
    }

    return { version: 3, byTopic: {} };
  }

  function saveStore(data) {
    const storage = window.PrimoVoloStorage;

    try {
      if (storage?.setJSON) storage.setJSON(storageKey(), data);
      else window.localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (error) {
      console.warn("Days Starting Check data could not save.", error);
    }
  }

  function latestResult() {
    return loadStore().byTopic?.[TOPIC_KEY]?.latest || null;
  }

  function canonicalModes() {
    const availability = window.PrimoVoloActivityAvailability;
    return availability?.getCanonicalModes
      ? availability.getCanonicalModes(TOPIC_KEY)
      : [
          "learn",
          "choose",
          "match-word",
          "match-sound",
          "memory",
          "words-in-action",
          "assemble-sentences",
          "complete",
          "write"
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
      write: "Scrivi",
      "words-in-action": "Parole in azione"
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

    if (recognitionCorrect <= 4) {
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
      sequenceGroups = [
        ["assemble-sentences"],
        ["complete"]
      ];
      message =
        "Ora esercitiamoci a produrre i giorni. · Now let's practice producing the days.";
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

    return {
      primaryMode: available.has(primaryMode)
        ? primaryMode
        : sequence[0]?.[0] || null,
      primaryLabel: activityLabel(
        available.has(primaryMode) ? primaryMode : sequence[0]?.[0]
      ),
      sequence,
      message
    };
  }

  function saveSession() {
    const data = loadStore();
    const topicData = data.byTopic[TOPIC_KEY] || {
      latest: null,
      history: []
    };
    const recommendation = recommendationFor(
      session.recognitionResults.filter(result => result.correct).length,
      session.productionResults.filter(result => result.correct).length
    );
    const saved = {
      id: session.id,
      version: 3,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      recognitionTotal: RECOGNITION_TOTAL,
      recognitionCorrect:
        session.recognitionResults.filter(result => result.correct).length,
      productionTotal: session.productionTasks.length,
      productionCorrect:
        session.productionResults.filter(result => result.correct).length,
      productionAdministered: session.productionAdministered,
      recommendation: {
        primary: recommendation.primaryMode,
        primaryLabel: recommendation.primaryLabel
      },
      results: session.results.map(result => ({
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

    saved.itemStatuses = session.recognitionTasks.map(task => {
      const recognized = session.recognitionResults.find(
        result => result.itemId === task.item.id
      )?.correct === true;
      const productionResult = session.productionResults.find(
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
            ? session.productionAdministered
              ? "recognized-not-yet-produced"
              : "recognized-production-not-administered"
            : "not-yet-recognized"
      };
    });

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

  function itemOptions(item, items = getItems(), random = Math.random) {
    const others = items.filter(option => option.id !== item.id);
    return shuffle(
      [item, ...shuffle(others, random).slice(0, 3)],
      random
    );
  }

  function buildRecognitionTasks(items = getItems(), random = Math.random) {
    return shuffle(items, random).map(item => ({
      item,
      taskType: "meaning-recognition",
      options: itemOptions(item, items, random)
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
    return recognitionCorrect >= 5;
  }

  function ensureStyles() {
    if (document.getElementById("daysStartingCheckStyles")) return;

    const style = document.createElement("style");
    style.id = "daysStartingCheckStyles";
    style.textContent = `
      .days-starting-check {
        width: min(980px, calc(100% - 32px)); margin: 18px auto 8px;
        padding: 18px 20px; border: 1px solid #d9e2ef;
        border-radius: 20px; background: #f8fbff;
        box-shadow: 0 8px 24px rgba(39,75,132,.07);
      }
      .days-starting-check[hidden], .days-check-modal[hidden] { display: none !important; }
      .days-check-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
      .days-check-copy { flex: 1 1 520px; }
      .days-check-kicker { display: inline-block; margin-bottom: 4px; color: #337a4d; font-size: .82rem; font-weight: 900; text-transform: uppercase; }
      .days-starting-check h3 { margin: 0; color: #274b84; font-size: 1.2rem; }
      .days-starting-check p { margin: 6px 0 0; color: #5f6f86; line-height: 1.45; }
      .days-check-summary { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
      .days-check-chip { padding: 6px 10px; border-radius: 999px; color: #274b84; background: #eaf2fb; font-size: .86rem; font-weight: 800; }
      .days-check-latest { margin-top: 10px; }
      .days-check-button, .days-check-next, .days-check-audio { border: 0; border-radius: 999px; padding: 11px 16px; color: white; background: #337a4d; font: inherit; font-weight: 850; cursor: pointer; }
      .days-check-next:disabled { opacity: .48; cursor: not-allowed; }
      .days-check-modal { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 18px; background: rgba(24,39,63,.58); }
      .days-check-dialog { position: relative; width: min(820px, 100%); max-height: min(740px, 94vh); overflow: auto; padding: 28px; border-radius: 24px; background: #fff; box-shadow: 0 20px 70px rgba(24,39,63,.28); }
      .days-check-close { position: absolute; top: 12px; right: 14px; border: 0; color: #274b84; background: transparent; font-size: 1.7rem; cursor: pointer; }
      .days-check-progress, .days-check-part, .days-check-task { display: block; margin: 0 0 6px; color: #5f6f86; font-size: .88rem; font-weight: 800; }
      .days-check-question { text-align: center; }
      .days-check-question h2 { margin: 8px 0 2px; color: #274b84; }
      .days-check-note { margin: 0 0 14px; color: #5f6f86; }
      .days-check-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
      .days-check-option { min-height: 64px; padding: 10px; border: 2px solid #d9e2ef; border-radius: 16px; color: #274b84; background: #fff; font: inherit; font-weight: 800; cursor: pointer; }
      .days-check-option:hover, .days-check-option.is-selected { border-color: #337a4d; background: #eff9f1; }
      .days-check-input { width: min(560px, 100%); margin: 12px auto; padding: 13px 15px; border: 2px solid #d9e2ef; border-radius: 12px; font: inherit; font-size: 1.05rem; }
      .days-check-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 20px; }
      .days-check-footer span { color: #5f6f86; font-size: .9rem; }
      .days-check-result { margin-top: 14px; padding: 16px; border-radius: 16px; background: #f3f6fb; }
      .days-check-result strong { display: block; color: #274b84; font-size: 2rem; }
      @media (max-width: 620px) {
        .days-check-dialog { padding: 24px 16px; }
        .days-check-options { grid-template-columns: 1fr; }
        .days-check-footer { align-items: stretch; flex-direction: column; }
      }
    `;
    document.head.append(style);
  }

  function buildCard() {
    const card = document.createElement("section");
    card.className = "days-starting-check";
    card.hidden = true;
    card.innerHTML = `
      <div class="days-check-row">
        <div class="days-check-copy">
          <span class="days-check-kicker">Prima di iniziare · Starting point</span>
          <h3>📅 Prova iniziale · Days Starting Check</h3>
          <p>
            Prima riconosci i giorni. Poi prova da solo quelli che hai riconosciuto.
            <span lang="en">First recognize the days. Then try the ones you recognized on your own.</span>
          </p>
          <div class="days-check-summary">
            <span class="days-check-chip">7 giorni · 7 days</span>
            <span class="days-check-chip">I giorni · Days</span>
          </div>
          <div class="days-check-latest" data-role="latest"></div>
        </div>
        <button type="button" class="days-check-button" data-action="start">
          ▶ Inizia · Start
        </button>
      </div>
    `;

    const menu = document.querySelector(".activity-menu");
    if (menu?.parentNode) menu.parentNode.insertBefore(card, menu);
    card.querySelector('[data-action="start"]')
      ?.addEventListener("click", startCheck);
    return card;
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "days-check-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="days-check-dialog" role="dialog" aria-modal="true" aria-label="Days Starting Check">
        <button type="button" class="days-check-close" aria-label="Close Starting Check">×</button>
        <div data-role="body"></div>
      </div>
    `;
    modalBody = modal.querySelector('[data-role="body"]');
    modal.querySelector(".days-check-close")?.addEventListener("click", () => {
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
    if (recognitionTasks.length !== RECOGNITION_TOTAL) {
      window.alert("The Days Starting Check could not load all required items.");
      return;
    }

    ensureModal();
    session = {
      id: `days-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
      results: []
    };
    modal.hidden = false;
    renderCurrent();
  }

  function currentTask() {
    const tasks = session?.stage === "production"
      ? session.productionTasks
      : session?.recognitionTasks;
    return tasks?.[session.index] || null;
  }

  function connectChoices() {
    const buttons = [...modalBody.querySelectorAll(".days-check-option")];
    const next = modalBody.querySelector('[data-action="next"]');
    buttons.forEach(button => button.addEventListener("click", () => {
      buttons.forEach(choice => choice.classList.toggle(
        "is-selected",
        choice === button
      ));
      session.selected = button.dataset.choice;
      if (next) next.disabled = false;
    }));
  }

  function renderCurrent() {
    const task = currentTask();
    if (!task || !modalBody) return;
    session.selected = null;
    const isRecognition = session.stage === "recognition";
    const tasks = isRecognition
      ? session.recognitionTasks
      : session.productionTasks;
    const base = `
      <p class="days-check-progress">${session.index + 1} / ${tasks.length}</p>
      <div class="days-check-question">
        <span class="days-check-part">Prova iniziale · Starting Check</span>
        <span class="days-check-task">${isRecognition
          ? "Parte 1 · Riconoscimento · Recognition"
          : "Parte 2 · Produzione indipendente · Independent production"}</span>
    `;

    if (isRecognition) {
      modalBody.innerHTML = `${base}
        <h2>${escapeHtml(task.item.italian)}</h2>
        <p class="days-check-note">Scegli il significato. · Choose the correct meaning.</p>
        <p><button type="button" class="days-check-audio" data-action="replay">🔊 Ascolta · Listen</button></p>
        <div class="days-check-options">
          ${task.options.map(option => `
            <button type="button" class="days-check-option" data-choice="${option.id}">
              ${escapeHtml(option.english)}
            </button>
          `).join("")}
        </div>
        <div class="days-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="button" class="days-check-next" data-action="next" disabled>Avanti · Next →</button>
        </div>
      </div>`;
      connectChoices();
      modalBody.querySelector('[data-action="next"]')
        ?.addEventListener("click", recordChoice);
      modalBody.querySelector('[data-action="replay"]')
        ?.addEventListener("click", () => speak(task.item.italian));
      return;
    }

    modalBody.innerHTML = `${base}
      <h2>${escapeHtml(task.item.english)}</h2>
      <p class="days-check-note">
        Scrivi il giorno in italiano.
        <span lang="en">Write the day in Italian.</span>
      </p>
      <form data-action="recall">
        <label class="sr-only" for="daysCheckInput">Scrivi il giorno in italiano</label>
        <input id="daysCheckInput" class="days-check-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Write the day in Italian">
        <div class="days-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="submit" class="days-check-next">Controlla · Check</button>
        </div>
      </form>
    </div>`;
    modalBody.querySelector('[data-action="recall"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        recordRecall();
      });
    modalBody.querySelector("#daysCheckInput")?.focus();
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
    const input = modalBody.querySelector("#daysCheckInput");
    const typedAnswer = input?.value || "";
    const task = currentTask();
    const productionStatus = classifyProduction(
      typedAnswer,
      task.item.italian
    );
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

  function advance() {
    session.index += 1;
    const tasks = session.stage === "recognition"
      ? session.recognitionTasks
      : session.productionTasks;

    if (session.index < tasks.length) {
      renderCurrent();
      return;
    }

    if (session.stage === "recognition") {
      const recognitionCorrect =
        session.recognitionResults.filter(
          result => result.correct
        ).length;

      if (!shouldAdministerProduction(recognitionCorrect)) {
        finishCheck();
        return;
      }

      session.productionAdministered = true;
      session.productionTasks = buildProductionTasks(
        session.recognitionTasks,
        session.recognitionResults
      );
      if (!session.productionTasks.length) {
        finishCheck();
        return;
      }
      session.stage = "production";
      session.index = 0;
      renderProductionIntro();
      return;
    }

    finishCheck();
  }

  function renderProductionIntro() {
    modalBody.innerHTML = `
      <div class="days-check-question">
        <span class="days-check-part">Parte 2 · Produzione indipendente</span>
        <h2>Ora prova da solo!</h2>
        <p>Ora prova i giorni che hai riconosciuto. <span lang="en">Now try the days you recognized on your own.</span></p>
        <button type="button" class="days-check-next" data-action="continue">Continua · Continue →</button>
      </div>
    `;
    modalBody.querySelector('[data-action="continue"]')
      ?.addEventListener("click", renderCurrent);
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
    refreshLatest();
    modalBody.innerHTML = `
      <div class="days-check-question">
        <span class="days-check-part">Prova completata · Check complete</span>
        <h2>Punto di partenza · Starting point</h2>
        <div class="days-check-result"><strong>${saved.recognitionCorrect} / ${saved.recognitionTotal}</strong><span>Riconoscimento · Recognition</span></div>
        ${saved.productionAdministered ? `
          <div class="days-check-result"><strong>${saved.productionCorrect} / ${saved.productionTotal}</strong><span>Produzione indipendente · Independent production</span></div>
        ` : ""}
        <p>Questa è una fotografia di partenza, non un voto. <span lang="en">This is a starting-point snapshot, not a grade.</span></p>
        <p>${escapeHtml(recommendation.message)}</p>
        <p><strong>Inizia con · Start with:</strong> ${escapeHtml(recommendation.primaryLabel)}<br><strong>Sequenza suggerita · Suggested sequence:</strong> ${escapeHtml(sequenceText)}</p>
        <button type="button" class="days-check-next" data-action="close">Chiudi · Close</button>
      </div>
    `;
    modalBody.querySelector('[data-action="close"]')
      ?.addEventListener("click", () => {
        modal.hidden = true;
        session = null;
      });
  }

  function initialize() {
    if (!document.querySelector(".activity-menu")) return;
    ensureStyles();
    checkCard = buildCard();
    updateVisibility();
    document.getElementById("topicSelect")
      ?.addEventListener("change", updateVisibility);
    window.addEventListener("primo-volo-student-changed", refreshLatest);
  }

  if (window.__PRIMO_VOLO_DAYS_STARTING_CHECK_TEST__) {
    window.__daysStartingCheckTestHooks = {
      buildRecognitionTasks,
      buildProductionTasks,
      shouldAdministerProduction,
      classifyProduction,
      normalizeAnswer,
      recommendationFor
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
