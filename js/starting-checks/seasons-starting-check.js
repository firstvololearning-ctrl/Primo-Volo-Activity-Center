"use strict";

/*
  SEASONS STARTING CHECK
  Four-target recognition and gated independent production. Diagnostic only:
  it writes only to Starting Check storage, never ordinary practice progress.
*/
(() => {
  const TOPIC_KEY = "seasons";
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";
  const RECOGNITION_TOTAL = 4;
  const PRODUCTION_GATE = 3;
  const RESPONSE_METADATA = Object.freeze({
    inverno: Object.freeze({
      canonical: "inverno",
      alternatives: Object.freeze(["l'inverno", "l’inverno"])
    }),
    primavera: Object.freeze({
      canonical: "primavera",
      alternatives: Object.freeze(["la primavera"])
    }),
    estate: Object.freeze({
      canonical: "estate",
      alternatives: Object.freeze(["l'estate", "l’estate"])
    }),
    autunno: Object.freeze({
      canonical: "autunno",
      alternatives: Object.freeze(["l'autunno", "l’autunno"])
    })
  });

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let session = null;

  function getItems() {
    const source = typeof seasons !== "undefined" && Array.isArray(seasons)
      ? seasons
      : [];
    return source.slice(0, RECOGNITION_TOTAL).map((item, index) => ({
      id: String(index + 1).padStart(2, "0"),
      italian: item.italian,
      english: item.english,
      image: item.image || "",
      response: RESPONSE_METADATA[item.italian]
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

  function normalizeAnswer(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’]/g, "")
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function classifyProduction(typedAnswer, item) {
    const normalizedAnswer = normalizeAnswer(typedAnswer);
    const response = item?.response;
    if (normalizedAnswer === normalizeAnswer(response?.canonical)) {
      return "produced-canonical";
    }
    return response?.alternatives?.some(alternative =>
      normalizedAnswer === normalizeAnswer(alternative)
    )
      ? "produced-acceptable-alternative"
      : null;
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
          byTopic: parsed.byTopic && typeof parsed.byTopic === "object"
            ? parsed.byTopic
            : {}
        };
      }
    } catch (error) {
      console.warn("Seasons Starting Check data could not load.", error);
    }
    return { version: 3, byTopic: {} };
  }

  function saveStore(data) {
    const storage = window.PrimoVoloStorage;
    try {
      if (storage?.setJSON) storage.setJSON(storageKey(), data);
      else window.localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (error) {
      console.warn("Seasons Starting Check data could not save.", error);
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
    }[mode] || mode || "";
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
      sequenceGroups = [["learn"], ["choose"], ["match-word", "match-sound"]];
      message =
        "Costruiamo prima il riconoscimento. · Let's build recognition first.";
    } else if (productionCorrect * 4 < recognitionCorrect * 3) {
      primaryMode = "assemble-sentences";
      sequenceGroups = [["assemble-sentences"], ["complete"]];
      message =
        "Ora esercitiamoci a produrre le stagioni. · Now let's practice producing the seasons.";
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
    return shuffle(
      [item, ...shuffle(items.filter(option => option.id !== item.id), random)],
      random
    );
  }

  function buildRecognitionTasks(items = getItems(), random = Math.random) {
    return shuffle(items, random).map(item => ({
      item,
      taskType: "picture-recognition",
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
    return recognitionCorrect >= PRODUCTION_GATE;
  }

  function saveSession(activeSession = session) {
    const recognitionCorrect = activeSession.recognitionResults
      .filter(result => result.correct).length;
    const productionCorrect = activeSession.productionResults
      .filter(result => result.correct).length;
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
      recommendation: {
        primary: recommendation.primaryMode,
        primaryLabel: recommendation.primaryLabel
      },
      results: activeSession.results.map(result => ({
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
        status: productionResult?.productionStatus || (recognized
          ? activeSession.productionAdministered
            ? "recognized-not-yet-produced"
            : "recognized-production-not-administered"
          : "not-yet-recognized")
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

  function ensureStyles() {
    if (document.getElementById("seasonsStartingCheckStyles")) return;
    const style = document.createElement("style");
    style.id = "seasonsStartingCheckStyles";
    style.textContent = `
      .seasons-starting-check { width:min(980px,calc(100% - 32px)); margin:18px auto 8px; padding:18px 20px; border:1px solid #d9e2ef; border-radius:20px; background:#f8fbff; box-shadow:0 8px 24px rgba(39,75,132,.07); }
      .seasons-starting-check[hidden], .seasons-check-modal[hidden] { display:none !important; }
      .seasons-check-row { display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; }
      .seasons-check-copy { flex:1 1 520px; }
      .seasons-check-kicker { display:inline-block; margin-bottom:4px; color:#337a4d; font-size:.82rem; font-weight:900; text-transform:uppercase; }
      .seasons-starting-check h3 { margin:0; color:#274b84; font-size:1.2rem; }
      .seasons-starting-check p { margin:6px 0 0; color:#5f6f86; line-height:1.45; }
      .seasons-check-summary { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .seasons-check-chip { padding:6px 10px; border-radius:999px; color:#274b84; background:#eaf2fb; font-size:.86rem; font-weight:800; }
      .seasons-check-button, .seasons-check-next { border:0; border-radius:999px; padding:11px 16px; color:white; background:#337a4d; font:inherit; font-weight:850; cursor:pointer; }
      .seasons-check-next:disabled { opacity:.48; cursor:not-allowed; }
      .seasons-check-modal { position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:18px; background:rgba(24,39,63,.58); }
      .seasons-check-dialog { position:relative; width:min(820px,100%); max-height:min(760px,94vh); overflow:auto; padding:28px; border-radius:24px; background:#fff; box-shadow:0 20px 70px rgba(24,39,63,.28); }
      .seasons-check-close { position:absolute; top:12px; right:14px; border:0; color:#274b84; background:transparent; font-size:1.7rem; cursor:pointer; }
      .seasons-check-progress, .seasons-check-part, .seasons-check-task { display:block; margin:0 0 6px; color:#5f6f86; font-size:.88rem; font-weight:800; }
      .seasons-check-question { text-align:center; }
      .seasons-check-question h2 { margin:8px 0 2px; color:#274b84; }
      .seasons-check-note { margin:0 0 14px; color:#5f6f86; }
      .seasons-check-cue { display:block; width:auto; max-width:min(320px,78vw); height:auto; max-height:min(360px,45vh); margin:14px auto; border-radius:18px; object-fit:contain; object-position:center; }
      .seasons-check-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:16px; }
      .seasons-check-option { min-height:64px; padding:10px; border:2px solid #d9e2ef; border-radius:16px; color:#274b84; background:#fff; font:inherit; font-weight:800; cursor:pointer; }
      .seasons-check-option:hover, .seasons-check-option.is-selected { border-color:#337a4d; background:#eff9f1; }
      .seasons-check-input { width:min(560px,100%); margin:12px auto; padding:13px 15px; border:2px solid #d9e2ef; border-radius:12px; font:inherit; font-size:1.05rem; }
      .seasons-check-footer { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-top:20px; }
      .seasons-check-footer span { color:#5f6f86; font-size:.9rem; }
      .seasons-check-result { margin-top:14px; padding:16px; border-radius:16px; background:#f3f6fb; }
      .seasons-check-result strong { display:block; color:#274b84; font-size:2rem; }
      @media (max-width:620px) { .seasons-check-dialog { padding:24px 16px; } .seasons-check-options { grid-template-columns:1fr; } .seasons-check-footer { align-items:stretch; flex-direction:column; } }
    `;
    document.head.append(style);
  }

  function buildCard() {
    const card = document.createElement("section");
    card.className = "seasons-starting-check";
    card.hidden = true;
    card.innerHTML = `
      <div class="seasons-check-row">
        <div class="seasons-check-copy">
          <span class="seasons-check-kicker">Prima di iniziare · Starting point</span>
          <h3>🍂 Prova iniziale · Seasons Starting Check</h3>
          <p>Prima mostra che cosa riconosci. Poi, se utile, scrivi le stagioni riconosciute. <span lang="en">First show what you recognize. Then, if useful, type the seasons you recognized.</span></p>
          <div class="seasons-check-summary">
            <span class="seasons-check-chip">4 stagioni · 4 seasons</span>
            <span class="seasons-check-chip">Produzione da 3/4 · Production at 3/4</span>
          </div>
          <div data-role="latest"></div>
        </div>
        <button type="button" class="seasons-check-button" data-action="start">▶ Inizia · Start</button>
      </div>`;
    const menu = document.querySelector(".activity-menu");
    if (menu?.parentNode) menu.parentNode.insertBefore(card, menu);
    card.querySelector('[data-action="start"]')
      ?.addEventListener("click", startCheck);
    return card;
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "seasons-check-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="seasons-check-dialog" role="dialog" aria-modal="true" aria-label="Seasons Starting Check">
        <button type="button" class="seasons-check-close" aria-label="Close Starting Check">×</button>
        <div data-role="body"></div>
      </div>`;
    modalBody = modal.querySelector('[data-role="body"]');
    modal.querySelector(".seasons-check-close")?.addEventListener("click", () => {
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
    checkCard.hidden =
      document.getElementById("topicSelect")?.value !== TOPIC_KEY;
    if (!checkCard.hidden) refreshLatest();
  }

  function startCheck() {
    const recognitionTasks = buildRecognitionTasks();
    if (recognitionTasks.length !== RECOGNITION_TOTAL) {
      window.alert("The Seasons Starting Check could not load all required items.");
      return;
    }
    ensureModal();
    session = {
      id: `seasons-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: new Date().toISOString(),
      completedAt: null,
      stage: "recognition",
      index: 0,
      selected: null,
      recognitionTasks,
      recognitionResults: [],
      productionTasks: [],
      productionResults: [],
      productionAdministered: false,
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

  function renderCurrent() {
    const task = currentTask();
    if (!task || !modalBody) return;
    session.selected = null;
    const isRecognition = session.stage === "recognition";
    const tasks = isRecognition ? session.recognitionTasks : session.productionTasks;
    const base = `
      <p class="seasons-check-progress">${session.index + 1} / ${tasks.length}</p>
      <div class="seasons-check-question">
        <span class="seasons-check-part">Prova iniziale · Starting Check</span>
        <span class="seasons-check-task">${isRecognition
          ? "Parte 1 · Riconoscimento · Recognition"
          : "Parte 2 · Produzione indipendente · Independent production"}</span>`;
    if (isRecognition) {
      modalBody.innerHTML = `${base}
        <img class="seasons-check-cue" src="${escapeHtml(task.item.image)}" alt="Season picture">
        <h2>Che stagione è?</h2>
        <p class="seasons-check-note">Scegli la stagione italiana. · Choose the Italian season.</p>
        <div class="seasons-check-options">
          ${task.options.map(option => `
            <button type="button" class="seasons-check-option" data-choice="${escapeHtml(option.id)}">${escapeHtml(option.italian)}</button>
          `).join("")}
        </div>
        <div class="seasons-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="button" class="seasons-check-next" data-action="next" disabled>Avanti · Next →</button>
        </div>
      </div>`;
      const buttons = [...modalBody.querySelectorAll(".seasons-check-option")];
      const next = modalBody.querySelector('[data-action="next"]');
      buttons.forEach(button => button.addEventListener("click", () => {
        buttons.forEach(choice => choice.classList.toggle(
          "is-selected",
          choice === button
        ));
        session.selected = button.dataset.choice;
        if (next) next.disabled = false;
      }));
      next?.addEventListener("click", recordRecognition);
      return;
    }
    modalBody.innerHTML = `${base}
      <img class="seasons-check-cue" src="${escapeHtml(task.item.image)}" alt="Season picture to name in Italian">
      <h2>Come si dice in italiano?</h2>
      <p class="seasons-check-note">Scrivi la stagione in italiano. · Write the season in Italian.</p>
      <form data-action="recall">
        <label class="sr-only" for="seasonsCheckInput">Write the season in Italian</label>
        <input id="seasonsCheckInput" class="seasons-check-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false">
        <div class="seasons-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="submit" class="seasons-check-next">Invia · Submit</button>
        </div>
      </form>
    </div>`;
    modalBody.querySelector('[data-action="recall"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        recordProduction();
      });
    modalBody.querySelector("#seasonsCheckInput")?.focus();
  }

  function recordRecognition() {
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

  function recordProduction() {
    const task = currentTask();
    const typedAnswer =
      modalBody.querySelector("#seasonsCheckInput")?.value || "";
    const productionStatus = classifyProduction(
      typedAnswer,
      task.item
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
      const recognitionCorrect = session.recognitionResults
        .filter(result => result.correct).length;
      if (!shouldAdministerProduction(recognitionCorrect)) {
        finishCheck();
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
    finishCheck();
  }

  function renderProductionIntro() {
    modalBody.innerHTML = `
      <div class="seasons-check-question">
        <span class="seasons-check-part">Parte 2 · Produzione indipendente</span>
        <h2>Ora prova da solo!</h2>
        <p>Scrivi le stagioni che hai riconosciuto. <span lang="en">Type the seasons you recognized.</span></p>
        <button type="button" class="seasons-check-next" data-action="continue">Continua · Continue →</button>
      </div>`;
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
      <div class="seasons-check-question">
        <span class="seasons-check-part">Prova completata · Check complete</span>
        <h2>Punto di partenza · Starting point</h2>
        <div class="seasons-check-result"><strong>${saved.recognitionCorrect} / ${saved.recognitionTotal}</strong><span>Riconoscimento · Recognition</span></div>
        <div class="seasons-check-result"><strong>${saved.productionAdministered
          ? `${saved.productionCorrect} / ${saved.productionTotal}`
          : "Non somministrata · Not administered"}</strong><span>Produzione indipendente · Independent production</span></div>
        <p>Questa è una fotografia di partenza, non un voto. <span lang="en">This is a starting-point snapshot, not a grade.</span></p>
        <p>${escapeHtml(recommendation.message)}</p>
        <p><strong>Inizia con · Start with:</strong> ${escapeHtml(recommendation.primaryLabel)}<br><strong>Sequenza suggerita · Suggested sequence:</strong> ${escapeHtml(sequenceText)}</p>
        <button type="button" class="seasons-check-next" data-action="close">Chiudi · Close</button>
      </div>`;
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
    ensureModal();
    updateVisibility();
    document.getElementById("topicSelect")
      ?.addEventListener("change", updateVisibility);
    window.addEventListener("primo-volo-student-changed", refreshLatest);
  }

  if (window.__PRIMO_VOLO_SEASONS_STARTING_CHECK_TEST__) {
    window.__seasonsStartingCheckTestHooks = {
      getItems,
      RESPONSE_METADATA,
      buildRecognitionTasks,
      buildProductionTasks,
      shouldAdministerProduction,
      classifyProduction,
      normalizeAnswer,
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
