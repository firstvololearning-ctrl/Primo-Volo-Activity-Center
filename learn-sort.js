"use strict";

/*
  Primo Volo d'Italiano
  Impara — Explore + Sorting Practice

  This file extends Impara without changing scored accuracy.

  Learn & Practice evidence:
  - vocabulary explored
  - picture-supported sort completed
  - word-only sort completed

  Sorting gives corrective feedback and allows retries,
  so it is intentionally NOT treated as scored evidence.
*/

(function initializeLearnSorting() {
  const learnActivity =
    document.querySelector("#learnActivity");

  const vocabularyGrid =
    document.querySelector("#vocabularyGrid");

  const topicSelect =
    document.querySelector("#topicSelect");

  const learnButton =
    document.querySelector(
      '.activity-button[data-mode="learn"]'
    );

  if (
    !learnActivity ||
    !vocabularyGrid ||
    !topicSelect ||
    !learnButton
  ) {
    console.error(
      "Impara sorting could not start because required elements were not found."
    );
    return;
  }

  const STORAGE_KEY =
    "primoVoloLearnPractice";

  /* ========================================
     PRACTICE STORAGE
     ======================================== */

  function emptyPracticeData() {
    return {
      version: 1,
      byTopic: {}
    };
  }

  function loadPracticeData() {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return emptyPracticeData();
      }

      const parsed =
        JSON.parse(saved);

      return {
        version: 1,
        byTopic:
          parsed &&
          typeof parsed.byTopic ===
            "object"
            ? parsed.byTopic
            : {}
      };
    } catch (error) {
      console.warn(
        "Impara practice data could not be loaded.",
        error
      );

      return emptyPracticeData();
    }
  }

  let practiceData =
    loadPracticeData();

  function savePracticeData() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          practiceData
        )
      );
    } catch (error) {
      console.warn(
        "Impara practice data could not be saved.",
        error
      );
    }
  }

  function ensureTopicPractice(
    topicKey
  ) {
    if (
      !practiceData.byTopic[
        topicKey
      ]
    ) {
      practiceData.byTopic[
        topicKey
      ] = {
        exploredWords: [],
        pictureSortCompleted: false,
        wordSortCompleted: false,
        pictureSortCompletedAt: null,
        wordSortCompletedAt: null,
        updatedAt: null
      };
    }

    const topicData =
      practiceData.byTopic[
        topicKey
      ];

    if (
      !Array.isArray(
        topicData.exploredWords
      )
    ) {
      topicData.exploredWords = [];
    }

    return topicData;
  }

  function announcePracticeChange(
    topicKey
  ) {
    document.dispatchEvent(
      new CustomEvent(
        "vololearnpracticechange",
        {
          detail: {
            topic: topicKey,
            practiceData
          }
        }
      )
    );
  }

  function markLearnPractice() {
    if (
      typeof window.markVoloPractice ===
        "function"
    ) {
      window.markVoloPractice(
        "learn"
      );
    }
  }

  function markWordExplored(
    topicKey,
    italian
  ) {
    if (
      !topicKey ||
      !italian
    ) {
      return;
    }

    const topicData =
      ensureTopicPractice(
        topicKey
      );

    if (
      topicData.exploredWords.includes(
        italian
      )
    ) {
      return;
    }

    topicData.exploredWords.push(
      italian
    );

    topicData.updatedAt =
      new Date().toISOString();

    savePracticeData();
    markLearnPractice();
    announcePracticeChange(
      topicKey
    );
  }

  function markSortCompleted(
    topicKey,
    roundType
  ) {
    const topicData =
      ensureTopicPractice(
        topicKey
      );

    const now =
      new Date().toISOString();

    if (
      roundType === "pictures"
    ) {
      topicData.pictureSortCompleted =
        true;

      topicData.pictureSortCompletedAt =
        topicData.pictureSortCompletedAt ||
        now;
    }

    if (
      roundType === "words"
    ) {
      topicData.wordSortCompleted =
        true;

      topicData.wordSortCompletedAt =
        topicData.wordSortCompletedAt ||
        now;
    }

    topicData.updatedAt = now;

    savePracticeData();
    markLearnPractice();
    announcePracticeChange(
      topicKey
    );
  }

  window.getVoloLearnPracticeData =
    function getVoloLearnPracticeData() {
      return practiceData;
    };


  /* ========================================
     SORTING CONFIGURATION

     Start with Food & Drinks because data.js
     already explicitly identifies each item
     as type "food" or "drink".
     ======================================== */

  const sortConfigs = {
    food: {
      titleItalian:
        "Mangio o bevo?",
      titleEnglish:
        "Do I eat it or drink it?",

      directionsPicturesItalian:
        "Guarda l’immagine e scegli la categoria.",
      directionsPicturesEnglish:
        "Look at the picture and choose the category.",

      directionsWordsItalian:
        "Leggi la parola senza l’immagine e scegli la categoria.",
      directionsWordsEnglish:
        "Read the word without the picture and choose the category.",

      categories: [
        {
          id: "food",
          italian: "🍎 Mangio",
          english: "I eat",
          sentenceStart:
            "Io mangio"
        },
        {
          id: "drink",
          italian: "🥤 Bevo",
          english: "I drink",
          sentenceStart:
            "Io bevo"
        }
      ],

      getItems() {
        if (
          typeof food ===
            "undefined" ||
          !Array.isArray(food)
        ) {
          return [];
        }

        return food.filter(
          item =>
            item &&
            (
              item.type === "food" ||
              item.type === "drink"
            )
        );
      },

      getCategory(item) {
        return item.type;
      }
    }
  };


  /* ========================================
     HELPERS
     ======================================== */

  function shuffle(items) {
    const copy =
      [...items];

    for (
      let index =
        copy.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(
          Math.random() *
          (index + 1)
        );

      [
        copy[index],
        copy[randomIndex]
      ] = [
        copy[randomIndex],
        copy[index]
      ];
    }

    return copy;
  }

  function escapeHTML(value) {
    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  function speak(text) {
    if (
      typeof speakItalian ===
        "function"
    ) {
      speakItalian(text);
      return;
    }

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    window
      .speechSynthesis
      .cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      "it-IT";

    utterance.rate =
      0.72;

    window
      .speechSynthesis
      .speak(
        utterance
      );
  }

  function getCurrentConfig() {
    return sortConfigs[
      topicSelect.value
    ] || null;
  }


  /* ========================================
     CREATE IMPARA SUB-MODES
     ======================================== */

  const modeBar =
    document.createElement(
      "div"
    );

  modeBar.id =
    "learnModeBar";

  modeBar.className =
    "learn-mode-bar";

  modeBar.setAttribute(
    "role",
    "group"
  );

  modeBar.setAttribute(
    "aria-label",
    "Choose an Impara practice activity"
  );

  modeBar.innerHTML = `
    <button
      type="button"
      class="learn-mode-button active"
      data-learn-mode="explore"
      aria-pressed="true"
    >
      <span>📖 Esplora</span>
      <small>Explore</small>
    </button>

    <button
      type="button"
      class="learn-mode-button"
      data-learn-mode="pictures"
      aria-pressed="false"
    >
      <span>🖼️ Ordina con immagini</span>
      <small>Sort with Pictures</small>
    </button>

    <button
      type="button"
      class="learn-mode-button"
      data-learn-mode="words"
      aria-pressed="false"
    >
      <span>🔤 Ordina le parole</span>
      <small>Sort Words</small>
    </button>
  `;

  const sortWorkspace =
    document.createElement(
      "section"
    );

  sortWorkspace.id =
    "learnSortWorkspace";

  sortWorkspace.className =
    "learn-sort-workspace";

  sortWorkspace.hidden =
    true;

  learnActivity.insertBefore(
    modeBar,
    vocabularyGrid
  );

  learnActivity.insertBefore(
    sortWorkspace,
    vocabularyGrid
  );

  const modeButtons =
    [
      ...modeBar.querySelectorAll(
        "[data-learn-mode]"
      )
    ];

  let currentLearnMode =
    "explore";

  let sortState = null;


  /* ========================================
     TRACK VOCABULARY EXPLORATION

     The existing Impara cards already speak
     when selected. This listener records only
     that a vocabulary item was explored.
     ======================================== */

  vocabularyGrid.addEventListener(
    "click",
    event => {
      const card =
        event.target.closest(
          "button, .vocabulary-card"
        );

      if (!card) {
        return;
      }

      const visibleItalian =
        card.querySelector(
          ".italian-word, .vocab-italian, strong, h4"
        )?.textContent?.trim();

      const topicKey =
        topicSelect.value;

      if (
        topicKey &&
        visibleItalian
      ) {
        markWordExplored(
          topicKey,
          visibleItalian
        );
      }
    }
  );


  /* ========================================
     RENDER MODE
     ======================================== */

  function setLearnMode(
    mode
  ) {
    const config =
      getCurrentConfig();

    if (
      mode !== "explore" &&
      !config
    ) {
      mode =
        "explore";
    }

    currentLearnMode =
      mode;

    modeButtons.forEach(
      button => {
        const active =
          button.dataset
            .learnMode ===
          mode;

        button.classList.toggle(
          "active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          String(active)
        );
      }
    );

    if (
      mode === "explore"
    ) {
      vocabularyGrid.hidden =
        false;

      sortWorkspace.hidden =
        true;

      sortWorkspace.innerHTML =
        "";

      return;
    }

    vocabularyGrid.hidden =
      true;

    sortWorkspace.hidden =
      false;

    startSortRound(
      mode
    );
  }


  /* ========================================
     SORT ROUND
     ======================================== */

  function startSortRound(
    roundType
  ) {
    const topicKey =
      topicSelect.value;

    const config =
      getCurrentConfig();

    if (!config) {
      setLearnMode(
        "explore"
      );
      return;
    }

    const items =
      shuffle(
        config.getItems()
      ).slice(
        0,
        10
      );

    if (!items.length) {
      sortWorkspace.innerHTML = `
        <div class="learn-sort-message">
          Questa attività non è ancora disponibile per questo argomento.
          <span>
            This activity is not available for this topic yet.
          </span>
        </div>
      `;
      return;
    }

    sortState = {
      topicKey,
      roundType,
      items,
      index: 0,
      correctPlaced: 0,
      waitingForNext: false
    };

    renderSortItem();
  }

  function renderSortItem() {
    if (!sortState) {
      return;
    }

    const config =
      sortConfigs[
        sortState.topicKey
      ];

    if (!config) {
      return;
    }

    if (
      sortState.index >=
      sortState.items.length
    ) {
      renderSortComplete();
      return;
    }

    const item =
      sortState.items[
        sortState.index
      ];

    const withPictures =
      sortState.roundType ===
        "pictures";

    const directionsItalian =
      withPictures
        ? config
            .directionsPicturesItalian
        : config
            .directionsWordsItalian;

    const directionsEnglish =
      withPictures
        ? config
            .directionsPicturesEnglish
        : config
            .directionsWordsEnglish;

    const imageMarkup =
      withPictures
        ? `
          <img
            class="learn-sort-image"
            src="${escapeHTML(item.image)}"
            alt=""
          >
        `
        : "";

    sortWorkspace.innerHTML = `
      <div class="learn-sort-card">

        <div class="learn-sort-heading">
          <h4>
            ${escapeHTML(
              config.titleItalian
            )}
          </h4>

          <span>
            ${escapeHTML(
              config.titleEnglish
            )}
          </span>
        </div>

        <p class="learn-sort-directions">
          ${escapeHTML(
            directionsItalian
          )}
          <span>
            ${escapeHTML(
              directionsEnglish
            )}
          </span>
        </p>

        <div class="learn-sort-progress">
          ${sortState.index + 1}
          /
          ${sortState.items.length}
        </div>

        <div
          class="
            learn-sort-prompt
            ${
              withPictures
                ? ""
                : "word-only"
            }
          "
        >
          ${imageMarkup}

          <button
            type="button"
            class="learn-sort-word"
            aria-label="Hear ${escapeHTML(item.italian)}"
          >
            <span
              class="learn-sort-speaker"
              aria-hidden="true"
            >
              🔊
            </span>

            ${escapeHTML(
              item.italian
            )}
          </button>
        </div>

        <div
          class="learn-sort-categories"
        >
          ${config.categories
            .map(
              category => `
                <button
                  type="button"
                  class="learn-sort-category"
                  data-category="${escapeHTML(
                    category.id
                  )}"
                >
                  <strong>
                    ${escapeHTML(
                      category.italian
                    )}
                  </strong>

                  <span>
                    ${escapeHTML(
                      category.english
                    )}
                  </span>
                </button>
              `
            )
            .join("")}
        </div>

        <div
          class="learn-sort-feedback"
          aria-live="polite"
        ></div>

        <button
          type="button"
          class="learn-sort-next"
          hidden
        >
          Avanti <span class="expanded-inline-english">· Next</span> →
        </button>

      </div>
    `;

    const wordButton =
      sortWorkspace.querySelector(
        ".learn-sort-word"
      );

    wordButton?.addEventListener(
      "click",
      () => {
        speak(
          item.italian
        );
      }
    );

    const categoryButtons =
      [
        ...sortWorkspace
          .querySelectorAll(
            ".learn-sort-category"
          )
      ];

    const feedback =
      sortWorkspace.querySelector(
        ".learn-sort-feedback"
      );

    const nextButton =
      sortWorkspace.querySelector(
        ".learn-sort-next"
      );

    categoryButtons.forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            if (
              sortState
                .waitingForNext
            ) {
              return;
            }

            const selected =
              button.dataset
                .category;

            const expected =
              config.getCategory(
                item
              );

            if (
              selected !==
              expected
            ) {
              button.classList.add(
                "try-again"
              );

              feedback.innerHTML = `
                <strong>
                  Prova ancora.
                </strong>
                <span>
                  Try again.
                </span>
              `;

              return;
            }

            sortState
              .waitingForNext =
              true;

            sortState
              .correctPlaced +=
              1;

            categoryButtons.forEach(
              choice => {
                choice.disabled =
                  true;
              }
            );

            button.classList.add(
              "correct"
            );

            const category =
              config.categories.find(
                entry =>
                  entry.id ===
                  expected
              );

            const sentence =
              category
                ? `${category.sentenceStart} ${item.italian}.`
                : item.italian;

            feedback.innerHTML = `
              <strong>
                Sì! ${escapeHTML(
                  sentence
                )}
              </strong>

              <span>
                Continua quando sei pronto.
              </span>
            `;

            speak(
              sentence
            );

            nextButton.hidden =
              false;
          }
        );
      }
    );

    nextButton?.addEventListener(
      "click",
      () => {
        sortState.index +=
          1;

        sortState.waitingForNext =
          false;

        renderSortItem();
      }
    );
  }


  /* ========================================
     ROUND COMPLETE
     ======================================== */

  function renderSortComplete() {
    if (!sortState) {
      return;
    }

    const config =
      sortConfigs[
        sortState.topicKey
      ];

    const completedRound =
      sortState.roundType;

    markSortCompleted(
      sortState.topicKey,
      completedRound
    );

    const pictureRound =
      completedRound ===
        "pictures";

    sortWorkspace.innerHTML = `
      <div
        class="
          learn-sort-complete
        "
      >
        <div
          class="learn-sort-complete-icon"
          aria-hidden="true"
        >
          ✈️
        </div>

        <h4>
          Ottimo lavoro!
        </h4>

        <p>
          Hai ordinato
          ${sortState.correctPlaced}
          parole.
        </p>

        <span>
          You sorted
          ${sortState.correctPlaced}
          words.
        </span>

        ${
          pictureRound
            ? `
              <button
                type="button"
                class="learn-sort-next-round"
              >
                🔤 Prova senza immagini
                <small>
                  Try Words Without Pictures
                </small>
              </button>
            `
            : `
              <button
                type="button"
                class="learn-sort-next-round"
                data-return-explore="true"
              >
                📖 Torna a Esplora
                <small>
                  Return to Explore
                </small>
              </button>
            `
        }

        <p class="learn-sort-practice-note">
          Attività di apprendimento e pratica:
          non viene calcolato un punteggio di accuratezza.
          <span>
            Learn & Practice activity:
            no accuracy score is calculated.
          </span>
        </p>
      </div>
    `;

    const nextRoundButton =
      sortWorkspace.querySelector(
        ".learn-sort-next-round"
      );

    nextRoundButton?.addEventListener(
      "click",
      () => {
        if (
          nextRoundButton.dataset
            .returnExplore ===
          "true"
        ) {
          setLearnMode(
            "explore"
          );
          return;
        }

        setLearnMode(
          "words"
        );
      }
    );
  }


  /* ========================================
     MODE AVAILABILITY
     ======================================== */

  function updateModeAvailability() {
    const config =
      getCurrentConfig();

    modeButtons.forEach(
      button => {
        if (
          button.dataset
            .learnMode ===
          "explore"
        ) {
          button.hidden =
            false;
          return;
        }

        button.hidden =
          !config;
      }
    );

    if (
      !config &&
      currentLearnMode !==
        "explore"
    ) {
      setLearnMode(
        "explore"
      );
    }

    if (config) {
      modeBar.hidden =
        false;
    } else {
      /*
        For topics without a meaningful
        sorting configuration yet, keep
        Impara exactly as it already works.
      */
      modeBar.hidden =
        true;

      vocabularyGrid.hidden =
        false;

      sortWorkspace.hidden =
        true;
    }
  }


  /* ========================================
     EVENTS
     ======================================== */

  modeButtons.forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          setLearnMode(
            button.dataset
              .learnMode
          );
        }
      );
    }
  );

  topicSelect.addEventListener(
    "change",
    () => {
      window.setTimeout(
        () => {
          currentLearnMode =
            "explore";

          updateModeAvailability();

          setLearnMode(
            "explore"
          );
        },
        0
      );
    }
  );

  learnButton.addEventListener(
    "click",
    () => {
      window.setTimeout(
        updateModeAvailability,
        0
      );
    }
  );

  document.addEventListener(
    "voloagechange",
    () => {
      window.setTimeout(
        updateModeAvailability,
        0
      );
    }
  );


  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#learnSortStyles"
    )
  ) {
    const style =
      document.createElement(
        "style"
      );

    style.id =
      "learnSortStyles";

    style.textContent = `
      .learn-mode-bar {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        margin: 0 auto 22px;
      }

      .learn-mode-bar[hidden] {
        display: none;
      }

      .learn-mode-button {
        display: grid;
        gap: 2px;
        min-width: 160px;
        padding: 10px 15px;
        border: 1px solid #cfdbea;
        border-radius: 999px;
        color: #274b84;
        background: #ffffff;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .learn-mode-button small {
        color: #6f7f93;
        font-size: .74rem;
        font-weight: 700;
      }

      .learn-mode-button.active {
        border-color: #7e9dc3;
        background: #eef5fc;
        box-shadow:
          0 2px 8px
          rgba(39, 75, 132, .10);
      }

      .learn-sort-workspace {
        width: min(820px, 100%);
        margin: 0 auto;
      }

      .learn-sort-workspace[hidden] {
        display: none;
      }

      .learn-sort-card,
      .learn-sort-complete {
        position: relative;
        padding: 24px;
        border: 1px solid #d8e1ec;
        border-radius: 22px;
        background: #fffdf9;
        box-shadow:
          0 8px 24px
          rgba(43, 67, 97, .08);
        text-align: center;
      }

      .learn-sort-heading h4,
      .learn-sort-complete h4 {
        margin: 0;
        color: #274b84;
        font-size: 1.35rem;
      }

      .learn-sort-heading > span {
        display: block;
        margin-top: 3px;
        color: #6b7a8e;
        font-weight: 700;
      }

      .learn-sort-directions {
        margin: 14px auto 8px;
        color: #3f5065;
        font-weight: 800;
      }

      .learn-sort-directions span {
        display: block;
        margin-top: 3px;
        color: #748195;
        font-size: .88rem;
        font-weight: 650;
      }

      .learn-sort-progress {
        margin: 10px 0 14px;
        color: #8a755a;
        font-size: .82rem;
        font-weight: 900;
      }

      .learn-sort-prompt {
        display: grid;
        place-items: center;
        gap: 10px;
        min-height: 230px;
        margin: 0 auto 18px;
      }

      .learn-sort-prompt.word-only {
        min-height: 130px;
      }

      .learn-sort-image {
        width: min(210px, 55vw);
        height: 170px;
        object-fit: contain;
        display: block;
      }

      .learn-sort-word {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 9px 14px;
        border: 0;
        border-radius: 14px;
        color: #274b84;
        background: #f2f6fb;
        font: inherit;
        font-size: 1.15rem;
        font-weight: 900;
        cursor: pointer;
      }

      .word-only
      .learn-sort-word {
        padding: 17px 24px;
        font-size: 1.45rem;
      }

      .learn-sort-speaker {
        font-size: .95em;
      }

      .learn-sort-categories {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 14px;
        width: min(560px, 100%);
        margin: 0 auto;
      }

      .learn-sort-category {
        display: grid;
        gap: 3px;
        min-height: 78px;
        padding: 13px;
        border: 2px solid #cbd8e7;
        border-radius: 18px;
        color: #274b84;
        background: white;
        font: inherit;
        cursor: pointer;
      }

      .learn-sort-category strong {
        font-size: 1.08rem;
      }

      .learn-sort-category span {
        color: #748195;
        font-size: .82rem;
        font-weight: 700;
      }

      .learn-sort-category.try-again {
        border-color: #d8a39a;
        background: #fff4f2;
      }

      .learn-sort-category.correct {
        border-color: #79aa95;
        background: #f0faf5;
      }

      .learn-sort-feedback {
        min-height: 48px;
        margin: 15px auto 4px;
        color: #40536b;
      }

      .learn-sort-feedback strong,
      .learn-sort-feedback span {
        display: block;
      }

      .learn-sort-feedback strong {
        color: #315e53;
      }

      .learn-sort-feedback span {
        margin-top: 3px;
        color: #788598;
        font-size: .84rem;
      }

      .learn-sort-next {
        margin-top: 4px;
        padding: 10px 20px;
        border: 0;
        border-radius: 999px;
        color: white;
        background: #274b84;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }

      .learn-sort-complete {
        padding: 34px 24px;
      }

      .learn-sort-complete-icon {
        margin-bottom: 8px;
        font-size: 2.1rem;
      }

      .learn-sort-complete p {
        margin-bottom: 3px;
        color: #40536b;
        font-weight: 800;
      }

      .learn-sort-complete > span {
        color: #738195;
      }

      .learn-sort-next-round {
        display: grid;
        gap: 3px;
        margin: 22px auto 0;
        padding: 12px 20px;
        border: 1px solid #b9cbe0;
        border-radius: 16px;
        color: #274b84;
        background: #eef5fc;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }

      .learn-sort-next-round small {
        color: #6d7d91;
        font-weight: 700;
      }

      .learn-sort-practice-note {
        margin-top: 24px !important;
        padding-top: 14px;
        border-top: 1px solid #e2e7ed;
        color: #7d725f !important;
        font-size: .82rem;
        font-weight: 700 !important;
      }

      .learn-sort-practice-note span {
        display: block;
        margin-top: 3px;
        color: #8a94a2;
      }

      .learn-sort-message {
        padding: 24px;
        border: 1px solid #d8e1ec;
        border-radius: 18px;
        background: #fffdf9;
        color: #40536b;
        text-align: center;
        font-weight: 800;
      }

      .learn-sort-message span {
        display: block;
        margin-top: 4px;
        color: #748195;
        font-weight: 650;
      }

      @media (max-width: 620px) {
        .learn-mode-button {
          min-width: 0;
          width: 100%;
        }

        .learn-sort-card {
          padding: 20px 15px;
        }

        .learn-sort-categories {
          grid-template-columns: 1fr;
        }

        .learn-sort-prompt {
          min-height: 205px;
        }

        .learn-sort-image {
          height: 145px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  updateModeAvailability();
})();
