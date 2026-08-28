"use strict";

/*
  WEATHER STARTING CHECK
  Four short tasks using the existing Weather vocabulary and images.
*/
(() => {
  const TOPIC_KEY = "weather";
  const STORAGE_FALLBACK_KEY =
    "primoVoloStartingChecksV1";
  const TASK_TYPES = [
    "picture-recognition",
    "listening-recognition",
    "sentence-understanding",
    "independent-recall"
  ];
  const TASK_LABELS = {
    "picture-recognition":
      "Italiano → immagine",
    "listening-recognition":
      "Ascolto → immagine",
    "sentence-understanding":
      "Domanda → risposta",
    "independent-recall":
      "Produzione indipendente"
  };

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let session = null;

  function getItems() {
    const source =
      typeof weather !== "undefined" &&
      Array.isArray(weather)
        ? weather
        : [];

    return source.slice(0, 8).map(
      (item, index) => ({
        id: String(index + 1).padStart(2, "0"),
        italian: item.italian,
        english: item.english,
        image: item.image || ""
      })
    );
  }

  function shuffle(items) {
    const result = [...items];

    for (
      let index = result.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex = Math.floor(
        Math.random() * (index + 1)
      );

      [
        result[index],
        result[randomIndex]
      ] = [
        result[randomIndex],
        result[index]
      ];
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

    if (
      window.PrimoVoloAudio &&
      typeof window.PrimoVoloAudio.speak ===
        "function"
    ) {
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

  function storageKey() {
    const storage = window.PrimoVoloStorage;
    const baseKey =
      storage?.keys?.startingChecks ||
      STORAGE_FALLBACK_KEY;

    if (storage?.studentKey) {
      return storage.studentKey(baseKey);
    }

    const studentId =
      window.localStorage.getItem(
        "primoVoloCurrentStudentV1"
      ) || "";

    return studentId
      ? `${baseKey}:student:${studentId}`
      : baseKey;
  }

  function loadStore() {
    const storage = window.PrimoVoloStorage;

    try {
      const parsed = storage?.getJSON
        ? storage.getJSON(storageKey(), null)
        : JSON.parse(
            window.localStorage.getItem(
              storageKey()
            ) || "null"
          );

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return {
          version: 2,
          byTopic:
            parsed.byTopic &&
            typeof parsed.byTopic === "object"
              ? parsed.byTopic
              : {}
        };
      }
    } catch (error) {
      console.warn(
        "Weather Starting Check data could not load.",
        error
      );
    }

    return { version: 2, byTopic: {} };
  }

  function saveStore(data) {
    const storage = window.PrimoVoloStorage;

    try {
      if (storage?.setJSON) {
        storage.setJSON(storageKey(), data);
      } else {
        window.localStorage.setItem(
          storageKey(),
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.warn(
        "Weather Starting Check data could not save.",
        error
      );
    }
  }

  function latestResult() {
    return loadStore().byTopic?.[TOPIC_KEY]
      ?.latest || null;
  }

  function saveSession() {
    const data = loadStore();
    const topicData =
      data.byTopic[TOPIC_KEY] || {
        latest: null,
        history: []
      };

    const saved = {
      id: session.id,
      version: 2,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      total: session.results.length,
      correct: session.results.filter(
        result => result.correct
      ).length,
      results: session.results.map(result => ({
        itemId: result.itemId,
        italian: result.italian,
        english: result.english,
        taskType: result.taskType,
        selectedItemId:
          result.selectedItemId || null,
        typedAnswer: result.typedAnswer || null,
        status: result.correct
          ? "correct"
          : "incorrect"
      }))
    };

    topicData.latest = saved;
    topicData.history = [
      ...(Array.isArray(topicData.history)
        ? topicData.history
        : []),
      saved
    ].slice(-10);

    data.version = 2;
    data.byTopic[TOPIC_KEY] = topicData;
    saveStore(data);

    return saved;
  }

  function ensureStyles() {
    if (
      document.getElementById(
        "weatherStartingCheckStyles"
      )
    ) {
      return;
    }

    const style = document.createElement("style");
    style.id = "weatherStartingCheckStyles";
    style.textContent = `
      .weather-starting-check {
        width: min(980px, calc(100% - 32px));
        margin: 18px auto 8px;
        padding: 18px 20px;
        border: 1px solid #d9e2ef;
        border-radius: 20px;
        background: #f8fbff;
        box-shadow: 0 8px 24px rgba(39,75,132,.07);
      }

      .weather-starting-check[hidden],
      .weather-check-modal[hidden] {
        display: none !important;
      }

      .weather-check-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }

      .weather-check-copy { flex: 1 1 520px; }

      .weather-check-kicker {
        display: inline-block;
        margin-bottom: 4px;
        color: #337a4d;
        font-size: .82rem;
        font-weight: 900;
        text-transform: uppercase;
      }

      .weather-starting-check h3 {
        margin: 0;
        color: #274b84;
        font-size: 1.2rem;
      }

      .weather-starting-check p {
        margin: 6px 0 0;
        color: #5f6f86;
        line-height: 1.45;
      }

      .weather-check-summary {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }

      .weather-check-chip {
        padding: 6px 10px;
        border-radius: 999px;
        color: #274b84;
        background: #eaf2fb;
        font-size: .86rem;
        font-weight: 800;
      }

      .weather-check-latest { margin-top: 10px; }

      .weather-check-button,
      .weather-check-next,
      .weather-check-audio {
        border: 0;
        border-radius: 999px;
        padding: 11px 16px;
        color: white;
        background: #337a4d;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .weather-check-next:disabled {
        opacity: .48;
        cursor: not-allowed;
      }

      .weather-check-modal {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(24, 39, 63, .58);
      }

      .weather-check-dialog {
        position: relative;
        width: min(820px, 100%);
        max-height: min(740px, 94vh);
        overflow: auto;
        padding: 28px;
        border-radius: 24px;
        background: #fff;
        box-shadow: 0 20px 70px rgba(24,39,63,.28);
      }

      .weather-check-close {
        position: absolute;
        top: 12px;
        right: 14px;
        border: 0;
        color: #274b84;
        background: transparent;
        font-size: 1.7rem;
        cursor: pointer;
      }

      .weather-check-progress,
      .weather-check-part,
      .weather-check-task {
        display: block;
        margin: 0 0 6px;
        color: #5f6f86;
        font-size: .88rem;
        font-weight: 800;
      }

      .weather-check-question {
        text-align: center;
      }

      .weather-check-question h2 {
        margin: 8px 0 2px;
        color: #274b84;
      }

      .weather-check-question-note {
        margin: 0 0 14px;
        color: #5f6f86;
      }

      .weather-check-image {
        display: block;
        width: min(210px, 58vw);
        aspect-ratio: 1;
        margin: 12px auto 16px;
        object-fit: contain;
      }

      .weather-check-options {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: 16px;
      }

      .weather-check-option {
        min-height: 94px;
        padding: 8px;
        border: 2px solid #d9e2ef;
        border-radius: 16px;
        color: #274b84;
        background: #fff;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .weather-check-option:hover,
      .weather-check-option.is-selected {
        border-color: #337a4d;
        background: #eff9f1;
      }

      .weather-check-option img {
        display: block;
        width: 100%;
        height: 72px;
        object-fit: contain;
      }

      .weather-check-text-option {
        min-height: 64px;
      }

      .weather-check-input {
        width: min(560px, 100%);
        margin: 12px auto;
        padding: 13px 15px;
        border: 2px solid #d9e2ef;
        border-radius: 12px;
        font: inherit;
        font-size: 1.05rem;
      }

      .weather-check-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: 20px;
      }

      .weather-check-footer span {
        color: #5f6f86;
        font-size: .9rem;
      }

      .weather-check-result {
        margin-top: 20px;
        padding: 16px;
        border-radius: 16px;
        background: #f3f6fb;
      }

      .weather-check-result strong {
        display: block;
        color: #274b84;
        font-size: 2rem;
      }

      @media (max-width: 620px) {
        .weather-check-dialog { padding: 24px 16px; }
        .weather-check-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .weather-check-footer { align-items: stretch; flex-direction: column; }
      }
    `;

    document.head.append(style);
  }

  function buildCard() {
    const card = document.createElement("section");
    card.className = "weather-starting-check";
    card.hidden = true;
    card.innerHTML = `
      <div class="weather-check-row">
        <div class="weather-check-copy">
          <span class="weather-check-kicker">
            Prima di iniziare · Starting point
          </span>
          <h3>🌦️ Prova iniziale · Weather Starting Check</h3>
          <p>
            Quattro domande brevi: immagini, ascolto,
            risposta alla domanda e produzione indipendente.
            <span lang="en">
              Four short tasks: picture recognition, listening,
              response understanding, and independent recall.
            </span>
          </p>
          <div class="weather-check-summary">
            <span class="weather-check-chip">4 domande · 4 tasks</span>
            <span class="weather-check-chip">Il tempo · Weather</span>
          </div>
          <div class="weather-check-latest" data-role="latest"></div>
        </div>
        <div>
          <button
            type="button"
            class="weather-check-button"
            data-action="start"
          >
            ▶ Inizia · Start
          </button>
        </div>
      </div>
    `;

    const menu = document.querySelector(".activity-menu");
    if (menu?.parentNode) {
      menu.parentNode.insertBefore(card, menu);
    }

    card.querySelector('[data-action="start"]')
      ?.addEventListener("click", startCheck);

    return card;
  }

  function ensureModal() {
    if (modal) return;

    modal = document.createElement("div");
    modal.className = "weather-check-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div
        class="weather-check-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Weather Starting Check"
      >
        <button
          type="button"
          class="weather-check-close"
          aria-label="Close Starting Check"
        >×</button>
        <div data-role="body"></div>
      </div>
    `;

    modalBody = modal.querySelector('[data-role="body"]');
    modal.querySelector(".weather-check-close")
      ?.addEventListener("click", () => {
        modal.hidden = true;
        session = null;
      });

    document.body.append(modal);
  }

  function refreshLatest() {
    if (!checkCard) return;

    const holder = checkCard.querySelector(
      '[data-role="latest"]'
    );
    const latest = latestResult();

    if (!holder || !latest) {
      if (holder) holder.innerHTML = "";
      return;
    }

    holder.innerHTML = `
      <p>
        <strong>Ultima prova · Latest:</strong>
        ${latest.correct ?? 0} / ${latest.total ?? 4}
      </p>
    `;
  }

  function updateVisibility() {
    if (!checkCard) return;

    const topicSelect =
      document.getElementById("topicSelect");
    checkCard.hidden =
      topicSelect?.value !== TOPIC_KEY;

    if (!checkCard.hidden) refreshLatest();
  }

  function buildTasks() {
    const items = shuffle(getItems()).slice(0, 4);

    return items.map((item, index) => ({
      item,
      taskType: TASK_TYPES[index]
    }));
  }

  function startCheck() {
    const tasks = buildTasks();

    if (tasks.length !== 4) {
      window.alert(
        "The Weather Starting Check could not load all required items."
      );
      return;
    }

    ensureModal();

    session = {
      id: `weather-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      startedAt: new Date().toISOString(),
      completedAt: null,
      index: 0,
      selected: null,
      tasks,
      results: []
    };

    modal.hidden = false;
    renderCurrent();
  }

  function currentTask() {
    return session?.tasks?.[session.index] || null;
  }

  function itemOptions(item) {
    const others = getItems().filter(
      option => option.id !== item.id
    );

    return shuffle([
      item,
      ...shuffle(others).slice(0, 3)
    ]);
  }

  function connectChoices() {
    const buttons = [
      ...modalBody.querySelectorAll(
        ".weather-check-option"
      )
    ];
    const next = modalBody.querySelector(
      '[data-action="next"]'
    );

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(choice => {
          choice.classList.toggle(
            "is-selected",
            choice === button
          );
        });

        session.selected = button.dataset.choice;
        if (next) next.disabled = false;
      });
    });
  }

  function renderCurrent() {
    const task = currentTask();
    if (!task || !modalBody) return;

    session.selected = null;
    const { item, taskType } = task;
    const progress = `${session.index + 1} / 4`;
    const base = `
      <p class="weather-check-progress">${progress}</p>
      <div class="weather-check-question">
        <span class="weather-check-part">Prova iniziale · Starting Check</span>
        <span class="weather-check-task">${TASK_LABELS[taskType]}</span>
    `;

    if (
      taskType === "picture-recognition" ||
      taskType === "listening-recognition"
    ) {
      const options = itemOptions(item);
      const listening =
        taskType === "listening-recognition";

      modalBody.innerHTML = `${base}
        <h2>${listening ? "Ascolta." : escapeHtml(item.italian)}</h2>
        <p class="weather-check-question-note">
          ${listening ? "Listen and choose the matching picture." : "Choose the matching picture."}
          <span lang="en">
            ${listening ? "The Italian expression is not shown before your answer." : "Choose the matching picture."}
          </span>
        </p>
        ${listening ? `
          <p>
            <button type="button" class="weather-check-audio" data-action="replay">
              🔊 Ascolta di nuovo · Replay
            </button>
          </p>
        ` : ""}
        <div class="weather-check-options">
          ${options.map(option => `
            <button
              type="button"
              class="weather-check-option"
              data-choice="${option.id}"
              aria-label="${escapeHtml(option.english)}"
            >
              <img src="${escapeHtml(option.image)}" alt="${escapeHtml(option.english)}">
            </button>
          `).join("")}
        </div>
        <div class="weather-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="button" class="weather-check-next" data-action="next" disabled>
            Avanti · Next →
          </button>
        </div>
      </div>`;

      connectChoices();
      modalBody.querySelector('[data-action="next"]')
        ?.addEventListener("click", recordChoice);
      modalBody.querySelector('[data-action="replay"]')
        ?.addEventListener("click", () => speak(item.italian));

      if (listening) {
        window.setTimeout(
          () => speak(item.italian),
          180
        );
      }
      return;
    }

    if (taskType === "sentence-understanding") {
      const options = itemOptions(item);

      modalBody.innerHTML = `${base}
        <h2>Che tempo fa?</h2>
        <p class="weather-check-question-note">
          What's the weather like?
        </p>
        <img class="weather-check-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.english)}">
        <div class="weather-check-options">
          ${options.map(option => `
            <button type="button" class="weather-check-option weather-check-text-option" data-choice="${option.id}">
              ${escapeHtml(option.italian)}
            </button>
          `).join("")}
        </div>
        <div class="weather-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="button" class="weather-check-next" data-action="next" disabled>
            Avanti · Next →
          </button>
        </div>
      </div>`;

      connectChoices();
      modalBody.querySelector('[data-action="next"]')
        ?.addEventListener("click", recordChoice);
      return;
    }

    modalBody.innerHTML = `${base}
      <h2>Che tempo fa?</h2>
      <p class="weather-check-question-note">
        What's the weather like?
      </p>
      <img class="weather-check-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.english)}">
      <form data-action="recall">
        <label class="sr-only" for="weatherCheckInput">
          Scrivi la risposta
        </label>
        <input
          id="weatherCheckInput"
          class="weather-check-input"
          type="text"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          aria-label="Type the complete weather expression"
        >
        <div class="weather-check-footer">
          <span>Nessun suggerimento · No hints</span>
          <button type="submit" class="weather-check-next">
            Controlla · Check
          </button>
        </div>
      </form>
    </div>`;

    modalBody.querySelector('[data-action="recall"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        recordRecall();
      });
    modalBody.querySelector("#weatherCheckInput")
      ?.focus();
  }

  function recordChoice() {
    if (!session || session.selected === null) {
      return;
    }

    const task = currentTask();
    session.results.push({
      itemId: task.item.id,
      italian: task.item.italian,
      english: task.item.english,
      taskType: task.taskType,
      selectedItemId: session.selected,
      correct: session.selected === task.item.id
    });

    advance();
  }

  function recordRecall() {
    const input = modalBody.querySelector(
      "#weatherCheckInput"
    );
    const typedAnswer = input?.value || "";
    const task = currentTask();

    session.results.push({
      itemId: task.item.id,
      italian: task.item.italian,
      english: task.item.english,
      taskType: task.taskType,
      typedAnswer,
      correct:
        normalizeAnswer(typedAnswer) ===
        normalizeAnswer(task.item.italian)
    });

    advance();
  }

  function advance() {
    session.index += 1;

    if (session.index >= session.tasks.length) {
      finishCheck();
    } else {
      renderCurrent();
    }
  }

  function canonicalPracticeLabels() {
    const availability =
      window.PrimoVoloActivityAvailability;
    const modes = availability?.getCanonicalModes
      ? availability.getCanonicalModes(TOPIC_KEY)
      : [
          "learn",
          "choose",
          "match-word",
          "match-sound",
          "memory",
          "assemble-sentences",
          "complete",
          "write",
          "conversation-practice"
        ];
    const labels = {
      learn: "Impara",
      choose: "Scegli",
      "match-word": "Abbina",
      "match-sound": "Ascolta",
      memory: "Memoria",
      "assemble-sentences": "Assembla",
      complete: "Completa",
      write: "Scrivi",
      "conversation-practice": "Conversiamo"
    };

    return modes
      .map(mode => labels[mode])
      .filter(Boolean)
      .join(" · ");
  }

  function finishCheck() {
    session.completedAt = new Date().toISOString();
    const saved = saveSession();
    refreshLatest();

    modalBody.innerHTML = `
      <div class="weather-check-question">
        <span class="weather-check-part">
          Prova completata · Check complete
        </span>
        <h2>Punto di partenza · Starting point</h2>
        <div class="weather-check-result">
          <strong>${saved.correct} / ${saved.total}</strong>
          <span>Weather Starting Check</span>
        </div>
        <p>
          Questa è una fotografia di partenza, non un voto
          e non una misura di padronanza.
          <span lang="en">
            This is a starting-point snapshot, not a grade
            or a measure of mastery.
          </span>
        </p>
        <p>
          Prossima pratica disponibile · Next practice:
          <br>
          ${escapeHtml(canonicalPracticeLabels())}
        </p>
        <button type="button" class="weather-check-next" data-action="close">
          Chiudi · Close
        </button>
      </div>
    `;

    modalBody.querySelector('[data-action="close"]')
      ?.addEventListener("click", () => {
        modal.hidden = true;
        session = null;
      });
  }

  function initialize() {
    if (!document.querySelector(".activity-menu")) {
      return;
    }

    ensureStyles();
    checkCard = buildCard();
    updateVisibility();

    document
      .getElementById("topicSelect")
      ?.addEventListener("change", updateVisibility);

    window.addEventListener(
      "primo-volo-student-changed",
      refreshLatest
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
