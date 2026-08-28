"use strict";

/*
  Primo Volo d'Italiano
  Parole in azione · Words in Action

  Add this file AFTER script.js in index.html:

  <script src="js/core/script.js"></script>
  <script src="js/activities/words-in-action.js"></script>
*/

(function initializeWordsInAction() {
  const menu =
    document.querySelector(".activity-menu");

  const main =
    document.querySelector("main.page");

  const topicSelectElement =
    document.querySelector("#topicSelect");

  const englishToggleElement =
    document.querySelector("#englishToggle");

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
      "Words in Action could not start because the activity menu or main page was not found."
    );
    return;
  }

  /* ========================================
     CREATE BUTTON
     ======================================== */

  let wordsButton =
    document.querySelector(
      '[data-mode="words-in-action"]'
    );

  if (!wordsButton) {
    wordsButton =
      document.createElement("button");

    wordsButton.type = "button";
    wordsButton.className =
      "activity-button";
    wordsButton.dataset.mode =
      "words-in-action";

    wordsButton.innerHTML = `
      <span class="activity-icon" aria-hidden="true">
        💬
      </span>

      <span class="activity-italian">
        Parole in azione
      </span>

      <small>
        Words in Action
      </small>
    `;

    const completeButton =
      menu.querySelector(
        '[data-mode="complete"]'
      );

    if (completeButton) {
      completeButton.before(wordsButton);
    } else {
      menu.appendChild(wordsButton);
    }
  }

  /* ========================================
     CREATE ACTIVITY PANEL
     ======================================== */

  let wordsActivity =
    document.querySelector(
      "#wordsInActionActivity"
    );

  if (!wordsActivity) {
    wordsActivity =
      document.createElement("section");

    wordsActivity.id =
      "wordsInActionActivity";

    wordsActivity.className =
      "words-in-action-activity activity-panel";

    wordsActivity.hidden = true;

    main.appendChild(wordsActivity);
  }

  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#wordsInActionStyles"
    )
  ) {
    const style =
      document.createElement("style");

    style.id = "wordsInActionStyles";

    style.textContent = `
      .activity-menu {
        grid-template-columns:
          repeat(8, minmax(0, 1fr));
      }

      .activity-button[
        data-mode="words-in-action"
      ] .activity-italian {
        line-height: 1.08;
      }

      .words-in-action-activity {
        width: min(820px, 100%);
        margin: 0 auto;
      }

      .words-action-card {
        padding: 26px;
        border-radius: 24px;
        background: white;
        box-shadow: var(
          --shadow,
          0 10px 28px rgba(36, 57, 87, 0.12)
        );
      }

      .words-action-heading {
        text-align: center;
      }

      .words-action-heading h4 {
        margin: 0;
        color: var(--blue-dark, #274b84);
        font-size: 1.3rem;
      }

      .words-action-heading p {
        margin: 6px 0 0;
        color: var(--muted, #66758d);
      }

   .words-action-frame {
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 22px auto 18px;

  background: none;
  border: none;
  box-shadow: none;
}
.carrier-phrase-image {
  width: 150px;
  max-width: 80%;
  height: auto;
  display: block;

  cursor: pointer;

  transition:
    transform .18s ease,
    filter .18s ease;
}

.carrier-phrase-image:hover{
  transform:scale(1.05);
  filter:brightness(1.05);
}

.carrier-phrase-image:active{
  transform:scale(.97);
}

      .words-action-image-frame {
        display: grid;
        place-items: center;
        width: min(330px, 90%);
        aspect-ratio: 1;
        margin: 0 auto 22px;
        padding: 14px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 22px;
        background: white;
      }

      .words-action-image-frame img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .words-action-choice-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .words-action-choice {
        min-height: 58px;
        padding: 12px 14px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 16px;
        color: var(--blue-dark, #274b84);
        background: white;
        font: inherit;
        font-size: 1.02rem;
        font-weight: 850;
        cursor: pointer;
        transition:
          transform 0.16s ease,
          border-color 0.16s ease,
          background 0.16s ease;
      }

      .words-action-choice:hover:not(
        :disabled
      ),
      .words-action-choice:focus-visible {
        transform: translateY(-2px);
        border-color:
          var(--blue, #274b84);
        outline: none;
      }

      .words-action-choice.correct {
        border-color: #3f8f5b;
        background: #eef9f1;
      }

      .words-action-choice.incorrect {
        border-color: #bc5145;
        background: #fff1ef;
      }

      .words-action-choice:disabled {
        cursor: default;
      }

      .words-action-feedback {
        min-height: 82px;
        margin: 20px 0 0;
        color: var(--blue-dark, #274b84);
        font-weight: 850;
        line-height: 1.45;
        text-align: center;
      }

      .words-action-feedback strong {
        display: block;
        margin-top: 7px;
        color: #337a4d;
        font-size: clamp(
          1.25rem,
          3vw,
          1.8rem
        );
      }

      .words-action-feedback span {
        display: block;
        margin-top: 4px;
        color: var(--muted, #66758d);
        font-size: 0.9rem;
        font-weight: 550;
      }

      .words-action-next {
        display: block;
        margin: 14px auto 0;
      }

      .words-action-empty {
        padding: 28px;
        color: var(--blue-dark, #274b84);
        text-align: center;
      }

      .words-action-empty span {
        display: block;
        margin-top: 5px;
        color: var(--muted, #66758d);
      }

      body.hide-english
      .words-action-heading p,
      body.hide-english
      .words-action-feedback span {
        display: none;
      }

      .words-action-expansion {
        margin: 18px 0 4px;
        padding: 18px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 20px;
        background: #f8fbff;
      }

      .words-action-expansion[hidden] {
        display: none;
      }

      .words-action-expansion-heading {
        margin: 0 0 5px;
        color: var(--blue-dark, #274b84);
        font-size: 1.08rem;
        font-weight: 900;
        text-align: center;
      }

      .words-action-expansion-note {
        margin: 0 0 14px;
        color: var(--muted, #66758d);
        font-size: 0.9rem;
        text-align: center;
      }

      .words-action-expansion-tools {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 14px;
      }

      .words-action-expand-button {
        min-height: 50px;
        padding: 10px 12px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 15px;
        background: white;
        color: var(--blue-dark, #274b84);
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .words-action-expand-button:hover,
      .words-action-expand-button:focus-visible,
      .words-action-expand-button.is-active {
        border-color:
          var(--blue, #4774b8);
        background: #eef5ff;
        outline: none;
      }

      .words-action-modifier-panel {
        margin-top: 12px;
      }

      .words-action-modifier-panel[hidden] {
        display: none;
      }

      .words-action-modifier-label {
        display: block;
        margin: 0 0 8px;
        color: var(--blue-dark, #274b84);
        font-weight: 850;
        text-align: center;
      }

      .words-action-modifier-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .words-action-modifier {
        padding: 8px 11px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 999px;
        background: white;
        color: var(--blue-dark, #274b84);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .words-action-modifier:hover,
      .words-action-modifier:focus-visible,
      .words-action-modifier.is-selected {
        border-color: #4f79b8;
        background: #eaf2ff;
        outline: none;
      }

      .words-action-expanded-sentence {
        margin: 16px 0 0;
        padding: 13px 14px;
        border-radius: 15px;
        background: white;
        color: #337a4d;
        font-size: clamp(
          1.08rem,
          2.5vw,
          1.35rem
        );
        font-weight: 900;
        text-align: center;
      }

      .words-action-expanded-audio {
        display: block;
        margin: 10px auto 0;
        border: 0;
        background: transparent;
        color: var(--blue-dark, #274b84);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }


      .words-action-guided-expansion {
        margin: 14px auto 18px;
        padding: 14px;
        border-radius: 18px;
        background: white;
        text-align: center;
      }

      .words-action-guided-label {
        margin: 0 0 10px;
        color: var(--blue-dark, #274b84);
        font-weight: 850;
      }

      .words-action-guided-image {
        display: block;
        width: min(100%, 460px);
        max-height: 330px;
        margin: 0 auto 12px;
        object-fit: contain;
        border-radius: 16px;
      }

      .words-action-guided-sentence {
        margin: 8px 0 0;
        color: #337a4d;
        font-size: clamp(
          1.08rem,
          2.5vw,
          1.35rem
        );
        font-weight: 900;
      }

      .words-action-guided-audio {
        margin: 10px auto 0;
        border: 0;
        background: transparent;
        color: var(--blue-dark, #274b84);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }


      @media (max-width: 1050px) {
        .activity-menu {
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
        }
      }

      @media (max-width: 620px) {
        .activity-menu {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .words-action-card {
          padding: 18px;
        }

        .words-action-choice-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ========================================
     GAME STATE
     ======================================== */

  let currentWordsItem = null;
  let wordsAnswered = false;

  function shuffleWordsAction(items) {
    return [...items].sort(
      () => Math.random() - 0.5
    );
  }

  function getVocabulary() {
    /*
      currentVocabulary is declared in
      script.js and is available to this
      classic script when this file is
      loaded after script.js.
    */
    if (
      typeof currentVocabulary ===
        "undefined" ||
      !Array.isArray(currentVocabulary)
    ) {
      return [];
    }

    return currentVocabulary;
  }

  function buildWordsChoices(
  correctItem,
  vocabularyPool = getVocabulary()
) {
  const incorrectChoices =
    shuffleWordsAction(
      vocabularyPool.filter(
        item => item !== correctItem
      )
    ).slice(0, 3);

  return shuffleWordsAction([
    correctItem,
    ...incorrectChoices
  ]);
}
function getCarrierPhrase() {

  if (
    typeof carrierPhrases === "undefined"
  ) {
    return null;
  }

  const phrases =
    carrierPhrases[currentTopicKey];

  if (
    !phrases ||
    !phrases.length
  ) {
    return null;
  }

  return phrases[
    Math.floor(
      Math.random() * phrases.length
    )
  ];
}

function isPluralWordsItem(item) {
  const italian =
    String(item?.italian || "")
      .trim()
      .toLowerCase();

  return /^(i|gli|le)\s/.test(italian);
}

function chooseCarrierPhraseForWordsItem(
  item
) {
  if (
    typeof carrierPhrases === "undefined"
  ) {
    return null;
  }

  const phrases =
    carrierPhrases[currentTopicKey];

  if (
    !Array.isArray(phrases) ||
    !phrases.length
  ) {
    return null;
  }

  const compatible =
    phrases.filter(carrier => {
      if (
        currentTopicKey === "food"
      ) {
        if (
          carrier.id === "bevo" &&
          item?.type !== "drink"
        ) {
          return false;
        }

        if (
          carrier.id === "mangio" &&
          item?.type !== "food"
        ) {
          return false;
        }
      }

      if (
        carrier.id === "piace" &&
        isPluralWordsItem(item)
      ) {
        return false;
      }

      return true;
    });

  const pool =
    compatible.length
      ? compatible
      : phrases;

  return pool[
    Math.floor(
      Math.random() * pool.length
    )
  ];
}

function drawWordsTarget(
  items,
  onRestart
) {
  const draw =
    window.PrimoVoloPracticeRounds
      .next(
        "words-in-action",
        currentTopicKey,
        items
      );

  if (draw.complete) {
    window.PrimoVoloPracticeRounds
      .renderComplete(
        wordsActivity,
        {
          activity: "words-in-action",
          topicKey: currentTopicKey,
          total: draw.total,
          onRestart
        }
      );

    return null;
  }

  return draw.item;
}

  function speakSentence(sentence) {
    if (
      typeof speakItalian === "function"
    ) {
      speakItalian(sentence);
    }
  }

  function saveWordsAttempt(isCorrect) {
    /*
      This automatically connects to the
      Progress feature when recordAttempt()
      exists in your current script.
    */
    if (
      typeof recordAttempt === "function"
    ) {
      recordAttempt(
        "words-in-action",
        isCorrect
      );
    }
  }
function showGreetingsWordsQuestion() {
  const age =
    Number(window.getVoloAge?.()) || 1;

  const responses = [
    {
      id: "name",
      italian: "Mi chiamo Volo.",
      image:
        "images/introductions/introductions-02.png"
    },
    {
      id: "place",
      italian: "Sono di Roma.",
      image:
        "images/introductions/introductions-03.png"
    },
    {
      id: "age",
      italian: `Ho ${age} anni.`,
      image:
        "images/introductions/introductions-04.png"
    },
    {
      id: "feeling",
      italian: "Sto bene, grazie.",
      image:
        "images/introductions/introductions-05.png"
    }
  ];

  const questions = [
    {
      question: "Come ti chiami?",
      correctId: "name",
      image:
        "images/introductions/introductions-02.png"
    },
    {
      question: "Di dove sei?",
      correctId: "place",
      image:
        "images/introductions/introductions-03.png"
    },
    {
      question: "Quanti anni hai?",
      correctId: "age",
      image:
        "images/introductions/introductions-04.png"
    },
    {
      question: "Come stai?",
      correctId: "feeling",
      image:
        "images/introductions/introductions-05.png"
    }
  ];

  const currentQuestion =
    drawWordsTarget(
      questions,
      showGreetingsWordsQuestion
    );

  if (!currentQuestion) {
    return;
  }

  const choices =
    shuffleWordsAction(responses);

  wordsAnswered = false;

  wordsActivity.innerHTML = `
    <div class="words-action-card">

      <div class="words-action-heading">
        <h4>
          💬 Parole in azione
        </h4>

        <p>
          Scegli la risposta di Volo.
          · Choose Volo's response.
        </p>
      </div>

      <div class="words-action-frame">
        <button
          type="button"
          id="greetingsQuestionAudio"
          class="introductions-question-audio"
        >
          🔊 ${currentQuestion.question}
        </button>
      </div>

      <div class="words-action-image-frame">
        <img
          src="${currentQuestion.image}"
          alt=""
        >
      </div>

      <div
        class="words-action-choice-grid"
        aria-label="Italian response choices"
      >
        ${choices.map(response => `
          <button
            type="button"
            class="words-action-choice"
            data-response-id="${response.id}"
          >
            ${response.italian}
          </button>
        `).join("")}
      </div>

      <p
        id="wordsActionFeedback"
        class="words-action-feedback"
        aria-live="polite"
      >
        Ascolta la domanda e scegli
        la risposta corretta.

        <span>
          Listen to the question and
          choose the correct response.
        </span>
      </p>

      <button
        type="button"
        id="nextWordsAction"
        class="
          next-question-button
          words-action-next
        "
        hidden
      >
        Prossima domanda · Next Question
      </button>

    </div>
  `;

  const audioButton =
    wordsActivity.querySelector(
      "#greetingsQuestionAudio"
    );

  const choiceButtons =
    wordsActivity.querySelectorAll(
      ".words-action-choice"
    );

  const feedback =
    wordsActivity.querySelector(
      "#wordsActionFeedback"
    );

  const nextButton =
    wordsActivity.querySelector(
      "#nextWordsAction"
    );

  audioButton.addEventListener(
    "click",
    () => {
      speakSentence(
        currentQuestion.question
      );
    }
  );

  choiceButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        if (wordsAnswered) {
          return;
        }

        const selectedId =
          button.dataset.responseId;

        const selectedResponse =
          responses.find(
            response =>
              response.id === selectedId
          );

        const isCorrect =
          selectedId ===
          currentQuestion.correctId;

        saveWordsAttempt(isCorrect);

        if (!isCorrect) {
          button.classList.add(
            "incorrect"
          );

          button.disabled = true;

          feedback.innerHTML = `
            Riprova.

            <span>
              Try another response.
            </span>
          `;

          speakSentence(
            selectedResponse.italian
          );

          return;
        }

        wordsAnswered = true;

        button.classList.add("correct");

        choiceButtons.forEach(choice => {
          choice.disabled = true;
        });

        const completeExchange =
          `${currentQuestion.question} ` +
          `${selectedResponse.italian}`;

        feedback.innerHTML = `
          Corretto!

          <strong>
            ${currentQuestion.question}<br>
            ${selectedResponse.italian}
          </strong>

          <span>
            Correct! Listen to the
            complete exchange.
          </span>
        `;

        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              completeExchange,
              "Ascolta lo scambio di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;

        speakSentence(
          completeExchange
        );
      }
    );
  });

  nextButton.addEventListener(
    "click",
    showGreetingsWordsQuestion
  );

  window.setTimeout(
    () => {
      speakSentence(
        currentQuestion.question
      );
    },
    350
  );
}
function showSeasonsWordsQuestion() {
  const seasonsVocabulary =
    getVocabulary();

  if (!seasonsVocabulary.length) {
    return;
  }

  const currentSeason =
    drawWordsTarget(
      seasonsVocabulary,
      showSeasonsWordsQuestion
    );

  if (!currentSeason) {
    return;
  }

  const choices =
    shuffleWordsAction(
      seasonsVocabulary
    );

  wordsAnswered = false;

  wordsActivity.innerHTML = `
    <div class="words-action-card">

      <div class="words-action-heading">
        <h4>
          💬 Parole in azione
        </h4>

        <p>
          Che stagione è? ·
          What season is it?
        </p>
      </div>

      <div class="words-action-frame">
        <button
          type="button"
          id="seasonQuestionAudio"
          class="introductions-question-audio"
        >
          🔊 Che stagione è?
        </button>
      </div>

      <div class="words-action-image-frame">
        <img
          src="${currentSeason.image}"
          alt="${currentSeason.english}"
        >
      </div>

      <div
        class="words-action-choice-grid"
        aria-label="Season choices"
      >
        ${choices.map(item => `
          <button
            type="button"
            class="words-action-choice"
            data-answer="${item.italian}"
          >
            È ${item.italian}.
          </button>
        `).join("")}
      </div>

      <p
        id="wordsActionFeedback"
        class="words-action-feedback"
        aria-live="polite"
      >
        Scegli la risposta corretta.

        <span>
          Choose the correct response.
        </span>
      </p>

      <button
        type="button"
        id="nextWordsAction"
        class="
          next-question-button
          words-action-next
        "
        hidden
      >
        Prossima domanda · Next Question
      </button>

    </div>
  `;

  const audioButton =
    wordsActivity.querySelector(
      "#seasonQuestionAudio"
    );

  const choiceButtons =
    wordsActivity.querySelectorAll(
      ".words-action-choice"
    );

  const feedback =
    wordsActivity.querySelector(
      "#wordsActionFeedback"
    );

  const nextButton =
    wordsActivity.querySelector(
      "#nextWordsAction"
    );

  audioButton.addEventListener(
    "click",
    () => {
      speakSentence(
        "Che stagione è?"
      );
    }
  );

  choiceButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        if (wordsAnswered) {
          return;
        }

        const isCorrect =
          button.dataset.answer ===
          currentSeason.italian;

        saveWordsAttempt(isCorrect);

        if (!isCorrect) {
          button.classList.add(
            "incorrect"
          );

          button.disabled = true;

          feedback.innerHTML = `
            Riprova.

            <span>
              Try another response.
            </span>
          `;

          return;
        }

        wordsAnswered = true;

        button.classList.add("correct");

        choiceButtons.forEach(choice => {
          choice.disabled = true;
        });

        const answer =
          `È ${currentSeason.italian}.`;

        const completeExchange =
          `Che stagione è? ${answer}`;

        feedback.innerHTML = `
          Corretto!

          <strong>
            Che stagione è?<br>
            ${answer}
          </strong>

          <span>
            Correct! Listen to the
            complete exchange.
          </span>
        `;

        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              completeExchange,
              "Ascolta lo scambio di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;

        speakSentence(
          completeExchange
        );
      }
    );
  });

  nextButton.addEventListener(
    "click",
    showSeasonsWordsQuestion
  );

  window.setTimeout(
    () => {
      speakSentence(
        "Che stagione è?"
      );
    },
    350
  );
}
function showPlacesWordsQuestion() {
  const vocabulary =
    getVocabulary();

  if (!vocabulary.length) {
    return;
  }

  const currentPlace =
    drawWordsTarget(
      vocabulary,
      showPlacesWordsQuestion
    );

  if (!currentPlace) {
    return;
  }

  const choices =
    buildWordsChoices(currentPlace);

  wordsAnswered = false;

  wordsActivity.innerHTML = `
    <div class="words-action-card">

      <div class="words-action-heading">
        <h4>
          💬 Parole in azione
        </h4>

        <p>
          Che luogo è? · What place is it?
        </p>
      </div>

      <div class="words-action-frame">
        <button
          type="button"
          id="placeQuestionAudio"
          class="introductions-question-audio"
        >
          🔊 Che luogo è?
        </button>
      </div>

      <div class="words-action-image-frame">
        <img
          src="${currentPlace.image}"
          alt="${currentPlace.english}"
        >
      </div>

      <div
        class="words-action-choice-grid"
        aria-label="Place choices"
      >
        ${choices.map(item => `
          <button
            type="button"
            class="words-action-choice"
            data-answer="${item.italian}"
          >
            È ${item.italian}.
          </button>
        `).join("")}
      </div>

      <p
        id="wordsActionFeedback"
        class="words-action-feedback"
        aria-live="polite"
      >
        Scegli la risposta corretta.

        <span>
          Choose the correct response.
        </span>
      </p>

      <button
        type="button"
        id="nextWordsAction"
        class="
          next-question-button
          words-action-next
        "
        hidden
      >
        Prossimo luogo · Next Place
      </button>

    </div>
  `;

  const audioButton =
    wordsActivity.querySelector(
      "#placeQuestionAudio"
    );

  const choiceButtons =
    wordsActivity.querySelectorAll(
      ".words-action-choice"
    );

  const feedback =
    wordsActivity.querySelector(
      "#wordsActionFeedback"
    );

  const nextButton =
    wordsActivity.querySelector(
      "#nextWordsAction"
    );

  audioButton.addEventListener(
    "click",
    () => {
      speakSentence(
        "Che luogo è?"
      );
    }
  );

  choiceButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        if (wordsAnswered) {
          return;
        }

        const isCorrect =
          button.dataset.answer ===
          currentPlace.italian;

        saveWordsAttempt(isCorrect);

        if (!isCorrect) {
          button.classList.add(
            "incorrect"
          );

          button.disabled = true;

          feedback.innerHTML = `
            Riprova.

            <span>
              Try another response.
            </span>
          `;

          return;
        }

        wordsAnswered = true;

        button.classList.add(
          "correct"
        );

        choiceButtons.forEach(choice => {
          choice.disabled = true;
        });

        const answer =
          `È ${currentPlace.italian}.`;

        feedback.innerHTML = `
          Corretto!

          <strong>
            Che luogo è?<br>
            ${answer}
          </strong>

          <span>
            Correct! Listen to the
            complete exchange.
          </span>
        `;

        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              `Che luogo è? ${answer}`,
              "Ascolta lo scambio di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;

        speakSentence(
          `Che luogo è? ${answer}`
        );
      }
    );
  });

  nextButton.addEventListener(
    "click",
    showPlacesWordsQuestion
  );

  window.setTimeout(
    () => {
      speakSentence(
        "Che luogo è?"
      );
    },
    350
  );
}

function showFamilyWordsQuestion() {
  const vocabulary =
    getVocabulary();

  if (!vocabulary.length) {
    return;
  }

  const currentFamilyMember =
    drawWordsTarget(
      vocabulary,
      showFamilyWordsQuestion
    );

  if (!currentFamilyMember) {
    return;
  }

  const choices =
    buildWordsChoices(
      currentFamilyMember
    );

  wordsAnswered = false;

  wordsActivity.innerHTML = `
    <div class="words-action-card">

      <div class="words-action-heading">
        <h4>
          💬 Parole in azione
        </h4>

        <p>
          Chi è? · Who is it?
        </p>
      </div>

      <div class="words-action-frame">
        <button
          type="button"
          id="familyQuestionAudio"
          class="introductions-question-audio"
        >
          🔊 Chi è?
        </button>
      </div>

      <div class="words-action-image-frame">
        <img
          src="${currentFamilyMember.image}"
          alt="${currentFamilyMember.english}"
        >
      </div>

      <div
        class="words-action-choice-grid"
        aria-label="Family identification choices"
      >
        ${choices.map(item => `
          <button
            type="button"
            class="words-action-choice"
            data-answer="${item.italian}"
          >
            È ${item.italian}.
          </button>
        `).join("")}
      </div>

      <p
        id="wordsActionFeedback"
        class="words-action-feedback"
        aria-live="polite"
      >
        Scegli la risposta corretta.

        <span>
          Choose the correct response.
        </span>
      </p>

      <div
        id="wordsActionExpansion"
        class="words-action-expansion"
        hidden
      ></div>

      <button
        type="button"
        id="nextWordsAction"
        class="
          next-question-button
          words-action-next
        "
        hidden
      >
        Prossima persona · Next Person
      </button>

    </div>
  `;

  const audioButton =
    wordsActivity.querySelector(
      "#familyQuestionAudio"
    );

  const choiceButtons =
    wordsActivity.querySelectorAll(
      ".words-action-choice"
    );

  const feedback =
    wordsActivity.querySelector(
      "#wordsActionFeedback"
    );

  const nextButton =
    wordsActivity.querySelector(
      "#nextWordsAction"
    );

  audioButton.addEventListener(
    "click",
    () => {
      speakSentence("Chi è?");
    }
  );

  choiceButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        if (wordsAnswered) {
          return;
        }

        const isCorrect =
          button.dataset.answer ===
          currentFamilyMember.italian;

        saveWordsAttempt(isCorrect);

        if (!isCorrect) {
          button.classList.add(
            "incorrect"
          );

          button.disabled = true;

          feedback.innerHTML = `
            Riprova.

            <span>
              Try another response.
            </span>
          `;

          return;
        }

        wordsAnswered = true;

        button.classList.add(
          "correct"
        );

        choiceButtons.forEach(choice => {
          choice.disabled = true;
        });

        const answer =
          `È ${currentFamilyMember.italian}.`;

        const completeExchange =
          `Chi è? ${answer}`;

        feedback.innerHTML = `
          Corretto!

          <strong>
            Chi è?<br>
            ${answer}
          </strong>

          <span>
            Correct! Listen to the
            complete exchange.
          </span>
        `;

        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              completeExchange,
              "Ascolta lo scambio di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;

        speakSentence(
          completeExchange
        );

        showGuidedCombinedExpansion(
          "family",
          currentFamilyMember
        );
      }
    );
  });

  nextButton.addEventListener(
    "click",
    showFamilyWordsQuestion
  );

  window.setTimeout(
    () => {
      speakSentence("Chi è?");
    },
    350
  );
}

function showRoutinesWordsQuestion() {
  const vocabulary = getVocabulary();

  if (!vocabulary.length) {
    wordsActivity.innerHTML = `
      <div class="words-action-empty">
        Nessuna routine disponibile.
        <span>
          No routines are available.
        </span>
      </div>
    `;
    return;
  }

  const currentItem =
    drawWordsTarget(
      vocabulary,
      showRoutinesWordsQuestion
    );

  if (!currentItem) {
    return;
  }

  const choices =
    buildWordsChoices(
      currentItem,
      vocabulary
    );

  wordsAnswered = false;

  const question =
    "Che cosa fai?";

  wordsActivity.innerHTML = `
    <div class="words-action-card">

      <div class="words-action-heading">
        <h4>
          💬 Parole in azione
        </h4>

        <p>
          Che cosa fai? · What do you do?
        </p>
      </div>

      <div class="words-action-frame">
        <button
          type="button"
          id="routineQuestionAudio"
          class="introductions-question-audio"
        >
          🔊 ${question}
        </button>
      </div>

      <div class="words-action-image-frame">
        <img
          src="${currentItem.image}"
          alt="${currentItem.english}"
        >
      </div>

      <div
        class="words-action-choice-grid"
        aria-label="Italian routine choices"
      >
        ${choices.map(item => `
          <button
            type="button"
            class="words-action-choice"
            data-answer="${item.italian}"
          >
            ${item.italian}
          </button>
        `).join("")}
      </div>

      <p
        id="wordsActionFeedback"
        class="words-action-feedback"
        aria-live="polite"
      >
        Scegli la risposta corretta.

        <span>
          Choose the correct response.
        </span>
      </p>

      <button
        type="button"
        id="nextWordsAction"
        class="
          next-question-button
          words-action-next
        "
        hidden
      >
        Prossima domanda · Next Question
      </button>

    </div>
  `;

  const audioButton =
    wordsActivity.querySelector(
      "#routineQuestionAudio"
    );

  const choiceButtons =
    wordsActivity.querySelectorAll(
      ".words-action-choice"
    );

  const feedback =
    wordsActivity.querySelector(
      "#wordsActionFeedback"
    );

  const nextButton =
    wordsActivity.querySelector(
      "#nextWordsAction"
    );

  audioButton.addEventListener(
    "click",
    () => {
      speakSentence(question);
    }
  );

  choiceButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        if (wordsAnswered) {
          return;
        }

        const isCorrect =
          button.dataset.answer ===
          currentItem.italian;

        saveWordsAttempt(isCorrect);

        if (!isCorrect) {
          button.classList.add(
            "incorrect"
          );

          button.disabled = true;

          feedback.innerHTML = `
            Riprova.

            <span>
              Try another response.
            </span>
          `;

          return;
        }

        wordsAnswered = true;

        button.classList.add(
          "correct"
        );

        choiceButtons.forEach(choice => {
          choice.disabled = true;
        });

        feedback.innerHTML = `
          Corretto!

          <strong>
            ${currentItem.italian}
          </strong>

          <span>
            Correct! Listen to the
            complete exchange.
          </span>
        `;

        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              `${question} ${currentItem.italian}`,
              "Ascolta lo scambio di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;

        speakSentence(
          `${question} ${currentItem.italian}`
        );
      }
    );
  });

  nextButton.addEventListener(
    "click",
    showRoutinesWordsQuestion
  );

  window.setTimeout(
    () => {
      speakSentence(question);
    },
    350
  );
}

const combinedExpansionTargets = Object.freeze({
  family: Object.freeze({
    "la nonna": [
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/nonna-bassa-rossa.png",
        sentence:
          "La nonna è bassa e rossa."
      }
    ],

    "il nonno": [
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/nonno-alto-rosso.png",
        sentence:
          "Il nonno è alto e rosso."
      }
    ],

    "la mamma": [
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/mamma-alta-blu.png",
        sentence:
          "La mamma è alta e blu."
      }
    ],

    "il papà": [
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/papa-alto-verde.png",
        sentence:
          "Il papà è alto e verde."
      }
    ],

    "il fratello": [
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/fratello-alto-giallo.png",
        sentence:
          "Il fratello è alto e giallo."
      },
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/fratello-basso-verde.png",
        sentence:
          "Il fratello è basso e verde."
      }
    ],

    "la sorella": [
      {
        image:
          "images/combined-adjectives/family-combined-adjectives/sorella-bassa-blu.png",
        sentence:
          "La sorella è bassa e blu."
      }
    ]
  }),

  animals: Object.freeze({
    "il cane": [
      {
        image:
          "images/combined-adjectives/animals-combined/cane-grande-giallo.png",
        sentence:
          "Il cane è grande e giallo."
      },
      {
        image:
          "images/combined-adjectives/animals-combined/cane-piccolo-giallo.png",
        sentence:
          "Il cane è piccolo e giallo."
      }
    ],

    "la capra": [
      {
        image:
          "images/combined-adjectives/animals-combined/capra-grande-bianca.png",
        sentence:
          "La capra è grande e bianca."
      }
    ],

    "il coniglio": [
      {
        image:
          "images/combined-adjectives/animals-combined/coniglio-grande-grigio.png",
        sentence:
          "Il coniglio è grande e grigio."
      }
    ],

    "il gatto": [
      {
        image:
          "images/combined-adjectives/animals-combined/gatto-grande-grigio.png",
        sentence:
          "Il gatto è grande e grigio."
      }
    ],

    "il maiale": [
      {
        image:
          "images/combined-adjectives/animals-combined/maiale-grande-rosa.png",
        sentence:
          "Il maiale è grande e rosa."
      },
      {
        image:
          "images/combined-adjectives/animals-combined/maiale-piccolo-marrone.png",
        sentence:
          "Il maiale è piccolo e marrone."
      }
    ],

    "la mucca": [
      {
        image:
          "images/combined-adjectives/animals-combined/mucca-piccola-marrone.png",
        sentence:
          "La mucca è piccola e marrone."
      }
    ],

    "la tartaruga": [
      {
        image:
          "images/combined-adjectives/animals-combined/tartaruga-grande-verde.png",
        sentence:
          "La tartaruga è grande e verde."
      }
    ],

    "l'uccello": [
      {
        image:
          "images/combined-adjectives/animals-combined/uccello-grande-blu.png",
        sentence:
          "L'uccello è grande e blu."
      }
    ]
  }),

  clothing: Object.freeze({
    "la camicia": [
      {
        image:
          "images/combined-adjectives/clothing-combined/camicia-grande-rossa.png",
        sentence:
          "La camicia è grande e rossa."
      }
    ],

    "il cappello": [
      {
        image:
          "images/combined-adjectives/clothing-combined/cappello-grande-viola.png",
        sentence:
          "Il cappello è grande e viola."
      }
    ],

    "il cappotto": [
      {
        image:
          "images/combined-adjectives/clothing-combined/cappotto-grande-blu.png",
        sentence:
          "Il cappotto è grande e blu."
      }
    ],

    "i pantaloni": [
      {
        image:
          "images/combined-adjectives/clothing-combined/pantaloni-grandi-verdi.png",
        sentence:
          "I pantaloni sono grandi e verdi."
      }
    ],

    "il vestito": [
      {
        image:
          "images/combined-adjectives/clothing-combined/vestito-grande-rosa.png",
        sentence:
          "Il vestito è grande e rosa."
      }
    ]
  })
});

function getCombinedExpansionTarget(
  topicKey,
  noun
) {
  const topicTargets =
    combinedExpansionTargets[
      topicKey
    ];

  if (
    !topicTargets ||
    !noun?.italian
  ) {
    return null;
  }

  const options =
    topicTargets[noun.italian];

  if (
    !Array.isArray(options) ||
    !options.length
  ) {
    return null;
  }

  return options[
    Math.floor(
      Math.random() *
      options.length
    )
  ];
}

function getGuidedTargetParts(
  target
) {
  if (!target?.sentence) {
    return null;
  }

  const match =
    target.sentence.match(
      /(?:è|sono)\s+(.+?)\s+e\s+(.+?)\.$/i
    );

  if (!match) {
    return null;
  }

  return {
    adjective: match[1].trim(),
    color: match[2].trim()
  };
}

function getGuidedOppositeAdjective(
  noun,
  adjective
) {
  const opposites = {
    alto: "basso",
    alta: "bassa",
    basso: "alto",
    bassa: "alta"
  };

  if (opposites[adjective]) {
    return opposites[adjective];
  }

  const phrase =
    noun?.italian
      ?.trim()
      .toLowerCase() || "";

  const feminine =
    phrase.startsWith("la ") ||
    phrase.startsWith("le ");

  const plural =
    phrase.startsWith("i ") ||
    phrase.startsWith("gli ") ||
    phrase.startsWith("le ");

  if (
    adjective === "grande" ||
    adjective === "grandi"
  ) {
    if (plural) {
      return feminine
        ? "piccole"
        : "piccoli";
    }

    return feminine
      ? "piccola"
      : "piccolo";
  }

  if (
    adjective.startsWith("piccol")
  ) {
    return plural
      ? "grandi"
      : "grande";
  }

  return null;
}

function shuffleGuidedChoices(
  choices
) {
  return [...choices].sort(
    () => Math.random() - 0.5
  );
}

function getGuidedAdjectiveChoices(
  noun,
  correct
) {
  const opposite =
    getGuidedOppositeAdjective(
      noun,
      correct
    );

  return shuffleGuidedChoices(
    [
      correct,
      opposite
    ].filter(Boolean)
  );
}

function getGuidedColorChoices(
  correct
) {
  const distractors = [
    "blu",
    "rosa",
    "viola"
  ];

  const choices = [correct];

  for (const color of distractors) {
    if (
      color !== correct &&
      choices.length < 4
    ) {
      choices.push(color);
    }
  }

  return shuffleGuidedChoices(
    choices
  );
}

function buildGuidedCombinedExpansionMarkup(
  target,
  noun
) {
  const parts =
    getGuidedTargetParts(
      target
    );

  if (!parts) {
    return "";
  }

  const adjectiveChoices =
    getGuidedAdjectiveChoices(
      noun,
      parts.adjective
    );

  const colorChoices =
    getGuidedColorChoices(
      parts.color
    );

  return `
    <div class="words-action-guided-expansion">

      <p class="words-action-guided-label">
        👀 Guarda l’immagine
        · Look at the image
      </p>

      <img
        class="words-action-guided-image"
        src="${target.image}"
        alt=""
      >

      <div
        class="words-action-guided-step"
        id="guidedAdjectiveStep"
      >
        <p class="words-action-modifier-label">
          1. Com’è?
          · Choose the adjective
        </p>

        <div class="words-action-modifier-grid">
          ${adjectiveChoices.map(
            choice => `
              <button
                type="button"
                class="words-action-modifier"
                data-guided-adjective="${choice}"
              >
                ${choice}
              </button>
            `
          ).join("")}
        </div>
      </div>

      <div
        class="words-action-guided-step"
        id="guidedColorStep"
        hidden
      >
        <p class="words-action-modifier-label">
          2. Di che colore è?
          · Choose the color
        </p>

        <div class="words-action-modifier-grid">
          ${colorChoices.map(
            choice => `
              <button
                type="button"
                class="words-action-modifier"
                data-guided-color="${choice}"
              >
                ${choice}
              </button>
            `
          ).join("")}
        </div>
      </div>

      <div
        id="guidedExpansionResult"
        hidden
      >
        <p class="words-action-guided-sentence">
          ${target.sentence}
        </p>

        <button
          type="button"
          class="words-action-guided-audio"
          data-guided-expansion-audio
        >
          🔊 Ascolta · Listen
        </button>
      </div>

    </div>
  `;
}

function wireGuidedCombinedExpansionChoices(
  container,
  target,
  noun
) {
  const parts =
    getGuidedTargetParts(
      target
    );

  if (!parts) {
    return;
  }

  const colorStep =
    container.querySelector(
      "#guidedColorStep"
    );

  const result =
    container.querySelector(
      "#guidedExpansionResult"
    );

  container
    .querySelectorAll(
      "[data-guided-adjective]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const choice =
            button.dataset
              .guidedAdjective;

          if (
            choice !==
            parts.adjective
          ) {
            button.classList.add(
              "incorrect"
            );

            window.setTimeout(
              () => {
                button.classList.remove(
                  "incorrect"
                );
              },
              500
            );

            return;
          }

          container
            .querySelectorAll(
              "[data-guided-adjective]"
            )
            .forEach(choiceButton => {
              choiceButton.disabled =
                true;
            });

          button.classList.add(
            "correct"
          );

          colorStep.hidden = false;

          speakSentence(
            parts.adjective
          );
        }
      );
    });

  container
    .querySelectorAll(
      "[data-guided-color]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const choice =
            button.dataset
              .guidedColor;

          if (
            choice !==
            parts.color
          ) {
            button.classList.add(
              "incorrect"
            );

            window.setTimeout(
              () => {
                button.classList.remove(
                  "incorrect"
                );
              },
              500
            );

            return;
          }

          container
            .querySelectorAll(
              "[data-guided-color]"
            )
            .forEach(choiceButton => {
              choiceButton.disabled =
                true;
            });

          button.classList.add(
            "correct"
          );

          result.hidden = false;

          speakSentence(
            target.sentence
          );
        }
      );
    });

  const audioButton =
    container.querySelector(
      "[data-guided-expansion-audio]"
    );

  audioButton?.addEventListener(
    "click",
    () => {
      speakSentence(
        target.sentence
      );
    }
  );
}

function showGuidedCombinedExpansion(
  topicKey,
  noun
) {
  const container =
    wordsActivity.querySelector(
      "#wordsActionExpansion"
    );

  if (!container) {
    return;
  }

  const target =
    getCombinedExpansionTarget(
      topicKey,
      noun
    );

  if (!target) {
    return;
  }

  container.innerHTML = `
    <button
      type="button"
      id="openWordsExpansion"
      class="words-action-expand-button"
    >
      ✨ Espandi la frase
      · Expand the sentence
    </button>

    <div
      id="guidedWordsExpansion"
      hidden
    >
      <p class="words-action-expansion-note">
        Guarda e aggiungi due dettagli.
        · Look and add two details.
      </p>

      ${buildGuidedCombinedExpansionMarkup(
        target,
        noun
      )}
    </div>
  `;

  container.hidden = false;

  const openButton =
    container.querySelector(
      "#openWordsExpansion"
    );

  const expansion =
    container.querySelector(
      "#guidedWordsExpansion"
    );

  openButton.addEventListener(
    "click",
    () => {
      openButton.hidden = true;
      expansion.hidden = false;

      wireGuidedCombinedExpansionChoices(
        container,
        target,
        noun
      );
    }
  );
}


function showClothingSentenceExpansion(
  carrier,
  noun
) {
  if (
    currentTopicKey !== "clothing" ||
    !window.PrimoVoloAgreement ||
    typeof colors === "undefined" ||
    typeof adjectives === "undefined"
  ) {
    return;
  }

  const container =
    wordsActivity.querySelector(
      "#wordsActionExpansion"
    );

  if (!container) {
    return;
  }

  const guidedTarget =
    getCombinedExpansionTarget(
      "clothing",
      noun
    );

  if (guidedTarget) {
    showGuidedCombinedExpansion(
      "clothing",
      noun
    );

    return;
  }

  const compatibleAdjectives =
    new Set(
      Array.isArray(
        noun.compatibleAdjectives
      )
        ? noun.compatibleAdjectives
        : []
    );

  const clothingAdjectives =
    adjectives.filter(
      item =>
        compatibleAdjectives.has(
          item.italian
        )
    );

  let selectedColor = null;
  let selectedAdjective = null;

  const carrierText =
    carrier.italian
      .replace("...", "")
      .trim();

  function buildSentence() {
    const nounPhrase =
      window.PrimoVoloAgreement
        .buildModifiedNounPhrase(
          noun,
          {
            color: selectedColor,
            adjective:
              selectedAdjective
          }
        );

    return `${carrierText} ${nounPhrase}.`;
  }

  function updatePreview() {
    const preview =
      container.querySelector(
        "#wordsActionExpandedSentence"
      );

    if (preview) {
      preview.textContent =
        buildSentence();
    }
  }

  function modifierButton(
    item,
    kind
  ) {
    const form =
      window.PrimoVoloAgreement
        .getModifierForm(
          item,
          noun
        );

    return `
      <button
        type="button"
        class="words-action-modifier"
        data-modifier-kind="${kind}"
        data-modifier-word="${item.italian}"
      >
        ${form}
      </button>
    `;
  }

  container.innerHTML = `
    <p class="words-action-expansion-heading">
      ✨ Espandi la frase
      · Expand the sentence
    </p>

    <p class="words-action-expansion-note">
      Aggiungi un dettaglio, se vuoi.
      · Add a detail if you want.
    </p>

    ${buildGuidedCombinedExpansionMarkup(
      guidedTarget
    )}

    <div class="words-action-expansion-tools">
      <button
        type="button"
        id="addWordsColor"
        class="words-action-expand-button"
      >
        🎨 + Colore · Color
      </button>

      <button
        type="button"
        id="addWordsAdjective"
        class="words-action-expand-button"
      >
        🔎 + Aggettivo · Adjective
      </button>
    </div>

    <div
      id="wordsColorPanel"
      class="words-action-modifier-panel"
      hidden
    >
      <span
        class="words-action-modifier-label"
      >
        Scegli un colore · Choose a color
      </span>

      <div class="words-action-modifier-grid">
        ${colors.map(
          item =>
            modifierButton(
              item,
              "color"
            )
        ).join("")}
      </div>
    </div>

    <div
      id="wordsAdjectivePanel"
      class="words-action-modifier-panel"
      hidden
    >
      <span
        class="words-action-modifier-label"
      >
        Scegli un aggettivo
        · Choose an adjective
      </span>

      <div class="words-action-modifier-grid">
        ${clothingAdjectives.map(
          item =>
            modifierButton(
              item,
              "adjective"
            )
        ).join("")}
      </div>
    </div>

    <p
      id="wordsActionExpandedSentence"
      class="words-action-expanded-sentence"
    >
      ${buildSentence()}
    </p>

    <button
      type="button"
      id="wordsActionExpandedAudio"
      class="words-action-expanded-audio"
    >
      🔊 Ascolta · Listen
    </button>
  `;

  container.hidden = false;

  wireGuidedCombinedExpansionAudio(
    container,
    guidedTarget
  );

  const colorToggle =
    container.querySelector(
      "#addWordsColor"
    );

  const adjectiveToggle =
    container.querySelector(
      "#addWordsAdjective"
    );

  const colorPanel =
    container.querySelector(
      "#wordsColorPanel"
    );

  const adjectivePanel =
    container.querySelector(
      "#wordsAdjectivePanel"
    );

  colorToggle.addEventListener(
    "click",
    () => {
      colorPanel.hidden =
        !colorPanel.hidden;

      colorToggle.classList.toggle(
        "is-active",
        !colorPanel.hidden
      );
    }
  );

  adjectiveToggle.addEventListener(
    "click",
    () => {
      adjectivePanel.hidden =
        !adjectivePanel.hidden;

      adjectiveToggle.classList.toggle(
        "is-active",
        !adjectivePanel.hidden
      );
    }
  );

  container
    .querySelectorAll(
      ".words-action-modifier"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const kind =
            button.dataset.modifierKind;

          const word =
            button.dataset.modifierWord;

          const pool =
            kind === "color"
              ? colors
              : clothingAdjectives;

          const selected =
            pool.find(
              item =>
                item.italian === word
            );

          if (!selected) {
            return;
          }

          container
            .querySelectorAll(
              `[data-modifier-kind="${kind}"]`
            )
            .forEach(choice => {
              choice.classList.remove(
                "is-selected"
              );
            });

          button.classList.add(
            "is-selected"
          );

          if (kind === "color") {
            selectedColor = selected;
          } else {
            selectedAdjective =
              selected;
          }

          updatePreview();

          speakSentence(
            buildSentence()
          );
        }
      );
    });

  const audioButton =
    container.querySelector(
      "#wordsActionExpandedAudio"
    );

  audioButton.addEventListener(
    "click",
    () => {
      speakSentence(
        buildSentence()
      );
    }
  );
}


function showWordsQuestion() {
  if (currentTopicKey === "routines") {
    showRoutinesWordsQuestion();
    return;
  }

  if (currentTopicKey === "greetings") {
    showGreetingsWordsQuestion();
    return;
  }

  if (currentTopicKey === "seasons") {
    showSeasonsWordsQuestion();
    return;
  }

  if (currentTopicKey === "places") {
    showPlacesWordsQuestion();
    return;
  }

  if (currentTopicKey === "family") {
    showFamilyWordsQuestion();
    return;
  }

  const vocabulary =
    getVocabulary();

    if (!vocabulary.length) {
      wordsActivity.innerHTML = `
        <div class="words-action-empty">
          Nessun vocabolario disponibile.

          <span>
            No vocabulary is available.
          </span>
        </div>
      `;
      return;
    }

    currentWordsItem =
  drawWordsTarget(
    vocabulary,
    showWordsQuestion
  );

if (!currentWordsItem) {
  return;
}

const carrier =
  chooseCarrierPhraseForWordsItem(
    currentWordsItem
  );

if (!carrier) {
  wordsActivity.innerHTML = `
    <div class="words-action-empty">
      Questa attività non è ancora disponibile
      per questo argomento.

      <span>
        This activity is not yet available
        for this topic.
      </span>
    </div>
  `;

  return;
}

/*
  The primary vocabulary target comes from
  the coverage-first deck. Carrier-phrase
  variation stays random, but is filtered
  so it is compatible with that target.
*/
const compatibleVocabulary =
  (() => {
    let compatible = [...vocabulary];

    if (currentTopicKey === "food") {
      if (carrier.id === "bevo") {
        compatible =
          compatible.filter(
            item => item.type === "drink"
          );
      }

      if (carrier.id === "mangio") {
        compatible =
          compatible.filter(
            item => item.type === "food"
          );
      }
    }

    if (carrier.id === "piace") {
      compatible =
        compatible.filter(item => {
          const italian =
            item.italian
              .trim()
              .toLowerCase();

          return !/^(i|gli|le)\s/.test(
            italian
          );
        });
    }

    return compatible;
  })();

if (
  !compatibleVocabulary.includes(
    currentWordsItem
  )
) {
  wordsActivity.innerHTML = `
    <div class="words-action-empty">
      Nessuna frase compatibile
      con questa parola.

      <span>
        No compatible sentence is
        available for this word.
      </span>
    </div>
  `;

  return;
}

wordsAnswered = false;

const choices =
  buildWordsChoices(
    currentWordsItem,
    compatibleVocabulary
  );

    wordsActivity.innerHTML = `
      <div class="words-action-card">

        <div class="words-action-heading">
          <h4>
            💬 Parole in azione
          </h4>

          <p>
            Words in Action
          </p>
        </div>

        <div class="words-action-frame">

<img
  id="carrierPhraseImage"
  src="${carrier.image}"
  alt="${carrier.italian}"
  class="carrier-phrase-image"
  tabindex="0"
  role="button"
  aria-label="Listen to ${carrier.italian}"
>

</div>

        <div class="words-action-image-frame">
          <img
            src="${currentWordsItem.image}"
            alt="${currentWordsItem.english}"
          >
        </div>

        <div
          class="words-action-choice-grid"
          aria-label="Italian word choices"
        >
          ${choices.map(item => `
            <button
              type="button"
              class="words-action-choice"
              data-answer="${item.italian}"
            >
              ${item.italian}
            </button>
          `).join("")}
        </div>

        <p
          id="wordsActionFeedback"
          class="words-action-feedback"
          aria-live="polite"
        >
          Scegli la parola che completa
          la frase.

          <span>
            Choose the word that
            completes the sentence.
          </span>
        </p>

        <div
          id="wordsActionExpansion"
          class="words-action-expansion"
          hidden
        ></div>

        <button
          type="button"
          id="nextWordsAction"
          class="
            next-question-button
            words-action-next
          "
          hidden
        >
          Prossima frase · Next Sentence
        </button>

      </div>
    `;

    const choiceButtons =
      wordsActivity.querySelectorAll(
        ".words-action-choice"
      );

    const feedback =
      wordsActivity.querySelector(
        "#wordsActionFeedback"
      );

    const nextButton =
      wordsActivity.querySelector(
        "#nextWordsAction"
      );
const carrierImage =
  wordsActivity.querySelector(
    "#carrierPhraseImage"
  );

function playCarrierPhrase() {
  speakSentence(
    carrier.italian
      .replace("...", "")
      .trim()
  );
}

carrierImage.addEventListener(
  "click",
  playCarrierPhrase
);

carrierImage.addEventListener(
  "keydown",
  event => {
    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {
      return;
    }

    event.preventDefault();
    playCarrierPhrase();
  }
);
    choiceButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          if (wordsAnswered) {
            return;
          }

          wordsAnswered = true;

          const isCorrect =
            button.dataset.answer ===
            currentWordsItem.italian;

          saveWordsAttempt(isCorrect);

          choiceButtons.forEach(choice => {
            choice.disabled = true;

            if (
              choice.dataset.answer ===
              currentWordsItem.italian
            ) {
              choice.classList.add(
                "correct"
              );
            }
          });
const carrierText =
  carrier.italian
    .replace("...", "")
    .trim();

    const sentenceItem =
  currentTopicKey === "prepositions" &&
  currentWordsItem.sentenceTail
    ? currentWordsItem.sentenceTail

    : currentTopicKey === "colors" &&
      (
        carrier.id === "vedo" ||
        carrier.id === "piace"
      )
      ? `il ${currentWordsItem.italian}`

    : currentTopicKey === "days" &&
      carrier.id === "piace"
      ? `${
          currentWordsItem.italian ===
          "domenica"
            ? "la"
            : "il"
        } ${currentWordsItem.italian}`

    : currentWordsItem.italian;

const sentence =
  `${carrierText} ${sentenceItem}.`;

          if (isCorrect) {
            feedback.innerHTML = `
              Corretto!

              <strong>
                ${sentence}
              </strong>

              <span>
                Correct! Listen to the
                complete sentence.
              </span>
            `;

            speakSentence(sentence);

            if (
              currentTopicKey ===
                "clothing"
            ) {
              showClothingSentenceExpansion(
                carrier,
                currentWordsItem
              );
            } else if (
              currentTopicKey ===
                "family" ||
              currentTopicKey ===
                "animals"
            ) {
              showGuidedCombinedExpansion(
                currentTopicKey,
                currentWordsItem
              );
            }
          } else {
            button.classList.add(
              "incorrect"
            );

            feedback.innerHTML = `
              La risposta corretta è:

              <strong>
                ${sentence}
              </strong>

              <span>
                The correct sentence is
                shown above.
              </span>
            `;

            speakSentence(sentence);
          }

          feedback.insertAdjacentHTML(
            "beforeend",
            window.PrimoVoloAudio
              .replayButtonMarkup(
                sentence,
                "Ascolta la frase di nuovo · Listen again"
              )
          );

          nextButton.hidden = false;
        }
      );
    });

    nextButton.addEventListener(
      "click",
      showWordsQuestion
    );
  }

  function hideStandardPanels() {
    [
      "#learnActivity",
      "#matchActivity",
      "#listenActivity",
      "#chooseActivity",
      "#completeActivity",
      "#writeActivity",
      "#memoryActivity"
    ].forEach(selector => {
      const panel =
        document.querySelector(selector);

      if (panel) {
        panel.hidden = true;
      }
    });
  }

  function showWordsMode() {
    document
      .querySelectorAll(
        ".activity-button"
      )
      .forEach(button => {
        button.classList.toggle(
          "active",
          button === wordsButton
        );
      });

    hideStandardPanels();

    wordsActivity.hidden = false;

    if (englishToggleControlElement) {
      englishToggleControlElement.hidden =
        true;
    }

    if (learnInstructionsElement) {
      learnInstructionsElement.hidden =
        true;
    }

    showWordsQuestion();
  }

  wordsButton.addEventListener(
    "click",
    showWordsMode
  );

  /*
    When another activity is selected,
    hide the Words in Action panel.
  */
  document
    .querySelectorAll(
      ".activity-button"
    )
    .forEach(button => {
      if (button === wordsButton) {
        return;
      }

      button.addEventListener(
        "click",
        () => {
          wordsActivity.hidden = true;
        }
      );
    });

  /*
    Changing the topic returns the app to
    Learn mode, so hide this panel too.
  */
  if (topicSelectElement) {
    topicSelectElement.addEventListener(
      "change",
      () => {
        wordsActivity.hidden = true;
      }
    );
  }

  /*
    Keep the English visibility behavior
    consistent if the user changes the
    toggle while elsewhere in the app.
  */
  if (englishToggleElement) {
    englishToggleElement.addEventListener(
      "change",
      () => {
        document.body.classList.toggle(
          "hide-english",
          !englishToggleElement.checked
        );
      }
    );
  }
})();
