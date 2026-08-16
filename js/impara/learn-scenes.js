"use strict";

/*
  Primo Volo d'Italiano
  Impara — Nella scena / In the Scene

  Purpose:
  Practice the carrier phrase:
    Che cosa vedi?
    Io vedo...

  This is Learn & Practice, not scored evidence.
  Learners receive feedback and may retry.
*/

(function initializeLearnScenes() {
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
      "Nella scena could not start because required Impara elements were not found."
    );
    return;
  }

  const STORAGE_KEY =
    "primoVoloScenePractice";

  const MAX_ITEMS_PER_ROUND =
    10;

  const IO_VEDO_IMAGE =
    "images/carrier-phrases/io-vedo-no-text.png";

  const CHOICES_PER_ITEM =
    4;


  /* ========================================
     SCENE CONFIGURATION
     ======================================== */

  const sceneConfigs = {
    clothing: {
      image:
        "images/scene-images/clothing/clothing.png",

      visibleItalian: [
        "la felpa",
        "i pantaloni",
        "le scarpe",
        "il cappello",
        "la maglietta",
        "i pantaloncini",
        "il vestito",
        "il maglione",
        "la sciarpa"
      ],

      getItems() {
        if (
          typeof clothing ===
            "undefined" ||
          !Array.isArray(clothing)
        ) {
          return [];
        }

        return clothing;
      }
    },

    animals: {
      image:
        "images/scene-images/animals.png",

      visibleItalian: [
        "il cane",
        "il gatto",
        "la mucca",
        "l'uccello",
        "il maiale",
        "la volpe",
        "il coniglio",
        "l'anatra",
        "il riccio",
        "la rana"
      ],

      getItems() {
        if (
          typeof animals ===
            "undefined" ||
          !Array.isArray(animals)
        ) {
          return [];
        }

        return animals;
      }
    }
  };


  /* ========================================
     STORAGE — PRACTICE, NOT ACCURACY
     ======================================== */

  function emptyPracticeData() {
    return {
      version: 2,
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
        version: 2,
        byTopic:
          parsed &&
          typeof parsed.byTopic ===
            "object"
            ? parsed.byTopic
            : {}
      };
    } catch (error) {
      console.warn(
        "Scene practice data could not be loaded.",
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
        "Scene practice data could not be saved.",
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
        pictureRoundsCompleted: 0,
        wordRoundsCompleted: 0,
        wordsPracticed: [],
        updatedAt: null
      };
    }

    const topicData =
      practiceData.byTopic[
        topicKey
      ];

    if (
      !Array.isArray(
        topicData.wordsPracticed
      )
    ) {
      topicData.wordsPracticed = [];
    }

    return topicData;
  }

  function recordCompletedRound(
    topicKey,
    mode,
    targets
  ) {
    const topicData =
      ensureTopicPractice(
        topicKey
      );

    if (mode === "pictures") {
      topicData.pictureRoundsCompleted =
        Number(
          topicData.pictureRoundsCompleted ||
          0
        ) + 1;
    }

    if (mode === "words") {
      topicData.wordRoundsCompleted =
        Number(
          topicData.wordRoundsCompleted ||
          0
        ) + 1;
    }

    targets.forEach(
      item => {
        if (
          !topicData.wordsPracticed.includes(
            item.italian
          )
        ) {
          topicData.wordsPracticed.push(
            item.italian
          );
        }
      }
    );

    topicData.updatedAt =
      new Date().toISOString();

    savePracticeData();

    if (
      typeof window.markVoloPractice ===
        "function"
    ) {
      window.markVoloPractice(
        "learn"
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "voloscenepracticechange",
        {
          detail: {
            topic:
              topicKey,
            mode,
            practiceData
          }
        }
      )
    );
  }

  window.getVoloScenePracticeData =
    function getVoloScenePracticeData() {
      return practiceData;
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

  function getCurrentConfig() {
    return sceneConfigs[
      topicSelect.value
    ] || null;
  }

  function buildEnglishSceneSentence(
    item
  ) {
    const english =
      String(
        item?.english || ""
      ).trim();

    return `I see the ${english}.`;
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


  /* ========================================
     CREATE IMPARA SCENE CONTROLS
     ======================================== */

  const sceneModeBar =
    document.createElement(
      "div"
    );

  sceneModeBar.id =
    "learnSceneModeBar";

  sceneModeBar.className =
    "learn-scene-mode-bar";

  sceneModeBar.hidden =
    true;

  sceneModeBar.innerHTML = `
    <button
      type="button"
      class="
        learn-scene-main-button
        active
      "
      data-scene-main-mode="explore"
      aria-pressed="true"
    >
      <span>
        📖 Esplora
      </span>

      <small>
        Explore
      </small>
    </button>

    <button
      type="button"
      class="learn-scene-main-button"
      data-scene-main-mode="scene"
      aria-pressed="false"
    >
      <span>
        👀 Nella scena
      </span>

      <small>
        In the Scene
      </small>
    </button>
  `;

  const sceneWorkspace =
    document.createElement(
      "section"
    );

  sceneWorkspace.id =
    "learnSceneWorkspace";

  sceneWorkspace.className =
    "learn-scene-workspace";

  sceneWorkspace.hidden =
    true;

  const existingLearnModeBar =
    document.querySelector(
      "#learnModeBar"
    );

  if (existingLearnModeBar) {
    existingLearnModeBar
      .insertAdjacentElement(
        "afterend",
        sceneModeBar
      );
  } else {
    learnActivity.insertBefore(
      sceneModeBar,
      vocabularyGrid
    );
  }

  learnActivity.insertBefore(
    sceneWorkspace,
    vocabularyGrid
  );

  const mainModeButtons =
    [
      ...sceneModeBar.querySelectorAll(
        "[data-scene-main-mode]"
      )
    ];

  let currentMainMode =
    "explore";

  let currentSceneMode =
    "pictures";

  let roundState =
    null;


  /* ========================================
     ROUND SETUP
     ======================================== */

  function createRound() {
    const config =
      getCurrentConfig();

    if (!config) {
      return null;
    }

    const allItems =
      config.getItems();

    const visibleSet =
      new Set(
        config.visibleItalian
      );

    const visibleItems =
      allItems.filter(
        item =>
          visibleSet.has(
            item.italian
          )
      );

    const absentItems =
      allItems.filter(
        item =>
          !visibleSet.has(
            item.italian
          )
      );

    return {
      targets:
        shuffle(
          visibleItems
        ).slice(
          0,
          MAX_ITEMS_PER_ROUND
        ),

      absentItems,

      index: 0
    };
  }

  function makeChoices(
    target,
    absentItems
  ) {
    const distractors =
      shuffle(
        absentItems
      ).slice(
        0,
        CHOICES_PER_ITEM - 1
      );

    return shuffle(
      [
        target,
        ...distractors
      ]
    );
  }


  /* ========================================
     MAIN MODE
     ======================================== */

  function setMainMode(
    mode
  ) {
    if (
      mode !== "explore" &&
      !getCurrentConfig()
    ) {
      mode =
        "explore";
    }

    currentMainMode =
      mode;

    mainModeButtons.forEach(
      button => {
        const active =
          button.dataset
            .sceneMainMode ===
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

      sceneWorkspace.hidden =
        true;

      sceneWorkspace.innerHTML =
        "";

      return;
    }

    vocabularyGrid.hidden =
      true;

    sceneWorkspace.hidden =
      false;

    startSceneRound(
      currentSceneMode
    );
  }


  /* ========================================
     SCENE ROUND
     ======================================== */

  function startSceneRound(
    mode
  ) {
    currentSceneMode =
      mode;

    roundState =
      createRound();

    if (
      !roundState ||
      !roundState.targets.length
    ) {
      sceneWorkspace.innerHTML = `
        <div
          class="learn-scene-message"
        >
          Questa attività non è ancora disponibile.
          <span>
            This activity is not available yet.
          </span>
        </div>
      `;

      return;
    }

    renderCurrentItem();
  }

  function renderCurrentItem() {
    const config =
      getCurrentConfig();

    if (
      !config ||
      !roundState
    ) {
      return;
    }

    if (
      roundState.index >=
      roundState.targets.length
    ) {
      renderRoundComplete();
      return;
    }

    const target =
      roundState.targets[
        roundState.index
      ];

    const choices =
      makeChoices(
        target,
        roundState.absentItems
      );

    const pictureMode =
      currentSceneMode ===
        "pictures";

    sceneWorkspace.innerHTML = `
      <div
        class="learn-scene-card"
      >
        <div
          class="learn-scene-heading"
        >
          <button
            type="button"
            class="learn-scene-question"
            aria-label="Hear the question"
          >
            <span aria-hidden="true">🔊</span>

            <strong>
              Che cosa vedi 👀?
            </strong>
          </button>

          <span>
            What do you see?
          </span>
        </div>

        <div
          class="learn-scene-levels"
          role="group"
          aria-label="Scene practice level"
        >
          <button
            type="button"
            class="
              learn-scene-level-button
              ${
                pictureMode
                  ? "active"
                  : ""
              }
            "
            data-scene-level="pictures"
          >
            🖼️ Con immagini

            <small>
              With Pictures
            </small>
          </button>

          <button
            type="button"
            class="
              learn-scene-level-button
              ${
                !pictureMode
                  ? "active"
                  : ""
              }
            "
            data-scene-level="words"
          >
            🔤 Solo parole

            <small>
              Words Only
            </small>
          </button>
        </div>

        <div
          class="learn-scene-progress"
        >
          ${roundState.index + 1}
          /
          ${roundState.targets.length}
        </div>

        <img
          class="learn-scene-image"
          src="${escapeHTML(
            config.image
          )}"
          alt=""
        >

        <p
          class="learn-scene-select-note"
        >
          Scegli una cosa che vedi nella scena.
          <span>
            Choose something you see in the scene.
          </span>
        </p>

        <div
          class="
            learn-scene-choice-grid
            ${
              pictureMode
                ? ""
                : "word-only"
            }
          "
        >
          ${choices
            .map(
              item => `
                <button
                  type="button"
                  class="learn-scene-choice"
                  data-italian="${escapeHTML(
                    item.italian
                  )}"
                >
                  ${
                    pictureMode
                      ? `
                        <img
                          src="${escapeHTML(
                            item.image
                          )}"
                          alt=""
                        >
                      `
                      : ""
                  }

                  <strong>
                    ${escapeHTML(
                      item.italian
                    )}
                  </strong>

                  ${
                    pictureMode
                      ? `
                        <span>
                          ${escapeHTML(
                            item.english
                          )}
                        </span>
                      `
                      : ""
                  }
                </button>
              `
            )
            .join("")}
        </div>

        <div
          class="learn-scene-feedback"
          aria-live="polite"
        ></div>

        <button
          type="button"
          class="learn-scene-next"
          hidden
        >
          Avanti <span class="expanded-inline-english">· Next</span> →
        </button>

        <p
          class="learn-scene-practice-note"
        >
          Attività di apprendimento e pratica:
          puoi provare di nuovo e non viene calcolato
          un punteggio di accuratezza.

          <span>
            Learn & Practice:
            retries are allowed and no accuracy score
            is calculated.
          </span>
        </p>
      </div>
    `;

    bindCurrentItem(
      target
    );
  }


  /* ========================================
     ITEM INTERACTION
     ======================================== */

  function bindCurrentItem(
    target
  ) {
    const questionButton =
      sceneWorkspace.querySelector(
        ".learn-scene-question"
      );

    const choiceButtons =
      [
        ...sceneWorkspace
          .querySelectorAll(
            ".learn-scene-choice"
          )
      ];

    const levelButtons =
      [
        ...sceneWorkspace
          .querySelectorAll(
            "[data-scene-level]"
          )
      ];

    const feedback =
      sceneWorkspace.querySelector(
        ".learn-scene-feedback"
      );

    const nextButton =
      sceneWorkspace.querySelector(
        ".learn-scene-next"
      );

    questionButton?.addEventListener(
      "click",
      () => {
        speak(
          "Che cosa vedi?"
        );
      }
    );

    levelButtons.forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            startSceneRound(
              button.dataset
                .sceneLevel
            );
          }
        );
      }
    );

    choiceButtons.forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const italian =
              button.dataset
                .italian;

            if (
              italian !==
              target.italian
            ) {
              speak(italian);

              button.classList.add(
                "incorrect"
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

            choiceButtons.forEach(
              choice => {
                choice.disabled =
                  true;
              }
            );

            button.classList.remove(
              "incorrect"
            );

            button.classList.add(
              "correct"
            );

            const sentence =
              `Io vedo ${target.italian}.`;

            feedback.innerHTML = `
              <div class="learn-scene-model-answer">

                

                <button
                  type="button"
                  class="learn-scene-answer-speech"
                >
                  <span
                    class="learn-scene-answer-speaker"
                    aria-hidden="true"
                  >
                    🔊
                  </span>

                  <span class="learn-scene-io-vedo-group">
                    <img
                      src="images/carrier-phrases/io-vedo-no-text.png"
                      alt=""
                      class="learn-scene-small-io-vedo"
                    >

                    <strong class="learn-scene-io-vedo-text">
                      Io vedo
                    </strong>
                  </span>

                  <strong class="learn-scene-answer-target">
                    ${escapeHTML(
                      target.italian
                    )}.
                  </strong>
                </button>

                <div class="learn-scene-english-model">
                  <span>
                    ${escapeHTML(
                      buildEnglishSceneSentence(
                        target
                      )
                    )}
                  </span>
                </div>

              </div>
            `;

            speak(
              sentence
            );

            feedback
              .querySelector(
                ".learn-scene-answer-speech"
              )
              ?.addEventListener(
                "click",
                () => {
                  speak(
                    sentence
                  );
                }
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
        roundState.index +=
          1;

        renderCurrentItem();
      }
    );
  }


  /* ========================================
     ROUND COMPLETE
     ======================================== */

  function renderRoundComplete() {
    const targets =
      roundState
        ? [...roundState.targets]
        : [];

    recordCompletedRound(
      topicSelect.value,
      currentSceneMode,
      targets
    );

    const pictureMode =
      currentSceneMode ===
        "pictures";

    sceneWorkspace.innerHTML = `
      <div
        class="learn-scene-complete"
      >
        <div
          class="learn-scene-complete-icon"
          aria-hidden="true"
        >
          👀
        </div>

        <h4>
          Ottimo lavoro!
        </h4>

        <p>
          Hai praticato
          <strong>
            Che cosa vedi?
          </strong>
          e
          <strong>
            Io vedo...
          </strong>
        </p>

        <span>
          You practiced asking what you see
          and answering with “Io vedo...”
        </span>

        ${
          pictureMode
            ? `
              <button
                type="button"
                class="learn-scene-next-round"
                data-next-mode="words"
              >
                🔤 Prova solo con le parole

                <small>
                  Try Words Only
                </small>
              </button>
            `
            : `
              <button
                type="button"
                class="learn-scene-next-round"
                data-next-mode="pictures"
              >
                🔄 Nuovo giro

                <small>
                  New Round
                </small>
              </button>
            `
        }
      </div>
    `;

    sceneWorkspace
      .querySelector(
        ".learn-scene-next-round"
      )
      ?.addEventListener(
        "click",
        event => {
          startSceneRound(
            event.currentTarget
              .dataset
              .nextMode
          );
        }
      );
  }


  /* ========================================
     TOPIC / IMPARA SYNC
     ======================================== */

  function syncTopicUI() {
    const config =
      getCurrentConfig();

    if (!config) {
      sceneModeBar.hidden =
        true;

      sceneWorkspace.hidden =
        true;

      sceneWorkspace.innerHTML =
        "";

      currentMainMode =
        "explore";

      /*
        Restore the normal Impara area when
        leaving Clothing/Animals scene mode.
        This prevents topics such as Casa
        from inheriting a hidden vocabulary grid.
      */
      vocabularyGrid.hidden =
        false;

      return;
    }

    sceneModeBar.hidden =
      false;

    if (existingLearnModeBar) {
      existingLearnModeBar.hidden =
        true;
    }

    setMainMode(
      "explore"
    );
  }

  topicSelect.addEventListener(
    "change",
    () => {
      window.setTimeout(
        syncTopicUI,
        40
      );
    }
  );

  learnButton.addEventListener(
    "click",
    () => {
      window.setTimeout(
        syncTopicUI,
        40
      );
    }
  );

  mainModeButtons.forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          setMainMode(
            button.dataset
              .sceneMainMode
          );
        }
      );
    }
  );


  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#learnSceneStyles"
    )
  ) {
    const style =
      document.createElement(
        "style"
      );

    style.id =
      "learnSceneStyles";

    style.textContent = `
      .learn-scene-mode-bar {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        margin: 0 auto 22px;
      }

      .learn-scene-mode-bar[hidden],
      .learn-scene-workspace[hidden] {
        display: none;
      }

      .learn-scene-main-button {
        display: grid;
        gap: 2px;
        min-width: 170px;
        padding: 10px 16px;
        border: 1px solid #cfdbea;
        border-radius: 999px;
        background: white;
        color: #274b84;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .learn-scene-main-button small {
        color: #6f7f93;
        font-size: .74rem;
        font-weight: 700;
      }

      .learn-scene-main-button.active {
        border-color: #7e9dc3;
        background: #eef5fc;
        box-shadow:
          0 2px 8px
          rgba(39, 75, 132, .10);
      }

      .learn-scene-workspace {
        width: min(980px, 100%);
        margin: 0 auto;
      }

      .learn-scene-card,
      .learn-scene-complete {
        padding: 24px;
        border: 1px solid #d8e1ec;
        border-radius: 22px;
        background: #fffdf9;
        box-shadow:
          0 8px 24px
          rgba(43, 67, 97, .08);
        text-align: center;
      }

      .learn-scene-heading {
        display: grid;
        justify-items: center;
        gap: 3px;
      }

      .learn-scene-question {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 15px;
        border: 0;
        border-radius: 14px;
        background: #eef5fc;
        color: #274b84;
        font: inherit;
        font-size: 1.3rem;
        cursor: pointer;
      }

      .learn-scene-heading > span {
        color: #6b7a8e;
        font-weight: 700;
      }

      .learn-scene-levels {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        margin: 13px 0 8px;
      }

      .learn-scene-level-button {
        display: grid;
        gap: 2px;
        padding: 8px 14px;
        border: 1px solid #d4deea;
        border-radius: 14px;
        background: white;
        color: #405b7d;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .learn-scene-level-button small {
        color: #7c8795;
        font-size: .7rem;
      }

      .learn-scene-level-button.active {
        border-color: #7e9dc3;
        background: #eef5fc;
        color: #274b84;
      }

      .learn-scene-progress {
        margin: 9px 0 12px;
        color: #8a755a;
        font-size: .82rem;
        font-weight: 900;
      }

      .learn-scene-image {
        display: block;
        width: min(760px, 100%);
        max-height: 560px;
        margin: 0 auto 14px;
        object-fit: contain;
        border-radius: 20px;
        box-shadow:
          0 5px 16px
          rgba(43, 67, 97, .10);
      }

      .learn-scene-select-note {
        margin: 13px auto;
        color: #40536b;
        font-weight: 850;
      }

      .learn-scene-select-note span {
        display: block;
        margin-top: 3px;
        color: #758296;
        font-size: .84rem;
        font-weight: 650;
      }

      .learn-scene-choice-grid {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap: 12px;
        width: min(760px, 100%);
        margin: 0 auto;
      }

      .learn-scene-choice {
        min-height: 145px;
        padding: 10px;
        border: 2px solid #d5dfeb;
        border-radius: 17px;
        background: white;
        color: #274b84;
        font: inherit;
        cursor: pointer;
        transition:
          transform .12s ease,
          border-color .12s ease,
          background .12s ease;
      }

      .learn-scene-choice:hover {
        transform:
          translateY(-1px);
      }

      .learn-scene-choice img {
        display: block;
        width: 105px;
        height: 88px;
        margin: 0 auto 5px;
        object-fit: contain;
      }

      .learn-scene-choice strong,
      .learn-scene-choice span {
        display: block;
      }

      .learn-scene-choice strong {
        font-size: .92rem;
        line-height: 1.1;
      }

      .learn-scene-choice span {
        margin-top: 3px;
        color: #788598;
        font-size: .72rem;
        font-weight: 650;
      }

      .learn-scene-choice-grid.word-only
      .learn-scene-choice {
        min-height: 76px;
        display: grid;
        place-items: center;
      }

      .learn-scene-choice-grid.word-only
      .learn-scene-choice strong {
        font-size: 1.05rem;
      }

      .learn-scene-choice.incorrect {
        border-color: #d69c92;
        background: #fff2f0;
      }

      .learn-scene-choice.correct {
        border-color: #70a48d;
        background: #eff9f4;
      }

      .learn-scene-choice:disabled {
        cursor: default;
      }

      .learn-scene-feedback {
        min-height: 62px;
        margin: 15px auto 4px;
        color: #40536b;
      }

      .learn-scene-feedback > strong,
      .learn-scene-feedback > span {
        display: block;
      }

      .learn-scene-feedback > strong {
        color: #315e53;
      }

      .learn-scene-feedback > span {
        margin-top: 3px;
        color: #788598;
        font-size: .84rem;
      }

      .learn-scene-model-answer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        margin-top: 7px;
      }

      .learn-scene-english-model {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .learn-scene-small-io-vedo {
        display: block;
        width: 58px;
        height: 58px;
        object-fit: contain;
      }

      .learn-scene-english-model > span {
        color: #66768b;
        font-size: 1rem;
        font-weight: 700;
        text-align: center;
      }

      .learn-scene-answer-speech {
        align-items: flex-end;
        gap: 7px;
        padding-top: 8px;
      }

      .learn-scene-answer-speaker {
        align-self: flex-end;
        padding-bottom: 2px;
        font-size: 1.05rem;
      }

      .learn-scene-io-vedo-group {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: 1px;
      }

      .learn-scene-small-io-vedo {
        width: 54px;
        height: 54px;
        object-fit: contain;
        margin-bottom: -2px;
      }

      .learn-scene-io-vedo-text,
      .learn-scene-answer-target {
        font-size: 1.25rem;
        line-height: 1.1;
      }

      .learn-scene-answer-target {
        padding-bottom: 1px;
      }

      .learn-scene-answer-speech {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 9px 14px;
        border: 0;
        border-radius: 14px;
        background: #eef8f3;
        color: #315e53;
        font: inherit;
        font-size: 1.05rem;
        cursor: pointer;
      }

      .learn-scene-next,
      .learn-scene-next-round {
        margin-top: 4px;
        padding: 10px 20px;
        border: 0;
        border-radius: 999px;
        background: #274b84;
        color: white;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }

      .learn-scene-practice-note {
        margin: 21px 0 0;
        padding-top: 13px;
        border-top: 1px solid #e2e7ed;
        color: #7d725f;
        font-size: .79rem;
        font-weight: 700;
      }

      .learn-scene-practice-note span {
        display: block;
        margin-top: 3px;
        color: #8a94a2;
      }

      .learn-scene-complete {
        padding: 34px 24px;
      }

      .learn-scene-complete-icon {
        margin-bottom: 8px;
        font-size: 2rem;
      }

      .learn-scene-complete h4 {
        margin: 0 0 10px;
        color: #274b84;
        font-size: 1.4rem;
      }

      .learn-scene-complete p {
        color: #40536b;
      }

      .learn-scene-complete > span {
        display: block;
        color: #748195;
      }

      .learn-scene-next-round {
        display: grid;
        gap: 3px;
        margin: 20px auto 0;
      }

      .learn-scene-next-round small {
        font-weight: 650;
        opacity: .88;
      }

      .learn-scene-message {
        padding: 24px;
        border: 1px solid #d8e1ec;
        border-radius: 18px;
        background: #fffdf9;
        color: #40536b;
        text-align: center;
        font-weight: 800;
      }

      .learn-scene-message span {
        display: block;
        margin-top: 4px;
        color: #748195;
        font-weight: 650;
      }

      /* Final Io vedo model alignment */

      .learn-scene-answer-speech {
        display: inline-flex !important;
        align-items: flex-end !important;
        justify-content: center;
        gap: 7px;
      }

      .learn-scene-answer-speaker {
        align-self: flex-end;
        padding-bottom: 2px;
      }

      .learn-scene-io-vedo-group {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: 1px;
      }

      .learn-scene-small-io-vedo {
        display: block;
        width: 54px;
        height: 54px;
        object-fit: contain;
        margin: 0 0 1px;
      }

      .learn-scene-io-vedo-text,
      .learn-scene-answer-target {
        display: inline-block;
        font-size: 1.25rem;
        line-height: 1.12;
      }

      .learn-scene-answer-target {
        align-self: flex-end !important;
        padding-bottom: 0;
        margin-bottom: 0;
      }

      .learn-scene-english-model > span {
        font-size: 1.05rem;
        font-weight: 700;
      }


      @media (max-width: 760px) {
        .learn-scene-choice-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 520px) {
        .learn-scene-main-button {
          width: 100%;
        }

        .learn-scene-card {
          padding: 18px 12px;
        }

        .learn-scene-choice {
          min-height: 128px;
        }

        .learn-scene-choice img {
          width: 88px;
          height: 74px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  syncTopicUI();
})();
