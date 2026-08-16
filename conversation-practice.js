"use strict";

/*
  Primo Volo d'Italiano
  Conversiamo · Conversation Practice

  Load this file AFTER assemble-sentences.js:

  <script src="data.js"></script>
  <script src="script.js"></script>
  <script src="words-in-action.js"></script>
  <script src="assemble-sentences.js"></script>
  <script src="conversation-practice.js"></script>

  Version 1 supports:
  - Il tempo · Weather
  - Espressioni in classe · Classroom Expressions

  When one of those topics is selected:
  - Parole in azione and Assembla are hidden.
  - Conversiamo appears in their place.
  - Students may answer by choosing or writing.
*/

(function initializeConversationPractice() {
  const menu =
    document.querySelector(".activity-menu");

  const main =
    document.querySelector("main.page");

  const topicSelectElement =
    document.querySelector("#topicSelect");

  const englishToggleControlElement =
    document.querySelector(
      "#englishToggleControl"
    );

  const learnInstructionsElement =
    document.querySelector(
      "#learnInstructions"
    );

  if (!menu || !main) {
    console.error(
      "Conversation Practice could not start because the activity menu or main page was not found."
    );
    return;
  }

  /* ========================================
     TOPIC CONFIGURATION

     Add new supported topics here later.
     ======================================== */

  const conversationConfigs = {
    weather: {
      promptItalian: "Che tempo fa?",
      promptEnglish:
        "What's the weather like?",
      instructionItalian:
        "Guarda l'immagine e rispondi alla domanda.",
      instructionEnglish:
        "Look at the picture and answer the question.",
      answerLabelItalian:
        "Risposta",
      answerLabelEnglish:
        "Answer"
    },

    classroom: {
      promptItalian:
        "Che cosa si dice in questa situazione?",
      promptEnglish:
        "What would you say in this situation?",
      instructionItalian:
        "Guarda l'immagine e scegli o scrivi l'espressione corretta.",
      instructionEnglish:
        "Look at the picture and choose or write the correct expression.",
      answerLabelItalian:
        "Espressione",
      answerLabelEnglish:
        "Expression"
    }
  };

  function getCurrentTopicKey() {
    if (
      typeof currentTopicKey !==
      "undefined"
    ) {
      return currentTopicKey;
    }

    return topicSelectElement
      ? topicSelectElement.value
      : "";
  }

  function getCurrentVocabulary() {
    if (
      typeof currentVocabulary ===
        "undefined" ||
      !Array.isArray(currentVocabulary)
    ) {
      return [];
    }

    return currentVocabulary;
  }

  function getCurrentConfig() {
    return conversationConfigs[
      getCurrentTopicKey()
    ] || null;
  }

  function isSupportedTopic() {
    return Boolean(getCurrentConfig());
  }

  /* ========================================
     CREATE BUTTON
     ======================================== */

  let conversationButton =
    document.querySelector(
      '[data-mode="conversation-practice"]'
    );

  if (!conversationButton) {
    conversationButton =
      document.createElement("button");

    conversationButton.type = "button";
    conversationButton.className =
      "activity-button";
    conversationButton.dataset.mode =
      "conversation-practice";
    conversationButton.hidden = true;

    conversationButton.innerHTML = `
      <span class="activity-icon" aria-hidden="true">
        🗣️
      </span>

      <span class="activity-italian">
        Conversiamo
      </span>

      <small lang="en">
        Conversation
      </small>
    `;

    const completeButton =
      menu.querySelector(
        '[data-mode="complete"]'
      );

    if (completeButton) {
      completeButton.before(
        conversationButton
      );
    } else {
      menu.appendChild(
        conversationButton
      );
    }
  }

  if (
    typeof activityLabels !== "undefined"
  ) {
    activityLabels[
      "conversation-choice"
    ] = "Conversiamo: Scegli · Choose";

    activityLabels[
      "conversation-write"
    ] = "Conversiamo: Scrivi · Write";
  }

  /* ========================================
     CREATE ACTIVITY PANEL
     ======================================== */

  let conversationActivity =
    document.querySelector(
      "#conversationPracticeActivity"
    );

  if (!conversationActivity) {
    conversationActivity =
      document.createElement("section");

    conversationActivity.id =
      "conversationPracticeActivity";

    conversationActivity.className =
      "conversation-practice-activity activity-panel";

    conversationActivity.hidden = true;

    main.appendChild(
      conversationActivity
    );
  }

  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#conversationPracticeStyles"
    )
  ) {
    const style =
      document.createElement("style");

    style.id =
      "conversationPracticeStyles";

    style.textContent = `
      .conversation-practice-activity {
        width: min(820px, 100%);
        margin: 0 auto;
      }

      .conversation-card {
        padding: 26px;
        border-radius: 24px;
        background: white;
        box-shadow: var(
          --shadow,
          0 10px 28px rgba(36, 57, 87, 0.12)
        );
        text-align: center;
      }

      .conversation-heading h4 {
        margin: 0;
        color: var(--blue-dark, #274b84);
        font-size: 1.35rem;
      }

      .conversation-heading p {
        margin: 5px 0 0;
        color: var(--muted, #66758d);
      }

      .conversation-mode-switch {
        display: inline-flex;
        gap: 6px;
        margin: 18px auto;
        padding: 5px;
        border: 1px solid
          var(--border, #d9e2ef);
        border-radius: 999px;
        background: #f4f7fb;
      }

      .conversation-mode-button {
        padding: 9px 16px;
        border: 0;
        border-radius: 999px;
        color: var(--blue-dark, #274b84);
        background: transparent;
        font-weight: 850;
        cursor: pointer;
      }

      .conversation-mode-button.active {
        color: white;
        background: var(--blue, #274b84);
      }

      .conversation-question {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin: 6px 0 14px;
      }

      .conversation-question-text {
        margin: 0;
        color: var(--blue-dark, #274b84);
        font-size: clamp(
          1.35rem,
          3vw,
          1.85rem
        );
        font-weight: 900;
      }

      .conversation-listen-button {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border: 1px solid
          var(--border, #d9e2ef);
        border-radius: 50%;
        background: #edf3fb;
        cursor: pointer;
      }

      .conversation-prompt-english {
        margin: -8px 0 14px;
        color: var(--muted, #66758d);
        font-size: 0.9rem;
      }

      .conversation-image-frame {
        display: grid;
        place-items: center;
        width: min(310px, 90%);
        aspect-ratio: 1;
        margin: 0 auto 18px;
        padding: 14px;
        overflow: hidden;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 22px;
        background: var(--cream, #fffaf3);
      }

      .conversation-image-frame img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .conversation-instruction {
        margin: 0 0 14px;
        color: var(--blue-dark, #274b84);
        font-weight: 800;
      }

      .conversation-instruction span {
        display: block;
        margin-top: 3px;
        color: var(--muted, #66758d);
        font-size: 0.88rem;
        font-weight: 550;
      }

      .conversation-choice-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .conversation-choice {
        min-height: 56px;
        padding: 11px 14px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 16px;
        color: var(--blue-dark, #274b84);
        background: white;
        font: inherit;
        font-size: 1rem;
        font-weight: 850;
        cursor: pointer;
        transition:
          transform 0.16s ease,
          border-color 0.16s ease,
          background 0.16s ease;
      }

      .conversation-choice:hover:not(:disabled),
      .conversation-choice:focus-visible {
        transform: translateY(-2px);
        border-color: var(--blue, #274b84);
        outline: none;
      }

      .conversation-choice.correct {
        border-color: #3f8f5b;
        background: #eef9f1;
      }

      .conversation-choice.incorrect {
        border-color: #bc5145;
        background: #fff1ef;
        animation: conversationShake 0.32s ease;
      }

      .conversation-write-form {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .conversation-write-label {
        margin-bottom: 8px;
        color: var(--blue-dark, #274b84);
        font-weight: 850;
      }

      .conversation-write-label span {
        display: block;
        margin-top: 3px;
        color: var(--muted, #66758d);
        font-size: 0.86rem;
        font-weight: 550;
      }

      .conversation-input {
        width: min(470px, 100%);
        padding: 12px 15px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 14px;
        color: var(--blue-dark, #274b84);
        background: white;
        font-size: 1.1rem;
        font-weight: 800;
        text-align: center;
      }

      .conversation-input:focus {
        border-color: var(--blue, #274b84);
        outline: 0;
        box-shadow:
          0 0 0 4px rgba(39, 75, 132, 0.14);
      }

      .conversation-input.incorrect {
        border-color: #bc5145;
        background: #fff1ef;
        animation: conversationShake 0.32s ease;
      }

      .conversation-check-button {
        margin-top: 11px;
        padding: 11px 20px;
        border: 0;
        border-radius: 999px;
        color: white;
        background: var(--blue, #274b84);
        font-weight: 850;
        cursor: pointer;
      }

      .conversation-feedback {
        min-height: 72px;
        margin: 18px 0 0;
        color: var(--blue-dark, #274b84);
        font-weight: 850;
        line-height: 1.45;
      }

      .conversation-feedback strong {
        display: block;
        margin-top: 6px;
        color: #337a4d;
        font-size: clamp(
          1.2rem,
          3vw,
          1.65rem
        );
      }

      .conversation-feedback span {
        display: block;
        margin-top: 4px;
        color: var(--muted, #66758d);
        font-size: 0.88rem;
        font-weight: 550;
      }

      .conversation-next {
        display: block;
        margin: 12px auto 0;
      }

      .conversation-empty {
        padding: 28px;
        color: var(--blue-dark, #274b84);
        text-align: center;
      }

      .conversation-empty span {
        display: block;
        margin-top: 5px;
        color: var(--muted, #66758d);
      }

      @keyframes conversationShake {
        0%, 100% {
          transform: translateX(0);
        }

        25% {
          transform: translateX(-6px);
        }

        75% {
          transform: translateX(6px);
        }
      }

      body.hide-english
      .conversation-heading p,
      body.hide-english
      .conversation-prompt-english,
      body.hide-english
      .conversation-instruction span,
      body.hide-english
      .conversation-write-label span,
      body.hide-english
      .conversation-feedback span {
        display: none;
      }

      @media (max-width: 620px) {
        .conversation-card {
          padding: 18px;
        }

        .conversation-choice-grid {
          grid-template-columns: 1fr;
        }

        .conversation-mode-switch {
          display: grid;
          width: 100%;
          border-radius: 18px;
        }

        .conversation-mode-button {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ========================================
     GAME STATE
     ======================================== */

  let responseMode = "choose";
  let currentItem = null;
  let questionComplete = false;
  let questionHadError = false;

  function shuffleItems(items) {
    const shuffled = [...items];

    for (
      let index = shuffled.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(
          Math.random() * (index + 1)
        );

      [
        shuffled[index],
        shuffled[randomIndex]
      ] = [
        shuffled[randomIndex],
        shuffled[index]
      ];
    }

    return shuffled;
  }

  function buildChoices(correctItem) {
    const vocabulary =
      getCurrentVocabulary();

    const incorrect =
      shuffleItems(
        vocabulary.filter(
          item => item !== correctItem
        )
      ).slice(0, 3);

    return shuffleItems([
      correctItem,
      ...incorrect
    ]);
  }

  function speak(text) {
    if (
      typeof speakItalian === "function"
    ) {
      speakItalian(text);
    }
  }

  function saveAttempt(isCorrect) {
    if (
      typeof recordAttempt !== "function"
    ) {
      return;
    }

    const activity =
      responseMode === "write"
        ? "conversation-write"
        : "conversation-choice";

    recordAttempt(
      activity,
      isCorrect
    );
  }

  function normalizeAnswer(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.!?,;:]/g, "")
      .replace(/\s+/g, " ");
  }

  function hideOtherPanels() {
    [
      "#learnActivity",
      "#matchActivity",
      "#listenActivity",
      "#chooseActivity",
      "#completeActivity",
      "#writeActivity",
      "#memoryActivity",
      "#wordsInActionActivity",
      "#assembleSentencesActivity"
    ].forEach(selector => {
      const panel =
        document.querySelector(selector);

      if (panel) {
        panel.hidden = true;
      }
    });
  }

  function renderUnsupportedMessage() {
    conversationActivity.innerHTML = `
      <div class="conversation-empty">
        Questa attività non è ancora
        disponibile per questo argomento.

        <span>
          This activity is not yet
          available for this topic.
        </span>
      </div>
    `;
  }

  function renderQuestion() {
    const config =
      getCurrentConfig();

    const vocabulary =
      getCurrentVocabulary();

    if (!config || !vocabulary.length) {
      renderUnsupportedMessage();
      return;
    }

    currentItem =
      vocabulary[
        Math.floor(
          Math.random() *
          vocabulary.length
        )
      ];

    questionComplete = false;
    questionHadError = false;

    const choices =
      buildChoices(currentItem);

    const responseArea =
      responseMode === "choose"
        ? `
          <div
            class="conversation-choice-grid"
            aria-label="Italian response choices"
          >
            ${choices.map(item => `
              <button
                type="button"
                class="conversation-choice"
                data-answer="${item.italian}"
              >
                ${item.italian}
              </button>
            `).join("")}
          </div>
        `
        : `
          <form
            id="conversationWriteForm"
            class="conversation-write-form"
          >
            <label
              for="conversationInput"
              class="conversation-write-label"
            >
              ${config.answerLabelItalian}

              <span>
                ${config.answerLabelEnglish}
              </span>
            </label>

            <input
              type="text"
              id="conversationInput"
              class="conversation-input"
              autocomplete="off"
              autocapitalize="sentences"
              spellcheck="false"
              aria-describedby="conversationFeedback"
            >

            <button
              type="submit"
              class="conversation-check-button"
            >
              Controlla · Check
            </button>
          </form>
        `;

    conversationActivity.innerHTML = `
      <div class="conversation-card">

        <div class="conversation-heading">
          <h4>
            🗣️ Conversiamo
          </h4>

          <p lang="en">
            Conversation Practice
          </p>
        </div>

        <div
          class="conversation-mode-switch"
          aria-label="Choose a response mode"
        >
          <button
            type="button"
            class="conversation-mode-button
              ${responseMode === "choose"
                ? "active"
                : ""}"
            data-response-mode="choose"
          >
            ✅ Scegli · Choose
          </button>

          <button
            type="button"
            class="conversation-mode-button
              ${responseMode === "write"
                ? "active"
                : ""}"
            data-response-mode="write"
          >
            ⌨️ Scrivi · Write
          </button>
        </div>

        <div class="conversation-question">
          <p class="conversation-question-text">
            ${config.promptItalian}
          </p>

          <button
            type="button"
            id="conversationListen"
            class="conversation-listen-button"
            aria-label="Listen to the question"
          >
            🔊
          </button>
        </div>

        <p class="conversation-prompt-english">
          ${config.promptEnglish}
        </p>

        <div class="conversation-image-frame">
          <img
            src="${currentItem.image}"
            alt="${currentItem.english}"
          >
        </div>

        <p class="conversation-instruction">
          ${config.instructionItalian}

          <span>
            ${config.instructionEnglish}
          </span>
        </p>

        ${responseArea}

        <p
          id="conversationFeedback"
          class="conversation-feedback"
          aria-live="polite"
        ></p>

        <button
          type="button"
          id="conversationNext"
          class="
            next-question-button
            conversation-next
          "
          hidden
        >
          Prossima domanda · Next Question
        </button>

      </div>
    `;

    const modeButtons =
      conversationActivity.querySelectorAll(
        ".conversation-mode-button"
      );

    const listenButton =
      conversationActivity.querySelector(
        "#conversationListen"
      );

    const feedback =
      conversationActivity.querySelector(
        "#conversationFeedback"
      );

    const nextButton =
      conversationActivity.querySelector(
        "#conversationNext"
      );

    modeButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          responseMode =
            button.dataset.responseMode;

          renderQuestion();
        }
      );
    });

    listenButton.addEventListener(
      "click",
      () => {
        speak(config.promptItalian);
      }
    );

    nextButton.addEventListener(
      "click",
      renderQuestion
    );

    if (responseMode === "choose") {
      const choiceButtons =
        conversationActivity.querySelectorAll(
          ".conversation-choice"
        );

      choiceButtons.forEach(button => {
        button.addEventListener(
          "click",
          () => {
            if (questionComplete) {
              return;
            }

            const isCorrect =
              button.dataset.answer ===
              currentItem.italian;

            saveAttempt(isCorrect);

            if (!isCorrect) {
              questionHadError = true;

              button.classList.remove(
                "incorrect"
              );

              void button.offsetWidth;

              button.classList.add(
                "incorrect"
              );

              feedback.innerHTML = `
                Riprova.

                <span>
                  Try another response.
                </span>
              `;

              button.addEventListener(
                "animationend",
                () => {
                  button.classList.remove(
                    "incorrect"
                  );
                },
                { once: true }
              );

              return;
            }

            questionComplete = true;
            button.classList.add("correct");

            choiceButtons.forEach(choice => {
              choice.disabled = true;
            });

            feedback.innerHTML = `
              Corretto!

              <strong>
                ${currentItem.italian}
              </strong>

              <span>
                Correct! Listen to the response.
              </span>
            `;

            nextButton.hidden = false;
            speak(currentItem.italian);
          }
        );
      });
    } else {
      const form =
        conversationActivity.querySelector(
          "#conversationWriteForm"
        );

      const input =
        conversationActivity.querySelector(
          "#conversationInput"
        );

      const checkButton =
        conversationActivity.querySelector(
          ".conversation-check-button"
        );

      form.addEventListener(
        "submit",
        event => {
          event.preventDefault();

          if (questionComplete) {
            return;
          }

          const studentAnswer =
            normalizeAnswer(input.value);

          const correctAnswer =
            normalizeAnswer(
              currentItem.italian
            );

          if (!studentAnswer) {
            feedback.innerHTML = `
              Scrivi una risposta.

              <span>
                Type a response.
              </span>
            `;

            input.focus();
            return;
          }

          const isCorrect =
            studentAnswer === correctAnswer;

          saveAttempt(isCorrect);

          if (!isCorrect) {
            questionHadError = true;

            input.classList.remove(
              "incorrect"
            );

            void input.offsetWidth;

            input.classList.add(
              "incorrect"
            );

            feedback.innerHTML = `
              Riprova.

              <span>
                Check the picture and try again.
              </span>
            `;

            input.select();
            return;
          }

          questionComplete = true;
          input.disabled = true;
          checkButton.disabled = true;

          feedback.innerHTML = `
            Corretto!

            <strong>
              ${currentItem.italian}
            </strong>

            <span>
              Correct! Listen to the response.
            </span>
          `;

          nextButton.hidden = false;
          speak(currentItem.italian);
        }
      );

      input.focus();
    }

    /*
      Let the student first see the question.
      Then read it aloud after a brief pause.
    */
    window.setTimeout(
      () => {
        if (
          !conversationActivity.hidden
        ) {
          speak(config.promptItalian);
        }
      },
      350
    );
  }

  function showConversationMode() {
    if (!isSupportedTopic()) {
      return;
    }

    document
      .querySelectorAll(
        ".activity-button"
      )
      .forEach(button => {
        button.classList.toggle(
          "active",
          button === conversationButton
        );
      });

    hideOtherPanels();

    conversationActivity.hidden = false;

    if (
      englishToggleControlElement
    ) {
      englishToggleControlElement.hidden =
        true;
    }

    if (
      learnInstructionsElement
    ) {
      learnInstructionsElement.hidden =
        true;
    }

    renderQuestion();
  }

  /* ========================================
     TOPIC-AWARE MENU
     ======================================== */

  function updateConversationAvailability() {
    const supported =
      isSupportedTopic();

    const wordsButton =
      document.querySelector(
        '[data-mode="words-in-action"]'
      );

    const assembleButton =
      document.querySelector(
        '[data-mode="assemble-sentences"]'
      );

    conversationButton.hidden =
      !supported;

    /*
      Weather and classroom expressions use
      Conversiamo instead of Parole in azione.

      Weather now ALSO supports Assembla
      using complete weather expressions.

      Classroom continues to hide Assembla
      for now.
    */
    const topicKey =
      getCurrentTopicKey();

    if (wordsButton) {
      wordsButton.hidden = supported;
    }

    if (assembleButton) {
      assembleButton.hidden =
        topicKey === "classroom";
    }

    if (!supported) {
      conversationActivity.hidden = true;
    }
  }

  conversationButton.addEventListener(
    "click",
    showConversationMode
  );

  document
    .querySelectorAll(
      ".activity-button"
    )
    .forEach(button => {
      if (
        button === conversationButton
      ) {
        return;
      }

      button.addEventListener(
        "click",
        () => {
          conversationActivity.hidden =
            true;
        }
      );
    });

  if (topicSelectElement) {
    topicSelectElement.addEventListener(
      "change",
      () => {
        conversationActivity.hidden =
          true;

        updateConversationAvailability();
      }
    );
  }

  updateConversationAvailability();
})();