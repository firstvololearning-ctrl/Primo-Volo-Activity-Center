"use strict";

/* ========================================
   NUMBERS STARTING CHECK
   Part 1: Vocabulary · Part 2: Carrier Phrases
   Numbers 1–20 · existing Primo Volo assets only
   ======================================== */

(() => {
  const TOPIC_KEY = "numbers";
  const VOCAB_TOTAL = 12;
  const CARRIER_TOTAL = 6;
  const TOTAL_ITEMS = VOCAB_TOTAL + CARRIER_TOTAL;
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";

  const VOCAB_TARGET_NUMBERS = [
    1, 2, 3, 4, 5, 7,
    9, 10, 12, 14, 17, 20
  ];

  const VOCAB_TASK_TYPES = [
    "word-to-numeral",
    "word-to-numeral",
    "word-to-numeral",
    "word-to-numeral",
    "numeral-to-word",
    "numeral-to-word",
    "numeral-to-word",
    "numeral-to-word",
    "listen-to-numeral",
    "listen-to-numeral",
    "listen-to-numeral",
    "listen-to-numeral"
  ];

  const DISTRACTORS = {
    1: [2, 3, 10],
    2: [3, 4, 12],
    3: [2, 4, 13],
    4: [3, 5, 14],
    5: [4, 6, 15],
    7: [6, 8, 17],
    9: [8, 10, 19],
    10: [9, 11, 20],
    12: [11, 13, 2],
    14: [13, 15, 4],
    17: [16, 18, 7],
    20: [18, 19, 10]
  };

  const NUMBER_SPECIFIC_CARRIERS = [
    {
      id: "numeroE",
      italian: "Il numero è...",
      english: "The number is...",
      image:
        "images/carrier-phrases/il-numero-e-no-text.png"
    },
    {
      id: "numeroPreferito",
      italian: "Il mio numero preferito è...",
      english: "My favorite number is...",
      image:
        "images/carrier-phrases/il-mio-numero-preferito-no-text.png"
    }
  ];

  const CARRIER_PLAN = [
    { family: "quantity", targetId: "vedo", number: 2 },
    { family: "quantity", targetId: "ho", number: 3 },
    { family: "quantity", targetId: "vedo", number: 4 },
    { family: "number", targetId: "numeroE", number: 7 },
    { family: "number", targetId: "numeroPreferito", number: 12 },
    { family: "number", targetId: "numeroE", number: 20 }
  ];

  const TASK_LABELS = {
    "word-to-numeral": "Parola → numero",
    "numeral-to-word": "Numero → parola",
    "listen-to-numeral": "Ascolto → numero",
    "carrier-meaning": "Ascolto → frase utile"
  };

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let activeSession = null;

  function getNumberItems() {
    const source =
      typeof numbers !== "undefined" &&
      Array.isArray(numbers)
        ? numbers
        : [];

    return source
      .slice(0, 20)
      .map((item, index) => ({
        id: String(index + 1).padStart(2, "0"),
        number: index + 1,
        italian: item.italian,
        english: item.english,
        image: item.image || ""
      }));
  }

  function numberItemsByValue() {
    return new Map(
      getNumberItems().map(item => [
        item.number,
        item
      ])
    );
  }

  function getQuantityCarriers() {
    const configured = Array.isArray(
      window.carrierPhrases?.numbers
    )
      ? window.carrierPhrases.numbers
      : [];

    return ["vedo", "ho"]
      .map(id =>
        configured.find(
          carrier => carrier.id === id
        )
      )
      .filter(Boolean);
  }

  function stemFor(carrier) {
    return String(carrier?.italian || "")
      .replace(/[.…]+$/u, "")
      .trim();
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

  function loadStartingChecks() {
    const storage = window.PrimoVoloStorage;
    const key = storageKey();

    try {
      const parsed = storage?.getJSON
        ? storage.getJSON(key, null)
        : JSON.parse(
            window.localStorage.getItem(key) ||
            "null"
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
        "Numbers starting check data could not be loaded.",
        error
      );
    }

    return {
      version: 2,
      byTopic: {}
    };
  }

  function saveStartingChecks(data) {
    const storage = window.PrimoVoloStorage;
    const key = storageKey();

    try {
      if (storage?.setJSON) {
        storage.setJSON(key, data);
      } else {
        window.localStorage.setItem(
          key,
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.warn(
        "Numbers starting check data could not be saved.",
        error
      );
    }
  }

  function latestResult() {
    const data = loadStartingChecks();

    return (
      data.byTopic?.[TOPIC_KEY]?.latest ||
      null
    );
  }

  function saveSession(session) {
    const data = loadStartingChecks();
    const topicData =
      data.byTopic[TOPIC_KEY] || {
        latest: null,
        history: []
      };

    const vocabularyResults =
      session.results.filter(
        result =>
          result.section === "vocabulary"
      );

    const carrierResults =
      session.results.filter(
        result => result.section === "carrier"
      );

    const byWord = {};
    vocabularyResults.forEach(result => {
      byWord[result.itemId] = {
        number: result.number,
        italian: result.italian,
        english: result.english,
        status: result.correct
          ? "correct"
          : "incorrect",
        taskType: result.taskType,
        selectedItemId:
          result.selectedItemId,
        checkedAt: session.completedAt
      };
    });

    const byCarrier = {};
    carrierResults.forEach(result => {
      const group =
        byCarrier[result.carrierId] || {
          italian: result.carrierItalian,
          family: result.family,
          attempts: 0,
          correct: 0
        };

      group.attempts += 1;

      if (result.correct) {
        group.correct += 1;
      }

      byCarrier[result.carrierId] =
        group;
    });

    const savedSession = {
      id: session.id,
      version: 2,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      total: session.results.length,
      correct: session.results.filter(
        result => result.correct
      ).length,
      vocabularyTotal:
        vocabularyResults.length,
      vocabularyCorrect:
        vocabularyResults.filter(
          result => result.correct
        ).length,
      carrierTotal: carrierResults.length,
      carrierCorrect:
        carrierResults.filter(
          result => result.correct
        ).length,
      byWord,
      byCarrier,
      results: session.results.map(
        result => ({
          section: result.section,
          itemId: result.itemId || null,
          number: result.number || null,
          italian: result.italian || null,
          english: result.english || null,
          taskType: result.taskType,
          selectedItemId:
            result.selectedItemId || null,
          carrierId:
            result.carrierId || null,
          carrierItalian:
            result.carrierItalian || null,
          selectedCarrierId:
            result.selectedCarrierId ||
            null,
          family: result.family || null,
          status: result.correct
            ? "correct"
            : "incorrect"
        })
      )
    };

    topicData.latest = savedSession;
    topicData.history = [
      ...(Array.isArray(topicData.history)
        ? topicData.history
        : []),
      savedSession
    ].slice(-10);

    data.version = 2;
    data.byTopic[TOPIC_KEY] = topicData;

    saveStartingChecks(data);
    return savedSession;
  }

  function formatDate(iso) {
    if (!iso) return "";

    try {
      return new Date(iso).toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );
    } catch {
      return "";
    }
  }

  function ensureStyles() {
    if (
      document.getElementById(
        "numbersStartingCheckStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id = "numbersStartingCheckStyles";
    style.textContent = `
      .numbers-starting-check {
        width: min(980px, calc(100% - 32px));
        margin: 18px auto 8px;
        padding: 18px 20px;
        border: 1px solid #d9e2ef;
        border-radius: 20px;
        background: #f8fbff;
        box-shadow:
          0 8px 24px rgba(39, 75, 132, .07);
      }

      .numbers-starting-check[hidden],
      .numbers-check-modal[hidden] {
        display: none !important;
      }

      .numbers-check-card-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }

      .numbers-check-copy {
        flex: 1 1 520px;
      }

      .numbers-check-kicker {
        display: inline-block;
        margin-bottom: 4px;
        color: #337a4d;
        font-size: .82rem;
        font-weight: 900;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      .numbers-starting-check h3 {
        margin: 0;
        color: #274b84;
        font-size: 1.2rem;
      }

      .numbers-starting-check p {
        margin: 6px 0 0;
        color: #5f6f86;
        line-height: 1.45;
      }

      .numbers-check-section-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }

      .numbers-check-section-chip {
        padding: 5px 9px;
        border: 1px solid #cbd8ea;
        border-radius: 999px;
        background: white;
        color: #405d7f;
        font-size: .78rem;
        font-weight: 850;
      }

      .numbers-check-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .numbers-check-button,
      .numbers-check-secondary,
      .numbers-check-next,
      .numbers-check-option,
      .numbers-check-audio {
        font: inherit;
        cursor: pointer;
      }

      .numbers-check-button,
      .numbers-check-next {
        padding: 10px 16px;
        border: 1px solid #a8c8b2;
        border-radius: 999px;
        background: #eef8f1;
        color: #286440;
        font-weight: 900;
      }

      .numbers-check-secondary,
      .numbers-check-audio {
        padding: 9px 14px;
        border: 1px solid #cbd8ea;
        border-radius: 999px;
        background: white;
        color: #274b84;
        font-weight: 800;
      }

      .numbers-check-modal {
        position: fixed;
        inset: 0;
        z-index: 100210;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(25, 42, 68, .56);
      }

      .numbers-check-dialog {
        position: relative;
        width: min(820px, 100%);
        max-height: 92vh;
        overflow-y: auto;
        padding: 26px;
        border-radius: 24px;
        background: white;
        box-shadow:
          0 20px 60px rgba(24, 43, 70, .25);
      }

      .numbers-check-close {
        position: absolute;
        top: 12px;
        right: 14px;
        width: 38px;
        height: 38px;
        border: 1px solid #d8e1ec;
        border-radius: 999px;
        background: white;
        color: #52647e;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }

      .numbers-check-progress {
        margin: 0 44px 16px 0;
        color: #69778a;
        font-size: .82rem;
        font-weight: 800;
      }

      .numbers-check-part-label,
      .numbers-check-task-label {
        display: inline-block;
        margin: 0 7px 8px 0;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: .78rem;
        font-weight: 850;
      }

      .numbers-check-part-label {
        background: #eef8f1;
        color: #337a4d;
      }

      .numbers-check-task-label {
        background: #f3f6fb;
        color: #52647e;
      }

      .numbers-check-question h2,
      .numbers-check-interstitial h2 {
        margin: 0;
        color: #274b84;
        font-size:
          clamp(1.45rem, 4vw, 2rem);
        line-height: 1.25;
      }

      .numbers-check-question-note,
      .numbers-check-interstitial p {
        margin: 8px 0 0;
        color: #6c788a;
        line-height: 1.5;
      }

      .numbers-check-big-number {
        display: grid;
        place-items: center;
        min-height: 145px;
        margin: 18px auto 6px;
        color: #274b84;
        font-size:
          clamp(4.2rem, 15vw, 7.5rem);
        font-weight: 950;
        line-height: 1;
      }

      .numbers-check-options {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 20px;
      }

      .numbers-check-option {
        min-height: 104px;
        padding: 14px;
        border: 2px solid #d9e2ef;
        border-radius: 18px;
        background: white;
        color: #274b84;
        font-weight: 850;
      }

      .numbers-check-option:hover,
      .numbers-check-option:focus-visible {
        border-color: #a9bdd6;
        outline: none;
      }

      .numbers-check-option.is-selected {
        border-color: #337a4d;
        background: #f1faf4;
        box-shadow:
          0 0 0 3px rgba(51, 122, 77, .12);
      }

      .numbers-check-numeral {
        display: grid;
        place-items: center;
        min-height: 78px;
        font-size: 2.6rem;
        font-weight: 950;
      }

      .numbers-check-word {
        display: grid;
        place-items: center;
        min-height: 78px;
        font-size: 1.15rem;
      }

      .numbers-carrier-options {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }

      .numbers-carrier-composite {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 8px;
      }

      .numbers-carrier-composite
      .carrier-visual {
        width: 100%;
        height: 125px;
        object-fit: contain;
      }

      .numbers-quantity-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        align-items: center;
        justify-items: center;
        gap: 4px;
        min-height: 125px;
      }

      .numbers-quantity-grid img {
        width: min(64px, 100%);
        height: 58px;
        object-fit: contain;
      }

      .numbers-carrier-number {
        display: grid;
        place-items: center;
        min-height: 125px;
        color: #274b84;
        font-size: 3rem;
        font-weight: 950;
      }

      .numbers-check-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 20px;
      }

      .numbers-check-next:disabled {
        opacity: .45;
        cursor: default;
      }

      .numbers-check-interstitial {
        padding: 18px 4px 4px;
        text-align: center;
      }

      .numbers-check-interstitial-badge {
        display: inline-block;
        margin-bottom: 12px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #eef8f1;
        color: #337a4d;
        font-size: .8rem;
        font-weight: 900;
      }

      .numbers-check-interstitial-actions {
        margin-top: 22px;
      }

      .numbers-check-result-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin: 18px 0;
      }

      .numbers-check-result-stat {
        padding: 18px;
        border: 1px solid #d9e2ef;
        border-radius: 18px;
        background: #f8fbff;
        text-align: center;
      }

      .numbers-check-result-stat strong {
        display: block;
        color: #274b84;
        font-size: 1.8rem;
      }

      .numbers-check-result-stat span {
        display: block;
        margin-top: 4px;
        color: #647489;
        font-size: .82rem;
        font-weight: 800;
      }

      .numbers-check-result-note {
        padding: 13px 15px;
        border-radius: 14px;
        background: #f3f6fb;
        color: #5f6f84;
        line-height: 1.5;
      }

      @media (max-width: 620px) {
        .numbers-check-dialog {
          padding: 22px 16px;
        }

        .numbers-check-options,
        .numbers-carrier-options {
          grid-template-columns: 1fr;
        }

        .numbers-check-result-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.append(style);
  }

  function buildCard() {
    const card =
      document.createElement("section");

    card.className =
      "numbers-starting-check";
    card.hidden = true;

    card.innerHTML = `
      <div class="numbers-check-card-row">
        <div class="numbers-check-copy">
          <span class="numbers-check-kicker">
            Prima di iniziare · Starting point
          </span>

          <h3>
            🔢 Prova iniziale · Numbers Starting Check
          </h3>

          <p>
            18 domande in due parti:
            vocabolario scritto/ascoltato e
            frasi utili collegate.
            <span lang="en">
              12 vocabulary items + 6 related
              carrier-phrase items.
            </span>
          </p>

          <div class="numbers-check-section-summary">
            <span class="numbers-check-section-chip">
              1 · Vocabolario 12
            </span>
            <span class="numbers-check-section-chip">
              2 · Frasi utili 6
            </span>
          </div>

          <div
            class="numbers-check-latest"
            data-role="latest"
          ></div>
        </div>

        <div class="numbers-check-actions">
          <button
            type="button"
            class="numbers-check-button"
            data-action="start"
          >
            ▶ Inizia · Start
          </button>
        </div>
      </div>
    `;

    const activityMenu =
      document.querySelector(
        ".activity-menu"
      );

    if (activityMenu?.parentNode) {
      activityMenu.parentNode.insertBefore(
        card,
        activityMenu
      );
    }

    card
      .querySelector('[data-action="start"]')
      ?.addEventListener(
        "click",
        startCheck
      );

    return card;
  }

  function ensureModal() {
    if (modal) return;

    modal =
      document.createElement("div");

    modal.className =
      "numbers-check-modal";
    modal.hidden = true;

    modal.innerHTML = `
      <div
        class="numbers-check-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Numbers Starting Check"
      >
        <button
          type="button"
          class="numbers-check-close"
          aria-label="Close Starting Check"
        >
          ×
        </button>

        <div
          class="numbers-check-body"
          data-role="body"
        ></div>
      </div>
    `;

    modalBody =
      modal.querySelector(
        '[data-role="body"]'
      );

    modal
      .querySelector(
        ".numbers-check-close"
      )
      ?.addEventListener(
        "click",
        closeModal
      );

    document.body.append(modal);
  }

  function closeModal() {
    if (!modal) return;

    modal.hidden = true;
    activeSession = null;
  }

  function refreshLatest() {
    if (!checkCard) return;

    const holder =
      checkCard.querySelector(
        '[data-role="latest"]'
      );

    if (!holder) return;

    const latest = latestResult();

    if (!latest) {
      holder.innerHTML = "";
      return;
    }

    holder.innerHTML = `
      <p>
        <strong>Ultima prova · Latest:</strong>
        Vocabolario
        ${latest.vocabularyCorrect ?? 0}/${
          latest.vocabularyTotal ?? VOCAB_TOTAL
        }
        · Frasi utili
        ${latest.carrierCorrect ?? 0}/${
          latest.carrierTotal ?? CARRIER_TOTAL
        }
        ${
          latest.completedAt
            ? `· ${escapeHtml(
                formatDate(
                  latest.completedAt
                )
              )}`
            : ""
        }
      </p>
    `;
  }

  function updateVisibility() {
    if (!checkCard) return;

    const topicSelect =
      document.getElementById(
        "topicSelect"
      );

    checkCard.hidden =
      topicSelect?.value !== TOPIC_KEY;

    if (!checkCard.hidden) {
      refreshLatest();
    }
  }

  function buildVocabularyTasks() {
    const byValue =
      numberItemsByValue();

    const targets = shuffle(
      VOCAB_TARGET_NUMBERS
    );

    const taskTypes = shuffle(
      VOCAB_TASK_TYPES
    );

    return targets
      .map((number, index) => ({
        section: "vocabulary",
        item: byValue.get(number),
        taskType: taskTypes[index]
      }))
      .filter(task => task.item);
  }

  function buildCarrierTasks() {
    const byValue =
      numberItemsByValue();

    return shuffle(
      CARRIER_PLAN
        .map(plan => ({
          ...plan,
          section: "carrier",
          item: byValue.get(plan.number),
          taskType: "carrier-meaning"
        }))
        .filter(task => task.item)
    );
  }

  function startCheck() {
    const vocabularyTasks =
      buildVocabularyTasks();

    const carrierTasks =
      buildCarrierTasks();

    if (
      vocabularyTasks.length !==
        VOCAB_TOTAL ||
      carrierTasks.length !==
        CARRIER_TOTAL
    ) {
      window.alert(
        "The Numbers Starting Check could not load all required items."
      );
      return;
    }

    ensureModal();

    activeSession = {
      id:
        `numbers-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      startedAt:
        new Date().toISOString(),
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
    if (!activeSession) return null;

    return activeSession.section ===
      "vocabulary"
      ? activeSession.vocabularyTasks[
          activeSession.index
        ]
      : activeSession.carrierTasks[
          activeSession.index
        ];
  }

  function vocabularyOptions(item) {
    const byValue =
      numberItemsByValue();

    const values = [
      item.number,
      ...(DISTRACTORS[item.number] || [])
    ]
      .map(value => byValue.get(value))
      .filter(Boolean)
      .slice(0, 4);

    return shuffle(values);
  }

  function renderCurrent() {
    if (!activeSession || !modalBody) {
      return;
    }

    if (
      activeSession.section ===
      "vocabulary"
    ) {
      renderVocabularyQuestion(
        currentTask()
      );
      return;
    }

    renderCarrierQuestion(
      currentTask()
    );
  }

  function progressNumber() {
    if (!activeSession) return 0;

    return activeSession.section ===
      "vocabulary"
      ? activeSession.index + 1
      : VOCAB_TOTAL +
          activeSession.index +
          1;
  }

  function renderVocabularyQuestion(task) {
    if (!task) return;

    activeSession.selected = null;

    const { item, taskType } = task;
    const options =
      vocabularyOptions(item);

    let promptHtml = "";
    let noteHtml = "";

    if (
      taskType === "word-to-numeral"
    ) {
      promptHtml = `
        <h2 lang="it">
          ${escapeHtml(item.italian)}
        </h2>
      `;
      noteHtml = `
        <p class="numbers-check-question-note">
          Scegli il numero.
          <span lang="en">
            Choose the numeral.
          </span>
        </p>
      `;
    } else if (
      taskType === "numeral-to-word"
    ) {
      promptHtml = `
        <div
          class="numbers-check-big-number"
          aria-label="${item.number}"
        >
          ${item.number}
        </div>
      `;
      noteHtml = `
        <p class="numbers-check-question-note">
          Scegli la parola italiana.
          <span lang="en">
            Choose the Italian number word.
          </span>
        </p>
      `;
    } else {
      promptHtml = `
        <h2>
          🔊 Ascolta e scegli.
        </h2>

        <p class="numbers-check-question-note">
          <span lang="en">
            Listen and choose the numeral.
          </span>
        </p>

        <p>
          <button
            type="button"
            class="numbers-check-audio"
            data-action="replay"
          >
            🔊 Ascolta di nuovo · Replay
          </button>
        </p>
      `;
    }

    const optionHtml = options
      .map(option => {
        const body =
          taskType ===
          "numeral-to-word"
            ? `
              <span class="numbers-check-word">
                ${escapeHtml(
                  option.italian
                )}
              </span>
            `
            : `
              <span class="numbers-check-numeral">
                ${option.number}
              </span>
            `;

        return `
          <button
            type="button"
            class="numbers-check-option"
            data-choice="${option.number}"
          >
            ${body}
          </button>
        `;
      })
      .join("");

    modalBody.innerHTML = `
      <p class="numbers-check-progress">
        ${progressNumber()} / ${TOTAL_ITEMS}
      </p>

      <div class="numbers-check-question">
        <span class="numbers-check-part-label">
          Parte 1 · Vocabolario
        </span>

        <span class="numbers-check-task-label">
          ${escapeHtml(
            TASK_LABELS[taskType]
          )}
        </span>

        ${promptHtml}
        ${noteHtml}

        <div class="numbers-check-options">
          ${optionHtml}
        </div>

        <div class="numbers-check-footer">
          <span>
            Nessun suggerimento durante la prova.
            <span lang="en">
              No hints during the check.
            </span>
          </span>

          <button
            type="button"
            class="numbers-check-next"
            data-action="next"
            disabled
          >
            Avanti · Next →
          </button>
        </div>
      </div>
    `;

    connectChoiceButtons(
      "number"
    );

    modalBody
      .querySelector(
        '[data-action="next"]'
      )
      ?.addEventListener(
        "click",
        recordVocabularyAnswer
      );

    modalBody
      .querySelector(
        '[data-action="replay"]'
      )
      ?.addEventListener(
        "click",
        () => speak(item.italian)
      );

    if (
      taskType ===
      "listen-to-numeral"
    ) {
      window.setTimeout(
        () => speak(item.italian),
        180
      );
    }
  }

  function connectChoiceButtons(kind) {
    const buttons = [
      ...modalBody.querySelectorAll(
        ".numbers-check-option"
      )
    ];

    const next =
      modalBody.querySelector(
        '[data-action="next"]'
      );

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          buttons.forEach(choice => {
            choice.classList.toggle(
              "is-selected",
              choice === button
            );
          });

          activeSession.selected =
            kind === "number"
              ? Number(
                  button.dataset.choice
                )
              : button.dataset.choice;

          if (next) {
            next.disabled = false;
          }
        }
      );
    });
  }

  function recordVocabularyAnswer() {
    if (
      !activeSession ||
      activeSession.selected === null
    ) {
      return;
    }

    const task = currentTask();

    if (!task) return;

    const { item, taskType } = task;
    const selectedNumber =
      Number(activeSession.selected);

    activeSession.results.push({
      section: "vocabulary",
      itemId: item.id,
      number: item.number,
      italian: item.italian,
      english: item.english,
      taskType,
      selectedItemId:
        String(selectedNumber).padStart(
          2,
          "0"
        ),
      correct:
        selectedNumber === item.number
    });

    activeSession.index += 1;

    if (
      activeSession.index >=
      VOCAB_TOTAL
    ) {
      renderCarrierTransition();
      return;
    }

    renderCurrent();
  }

  function renderCarrierTransition() {
    if (!activeSession || !modalBody) {
      return;
    }

    modalBody.innerHTML = `
      <div class="numbers-check-interstitial">
        <span
          class="numbers-check-interstitial-badge"
        >
          Parte 1 completata · Part 1 complete
        </span>

        <h2>
          💬 Parte 2 · Frasi utili
        </h2>

        <p>
          Ora ascolta sei frasi con i numeri.
          Scegli l'immagine della frase utile
          che corrisponde a ciò che senti.
          <span lang="en">
            Now listen to six number-related
            phrases and choose the matching
            carrier-phrase visual.
          </span>
        </p>

        <p>
          Il numero o la quantità resta uguale
          nelle risposte: cambia solo la frase utile.
          <span lang="en">
            The number or quantity stays the same
            across each choice set; only the
            carrier phrase changes.
          </span>
        </p>

        <div
          class="numbers-check-interstitial-actions"
        >
          <button
            type="button"
            class="numbers-check-next"
            data-action="continue"
          >
            Continua · Continue →
          </button>
        </div>
      </div>
    `;

    modalBody
      .querySelector(
        '[data-action="continue"]'
      )
      ?.addEventListener(
        "click",
        () => {
          activeSession.section =
            "carrier";
          activeSession.index = 0;
          activeSession.selected =
            null;
          renderCurrent();
        }
      );
  }

  function quantitySentence(
    carrier,
    item
  ) {
    return `${stemFor(carrier)} ${
      item.italian
    } matite.`;
  }

  function numberSentence(
    carrier,
    item
  ) {
    return `${stemFor(carrier)} ${
      item.italian
    }.`;
  }

  function quantityGridHtml(count) {
    return Array.from(
      { length: count },
      (_, index) => `
        <img
          src="images/classroom/supplies/supplies-04.png"
          alt=""
          aria-hidden="true"
          draggable="false"
          data-count="${index + 1}"
        >
      `
    ).join("");
  }

  function renderCarrierQuestion(task) {
    if (!task) return;

    activeSession.selected = null;

    const quantityCarriers =
      getQuantityCarriers();

    const familyCarriers =
      task.family === "quantity"
        ? quantityCarriers
        : NUMBER_SPECIFIC_CARRIERS;

    const target =
      familyCarriers.find(
        carrier =>
          carrier.id === task.targetId
      );

    if (
      !target ||
      familyCarriers.length < 2
    ) {
      window.alert(
        "The required Numbers carrier phrase visuals could not be loaded."
      );
      closeModal();
      return;
    }

    const sentence =
      task.family === "quantity"
        ? quantitySentence(
            target,
            task.item
          )
        : numberSentence(
            target,
            task.item
          );

    const options = shuffle(
      familyCarriers
    );

    const optionHtml = options
      .map((carrier, index) => {
        const contextHtml =
          task.family === "quantity"
            ? `
              <div
                class="numbers-quantity-grid"
                aria-hidden="true"
              >
                ${quantityGridHtml(
                  task.item.number
                )}
              </div>
            `
            : `
              <div
                class="numbers-carrier-number"
                aria-hidden="true"
              >
                ${task.item.number}
              </div>
            `;

        return `
          <button
            type="button"
            class="
              numbers-check-option
              numbers-carrier-composite
            "
            data-choice="${escapeHtml(
              carrier.id
            )}"
            aria-label="Carrier phrase choice ${
              index + 1
            }"
          >
            <img
              class="carrier-visual"
              src="${escapeHtml(
                carrier.image
              )}"
              alt=""
              aria-hidden="true"
              draggable="false"
            >

            ${contextHtml}
          </button>
        `;
      })
      .join("");

    modalBody.innerHTML = `
      <p class="numbers-check-progress">
        ${progressNumber()} / ${TOTAL_ITEMS}
      </p>

      <div class="numbers-check-question">
        <span class="numbers-check-part-label">
          Parte 2 · Frasi utili
        </span>

        <span class="numbers-check-task-label">
          ${TASK_LABELS[
            "carrier-meaning"
          ]}
        </span>

        <h2>
          🔊 Quale frase hai sentito?
        </h2>

        <p class="numbers-check-question-note">
          <span lang="en">
            Which carrier phrase did you hear?
          </span>
        </p>

        <p>
          <button
            type="button"
            class="numbers-check-audio"
            data-action="replay"
          >
            🔊 Ascolta di nuovo · Replay
          </button>
        </p>

        <div
          class="
            numbers-check-options
            numbers-carrier-options
          "
        >
          ${optionHtml}
        </div>

        <div class="numbers-check-footer">
          <span>
            Nessun suggerimento durante la prova.
            <span lang="en">
              No hints during the check.
            </span>
          </span>

          <button
            type="button"
            class="numbers-check-next"
            data-action="next"
            disabled
          >
            Avanti · Next →
          </button>
        </div>
      </div>
    `;

    connectChoiceButtons(
      "carrier"
    );

    modalBody
      .querySelector(
        '[data-action="next"]'
      )
      ?.addEventListener(
        "click",
        () =>
          recordCarrierAnswer(
            task,
            target
          )
      );

    modalBody
      .querySelector(
        '[data-action="replay"]'
      )
      ?.addEventListener(
        "click",
        () => speak(sentence)
      );

    window.setTimeout(
      () => speak(sentence),
      180
    );
  }

  function recordCarrierAnswer(
    task,
    target
  ) {
    if (
      !activeSession ||
      activeSession.selected === null
    ) {
      return;
    }

    activeSession.results.push({
      section: "carrier",
      itemId: task.item.id,
      number: task.item.number,
      italian: task.item.italian,
      english: task.item.english,
      taskType: "carrier-meaning",
      carrierId: target.id,
      carrierItalian: target.italian,
      selectedCarrierId:
        activeSession.selected,
      family: task.family,
      correct:
        activeSession.selected ===
        target.id
    });

    activeSession.index += 1;

    if (
      activeSession.index >=
      CARRIER_TOTAL
    ) {
      finishCheck();
      return;
    }

    renderCurrent();
  }

  function finishCheck() {
    if (!activeSession) return;

    activeSession.completedAt =
      new Date().toISOString();

    const saved =
      saveSession(activeSession);

    renderResults(saved);
    refreshLatest();

    activeSession = null;
  }

  function renderResults(saved) {
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="numbers-check-interstitial">
        <span
          class="numbers-check-interstitial-badge"
        >
          Prova completata · Check complete
        </span>

        <h2>
          Punto di partenza · Starting point
        </h2>

        <div
          class="numbers-check-result-grid"
        >
          <div
            class="numbers-check-result-stat"
          >
            <strong>
              ${
                saved.vocabularyCorrect
              } / ${
                saved.vocabularyTotal
              }
            </strong>
            <span>
              Vocabolario · Vocabulary
            </span>
          </div>

          <div
            class="numbers-check-result-stat"
          >
            <strong>
              ${
                saved.carrierCorrect
              } / ${
                saved.carrierTotal
              }
            </strong>
            <span>
              Frasi utili · Carrier Phrases
            </span>
          </div>
        </div>

        <p class="numbers-check-result-note">
          Questa è una fotografia di partenza,
          non un voto e non una misura di padronanza.
          <span lang="en">
            This is a starting-point snapshot,
            not a grade or a measure of mastery.
            Use the two sections to see where
            teaching or review may be useful.
          </span>
        </p>

        <div
          class="numbers-check-interstitial-actions"
        >
          <button
            type="button"
            class="numbers-check-next"
            data-action="close"
          >
            Chiudi · Close
          </button>
        </div>
      </div>
    `;

    modalBody
      .querySelector(
        '[data-action="close"]'
      )
      ?.addEventListener(
        "click",
        () => {
          if (modal) {
            modal.hidden = true;
          }
        }
      );
  }

  function init() {
    ensureStyles();
    checkCard = buildCard();
    ensureModal();

    const topicSelect =
      document.getElementById(
        "topicSelect"
      );

    topicSelect?.addEventListener(
      "change",
      updateVisibility
    );

    updateVisibility();
    refreshLatest();
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
