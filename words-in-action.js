"use strict";

/*
  Primo Volo d'Italiano
  Parole in azione · Words in Action

  Add this file AFTER script.js in index.html:

  <script src="script.js"></script>
  <script src="words-in-action.js"></script>
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
      <span class="activity-icon">
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

  function buildWordsChoices(correctItem) {
    const vocabulary =
      getVocabulary();

    const incorrectChoices =
      shuffleWordsAction(
        vocabulary.filter(
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

  function showWordsQuestion() {
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
  vocabulary[
    Math.floor(
      Math.random() *
      vocabulary.length
    )
  ];

const carrier =
  getCarrierPhrase();

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

wordsAnswered = false;

    const choices =
      buildWordsChoices(
        currentWordsItem
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
  src="${carrier.image.replace("-no-text", "")}"
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

const sentence =
  `${carrierText} ${currentWordsItem.italian}.`;
  

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