"use strict";

/*
  Primo Volo d'Italiano
  Months of the Year sentence support

  Load this file after:
  - words-in-action.js
  - assemble-sentences.js
  - conversation-practice.js
  - days-activities.js

  It adds month-specific versions of:
  - Parole in azione
  - Assembla

  It also keeps the existing
  Mostra l'inglese · Show English
  checkbox visible and uses it to show or
  hide the English month name.
*/

(function initializeMonthsActivities() {
  const wordsButton =
    document.querySelector(
      '[data-mode="words-in-action"]'
    );

  const assembleButton =
    document.querySelector(
      '[data-mode="assemble-sentences"]'
    );

  const main =
    document.querySelector("main.page");

  const englishToggleControlElement =
    document.querySelector(
      "#englishToggleControl"
    );

  const learnInstructionsElement =
    document.querySelector(
      "#learnInstructions"
    );

  if (!wordsButton || !assembleButton || !main) {
    console.error(
      "Months activity support could not start because required page elements are missing."
    );
    return;
  }

  /* ========================================
     MONTH-SPECIFIC STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#monthsActivitiesStyles"
    )
  ) {
    const style =
      document.createElement("style");

    style.id = "monthsActivitiesStyles";

    style.textContent = `
      .month-english-label {
        display: block;
        margin: 7px 0 0;
        color: var(--muted, #66758d);
        font-size: 0.92rem;
        font-weight: 750;
        line-height: 1.2;
        text-align: center;
      }

      .month-choice-english {
        display: block;
        margin-top: 4px;
        color: var(--muted, #66758d);
        font-size: 0.82rem;
        font-weight: 650;
        line-height: 1.15;
      }

      body.hide-english
      .month-english-label,
      body.hide-english
      .month-choice-english,
      body.hide-english
      .month-feedback-english {
        display: none;
      }

      .months-topic
      .months-carrier-visual {
        display: grid;
        place-items: center;
        gap: 6px;
        width: min(210px, 100%);
        margin: 0 auto;
      }

      .months-topic
      .months-carrier-visual img {
        display: block;
        width: min(175px, 100%);
        height: auto;
        object-fit: contain;
      }

      .months-topic
      .months-carrier-text {
        margin: 0;
        color: var(--blue-dark, #274b84);
        font-size: 1.1rem;
        font-weight: 900;
        text-align: center;
      }

      .months-topic
      .words-action-image-frame {
        display: grid;
        place-items: center;
        width: min(280px, 78vw);
        height: auto;
        aspect-ratio: 1;
        margin: 0 auto 18px;
        padding: 10px;
        overflow: hidden;
      }

      .months-topic
      .words-action-image-frame img {
        display: block;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transform: none;
      }

      .months-topic
      .assemble-picture-frame {
        width: min(280px, 100%);
        height: auto;
        aspect-ratio: 1;
        padding: 10px;
        overflow: hidden;
      }

      .months-topic
      .assemble-picture-frame img {
        display: block;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transform: none;
      }

      .months-topic
      .assemble-prompt-row {
        grid-template-columns:
          minmax(150px, 210px)
          minmax(210px, 300px);
        align-items: center;
      }

      @media (max-width: 620px) {
        .months-topic
        .assemble-prompt-row {
          grid-template-columns: 1fr;
          width: min(290px, 100%);
        }

        .months-topic
        .words-action-image-frame {
          width: min(245px, 76vw);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function isMonthsTopic() {
    return (
      typeof currentTopicKey !==
        "undefined" &&
      currentTopicKey === "months"
    );
  }

  function getVocabulary() {
    if (
      typeof currentVocabulary ===
        "undefined" ||
      !Array.isArray(currentVocabulary)
    ) {
      return [];
    }

    return currentVocabulary;
  }

  function getMonthCarriers() {
    if (
      typeof carrierPhrases !==
        "undefined" &&
      carrierPhrases.months &&
      Array.isArray(
        carrierPhrases.months
      )
    ) {
      return carrierPhrases.months;
    }

    /*
      Fallbacks allow the month activities
      to work even before the months entry
      is added to carrier-phrases.js.
    */
    return [
      {
        id: "e",
        italian: "È...",
        english: "It is...",
        image:
          "images/carrier-phrases/e-no-text.png"
      },
      {
        id: "piace",
        italian: "Mi piace...",
        english: "I like...",
        image:
          "images/carrier-phrases/mi-piace-no-text.png"
      }
    ];
  }

  function shuffle(items) {
    const result = [...items];

    for (
      let index = result.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(
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

  function chooseRandom(items) {
    return items[
      Math.floor(Math.random() * items.length)
    ];
  }

  function cleanCarrierText(text) {
    return String(text || "")
      .replace(/\.\.\./g, "")
      .trim();
  }

  function getSentenceTarget(
    item,
    carrier
  ) {
    return (
      item.sentenceForms?.[carrier.id] ||
      item.italian
    );
  }

  function buildItalianSentence(
    item,
    carrier
  ) {
    const carrierText =
      cleanCarrierText(carrier.italian);

    const target =
      getSentenceTarget(item, carrier);

    const sentence =
      `${carrierText} ${target}`
        .replace(/\s+/g, " ")
        .trim();

    return /[.!?]$/.test(sentence)
      ? sentence
      : `${sentence}.`;
  }

  function buildEnglishSentence(
    item,
    carrier
  ) {
    const carrierText =
      cleanCarrierText(carrier.english);

    const sentence =
      `${carrierText} ${item.english}`
        .replace(/\s+/g, " ")
        .trim();

    return /[.!?]$/.test(sentence)
      ? sentence
      : `${sentence}.`;
  }

  function speak(text) {
    if (
      typeof speakItalian === "function"
    ) {
      speakItalian(text);
    }
  }

  function saveAttempt(
    activity,
    correct
  ) {
    if (
      typeof recordAttempt ===
        "function"
    ) {
      recordAttempt(
        activity,
        correct
      );
    }
  }

  function activateButton(
    activeButton
  ) {
    document
      .querySelectorAll(
        ".activity-button"
      )
      .forEach(button => {
        button.classList.toggle(
          "active",
          button === activeButton
        );
      });
  }

  function hideAllPanels() {
    document
      .querySelectorAll(
        `
          .activity-panel,
          #wordsInActionActivity,
          #assembleSentencesActivity,
          #conversationPracticeActivity,
          #introductionsPracticeActivity
        `
      )
      .forEach(panel => {
        panel.hidden = true;
      });
  }

  function prepareActivity(
    activeButton
  ) {
    activateButton(activeButton);
    hideAllPanels();

    /*
      Months retain the existing English
      support checkbox in both activities.
    */
    if (
      englishToggleControlElement
    ) {
      englishToggleControlElement.hidden =
        false;
    }

    if (
      learnInstructionsElement
    ) {
      learnInstructionsElement.hidden =
        true;
    }
  }

  function getOrCreatePanel(
    id,
    className
  ) {
    let panel =
      document.querySelector(`#${id}`);

    if (!panel) {
      panel =
        document.createElement(
          "section"
        );

      panel.id = id;
      panel.className =
        `${className} activity-panel`;

      main.appendChild(panel);
    }

    return panel;
  }

  function carrierImageMarkup(
    carrier,
    extraClass = ""
  ) {
    if (!carrier.image) {
      return "";
    }

    return `
      <img
        src="${carrier.image}"
        alt="${carrier.italian}"
        class="${extraClass}"
      >
    `;
  }

  /* ========================================
     PAROLE IN AZIONE
     ======================================== */

  function renderMonthsWordsInAction() {
    const vocabulary =
      getVocabulary();

    const carriers =
      getMonthCarriers();

    const panel =
      getOrCreatePanel(
        "wordsInActionActivity",
        "words-in-action-activity"
      );

    prepareActivity(wordsButton);
    panel.hidden = false;

    if (
      !vocabulary.length ||
      !carriers.length
    ) {
      panel.innerHTML = `
        <div class="words-action-empty">
          Nessun vocabolario disponibile.

          <span>
            No vocabulary is available.
          </span>
        </div>
      `;

      return;
    }

    const item =
      chooseRandom(vocabulary);

    const carrier =
      chooseRandom(carriers);

    const choices =
      shuffle([
        item,
        ...shuffle(
          vocabulary.filter(
            choice => choice !== item
          )
        ).slice(0, 3)
      ]);

    const italianSentence =
      buildItalianSentence(
        item,
        carrier
      );

    const englishSentence =
      buildEnglishSentence(
        item,
        carrier
      );

    panel.innerHTML = `
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
          <div class="months-carrier-visual">
            ${carrierImageMarkup(carrier)}

            <p class="months-carrier-text">
              ${carrier.italian}
            </p>
          </div>
        </div>

        <div class="words-action-image-frame">
          <img
            src="${item.image}"
            alt="${item.english}"
          >
        </div>

        <p class="month-english-label">
          ${item.english}
        </p>

        <div
          class="words-action-choice-grid"
          aria-label="Italian month choices"
        >
          ${choices.map(choice => `
            <button
              type="button"
              class="words-action-choice"
              data-answer="${choice.italian}"
            >
              ${choice.italian}

              <span class="month-choice-english">
                ${choice.english}
              </span>
            </button>
          `).join("")}
        </div>

        <p
          id="monthsWordsFeedback"
          class="words-action-feedback"
          aria-live="polite"
        >
          Scegli il mese che completa
          la frase.

          <span>
            Choose the month that
            completes the sentence.
          </span>
        </p>

        <button
          type="button"
          id="monthsWordsNext"
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

    const buttons =
      panel.querySelectorAll(
        ".words-action-choice"
      );

    const feedback =
      panel.querySelector(
        "#monthsWordsFeedback"
      );

    const nextButton =
      panel.querySelector(
        "#monthsWordsNext"
      );

    let answered = false;

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          if (answered) {
            return;
          }

          answered = true;

          const correct =
            button.dataset.answer ===
            item.italian;

          saveAttempt(
            "words-in-action",
            correct
          );

          buttons.forEach(choice => {
            choice.disabled = true;

            if (
              choice.dataset.answer ===
              item.italian
            ) {
              choice.classList.add(
                "correct"
              );
            }
          });

          if (!correct) {
            button.classList.add(
              "incorrect"
            );
          }

          feedback.innerHTML = correct
            ? `
                Corretto!

                <strong>
                  ${italianSentence}
                </strong>

                <span class="month-feedback-english">
                  ${englishSentence}
                </span>
              `
            : `
                La risposta corretta è

                <strong>
                  ${italianSentence}
                </strong>

                <span class="month-feedback-english">
                  ${englishSentence}
                </span>
              `;

          feedback.insertAdjacentHTML(
            "beforeend",
            window.PrimoVoloAudio
              .replayButtonMarkup(
                italianSentence,
                "Ascolta la frase di nuovo · Listen again"
              )
          );

          nextButton.hidden = false;
          speak(italianSentence);
        }
      );
    });

    nextButton.addEventListener(
      "click",
      renderMonthsWordsInAction
    );
  }

  /* ========================================
     ASSEMBLA
     ======================================== */

  function sentenceTokens(sentence) {
    return sentence
      .trim()
      .split(/\s+/);
  }

  function shuffleUntilDifferent(
    items
  ) {
    if (items.length < 2) {
      return [...items];
    }

    let shuffled =
      shuffle(items);

    let attempts = 0;

    while (
      shuffled.every(
        (item, index) =>
          item.id === items[index].id
      ) &&
      attempts < 12
    ) {
      shuffled =
        shuffle(items);

      attempts += 1;
    }

    return shuffled;
  }

  function renderMonthsAssemble() {
    const vocabulary =
      getVocabulary();

    const carriers =
      getMonthCarriers();

    const panel =
      getOrCreatePanel(
        "assembleSentencesActivity",
        "assemble-sentences-activity"
      );

    prepareActivity(assembleButton);
    panel.hidden = false;

    if (
      !vocabulary.length ||
      !carriers.length
    ) {
      panel.innerHTML = `
        <div class="assemble-empty">
          Nessun vocabolario disponibile.

          <span>
            No vocabulary is available.
          </span>
        </div>
      `;

      return;
    }

    const item =
      chooseRandom(vocabulary);

    const carrier =
      chooseRandom(carriers);

    const italianSentence =
      buildItalianSentence(
        item,
        carrier
      );

    const englishSentence =
      buildEnglishSentence(
        item,
        carrier
      );

    const correctTokens =
      sentenceTokens(
        italianSentence
      );

    const tileObjects =
      correctTokens.map(
        (token, index) => ({
          id:
            `month-token-${index}`,
          token
        })
      );

    const shuffledTiles =
      shuffleUntilDifferent(
        tileObjects
      );

    let placedCount = 0;
    let hadError = false;
    let complete = false;

    panel.innerHTML = `
      <div class="assemble-card">

        <div class="assemble-heading">
          <h4>
            🧩 Assembla
          </h4>

          <p>
            Assemble the Sentence
          </p>
        </div>

        <div class="assemble-prompt-row">

          <div class="assemble-carrier-visual">
            <div class="months-carrier-visual">
              ${carrierImageMarkup(
                carrier,
                "assemble-carrier-image"
              )}

              <p class="months-carrier-text">
                ${carrier.italian}
              </p>
            </div>
          </div>

          <div>
            <div class="assemble-picture-frame">
              <img
                src="${item.image}"
                alt="${item.english}"
              >
            </div>

            <p class="month-english-label">
              ${item.english}
            </p>
          </div>

        </div>

        <p class="assemble-instruction">
          Tocca le parole nell'ordine corretto.

          <span>
            Tap the words in the correct order.
          </span>
        </p>

        <div
          id="monthsAssembleSentenceArea"
          class="assemble-sentence-area"
          aria-live="polite"
        >
          <span class="assemble-placeholder">
            Costruisci la frase qui.
          </span>
        </div>

        <div
          id="monthsAssembleWordBank"
          class="assemble-word-bank"
          aria-label="Mixed-up sentence words"
        >
          ${shuffledTiles.map(tile => `
            <button
              type="button"
              class="assemble-word-tile"
              data-tile-id="${tile.id}"
            >
              ${tile.token}
            </button>
          `).join("")}
        </div>

        <p
          id="monthsAssembleFeedback"
          class="assemble-feedback"
          aria-live="polite"
        ></p>

        <div class="assemble-actions">

          <button
            type="button"
            id="monthsAssembleReset"
            class="assemble-secondary-button"
          >
            Ricomincia · Start Over
          </button>

          <button
            type="button"
            id="monthsAssembleNext"
            class="next-question-button"
            hidden
          >
            Prossima frase · Next Sentence
          </button>

        </div>

      </div>
    `;

    const area =
      panel.querySelector(
        "#monthsAssembleSentenceArea"
      );

    const buttons =
      panel.querySelectorAll(
        ".assemble-word-tile"
      );

    const feedback =
      panel.querySelector(
        "#monthsAssembleFeedback"
      );

    const resetButton =
      panel.querySelector(
        "#monthsAssembleReset"
      );

    const nextButton =
      panel.querySelector(
        "#monthsAssembleNext"
      );

    const tileLookup =
      new Map(
        tileObjects.map(
          tile => [
            tile.id,
            tile
          ]
        )
      );

    const placedTokens = [];

    function renderPlaced() {
      area.innerHTML =
        placedTokens.length
          ? placedTokens.map(
              token => `
                <span class="assembled-word">
                  ${token}
                </span>
              `
            ).join("")
          : `
              <span class="assemble-placeholder">
                Costruisci la frase qui.
              </span>
            `;
    }

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          if (
            complete ||
            button.disabled
          ) {
            return;
          }

          const tile =
            tileLookup.get(
              button.dataset.tileId
            );

          const expected =
            correctTokens[
              placedCount
            ];

          if (
            !tile ||
            tile.token !== expected
          ) {
            hadError = true;

            button.classList.remove(
              "wrong"
            );

            void button.offsetWidth;

            button.classList.add(
              "wrong"
            );

            feedback.innerHTML = `
              Riprova.

              <span>
                Try another word.
              </span>
            `;

            return;
          }

          placedTokens.push(
            tile.token
          );

          placedCount += 1;
          button.disabled = true;

          button.classList.add(
            "used"
          );

          feedback.textContent = "";
          renderPlaced();

          if (
            placedCount !==
            correctTokens.length
          ) {
            return;
          }

          complete = true;

          saveAttempt(
            "assemble-sentences",
            !hadError
          );

          feedback.innerHTML = `
            🎉 Frase completa!

            <strong>
              ${italianSentence}
            </strong>

            <span class="month-feedback-english">
              ${englishSentence}
            </span>
          `;

          buttons.forEach(
            tileButton => {
              tileButton.disabled = true;
            }
          );

          feedback.insertAdjacentHTML(
            "beforeend",
            window.PrimoVoloAudio
              .replayButtonMarkup(
                italianSentence,
                "Ascolta la frase di nuovo · Listen again"
              )
          );

          resetButton.hidden = true;
          nextButton.hidden = false;

          speak(italianSentence);
        }
      );
    });

    resetButton.addEventListener(
      "click",
      renderMonthsAssemble
    );

    nextButton.addEventListener(
      "click",
      renderMonthsAssemble
    );
  }

  /*
    Capture the click before the general
    Words in Action and Assemble files.
    This is the same approach used by the
    day-specific activity support.
  */
  document.addEventListener(
    "click",
    event => {
      if (!isMonthsTopic()) {
        return;
      }

      const button =
        event.target.closest(
          ".activity-button"
        );

      if (button === wordsButton) {
        event.preventDefault();
        event.stopImmediatePropagation();

        renderMonthsWordsInAction();
      }

      if (
        button === assembleButton
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        renderMonthsAssemble();
      }
    },
    true
  );
})();