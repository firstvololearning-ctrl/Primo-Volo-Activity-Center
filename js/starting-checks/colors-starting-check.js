"use strict";

(() => {
  const TOPIC_KEY = "colors";
  const VOCAB_TOTAL = 11;
  const CARRIER_TOTAL = 6;
  const TOTAL_ITEMS = VOCAB_TOTAL + CARRIER_TOTAL;
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";

  const TARGET_IDS = [
    "01","02","03","04","05","06",
    "07","08","09","10","11"
  ];

  const TASK_TYPES = [
    "italian-to-picture",
    "italian-to-picture",
    "italian-to-picture",
    "italian-to-picture",
    "picture-to-italian",
    "picture-to-italian",
    "picture-to-italian",
    "picture-to-italian",
    "listen-to-picture",
    "listen-to-picture",
    "listen-to-picture"
  ];

  const DISTRACTORS = {
    "01":["02","07","10"],
    "02":["01","03","10"],
    "03":["02","04","09"],
    "04":["03","05","11"],
    "05":["04","06","08"],
    "06":["05","07","08"],
    "07":["01","06","09"],
    "08":["10","11","05"],
    "09":["11","03","07"],
    "10":["08","02","11"],
    "11":["09","08","10"]
  };

  const CARRIER_PLAN = [
    { carrierId:"vedo",  colorId:"01" },
    { carrierId:"piace", colorId:"05" },
    { carrierId:"e",     colorId:"04" },
    { carrierId:"vedo",  colorId:"03" },
    { carrierId:"piace", colorId:"06" },
    { carrierId:"e",     colorId:"02" }
  ];

  const TASK_LABELS = {
    "italian-to-picture":"Italiano → immagine",
    "picture-to-italian":"Immagine → italiano",
    "listen-to-picture":"Ascolto → immagine",
    "carrier-meaning":"Ascolto → frase utile"
  };

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let session = null;

  function getItems() {
    const source =
      typeof colors !== "undefined" && Array.isArray(colors)
        ? colors
        : [];

    return source.slice(0, 11).map((item, index) => ({
      id: String(index + 1).padStart(2, "0"),
      italian: item.italian,
      masculine: item.masculine || item.italian,
      english: item.english,
      image: item.image || ""
    }));
  }

  function itemMap() {
    return new Map(getItems().map(item => [item.id, item]));
  }

  function getCarriers() {
    const configured = Array.isArray(window.carrierPhrases?.colors)
      ? window.carrierPhrases.colors
      : [];

    return ["vedo","piace","e"]
      .map(id => configured.find(carrier => carrier.id === id))
      .filter(Boolean);
  }

  function balloonImage(item) {
    return (
      "images/scene-images/colors/balloons_separate/" +
      `balloon-${item.italian}.png`
    );
  }

  function carrierStem(carrier) {
    return String(carrier?.italian || "")
      .replace(/[.…]+$/u, "")
      .trim();
  }

  function carrierSentence(carrier, item) {
    const stem = carrierStem(carrier);
    const color = item.masculine || item.italian;

    if (carrier.id === "piace") {
      return `${stem} il palloncino ${color}.`;
    }

    return `${stem} un palloncino ${color}.`;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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
      typeof window.PrimoVoloAudio.speak === "function"
    ) {
      window.PrimoVoloAudio.speak(text);
    }
  }

  function storageKey() {
    const storage = window.PrimoVoloStorage;
    const baseKey =
      storage?.keys?.startingChecks || STORAGE_FALLBACK_KEY;

    if (storage?.studentKey) {
      return storage.studentKey(baseKey);
    }

    const studentId =
      window.localStorage.getItem("primoVoloCurrentStudentV1") || "";

    return studentId
      ? `${baseKey}:student:${studentId}`
      : baseKey;
  }

  function loadStore() {
    const storage = window.PrimoVoloStorage;
    const key = storageKey();

    try {
      const parsed = storage?.getJSON
        ? storage.getJSON(key, null)
        : JSON.parse(window.localStorage.getItem(key) || "null");

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          version: 2,
          byTopic:
            parsed.byTopic && typeof parsed.byTopic === "object"
              ? parsed.byTopic
              : {}
        };
      }
    } catch (error) {
      console.warn("Colors Starting Check data could not load.", error);
    }

    return { version: 2, byTopic: {} };
  }

  function saveStore(data) {
    const storage = window.PrimoVoloStorage;
    const key = storageKey();

    try {
      if (storage?.setJSON) {
        storage.setJSON(key, data);
      } else {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.warn("Colors Starting Check data could not save.", error);
    }
  }

  function latestResult() {
    return loadStore().byTopic?.[TOPIC_KEY]?.latest || null;
  }

  function saveSession() {
    const data = loadStore();
    const topicData = data.byTopic[TOPIC_KEY] || {
      latest: null,
      history: []
    };

    const vocab = session.results.filter(
      result => result.section === "vocabulary"
    );
    const carriers = session.results.filter(
      result => result.section === "carrier"
    );

    const byWord = {};
    vocab.forEach(result => {
      byWord[result.itemId] = {
        italian: result.italian,
        english: result.english,
        status: result.correct ? "correct" : "incorrect",
        taskType: result.taskType,
        selectedItemId: result.selectedItemId,
        checkedAt: session.completedAt
      };
    });

    const byCarrier = {};
    carriers.forEach(result => {
      const group = byCarrier[result.carrierId] || {
        italian: result.carrierItalian,
        attempts: 0,
        correct: 0
      };
      group.attempts += 1;
      if (result.correct) group.correct += 1;
      byCarrier[result.carrierId] = group;
    });

    const saved = {
      id: session.id,
      version: 2,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      total: session.results.length,
      correct: session.results.filter(result => result.correct).length,
      vocabularyTotal: vocab.length,
      vocabularyCorrect: vocab.filter(result => result.correct).length,
      carrierTotal: carriers.length,
      carrierCorrect: carriers.filter(result => result.correct).length,
      byWord,
      byCarrier,
      results: session.results.map(result => ({
        section: result.section,
        itemId: result.itemId || null,
        italian: result.italian || null,
        english: result.english || null,
        taskType: result.taskType,
        selectedItemId: result.selectedItemId || null,
        carrierId: result.carrierId || null,
        carrierItalian: result.carrierItalian || null,
        selectedCarrierId: result.selectedCarrierId || null,
        status: result.correct ? "correct" : "incorrect"
      }))
    };

    topicData.latest = saved;
    topicData.history = [
      ...(Array.isArray(topicData.history) ? topicData.history : []),
      saved
    ].slice(-10);

    data.version = 2;
    data.byTopic[TOPIC_KEY] = topicData;
    saveStore(data);

    return saved;
  }

  function ensureStyles() {
    if (document.getElementById("colorsStartingCheckStyles")) return;

    const style = document.createElement("style");
    style.id = "colorsStartingCheckStyles";
    style.textContent = `
      .colors-starting-check {
        width:min(980px,calc(100% - 32px));
        margin:18px auto 8px;
        padding:18px 20px;
        border:1px solid #d9e2ef;
        border-radius:20px;
        background:#f8fbff;
        box-shadow:0 8px 24px rgba(39,75,132,.07);
      }

      .colors-starting-check[hidden],
      .colors-check-modal[hidden] {
        display:none !important;
      }

      .colors-check-card-row {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
        flex-wrap:wrap;
      }

      .colors-check-copy { flex:1 1 520px; }

      .colors-check-kicker {
        display:inline-block;
        margin-bottom:4px;
        color:#337a4d;
        font-size:.82rem;
        font-weight:900;
        text-transform:uppercase;
      }

      .colors-starting-check h3 {
        margin:0;
        color:#274b84;
        font-size:1.2rem;
      }

      .colors-starting-check p {
        margin:6px 0 0;
        color:#5f6f86;
        line-height:1.45;
      }

      .colors-check-section-summary,
      .colors-check-actions {
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:10px;
      }

      .colors-check-section-chip {
        padding:5px 9px;
        border:1px solid #cbd8ea;
        border-radius:999px;
        background:white;
        color:#405d7f;
        font-size:.78rem;
        font-weight:850;
      }

      .colors-check-button,
      .colors-check-next,
      .colors-check-audio,
      .colors-check-option {
        font:inherit;
        cursor:pointer;
      }

      .colors-check-button,
      .colors-check-next {
        padding:10px 16px;
        border:1px solid #a8c8b2;
        border-radius:999px;
        background:#eef8f1;
        color:#286440;
        font-weight:900;
      }

      .colors-check-audio {
        padding:9px 14px;
        border:1px solid #cbd8ea;
        border-radius:999px;
        background:white;
        color:#274b84;
        font-weight:800;
      }

      .colors-check-modal {
        position:fixed;
        inset:0;
        z-index:100220;
        display:grid;
        place-items:center;
        padding:18px;
        background:rgba(25,42,68,.56);
      }

      .colors-check-dialog {
        position:relative;
        width:min(820px,100%);
        max-height:92vh;
        overflow-y:auto;
        padding:26px;
        border-radius:24px;
        background:white;
        box-shadow:0 20px 60px rgba(24,43,70,.25);
      }

      .colors-check-close {
        position:absolute;
        top:12px;
        right:14px;
        width:38px;
        height:38px;
        border:1px solid #d8e1ec;
        border-radius:999px;
        background:white;
        color:#52647e;
        font:inherit;
        font-weight:900;
        cursor:pointer;
      }

      .colors-check-progress {
        margin:0 44px 16px 0;
        color:#69778a;
        font-size:.82rem;
        font-weight:800;
      }

      .colors-check-part-label,
      .colors-check-task-label {
        display:inline-block;
        margin:0 7px 8px 0;
        padding:5px 9px;
        border-radius:999px;
        font-size:.78rem;
        font-weight:850;
      }

      .colors-check-part-label {
        background:#eef8f1;
        color:#337a4d;
      }

      .colors-check-task-label {
        background:#f3f6fb;
        color:#52647e;
      }

      .colors-check-question h2,
      .colors-check-interstitial h2 {
        margin:0;
        color:#274b84;
        font-size:clamp(1.45rem,4vw,2rem);
      }

      .colors-check-question-note,
      .colors-check-interstitial p {
        margin:8px 0 0;
        color:#6c788a;
        line-height:1.5;
      }

      .colors-check-target-image {
        display:block;
        width:min(250px,62vw);
        height:210px;
        margin:18px auto 8px;
        padding:10px;
        border:1px solid #e0e7ef;
        border-radius:20px;
        background:white;
        object-fit:contain;
      }

      .colors-check-options {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
        margin-top:20px;
      }

      .colors-carrier-options {
        grid-template-columns:repeat(3,minmax(0,1fr));
      }

      .colors-check-option {
        min-height:112px;
        padding:12px;
        border:2px solid #d9e2ef;
        border-radius:18px;
        background:white;
        color:#274b84;
        font-weight:850;
      }

      .colors-check-option:hover,
      .colors-check-option:focus-visible {
        border-color:#a9bdd6;
        outline:none;
      }

      .colors-check-option.is-selected {
        border-color:#337a4d;
        background:#f1faf4;
        box-shadow:0 0 0 3px rgba(51,122,77,.12);
      }

      .colors-check-option > img {
        display:block;
        width:100%;
        height:130px;
        object-fit:contain;
      }

      .colors-check-word {
        display:grid;
        place-items:center;
        min-height:82px;
        font-size:1.12rem;
      }

      .colors-carrier-composite {
        display:grid;
        grid-template-columns:1fr .85fr;
        align-items:center;
        gap:7px;
      }

      .colors-carrier-composite .carrier-visual,
      .colors-carrier-composite .balloon-visual {
        width:100%;
        height:120px;
        object-fit:contain;
      }

      .colors-check-footer {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:14px;
        flex-wrap:wrap;
        margin-top:20px;
      }

      .colors-check-next:disabled {
        opacity:.45;
        cursor:default;
      }

      .colors-check-interstitial {
        padding:18px 4px 4px;
        text-align:center;
      }

      .colors-check-interstitial-badge {
        display:inline-block;
        margin-bottom:12px;
        padding:6px 10px;
        border-radius:999px;
        background:#eef8f1;
        color:#337a4d;
        font-size:.8rem;
        font-weight:900;
      }

      .colors-check-interstitial-actions {
        margin-top:22px;
      }

      .colors-check-result-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
        margin:18px 0;
      }

      .colors-check-result-stat {
        padding:18px;
        border:1px solid #d9e2ef;
        border-radius:18px;
        background:#f8fbff;
        text-align:center;
      }

      .colors-check-result-stat strong {
        display:block;
        color:#274b84;
        font-size:1.8rem;
      }

      .colors-check-result-stat span {
        display:block;
        margin-top:4px;
        color:#647489;
        font-size:.82rem;
        font-weight:800;
      }

      .colors-check-result-note {
        padding:13px 15px;
        border-radius:14px;
        background:#f3f6fb;
        color:#5f6f84;
        line-height:1.5;
      }

      @media (max-width:660px) {
        .colors-check-dialog { padding:22px 16px; }
        .colors-check-options,
        .colors-carrier-options,
        .colors-check-result-grid {
          grid-template-columns:1fr;
        }
      }
    `;

    document.head.append(style);
  }

  function buildCard() {
    const card = document.createElement("section");
    card.className = "colors-starting-check";
    card.hidden = true;

    card.innerHTML = `
      <div class="colors-check-card-row">
        <div class="colors-check-copy">
          <span class="colors-check-kicker">
            Prima di iniziare · Starting point
          </span>
          <h3>🎨 Prova iniziale · Colors Starting Check</h3>
          <p>
            17 domande in due parti: tutti gli 11 colori con
            riconoscimento scritto/visivo e ascolto, più 6 frasi utili.
            <span lang="en">
              All 11 color targets plus 6 related carrier-phrase items.
            </span>
          </p>
          <div class="colors-check-section-summary">
            <span class="colors-check-section-chip">
              Parte 1 · Vocabolario — 11
            </span>
            <span class="colors-check-section-chip">
              Parte 2 · Frasi utili — 6
            </span>
          </div>
          <div data-role="latest"></div>
        </div>

        <div class="colors-check-actions">
          <button
            type="button"
            class="colors-check-button"
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
    modal.className = "colors-check-modal";
    modal.hidden = true;

    modal.innerHTML = `
      <div
        class="colors-check-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Colors Starting Check"
      >
        <button
          type="button"
          class="colors-check-close"
          aria-label="Close Starting Check"
        >×</button>
        <div data-role="body"></div>
      </div>
    `;

    modalBody = modal.querySelector('[data-role="body"]');

    modal.querySelector(".colors-check-close")
      ?.addEventListener("click", () => {
        modal.hidden = true;
        session = null;
      });

    document.body.append(modal);
  }

  function refreshLatest() {
    if (!checkCard) return;

    const holder = checkCard.querySelector('[data-role="latest"]');
    const latest = latestResult();

    if (!holder || !latest) {
      if (holder) holder.innerHTML = "";
      return;
    }

    holder.innerHTML = `
      <p>
        <strong>Ultima prova · Latest:</strong>
        Vocabolario ${latest.vocabularyCorrect ?? 0}/${
          latest.vocabularyTotal ?? VOCAB_TOTAL
        }
        · Frasi utili ${latest.carrierCorrect ?? 0}/${
          latest.carrierTotal ?? CARRIER_TOTAL
        }
      </p>
    `;
  }

  function updateVisibility() {
    if (!checkCard) return;

    const topicSelect = document.getElementById("topicSelect");
    checkCard.hidden = topicSelect?.value !== TOPIC_KEY;

    if (!checkCard.hidden) refreshLatest();
  }

  function buildVocabTasks() {
    const map = itemMap();
    const ids = shuffle(TARGET_IDS);
    const types = shuffle(TASK_TYPES);

    return ids
      .map((id, index) => ({
        section: "vocabulary",
        item: map.get(id),
        taskType: types[index]
      }))
      .filter(task => task.item);
  }

  function buildCarrierTasks() {
    const map = itemMap();

    return shuffle(
      CARRIER_PLAN
        .map(plan => ({
          section: "carrier",
          carrierId: plan.carrierId,
          item: map.get(plan.colorId),
          taskType: "carrier-meaning"
        }))
        .filter(task => task.item)
    );
  }

  function startCheck() {
    const vocabularyTasks = buildVocabTasks();
    const carrierTasks = buildCarrierTasks();

    if (
      vocabularyTasks.length !== VOCAB_TOTAL ||
      carrierTasks.length !== CARRIER_TOTAL ||
      getCarriers().length !== 3
    ) {
      window.alert(
        "The Colors Starting Check could not load all required items."
      );
      return;
    }

    ensureModal();

    session = {
      id: `colors-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: new Date().toISOString(),
      completedAt: null,
      section: "vocabulary",
      index: 0,
      selected: null,
      vocabularyTasks,
      carrierTasks,
      results: []
    };

    modal.hidden = false;
    renderCurrent();
  }

  function currentTask() {
    if (!session) return null;

    return session.section === "vocabulary"
      ? session.vocabularyTasks[session.index]
      : session.carrierTasks[session.index];
  }

  function progressNumber() {
    return session.section === "vocabulary"
      ? session.index + 1
      : VOCAB_TOTAL + session.index + 1;
  }

  function vocabOptions(item) {
    const map = itemMap();
    return shuffle(
      [item.id, ...(DISTRACTORS[item.id] || [])]
        .map(id => map.get(id))
        .filter(Boolean)
        .slice(0, 4)
    );
  }

  function connectChoices() {
    const buttons = [
      ...modalBody.querySelectorAll(".colors-check-option")
    ];
    const next = modalBody.querySelector('[data-action="next"]');

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(choice => {
          choice.classList.toggle("is-selected", choice === button);
        });

        session.selected = button.dataset.choice;
        if (next) next.disabled = false;
      });
    });
  }

  function renderCurrent() {
    if (!session || !modalBody) return;

    if (session.section === "vocabulary") {
      renderVocabQuestion(currentTask());
    } else {
      renderCarrierQuestion(currentTask());
    }
  }

  function renderVocabQuestion(task) {
    session.selected = null;

    const { item, taskType } = task;
    const options = vocabOptions(item);

    let prompt = "";
    let note = "";

    if (taskType === "italian-to-picture") {
      prompt = `<h2 lang="it">${escapeHtml(item.italian)}</h2>`;
      note = `
        <p class="colors-check-question-note">
          Scegli il colore.
          <span lang="en">Choose the matching color.</span>
        </p>
      `;
    } else if (taskType === "picture-to-italian") {
      prompt = `
        <img
          class="colors-check-target-image"
          src="${escapeHtml(item.image)}"
          alt=""
          aria-hidden="true"
          draggable="false"
        >
      `;
      note = `
        <p class="colors-check-question-note">
          Scegli la parola italiana.
          <span lang="en">Choose the Italian color word.</span>
        </p>
      `;
    } else {
      prompt = `
        <h2>🔊 Ascolta e scegli.</h2>
        <p class="colors-check-question-note">
          <span lang="en">Listen and choose the color.</span>
        </p>
        <p>
          <button
            type="button"
            class="colors-check-audio"
            data-action="replay"
          >
            🔊 Ascolta di nuovo · Replay
          </button>
        </p>
      `;
    }

    const optionHtml = options.map((option, index) => {
      const body =
        taskType === "picture-to-italian"
          ? `<span class="colors-check-word">${escapeHtml(option.italian)}</span>`
          : `
            <img
              src="${escapeHtml(option.image)}"
              alt=""
              aria-hidden="true"
              draggable="false"
            >
          `;

      return `
        <button
          type="button"
          class="colors-check-option"
          data-choice="${escapeHtml(option.id)}"
          aria-label="Color choice ${index + 1}"
        >
          ${body}
        </button>
      `;
    }).join("");

    modalBody.innerHTML = `
      <p class="colors-check-progress">
        ${progressNumber()} / ${TOTAL_ITEMS}
      </p>

      <div class="colors-check-question">
        <span class="colors-check-part-label">
          Parte 1 · Vocabolario
        </span>
        <span class="colors-check-task-label">
          ${escapeHtml(TASK_LABELS[taskType])}
        </span>

        ${prompt}
        ${note}

        <div class="colors-check-options">
          ${optionHtml}
        </div>

        <div class="colors-check-footer">
          <span>
            Nessun suggerimento durante la prova.
            <span lang="en">No hints during the check.</span>
          </span>
          <button
            type="button"
            class="colors-check-next"
            data-action="next"
            disabled
          >
            Avanti · Next →
          </button>
        </div>
      </div>
    `;

    connectChoices();

    modalBody.querySelector('[data-action="next"]')
      ?.addEventListener("click", recordVocabAnswer);

    modalBody.querySelector('[data-action="replay"]')
      ?.addEventListener("click", () => speak(item.italian));

    if (taskType === "listen-to-picture") {
      window.setTimeout(() => speak(item.italian), 180);
    }
  }

  function recordVocabAnswer() {
    if (!session || session.selected === null) return;

    const task = currentTask();
    const { item, taskType } = task;

    session.results.push({
      section: "vocabulary",
      itemId: item.id,
      italian: item.italian,
      english: item.english,
      taskType,
      selectedItemId: session.selected,
      correct: session.selected === item.id
    });

    session.index += 1;

    if (session.index >= VOCAB_TOTAL) {
      renderCarrierTransition();
    } else {
      renderCurrent();
    }
  }

  function renderCarrierTransition() {
    modalBody.innerHTML = `
      <div class="colors-check-interstitial">
        <span class="colors-check-interstitial-badge">
          Parte 1 completata · Part 1 complete
        </span>

        <h2>💬 Parte 2 · Frasi utili</h2>

        <p>
          Ora ascolta sei frasi con un palloncino colorato.
          Scegli l'immagine della frase utile che corrisponde.
          <span lang="en">
            Now listen to six sentences with a colored balloon
            and choose the matching carrier-phrase visual.
          </span>
        </p>

        <p>
          Lo stesso palloncino colorato resta uguale nelle risposte:
          cambia solo la frase utile.
          <span lang="en">
            The same colored balloon appears in every choice;
            only the carrier phrase changes.
          </span>
        </p>

        <div class="colors-check-interstitial-actions">
          <button
            type="button"
            class="colors-check-next"
            data-action="continue"
          >
            Continua · Continue →
          </button>
        </div>
      </div>
    `;

    modalBody.querySelector('[data-action="continue"]')
      ?.addEventListener("click", () => {
        session.section = "carrier";
        session.index = 0;
        session.selected = null;
        renderCurrent();
      });
  }

  function renderCarrierQuestion(task) {
    session.selected = null;

    const carriers = getCarriers();
    const target = carriers.find(
      carrier => carrier.id === task.carrierId
    );

    if (!target || carriers.length !== 3) {
      window.alert("The Colors carrier phrase visuals could not load.");
      modal.hidden = true;
      session = null;
      return;
    }

    const sentence = carrierSentence(target, task.item);
    const balloon = balloonImage(task.item);

    const optionHtml = shuffle(carriers).map(carrier => `
      <button
        type="button"
        class="colors-check-option colors-carrier-composite"
        data-choice="${escapeHtml(carrier.id)}"
        aria-label="${escapeHtml(carrier.italian)}"
      >
        <img
          class="carrier-visual"
          src="${escapeHtml(carrier.image)}"
          alt=""
          aria-hidden="true"
          draggable="false"
        >
        <img
          class="balloon-visual"
          src="${escapeHtml(balloon)}"
          alt=""
          aria-hidden="true"
          draggable="false"
        >
      </button>
    `).join("");

    modalBody.innerHTML = `
      <p class="colors-check-progress">
        ${progressNumber()} / ${TOTAL_ITEMS}
      </p>

      <div class="colors-check-question">
        <span class="colors-check-part-label">
          Parte 2 · Frasi utili
        </span>
        <span class="colors-check-task-label">
          ${TASK_LABELS["carrier-meaning"]}
        </span>

        <h2>🔊 Quale frase hai sentito?</h2>
        <p class="colors-check-question-note">
          <span lang="en">Which carrier phrase did you hear?</span>
        </p>

        <p>
          <button
            type="button"
            class="colors-check-audio"
            data-action="replay"
          >
            🔊 Ascolta di nuovo · Replay
          </button>
        </p>

        <div class="colors-check-options colors-carrier-options">
          ${optionHtml}
        </div>

        <div class="colors-check-footer">
          <span>
            Nessun suggerimento durante la prova.
            <span lang="en">No hints during the check.</span>
          </span>
          <button
            type="button"
            class="colors-check-next"
            data-action="next"
            disabled
          >
            Avanti · Next →
          </button>
        </div>
      </div>
    `;

    connectChoices();

    modalBody.querySelector('[data-action="next"]')
      ?.addEventListener("click", () => {
        session.results.push({
          section: "carrier",
          itemId: task.item.id,
          italian: task.item.italian,
          english: task.item.english,
          taskType: "carrier-meaning",
          carrierId: target.id,
          carrierItalian: target.italian,
          selectedCarrierId: session.selected,
          correct: session.selected === target.id
        });

        session.index += 1;

        if (session.index >= CARRIER_TOTAL) {
          finishCheck();
        } else {
          renderCurrent();
        }
      });

    modalBody.querySelector('[data-action="replay"]')
      ?.addEventListener("click", () => speak(sentence));

    window.setTimeout(() => speak(sentence), 180);
  }

  function finishCheck() {
    session.completedAt = new Date().toISOString();
    const saved = saveSession();
    refreshLatest();

    modalBody.innerHTML = `
      <div class="colors-check-interstitial">
        <span class="colors-check-interstitial-badge">
          Prova completata · Check complete
        </span>

        <h2>Punto di partenza · Starting point</h2>

        <div class="colors-check-result-grid">
          <div class="colors-check-result-stat">
            <strong>
              ${saved.vocabularyCorrect} / ${saved.vocabularyTotal}
            </strong>
            <span>Vocabolario · Vocabulary</span>
          </div>

          <div class="colors-check-result-stat">
            <strong>
              ${saved.carrierCorrect} / ${saved.carrierTotal}
            </strong>
            <span>Frasi utili · Carrier Phrases</span>
          </div>
        </div>

        <p class="colors-check-result-note">
          Questa è una fotografia di partenza, non un voto e non
          una misura di padronanza.
          <span lang="en">
            This is a starting-point snapshot, not a grade or a
            measure of mastery. Use the two sections to see where
            teaching or review may be useful.
          </span>
        </p>

        <div class="colors-check-interstitial-actions">
          <button
            type="button"
            class="colors-check-next"
            data-action="close"
          >
            Chiudi · Close
          </button>
        </div>
      </div>
    `;

    session = null;

    modalBody.querySelector('[data-action="close"]')
      ?.addEventListener("click", () => {
        modal.hidden = true;
      });
  }

  function init() {
    ensureStyles();
    checkCard = buildCard();
    ensureModal();

    document.getElementById("topicSelect")
      ?.addEventListener("change", updateVisibility);

    updateVisibility();
    refreshLatest();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
