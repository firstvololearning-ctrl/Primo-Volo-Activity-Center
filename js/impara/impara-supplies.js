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
   Part 1: Vocabulary · Part 2: Carrier Phrases
   Reuses existing supply + carrier phrase assets
   ======================================== */

(() => {
  const TOPIC_KEY = "supplies";
  const VOCAB_TOTAL = 12;
  const CARRIER_TOTAL = 6;
  const TOTAL_ITEMS = VOCAB_TOTAL + CARRIER_TOTAL;
  const STORAGE_FALLBACK_KEY = "primoVoloStartingChecksV1";

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

  const VOCAB_TARGET_IDS = [
    "01", "02", "03", "04", "05", "06",
    "08", "09", "11", "12", "13", "14"
  ];

  const CARRIER_SUPPLY_IDS = [
    "04", "05", "08", "09", "13", "14"
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

  const VOCAB_TASK_TYPES = [
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
    "listen-to-picture": "Ascolto → immagine",
    "carrier-meaning": "Ascolto → frase utile"
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
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [
        result[randomIndex], result[index]
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

  function getSupplyCarriers() {
    const all = Array.isArray(
      window.carrierPhrases?.[TOPIC_KEY]
    )
      ? window.carrierPhrases[TOPIC_KEY]
      : [];

    const wanted = ["vedo", "ho", "piace"];

    return wanted
      .map(id => all.find(carrier => carrier.id === id))
      .filter(Boolean);
  }

  function carrierSentence(carrier, supply) {
    const stem = String(carrier?.italian || "")
      .replace(/[.…]+$/u, "")
      .trim();

    return `${stem} ${supply.italian}.`;
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
        "Starting check data could not be loaded.",
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

    const vocabularyResults =
      session.results.filter(
        result => result.section === "vocabulary"
      );

    const carrierResults =
      session.results.filter(
        result => result.section === "carrier"
      );

    const byWord = {};
    vocabularyResults.forEach(result => {
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

    const byCarrier = {};
    carrierResults.forEach(result => {
      const group =
        byCarrier[result.carrierId] || {
          italian: result.carrierItalian,
          attempts: 0,
          correct: 0
        };

      group.attempts += 1;
      if (result.correct) group.correct += 1;
      byCarrier[result.carrierId] = group;
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
      vocabularyTotal: vocabularyResults.length,
      vocabularyCorrect: vocabularyResults.filter(
        result => result.correct
      ).length,
      carrierTotal: carrierResults.length,
      carrierCorrect: carrierResults.filter(
        result => result.correct
      ).length,
      byWord,
      byCarrier,
      results: session.results.map(result => ({
        section: result.section,
        itemId: result.itemId,
        italian: result.italian,
        english: result.english,
        taskType: result.taskType,
        selectedItemId:
          result.selectedItemId || null,
        carrierId: result.carrierId || null,
        carrierItalian:
          result.carrierItalian || null,
        selectedCarrierId:
          result.selectedCarrierId || null,
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

      .supplies-check-section-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }

      .supplies-check-section-chip {
        padding: 5px 9px;
        border: 1px solid #cbd8ea;
        border-radius: 999px;
        background: white;
        color: #405d7f;
        font-size: .78rem;
        font-weight: 850;
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
        width: min(820px, 100%);
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

      .supplies-check-part-label,
      .supplies-check-task-label {
        display: inline-block;
        margin: 0 7px 8px 0;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: .78rem;
        font-weight: 850;
      }

      .supplies-check-part-label {
        background: #eef8f1;
        color: #337a4d;
      }

      .supplies-check-task-label {
        background: #f3f6fb;
        color: #52647e;
      }

      .supplies-check-question h2,
      .supplies-check-interstitial h2 {
        margin: 0;
        color: #274b84;
        font-size: clamp(1.45rem, 4vw, 2rem);
        line-height: 1.25;
      }

      .supplies-check-question-note,
      .supplies-check-interstitial p {
        margin: 8px 0 0;
        color: #6c788a;
        line-height: 1.5;
      }

      .supplies-check-target-image {
        display: block;
        width: min(220px, 60vw);
        aspect-ratio: 1;
        object-fit: contain;
        margin: 18px auto 8px;
        padding: 10px;
        border: 1px solid #e0e7ef;
        border-radius: 20px;
        background: #fffaf3;
      }

      .supplies-check-options {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 20px;
      }

      .supplies-check-options.carrier-options {
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
      }

      .supplies-check-option {
        min-height: 118px;
        padding: 12px;
        border: 2px solid #d9e2ef;
        border-radius: 18px;
        background: white;
        color: #274b84;
        font-weight: 850;
      }

      .supplies-check-option:hover,
      .supplies-check-option:focus-visible {
        border-color: #a9bdd6;
        outline: none;
      }

      .supplies-check-option.is-selected {
        border-color: #337a4d;
        background: #f1faf4;
        box-shadow:
          0 0 0 3px rgba(51, 122, 77, .12);
      }

      .supplies-check-option img {
        display: block;
        width: 100%;
        max-height: 150px;
        object-fit: contain;
      }

      .supplies-check-option-text {
        min-height: 74px;
        font-size: 1.05rem;
      }

      .supplies-carrier-composite {
        display: grid;
        grid-template-columns: 1fr .82fr;
        align-items: center;
        gap: 6px;
      }

      .supplies-carrier-composite img {
        width: 100%;
        height: 120px;
        object-fit: contain;
      }

      .supplies-carrier-plus {
        display: none;
      }

      .supplies-check-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 20px;
      }

      .supplies-check-next:disabled {
        opacity: .45;
        cursor: default;
      }

      .supplies-check-interstitial {
        text-align: center;
        padding: 16px 4px 4px;
      }

      .supplies-check-interstitial-badge {
        display: inline-block;
        margin-bottom: 12px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #eef8f1;
        color: #337a4d;
        font-size: .8rem;
        font-weight: 900;
      }

      .supplies-check-interstitial-actions {
        margin-top: 22px;
      }

      .supplies-check-result-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin: 18px 0;
      }

      .supplies-check-result-stat {
        padding: 18px;
        border: 1px solid #d9e2ef;
        border-radius: 18px;
        background: #f8fbff;
        text-align: center;
      }

      .supplies-check-result-stat strong {
        display: block;
        color: #274b84;
        font-size: 1.8rem;
      }

      .supplies-check-result-stat span {
        display: block;
        margin-top: 4px;
        color: #65758a;
        font-weight: 800;
      }

      .supplies-check-result-note {
        color: #66758d;
        line-height: 1.5;
      }

      .supplies-check-results-table {
        width: 100%;
        margin-top: 14px;
        border-collapse: collapse;
      }

      .supplies-check-results-table th,
      .supplies-check-results-table td {
        padding: 9px 10px;
        border-bottom: 1px solid #e0e6ee;
        text-align: left;
        vertical-align: top;
      }

      .supplies-check-results-table th {
        color: #274b84;
        background: #f5f8fc;
      }

      .supplies-check-status-correct {
        color: #337a4d;
        font-weight: 850;
      }

      .supplies-check-status-review {
        color: #a45b45;
        font-weight: 850;
      }

      .supplies-check-results-heading {
        margin: 24px 0 8px;
        color: #274b84;
        font-size: 1rem;
      }

      @media (max-width: 680px) {
        .supplies-check-options,
        .supplies-check-options.carrier-options {
          grid-template-columns: 1fr;
        }

        .supplies-carrier-composite {
          grid-template-columns: 1fr 1fr;
        }

        .supplies-check-result-grid {
          grid-template-columns: 1fr;
        }

        .supplies-check-dialog {
          padding: 22px 16px;
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
    } else if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function renderCard() {
    const card = createCard();
    if (!card) return;

    const latest = latestResult();
    const hasResult = Boolean(latest);

    const latestSummary = hasResult
      ? `
        <p>
          <strong>Ultima prova:</strong>
          Vocabolario
          ${Number(latest.vocabularyCorrect ?? latest.correct ?? 0)}/
          ${Number(latest.vocabularyTotal ?? latest.total ?? VOCAB_TOTAL)}
          · Frasi utili
          ${Number(latest.carrierCorrect ?? 0)}/
          ${Number(latest.carrierTotal ?? 0)}
          · ${escapeHtml(formatDate(latest.completedAt))}
        </p>
      `
      : "";

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
            Due parti brevi per vedere che cosa lo studente
            riconosce già.
            <span lang="en">
              Two short sections with no hints or translations.
            </span>
          </p>
          <div class="supplies-check-section-summary">
            <span class="supplies-check-section-chip">
              1 · Vocabolario · Vocabulary · 12
            </span>
            <span class="supplies-check-section-chip">
              2 · Frasi utili · Carrier Phrases · 6
            </span>
          </div>
          ${latestSummary}
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

  function buildVocabularyQuestions() {
    const targets = shuffle(VOCAB_TARGET_IDS)
      .slice(0, VOCAB_TOTAL)
      .map(id => itemById.get(id));

    const taskTypes =
      shuffle(VOCAB_TASK_TYPES);

    return targets.map((target, index) => {
      const optionIds = shuffle([
        target.id,
        ...DISTRACTORS[target.id]
      ]);

      return {
        section: "vocabulary",
        target,
        taskType: taskTypes[index],
        options: optionIds.map(
          id => itemById.get(id)
        )
      };
    });
  }

  function buildCarrierQuestions() {
    const carriers = getSupplyCarriers();

    if (carriers.length !== 3) {
      console.warn(
        "School Supplies carrier phrases are incomplete.",
        carriers
      );
      return [];
    }

    const supplies = shuffle(
      CARRIER_SUPPLY_IDS
    ).slice(0, CARRIER_TOTAL);

    const carrierTargets = shuffle([
      carriers.find(c => c.id === "vedo"),
      carriers.find(c => c.id === "vedo"),
      carriers.find(c => c.id === "ho"),
      carriers.find(c => c.id === "ho"),
      carriers.find(c => c.id === "piace"),
      carriers.find(c => c.id === "piace")
    ]);

    return supplies.map((supplyId, index) => {
      const supply = itemById.get(supplyId);
      const carrier = carrierTargets[index];

      return {
        section: "carrier",
        target: supply,
        carrier,
        taskType: "carrier-meaning",
        options: shuffle(carriers)
      };
    });
  }

  function startCheck() {
    createModal();

    const carrierQuestions =
      buildCarrierQuestions();

    if (carrierQuestions.length !== CARRIER_TOTAL) {
      modal.hidden = false;
      modalBody.innerHTML = `
        <h2 id="suppliesCheckDialogTitle">
          La prova non è pronta.
        </h2>
        <p>
          Non riesco a trovare tutte le frasi utili
          del materiale scolastico.
          <span lang="en">
            The School Supplies carrier phrase data is incomplete.
          </span>
        </p>
      `;
      return;
    }

    activeSession = {
      id: `supplies-${Date.now()}`,
      startedAt: new Date().toISOString(),
      index: 0,
      selectedItemId: null,
      selectedCarrierId: null,
      awaitingCarrierIntro: false,
      questions: [
        ...buildVocabularyQuestions(),
        ...carrierQuestions
      ],
      results: []
    };

    modal.hidden = false;
    renderQuestion();
  }

  function vocabularyOptionHtml(
    item,
    taskType,
    index
  ) {
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

  function carrierOptionHtml(
    carrier,
    supply,
    index
  ) {
    return `
      <button
        type="button"
        class="supplies-check-option"
        data-carrier-id="${escapeHtml(carrier.id)}"
        aria-label="Opzione ${index + 1}"
      >
        <span class="supplies-carrier-composite">
          <img
            src="${escapeHtml(carrier.image)}"
            alt=""
          >
          <span
            class="supplies-carrier-plus"
            aria-hidden="true"
          >+</span>
          <img
            src="${escapeHtml(supply.image)}"
            alt=""
          >
        </span>
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
    activeSession.selectedCarrierId = null;

    if (question.section === "carrier") {
      renderCarrierQuestion(question);
      return;
    }

    renderVocabularyQuestion(question);
  }

  function renderVocabularyQuestion(question) {
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
        Parte 1 · Vocabolario ·
        Domanda ${number} di ${VOCAB_TOTAL}
      </p>

      <section class="supplies-check-question">
        <span class="supplies-check-part-label">
          1 · Vocabolario · Vocabulary
        </span>
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
              vocabularyOptionHtml(
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
            ${number === VOCAB_TOTAL
              ? "Continua · Continue"
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

  function renderCarrierIntro() {
    if (!activeSession || !modalBody) return;

    modalBody.innerHTML = `
      <section class="supplies-check-interstitial">
        <span class="supplies-check-interstitial-badge">
          Parte 1 completata · Part 1 complete
        </span>

        <h2 id="suppliesCheckDialogTitle">
          💬 Parte 2 · Frasi utili
          <span lang="en">· Carrier Phrases</span>
        </h2>

        <p>
          Ora ascolta una frase completa.
          L'oggetto scolastico rimane uguale in tutte
          le risposte: scegli l'immagine della frase
          che corrisponde a ciò che senti.
        </p>

        <p lang="en">
          Now listen to a complete sentence. The school-supply
          picture stays the same in every choice, so choose the
          carrier-phrase image that matches what you hear.
        </p>

        <div class="supplies-check-section-summary">
          <span class="supplies-check-section-chip">
            Io vedo…
          </span>
          <span class="supplies-check-section-chip">
            Io ho…
          </span>
          <span class="supplies-check-section-chip">
            Mi piace…
          </span>
        </div>

        <div class="supplies-check-interstitial-actions">
          <button
            type="button"
            class="supplies-check-button"
            data-action="begin-carriers"
          >
            ▶ Continua · Continue
          </button>
        </div>
      </section>
    `;

    modalBody
      .querySelector('[data-action="begin-carriers"]')
      .addEventListener(
        "click",
        renderQuestion
      );
  }

  function renderCarrierQuestion(question) {
    const carrierIndex =
      activeSession.index - VOCAB_TOTAL + 1;

    const sentence =
      carrierSentence(
        question.carrier,
        question.target
      );

    modalBody.innerHTML = `
      <p class="supplies-check-progress">
        Parte 2 · Frasi utili ·
        Domanda ${carrierIndex} di ${CARRIER_TOTAL}
      </p>

      <section class="supplies-check-question">
        <span class="supplies-check-part-label">
          2 · Frasi utili · Carrier Phrases
        </span>
        <span class="supplies-check-task-label">
          ${TASK_LABELS["carrier-meaning"]}
        </span>

        <h2 id="suppliesCheckDialogTitle">
          Ascolta la frase. Quale immagine mostra il significato?
        </h2>

        <p>
          <button
            type="button"
            class="supplies-check-audio"
            data-action="replay-audio"
          >
            🔊 Ascolta di nuovo · Listen again
          </button>
        </p>

        <p class="supplies-check-question-note">
          L'oggetto è lo stesso in ogni risposta.
          <span lang="en">
            The school-supply picture is the same in every choice.
          </span>
        </p>

        <div class="supplies-check-options carrier-options">
          ${question.options
            .map((carrier, index) =>
              carrierOptionHtml(
                carrier,
                question.target,
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
            ${carrierIndex === CARRIER_TOTAL
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
      .querySelectorAll("[data-carrier-id]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            modalBody
              .querySelectorAll("[data-carrier-id]")
              .forEach(option =>
                option.classList.remove(
                  "is-selected"
                )
              );

            button.classList.add(
              "is-selected"
            );

            activeSession.selectedCarrierId =
              button.dataset.carrierId;

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
      .addEventListener(
        "click",
        () => speak(sentence)
      );

    window.setTimeout(
      () => {
        if (
          activeSession &&
          activeSession.questions[
            activeSession.index
          ] === question &&
          !modal.hidden
        ) {
          speak(sentence);
        }
      },
      250
    );
  }

  function recordAndAdvance() {
    if (!activeSession) return;

    const question =
      activeSession.questions[
        activeSession.index
      ];

    if (!question) return;

    if (question.section === "vocabulary") {
      if (!activeSession.selectedItemId) return;

      activeSession.results.push({
        section: "vocabulary",
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
    } else {
      if (!activeSession.selectedCarrierId) return;

      activeSession.results.push({
        section: "carrier",
        itemId: question.target.id,
        italian: question.target.italian,
        english: question.target.english,
        taskType: question.taskType,
        carrierId: question.carrier.id,
        carrierItalian:
          question.carrier.italian,
        selectedCarrierId:
          activeSession.selectedCarrierId,
        correct:
          activeSession.selectedCarrierId ===
          question.carrier.id
      });
    }

    activeSession.index += 1;

    if (activeSession.index === VOCAB_TOTAL) {
      renderCarrierIntro();
      return;
    }

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

    const vocabularyRows = result.results
      .filter(entry =>
        (entry.section || "vocabulary") ===
        "vocabulary"
      )
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

    const carrierGroups =
      result.byCarrier || {};

    const carrierRows =
      Object.values(carrierGroups)
        .map(group => {
          const strong =
            Number(group.correct) ===
            Number(group.attempts);

          return `
            <tr>
              <td>
                <strong>
                  ${escapeHtml(group.italian)}
                </strong>
              </td>
              <td>
                ${Number(group.correct)}/
                ${Number(group.attempts)}
              </td>
              <td class="${strong
                ? "supplies-check-status-correct"
                : "supplies-check-status-review"}">
                ${strong
                  ? "✓ Riconosciuta · Recognized"
                  : "○ Da insegnare/ripassare · Review"}
              </td>
            </tr>
          `;
        })
        .join("");

    const vocabularyCorrect =
      Number(
        result.vocabularyCorrect ??
        result.correct ??
        0
      );

    const vocabularyTotal =
      Number(
        result.vocabularyTotal ??
        result.total ??
        VOCAB_TOTAL
      );

    const carrierCorrect =
      Number(result.carrierCorrect ?? 0);

    const carrierTotal =
      Number(result.carrierTotal ?? 0);

    modalBody.innerHTML = `
      <h2 id="suppliesCheckDialogTitle">
        📚 Risultati della prova iniziale
        <span lang="en">· Starting Check Results</span>
      </h2>

      <div class="supplies-check-result-grid">
        <div class="supplies-check-result-stat">
          <strong>
            ${vocabularyCorrect}/${vocabularyTotal}
          </strong>
          <span>
            Vocabolario · Vocabulary
          </span>
        </div>

        <div class="supplies-check-result-stat">
          <strong>
            ${carrierCorrect}/${carrierTotal}
          </strong>
          <span>
            Frasi utili · Carrier Phrases
          </span>
        </div>
      </div>

      <p class="supplies-check-result-note">
        Questa è una fotografia di partenza, non un voto e
        non una misura di padronanza.
        <span lang="en">
          Use the two sections separately to decide what
          may need teaching or review.
        </span>
      </p>

      <h3 class="supplies-check-results-heading">
        Parte 1 · Vocabolario · Vocabulary
      </h3>

      <table class="supplies-check-results-table">
        <thead>
          <tr>
            <th>Parola · Word</th>
            <th>Tipo · Task</th>
            <th>Stato · Status</th>
          </tr>
        </thead>
        <tbody>
          ${vocabularyRows}
        </tbody>
      </table>

      <h3 class="supplies-check-results-heading">
        Parte 2 · Frasi utili · Carrier Phrases
      </h3>

      ${carrierTotal ? `
        <table class="supplies-check-results-table">
          <thead>
            <tr>
              <th>Frase · Phrase</th>
              <th>Risultato · Result</th>
              <th>Stato · Status</th>
            </tr>
          </thead>
          <tbody>
            ${carrierRows}
          </tbody>
        </table>
      ` : `
        <p class="supplies-check-result-note">
          Questa prova precedente includeva solo il vocabolario.
          <span lang="en">
            This earlier result was from the vocabulary-only version.
          </span>
        </p>
      `}

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
