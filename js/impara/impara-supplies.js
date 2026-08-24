/* ========================================
   EXPANDED IMPARA — SCHOOL SUPPLIES
   Explore cards + interactive classroom
   ======================================== */

(() => {
  const ITEMS = [
    { n: "01", it: "il foglio", en: "sheet of paper", x: 22.0, y: 63.1 },
    { n: "02", it: "le forbici", en: "scissors", x: 71.2, y: 43.2 },
    { n: "03", it: "la colla", en: "glue", x: 65.5, y: 38.1 },
    { n: "04", it: "la matita", en: "pencil", x: 72.5, y: 78.7 },
    { n: "05", it: "la penna", en: "pen", x: 22.4, y: 42.0 },
    { n: "06", it: "la matita colorata", en: "colored pencil", x: 26.1, y: 70.4 },
    { n: "07", it: "il gesso", en: "chalk", x: 86.7, y: 24.5 },
    { n: "08", it: "il pennarello", en: "marker", x: 40.1, y: 68.6 },
    { n: "09", it: "il righello", en: "ruler", x: 88.8, y: 83.0 },
    { n: "10", it: "la spillatrice", en: "stapler", x: 83.3, y: 42.7 },
    { n: "11", it: "il nastro adesivo", en: "tape", x: 93.9, y: 48.5 },
    { n: "13", it: "lo zaino", en: "backpack", x: 6.1, y: 81.8 },
    { n: "14", it: "il quaderno", en: "notebook", x: 14.0, y: 39.0 }
  ];

  const SCENE =
    "images/scene-images/supplies/supplies1.png";

  function speak(text) {
    if (
      typeof speakItalian ===
      "function"
    ) {
      speakItalian(text);
    }
  }

  function getSuppliesGrid() {
    const imgs = [
      ...document.querySelectorAll(
        'img[src*="supplies-"]'
      )
    ].filter(img =>
      !img.src.includes("scene-images/supplies")
    );

    if (imgs.length < 10) return null;

    let node = imgs[0].parentElement;

    while (
      node &&
      node !== document.body
    ) {
      const count =
        node.querySelectorAll(
          'img[src*="supplies-"]'
        ).length;

      if (count >= 10) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  function getOriginalImage(number) {
    return document.querySelector(
      `img[src*="supplies-${number}"]`
    );
  }

  function makeHotspot(item, result) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className =
      "supplies-scene-hotspot";

    button.style.left = `${item.x}%`;
    button.style.top = `${item.y}%`;

    button.dataset.label = item.it;
    button.dataset.item = item.n;

    button.setAttribute(
      "aria-label",
      `${item.it}: ${item.en}`
    );

    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".supplies-scene-hotspot"
          )
          .forEach(el =>
            el.classList.remove(
              "is-active"
            )
          );

        button.classList.add(
          "is-active"
        );

        result.innerHTML = `
          <strong>${item.it}</strong>
          <span class="supplies-result-english">
            ${item.en}
          </span>
        `;

        speak(item.it);
      }
    );

    return button;
  }

  function buildPanel(grid) {
    if (
      document.getElementById(
        "suppliesExpandedImpara"
      )
    ) {
      return;
    }

    const wrapper =
      document.createElement("section");

    wrapper.id =
      "suppliesExpandedImpara";

    wrapper.className =
      "supplies-expanded-impara";

    const nav =
      document.createElement("div");

    nav.className =
      "supplies-impara-tabs";

    const explore =
      document.createElement("button");

    explore.type = "button";
    explore.className =
      "supplies-impara-tab is-active";

    explore.innerHTML = `
      <strong>📖 Esplora</strong>
      <span>Explore</span>
    `;

    const sceneTab =
      document.createElement("button");

    sceneTab.type = "button";
    sceneTab.className =
      "supplies-impara-tab";

    sceneTab.innerHTML = `
      <strong>🔎 Trova nella classe</strong>
      <span>Find It in the Classroom</span>
    `;

    nav.append(
      explore,
      sceneTab
    );

    const panel =
      document.createElement("div");

    panel.className =
      "supplies-scene-panel";

    panel.hidden = true;

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          🔎 Trova nella classe
        </h4>

        <p>
          Tocca un oggetto per ascoltare
          la parola.
          <span class="supplies-result-english">
            · Tap an object to hear the word.
          </span>
        </p>
      </div>

      <div class="supplies-classroom-scene">
        <img
          class="supplies-scene-image"
          src="${SCENE}"
          alt="A clay classroom with school supplies placed around the room"
        >

        <div
          class="supplies-hotspot-layer"
          aria-label="Interactive school supplies"
        ></div>
      </div>

      <div
        class="supplies-scene-result"
        aria-live="polite"
      >
        <strong>
          Tocca un oggetto.
        </strong>

        <span class="supplies-result-english">
          Tap an object.
        </span>
      </div>
    `;

    wrapper.append(
      nav,
      panel
    );

    grid.parentNode.insertBefore(
      wrapper,
      grid
    );

    const scene =
      panel.querySelector(
        ".supplies-classroom-scene"
      );

    const layer =
      panel.querySelector(
        ".supplies-hotspot-layer"
      );

    const result =
      panel.querySelector(
        ".supplies-scene-result"
      );

    ITEMS.forEach(item => {
      if (item.overlay) {
        const original =
          getOriginalImage(item.n);

        if (original) {
          const overlay =
            document.createElement("img");

          overlay.src =
            original.src;

          overlay.alt = "";

          overlay.className =
            "supplies-scene-overlay";

          overlay.style.left =
            `${item.x}%`;

          overlay.style.top =
            `${item.y}%`;

          scene.appendChild(
            overlay
          );
        }
      }

      layer.appendChild(
        makeHotspot(
          item,
          result
        )
      );
    });

    function showExplore() {
      explore.classList.add(
        "is-active"
      );

      sceneTab.classList.remove(
        "is-active"
      );

      panel.hidden = true;
      grid.style.display = "";
    }

    function showScene() {
      sceneTab.classList.add(
        "is-active"
      );

      explore.classList.remove(
        "is-active"
      );

      grid.style.display = "none";
      panel.hidden = false;
    }

    explore.addEventListener(
      "click",
      showExplore
    );

    sceneTab.addEventListener(
      "click",
      showScene
    );
  }

  function clearSuppliesPanel() {
    const wrapper =
      document.getElementById(
        "suppliesExpandedImpara"
      );

    if (wrapper) {
      wrapper.remove();
    }

    const grid =
      document.getElementById(
        "vocabularyGrid"
      );

    if (grid) {
      grid.style.display = "";
    }
  }

  function init() {
    const grid =
      getSuppliesGrid();

    if (!grid) {
      clearSuppliesPanel();
      return;
    }

    buildPanel(grid);
  }

  const observer =
    new MutationObserver(() => {
      init();
    });

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  init();
})();

/* ========================================
   SCHOOL SUPPLIES STARTING CHECK
   Vocabulary-only diagnostic using existing assets
   ======================================== */

(() => {
  const TOPIC_KEY = "supplies";
  const TOTAL_ITEMS = 12;
  const STORAGE_FALLBACK_KEY =
    "primoVoloStartingChecksV1";

  const PRETEST_ITEMS = [
    { id: "01", italian: "il foglio", english: "sheet of paper", image: "images/classroom/supplies/supplies-01.png" },
    { id: "02", italian: "le forbici", english: "scissors", image: "images/classroom/supplies/supplies-02.png" },
    { id: "03", italian: "la colla", english: "glue", image: "images/classroom/supplies/supplies-03.png" },
    { id: "04", italian: "la matita", english: "pencil", image: "images/classroom/supplies/supplies-04.png" },
    { id: "05", italian: "la penna", english: "pen", image: "images/classroom/supplies/supplies-05.png" },
    { id: "06", italian: "la matita colorata", english: "colored pencil", image: "images/classroom/supplies/supplies-06.png" },
    { id: "07", italian: "il gesso", english: "chalk", image: "images/classroom/supplies/supplies-07.png" },
    { id: "08", italian: "il pennarello", english: "marker", image: "images/classroom/supplies/supplies-08.png" },
    { id: "09", italian: "il righello", english: "ruler", image: "images/classroom/supplies/supplies-09.png" },
    { id: "10", italian: "la spillatrice", english: "stapler", image: "images/classroom/supplies/supplies-10.png" },
    { id: "11", italian: "il nastro adesivo", english: "tape", image: "images/classroom/supplies/supplies-11.png" },
    { id: "12", italian: "la gomma", english: "eraser", image: "images/classroom/supplies/supplies-12.png" },
    { id: "13", italian: "lo zaino", english: "backpack", image: "images/classroom/supplies/supplies-13.png" },
    { id: "14", italian: "il quaderno", english: "notebook", image: "images/classroom/supplies/supplies-14.png" }
  ];

  const TARGET_IDS = [
    "01", "02", "03", "04", "05", "06",
    "08", "09", "11", "12", "13", "14"
  ];

  const DISTRACTORS = {
    "01": ["14", "09", "12"],
    "02": ["03", "10", "11"],
    "03": ["11", "10", "02"],
    "04": ["05", "06", "08"],
    "05": ["04", "08", "06"],
    "06": ["04", "05", "08"],
    "07": ["04", "08", "12"],
    "08": ["04", "05", "06"],
    "09": ["04", "08", "01"],
    "10": ["03", "11", "02"],
    "11": ["03", "10", "02"],
    "12": ["04", "05", "09"],
    "13": ["14", "01", "11"],
    "14": ["01", "13", "09"]
  };

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
    "listen-to-picture",
    "listen-to-picture"
  ];

  const TASK_LABELS = {
    "italian-to-picture": "Italiano → immagine",
    "picture-to-italian": "Immagine → italiano",
    "listen-to-picture": "Ascolto → immagine"
  };

  const itemById = new Map(
    PRETEST_ITEMS.map(item => [item.id, item])
  );

  let checkCard = null;
  let modal = null;
  let modalBody = null;
  let activeSession = null;

  function shuffle(items) {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(
        Math.random() * (index + 1)
      );

      [result[index], result[randomIndex]] = [
        result[randomIndex],
        result[index]
      ];
    }

    return result;
  }

  function escapeHtml(value) {
    return String(value || "")
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
          version: 1,
          byTopic:
            parsed.byTopic &&
            typeof parsed.byTopic === "object"
              ? parsed.byTopic
              : {}
        };
      }
    } catch (error) {
      console.warn(
        "Starting check data could not be loaded.",
        error
      );
    }

    return {
      version: 1,
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
        "Starting check data could not be saved.",
        error
      );
    }
  }

  function latestResult() {
    const data = loadStartingChecks();
    return data.byTopic?.[TOPIC_KEY]?.latest || null;
  }

  function saveSession(session) {
    const data = loadStartingChecks();
    const topicData =
      data.byTopic[TOPIC_KEY] || {
        latest: null,
        history: []
      };

    const byWord = {};

    session.results.forEach(result => {
      byWord[result.itemId] = {
        italian: result.italian,
        english: result.english,
        status: result.correct
          ? "correct"
          : "incorrect",
        taskType: result.taskType,
        selectedItemId: result.selectedItemId,
        checkedAt: session.completedAt
      };
    });

    const savedSession = {
      id: session.id,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      total: session.results.length,
      correct: session.results.filter(
        result => result.correct
      ).length,
      byWord,
      results: session.results.map(result => ({
        itemId: result.itemId,
        italian: result.italian,
        english: result.english,
        taskType: result.taskType,
        selectedItemId: result.selectedItemId,
        status: result.correct
          ? "correct"
          : "incorrect"
      }))
    };

    topicData.latest = savedSession;
    topicData.history = [
      ...(Array.isArray(topicData.history)
        ? topicData.history
        : []),
      savedSession
    ].slice(-10);

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
        "suppliesStartingCheckStyles"
      )
    ) {
      return;
    }

    const style = document.createElement("style");
    style.id = "suppliesStartingCheckStyles";
    style.textContent = `
      .supplies-starting-check {
        width: min(980px, calc(100% - 32px));
        margin: 18px auto 8px;
        padding: 18px 20px;
        border: 1px solid #d9e2ef;
        border-radius: 20px;
        background: #f8fbff;
        box-shadow: 0 8px 24px rgba(39, 75, 132, .07);
      }

      .supplies-starting-check[hidden],
      .supplies-check-modal[hidden] {
        display: none !important;
      }

      .supplies-check-card-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }

      .supplies-check-copy {
        flex: 1 1 500px;
      }

      .supplies-check-kicker {
        display: inline-block;
        margin-bottom: 4px;
        color: #337a4d;
        font-size: .82rem;
        font-weight: 900;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      .supplies-starting-check h3 {
        margin: 0;
        color: #274b84;
        font-size: 1.2rem;
      }

      .supplies-starting-check p {
        margin: 6px 0 0;
        color: #5f6f86;
        line-height: 1.45;
      }

      .supplies-check-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .supplies-check-button,
      .supplies-check-secondary,
      .supplies-check-next,
      .supplies-check-option,
      .supplies-check-audio {
        font: inherit;
        cursor: pointer;
      }

      .supplies-check-button,
      .supplies-check-next {
        padding: 10px 16px;
        border: 1px solid #a8c8b2;
        border-radius: 999px;
        background: #eef8f1;
        color: #286440;
        font-weight: 900;
      }

      .supplies-check-secondary,
      .supplies-check-audio {
        padding: 9px 14px;
        border: 1px solid #cbd8ea;
        border-radius: 999px;
        background: white;
        color: #274b84;
        font-weight: 800;
      }

      .supplies-check-modal {
        position: fixed;
        inset: 0;
        z-index: 100200;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(25, 42, 68, .56);
      }

      .supplies-check-dialog {
        position: relative;
        width: min(780px, 100%);
        max-height: 92vh;
        overflow-y: auto;
        padding: 26px;
        border-radius: 24px;
        background: white;
        box-shadow: 0 22px 65px rgba(0, 0, 0, .24);
      }

      .supplies-check-close {
        position: absolute;
        top: 12px;
        right: 14px;
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 50%;
        background: #eef3fa;
        color: #274b84;
        font-size: 1.7rem;
        cursor: pointer;
      }

      .supplies-check-progress {
        margin: 0 52px 16px 0;
        color: #66758d;
        font-size: .9rem;
        font-weight: 800;
      }

      .supplies-check-task-label {
        display: inline-block;
        margin-bottom: 8px;
        padding: 5px 9px;
        border-radius: 999px;
        background: #f3f6fb;
        color: #52647e;
        font-size: .78rem;
        font-weight: 800;
      }

      .supplies-check-question h2 {
        margin: 0;
        color: #274b84;
        font-size: clamp(1.45rem, 4vw, 2rem);
        line-height: 1.25;
      }

      .supplies-check-question-note {
        margin: 8px 0 0;
        color: #6c788a;
      }

      .supplies-check-target-image {
        display: block;
        width: min(260px, 60vw);
        height: 220px;
        margin: 18px auto;
        object-fit: contain;
      }

      .supplies-check-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 22px;
      }

      .supplies-check-option {
        min-height: 92px;
        padding: 12px;
        border: 2px solid #d9e2ef;
        border-radius: 16px;
        background: white;
        color: #263b5d;
        font-weight: 850;
      }

      .supplies-check-option:hover,
      .supplies-check-option:focus-visible {
        border-color: #8fb0db;
        outline: none;
      }

      .supplies-check-option.is-selected {
        border-color: #4f78b4;
        background: #eef5ff;
        box-shadow: 0 0 0 2px rgba(79, 120, 180, .13);
      }

      .supplies-check-option img {
        display: block;
        width: 100%;
        height: 135px;
        object-fit: contain;
      }

      .supplies-check-option-text {
        min-height: 70px;
        display: grid;
        place-items: center;
        padding: 16px;
        font-size: 1.08rem;
      }

      .supplies-check-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 22px;
      }

      .supplies-check-next:disabled {
        opacity: .45;
        cursor: not-allowed;
      }

      .supplies-check-result-score {
        margin: 12px 0 4px;
        color: #274b84;
        font-size: clamp(2rem, 7vw, 3.2rem);
        font-weight: 950;
      }

      .supplies-check-result-note {
        color: #66758d;
        line-height: 1.5;
      }

      .supplies-check-results-table {
        width: 100%;
        margin-top: 20px;
        border-collapse: collapse;
      }

      .supplies-check-results-table th,
      .supplies-check-results-table td {
        padding: 9px 10px;
        border-bottom: 1px solid #e1e7ef;
        text-align: left;
        vertical-align: top;
      }

      .supplies-check-results-table th {
        color: #274b84;
        background: #f6f8fb;
      }

      .supplies-check-status-correct {
        color: #2f7247;
        font-weight: 900;
      }

      .supplies-check-status-review {
        color: #8b5a35;
        font-weight: 900;
      }

      @media (max-width: 620px) {
        .supplies-starting-check {
          width: min(100% - 20px, 980px);
          padding: 16px;
        }

        .supplies-check-dialog {
          padding: 22px 16px;
        }

        .supplies-check-options {
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .supplies-check-option img {
          height: 110px;
        }

        .supplies-check-footer {
          align-items: stretch;
          flex-direction: column;
        }

        .supplies-check-next,
        .supplies-check-secondary {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createCard() {
    if (checkCard) return checkCard;

    const activityMenu =
      document.querySelector(".activity-menu");

    if (!activityMenu) return null;

    checkCard = document.createElement("section");
    checkCard.className = "supplies-starting-check";
    checkCard.hidden = true;
    checkCard.setAttribute(
      "aria-label",
      "School Supplies starting check"
    );

    activityMenu.parentNode.insertBefore(
      checkCard,
      activityMenu
    );

    return checkCard;
  }

  function createModal() {
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "supplies-check-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div
        class="supplies-check-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suppliesCheckDialogTitle"
      >
        <button
          type="button"
          class="supplies-check-close"
          aria-label="Chiudi · Close"
        >×</button>
        <div class="supplies-check-modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);
    modalBody = modal.querySelector(
      ".supplies-check-modal-body"
    );

    modal
      .querySelector(".supplies-check-close")
      .addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    return modal;
  }

  function closeModal() {
    if (!modal) return;

    modal.hidden = true;

    if (
      window.PrimoVoloAudio &&
      typeof window.PrimoVoloAudio.stop === "function"
    ) {
      window.PrimoVoloAudio.stop();
    } else if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }
  }

  function renderCard() {
    const card = createCard();
    if (!card) return;

    const latest = latestResult();
    const hasResult = Boolean(latest);

    card.innerHTML = `
      <div class="supplies-check-card-row">
        <div class="supplies-check-copy">
          <span class="supplies-check-kicker">
            Prima di iniziare · Starting point
          </span>
          <h3>
            📚 Prova iniziale · School Supplies Starting Check
          </h3>
          <p>
            12 domande brevi: parole, immagini e ascolto.
            <span lang="en">
              No hints or translations during the check.
            </span>
          </p>
          ${hasResult ? `
            <p>
              <strong>Ultima prova:</strong>
              ${latest.correct}/${latest.total}
              · ${escapeHtml(formatDate(latest.completedAt))}
            </p>
          ` : ""}
        </div>
        <div class="supplies-check-actions">
          <button
            type="button"
            class="supplies-check-button"
            data-action="start"
          >
            ${hasResult
              ? "↻ Ripeti · Retake"
              : "▶ Inizia · Start"}
          </button>
          ${hasResult ? `
            <button
              type="button"
              class="supplies-check-secondary"
              data-action="results"
            >
              Risultati · Results
            </button>
          ` : ""}
        </div>
      </div>
    `;

    card
      .querySelector('[data-action="start"]')
      ?.addEventListener(
        "click",
        startCheck
      );

    card
      .querySelector('[data-action="results"]')
      ?.addEventListener(
        "click",
        () => showResults(latest)
      );
  }

  function syncVisibility() {
    const select =
      document.getElementById("topicSelect");
    const card = createCard();

    if (!select || !card) return;

    const isSupplies =
      select.value === TOPIC_KEY;

    card.hidden = !isSupplies;

    if (!isSupplies) {
      closeModal();
    } else {
      renderCard();
    }
  }

  function buildQuestions() {
    const targets = shuffle(TARGET_IDS)
      .slice(0, TOTAL_ITEMS)
      .map(id => itemById.get(id));

    const taskTypes = shuffle(TASK_TYPES);

    return targets.map((target, index) => {
      const optionIds = shuffle([
        target.id,
        ...DISTRACTORS[target.id]
      ]);

      return {
        target,
        taskType: taskTypes[index],
        options: optionIds.map(
          id => itemById.get(id)
        )
      };
    });
  }

  function startCheck() {
    createModal();

    activeSession = {
      id: `supplies-${Date.now()}`,
      startedAt: new Date().toISOString(),
      index: 0,
      selectedItemId: null,
      questions: buildQuestions(),
      results: []
    };

    modal.hidden = false;
    renderQuestion();
  }

  function optionButtonHtml(item, taskType, index) {
    if (taskType === "picture-to-italian") {
      return `
        <button
          type="button"
          class="supplies-check-option supplies-check-option-text"
          data-option-id="${item.id}"
        >
          ${escapeHtml(item.italian)}
        </button>
      `;
    }

    return `
      <button
        type="button"
        class="supplies-check-option"
        data-option-id="${item.id}"
        aria-label="Opzione ${index + 1}"
      >
        <img
          src="${item.image}"
          alt=""
        >
      </button>
    `;
  }

  function renderQuestion() {
    if (!activeSession || !modalBody) return;

    const question =
      activeSession.questions[
        activeSession.index
      ];

    if (!question) {
      finishCheck();
      return;
    }

    activeSession.selectedItemId = null;

    const number = activeSession.index + 1;
    const target = question.target;
    const taskType = question.taskType;

    let promptHtml = "";
    let targetHtml = "";
    let audioHtml = "";

    if (taskType === "italian-to-picture") {
      promptHtml = `
        <h2 id="suppliesCheckDialogTitle">
          Quale immagine mostra
          <strong>${escapeHtml(target.italian)}</strong>?
        </h2>
      `;
    } else if (taskType === "picture-to-italian") {
      promptHtml = `
        <h2 id="suppliesCheckDialogTitle">
          Come si dice in italiano?
        </h2>
      `;
      targetHtml = `
        <img
          class="supplies-check-target-image"
          src="${target.image}"
          alt="Oggetto scolastico"
        >
      `;
    } else {
      promptHtml = `
        <h2 id="suppliesCheckDialogTitle">
          Ascolta. Quale immagine corrisponde alla parola?
        </h2>
      `;
      audioHtml = `
        <p>
          <button
            type="button"
            class="supplies-check-audio"
            data-action="replay-audio"
          >
            🔊 Ascolta di nuovo · Listen again
          </button>
        </p>
      `;
    }

    modalBody.innerHTML = `
      <p class="supplies-check-progress">
        Domanda ${number} di ${TOTAL_ITEMS}
        · Question ${number} of ${TOTAL_ITEMS}
      </p>

      <section class="supplies-check-question">
        <span class="supplies-check-task-label">
          ${TASK_LABELS[taskType]}
        </span>

        ${promptHtml}
        ${targetHtml}
        ${audioHtml}

        <p class="supplies-check-question-note">
          Scegli una risposta.
          <span lang="en">Choose one answer.</span>
        </p>

        <div class="supplies-check-options">
          ${question.options
            .map((item, index) =>
              optionButtonHtml(
                item,
                taskType,
                index
              )
            )
            .join("")}
        </div>

        <div class="supplies-check-footer">
          <span class="supplies-check-question-note">
            Nessun feedback fino alla fine.
            <span lang="en">
              Feedback is saved until the end.
            </span>
          </span>

          <button
            type="button"
            class="supplies-check-next"
            data-action="next"
            disabled
          >
            ${number === TOTAL_ITEMS
              ? "Finisci · Finish"
              : "Avanti · Next"}
          </button>
        </div>
      </section>
    `;

    const nextButton = modalBody.querySelector(
      '[data-action="next"]'
    );

    modalBody
      .querySelectorAll("[data-option-id]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            modalBody
              .querySelectorAll("[data-option-id]")
              .forEach(option =>
                option.classList.remove(
                  "is-selected"
                )
              );

            button.classList.add(
              "is-selected"
            );

            activeSession.selectedItemId =
              button.dataset.optionId;

            nextButton.disabled = false;
          }
        );
      });

    nextButton.addEventListener(
      "click",
      recordAndAdvance
    );

    modalBody
      .querySelector('[data-action="replay-audio"]')
      ?.addEventListener(
        "click",
        () => speak(target.italian)
      );

    if (taskType === "listen-to-picture") {
      window.setTimeout(
        () => {
          if (
            activeSession &&
            activeSession.questions[
              activeSession.index
            ] === question &&
            !modal.hidden
          ) {
            speak(target.italian);
          }
        },
        250
      );
    }
  }

  function recordAndAdvance() {
    if (
      !activeSession ||
      !activeSession.selectedItemId
    ) {
      return;
    }

    const question =
      activeSession.questions[
        activeSession.index
      ];

    activeSession.results.push({
      itemId: question.target.id,
      italian: question.target.italian,
      english: question.target.english,
      taskType: question.taskType,
      selectedItemId:
        activeSession.selectedItemId,
      correct:
        activeSession.selectedItemId ===
        question.target.id
    });

    activeSession.index += 1;

    if (
      activeSession.index >=
      activeSession.questions.length
    ) {
      finishCheck();
      return;
    }

    renderQuestion();
  }

  function finishCheck() {
    if (!activeSession) return;

    activeSession.completedAt =
      new Date().toISOString();

    const saved = saveSession(activeSession);
    activeSession = null;

    renderCard();
    showResults(saved);
  }

  function showResults(result) {
    if (!result) return;

    createModal();
    modal.hidden = false;

    const rows = result.results
      .map(entry => {
        const correct =
          entry.status === "correct";

        return `
          <tr>
            <td>
              <strong>
                ${escapeHtml(entry.italian)}
              </strong>
            </td>
            <td>
              ${escapeHtml(
                TASK_LABELS[entry.taskType] ||
                entry.taskType
              )}
            </td>
            <td class="${correct
              ? "supplies-check-status-correct"
              : "supplies-check-status-review"}">
              ${correct
                ? "✓ Corretta · Correct"
                : "○ Da insegnare/ripassare · Review"}
            </td>
          </tr>
        `;
      })
      .join("");

    modalBody.innerHTML = `
      <h2 id="suppliesCheckDialogTitle">
        📚 Risultati della prova iniziale
        <span lang="en">· Starting Check Results</span>
      </h2>

      <div class="supplies-check-result-score">
        ${result.correct}/${result.total}
      </div>

      <p class="supplies-check-result-note">
        Questa è una fotografia di partenza, non un voto e
        non una misura di padronanza.
        <span lang="en">
          Use it to see which words may need teaching or review.
        </span>
      </p>

      <table class="supplies-check-results-table">
        <thead>
          <tr>
            <th>Parola · Word</th>
            <th>Tipo · Task</th>
            <th>Stato · Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="supplies-check-footer">
        <span class="supplies-check-question-note">
          Salvato ${escapeHtml(
            formatDate(result.completedAt)
          )}
        </span>

        <button
          type="button"
          class="supplies-check-button"
          data-action="done"
        >
          Fatto · Done
        </button>
      </div>
    `;

    modalBody
      .querySelector('[data-action="done"]')
      ?.addEventListener(
        "click",
        closeModal
      );
  }

  function initStartingCheck() {
    ensureStyles();
    createModal();
    createCard();
    syncVisibility();

    document
      .getElementById("topicSelect")
      ?.addEventListener(
        "change",
        syncVisibility
      );

    window.addEventListener(
      "primo-volo-student-changed",
      () => {
        closeModal();
        renderCard();
        syncVisibility();
      }
    );

    window.addEventListener(
      "primo-volo-storage-change",
      event => {
        const detail = event.detail || {};
        const descriptor =
          detail.descriptor || {};

        if (
          descriptor.id === "starting-checks" ||
          String(detail.key || "").includes(
            STORAGE_FALLBACK_KEY
          )
        ) {
          renderCard();
        }
      }
    );
  }

  initStartingCheck();
})();
