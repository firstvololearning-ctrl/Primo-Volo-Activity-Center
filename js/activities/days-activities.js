"use strict";

/*
  Primo Volo d'Italiano
  Days of the Week sentence support

  Load this file after words-in-action.js,
  assemble-sentences.js, and conversation-practice.js.

  It supplies the day-specific forms needed for:
  - È lunedì.
  - Mi piace il lunedì.
  - Mi piace la domenica.
*/

(function initializeDaysActivities() {
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
      "Days activity support could not start because required page elements are missing."
    );
    return;
  }

  function isDaysTopic() {
    return (
      typeof currentTopicKey !== "undefined" &&
      currentTopicKey === "days"
    );
  }

  function getVocabulary() {
    if (
      typeof currentVocabulary === "undefined" ||
      !Array.isArray(currentVocabulary)
    ) {
      return [];
    }

    return currentVocabulary;
  }

  function getDayCarriers() {
    if (
      typeof carrierPhrases === "undefined" ||
      !carrierPhrases.days
    ) {
      return [];
    }

    return carrierPhrases.days;
  }

  function shuffle(items) {
    const result = [...items];

    for (
      let index = result.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(Math.random() * (index + 1));

      [result[index], result[randomIndex]] =
        [result[randomIndex], result[index]];
    }

    return result;
  }

  function chooseRandom(items) {
    return items[
      Math.floor(Math.random() * items.length)
    ];
  }

  function getSentenceTarget(item, carrier) {
    return (
      item.sentenceForms?.[carrier.id] ||
      item.italian
    );
  }

  function buildSentence(item, carrier) {
    const carrierText =
      carrier.italian
        .replace("...", "")
        .trim();

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

  function speak(text) {
    if (typeof speakItalian === "function") {
      speakItalian(text);
    }
  }

  function saveAttempt(activity, correct) {
    if (typeof recordAttempt === "function") {
      recordAttempt(activity, correct);
    }
  }

  function activateButton(activeButton) {
    document
      .querySelectorAll(".activity-button")
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

  function prepareActivity(activeButton) {
    activateButton(activeButton);
    hideAllPanels();

    if (englishToggleControlElement) {
      englishToggleControlElement.hidden = true;
    }

    if (learnInstructionsElement) {
      learnInstructionsElement.hidden = true;
    }
  }

  function getOrCreatePanel(id, className) {
    let panel = document.querySelector(`#${id}`);

    if (!panel) {
      panel = document.createElement("section");
      panel.id = id;
      panel.className = `${className} activity-panel`;
      main.appendChild(panel);
    }

    return panel;
  }

  function renderDaysWordsInAction() {
    const vocabulary = getVocabulary();
    const carriers = getDayCarriers();

    const panel = getOrCreatePanel(
      "wordsInActionActivity",
      "words-in-action-activity"
    );

    prepareActivity(wordsButton);
    panel.hidden = false;

    if (!vocabulary.length || !carriers.length) {
      panel.innerHTML = `
        <div class="words-action-empty">
          Nessun vocabolario disponibile.
          <span>No vocabulary is available.</span>
        </div>
      `;
      return;
    }

    const item = chooseRandom(vocabulary);
    const carrier = chooseRandom(carriers);
    const choices = shuffle([
      item,
      ...shuffle(
        vocabulary.filter(choice => choice !== item)
      ).slice(0, 3)
    ]);

    const carrierImage =
      carrier.image.replace("-no-text", "");

    panel.innerHTML = `
      <div class="words-action-card">
        <div class="words-action-heading">
          <h4>💬 Parole in azione</h4>
          <p>Words in Action</p>
        </div>

        <div class="words-action-frame">
          <img
            id="daysCarrierPhraseImage"
            src="${carrierImage}"
            alt="${carrier.italian}"
            class="carrier-phrase-image"
            tabindex="0"
            role="button"
            aria-label="Listen to ${carrier.italian}"
          >
        </div>

        <div class="words-action-image-frame">
          <img
            src="${item.image}"
            alt="${item.english}"
          >
        </div>

        <div
          class="words-action-choice-grid"
          aria-label="Italian day choices"
        >
          ${choices.map(choice => `
            <button
              type="button"
              class="words-action-choice"
              data-answer="${choice.italian}"
            >
              ${choice.italian}
            </button>
          `).join("")}
        </div>

        <p
          id="daysWordsFeedback"
          class="words-action-feedback"
          aria-live="polite"
        >
          Scegli il giorno che completa la frase.
          <span>
            Choose the day that completes the sentence.
          </span>
        </p>

        <button
          type="button"
          id="daysWordsNext"
          class="next-question-button words-action-next"
          hidden
        >
          Prossima frase · Next Sentence
        </button>
      </div>
    `;

    const phraseImage =
      panel.querySelector("#daysCarrierPhraseImage");

    const buttons =
      panel.querySelectorAll(".words-action-choice");

    const feedback =
      panel.querySelector("#daysWordsFeedback");

    const nextButton =
      panel.querySelector("#daysWordsNext");

    function playCarrier() {
      speak(
        carrier.italian
          .replace("...", "")
          .trim()
      );
    }

    phraseImage.addEventListener("click", playCarrier);
    phraseImage.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      playCarrier();
    });

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const correct =
          button.dataset.answer === item.italian;

        saveAttempt("words-in-action", correct);

        buttons.forEach(choice => {
          choice.disabled = true;

          if (choice.dataset.answer === item.italian) {
            choice.classList.add("correct");
          }
        });

        if (!correct) {
          button.classList.add("incorrect");
        }

        const sentence =
          buildSentence(item, carrier);

        feedback.innerHTML = correct
          ? `
              Corretto!
              <strong>${sentence}</strong>
              <span>
                Correct! Listen to the complete sentence.
              </span>
            `
          : `
              La risposta corretta è
              <strong>${sentence}</strong>
              <span>
                Listen to the complete sentence.
              </span>
            `;

        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              sentence,
              "Ascolta la frase di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;
        speak(sentence);
      }, { once: true });
    });

    nextButton.addEventListener(
      "click",
      renderDaysWordsInAction
    );
  }

  function sentenceTokens(sentence) {
    return sentence.split(/\s+/);
  }

  function shuffleUntilDifferent(items) {
    if (items.length < 2) {
      return [...items];
    }

    let shuffled = shuffle(items);
    let attempts = 0;

    while (
      shuffled.every(
        (item, index) => item.id === items[index].id
      ) &&
      attempts < 12
    ) {
      shuffled = shuffle(items);
      attempts += 1;
    }

    return shuffled;
  }

  function renderDaysAssemble() {
    const vocabulary = getVocabulary();
    const carriers = getDayCarriers();

    const panel = getOrCreatePanel(
      "assembleSentencesActivity",
      "assemble-sentences-activity"
    );

    prepareActivity(assembleButton);
    panel.hidden = false;

    if (!vocabulary.length || !carriers.length) {
      panel.innerHTML = `
        <div class="assemble-empty">
          Nessun vocabolario disponibile.
          <span>No vocabulary is available.</span>
        </div>
      `;
      return;
    }

    const item = chooseRandom(vocabulary);
    const carrier = chooseRandom(carriers);
    const sentence = buildSentence(item, carrier);
    const correctTokens = sentenceTokens(sentence);

    const tileObjects = correctTokens.map(
      (token, index) => ({
        id: `day-token-${index}`,
        token,
        index
      })
    );

    const shuffledTiles =
      shuffleUntilDifferent(tileObjects);

    let placedCount = 0;
    let hadError = false;
    let complete = false;

    panel.innerHTML = `
      <div class="assemble-card">
        <div class="assemble-heading">
          <h4>🧩 Assembla</h4>
          <p>Assemble the Sentence</p>
        </div>

        <div class="assemble-prompt-row">
          <div class="assemble-carrier-visual">
            <img
              src="${carrier.image}"
              alt="${carrier.italian}"
              class="assemble-carrier-image"
            >
          </div>

          <div class="assemble-picture-frame">
            <img
              src="${item.image}"
              alt="${item.english}"
            >
          </div>
        </div>

        <p class="assemble-instruction">
          Tocca le parole nell'ordine corretto.
          <span>
            Tap the words in the correct order.
          </span>
        </p>

        <div
          id="daysAssembleSentenceArea"
          class="assemble-sentence-area"
          aria-live="polite"
        >
          <span class="assemble-placeholder">
            Costruisci la frase qui.
          </span>
        </div>

        <div
          id="daysAssembleWordBank"
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
          id="daysAssembleFeedback"
          class="assemble-feedback"
          aria-live="polite"
        ></p>

        <div class="assemble-actions">
          <button
            type="button"
            id="daysAssembleReset"
            class="assemble-secondary-button"
          >
            Ricomincia · Start Over
          </button>

          <button
            type="button"
            id="daysAssembleNext"
            class="next-question-button"
            hidden
          >
            Prossima frase · Next Sentence
          </button>
        </div>
      </div>
    `;

    const area =
      panel.querySelector("#daysAssembleSentenceArea");

    const buttons =
      panel.querySelectorAll(".assemble-word-tile");

    const feedback =
      panel.querySelector("#daysAssembleFeedback");

    const resetButton =
      panel.querySelector("#daysAssembleReset");

    const nextButton =
      panel.querySelector("#daysAssembleNext");

    const tileLookup = new Map(
      tileObjects.map(tile => [tile.id, tile])
    );

    const placedTokens = [];

    function renderPlaced() {
      area.innerHTML = placedTokens.length
        ? placedTokens.map(token => `
            <span class="assembled-word">
              ${token}
            </span>
          `).join("")
        : `
            <span class="assemble-placeholder">
              Costruisci la frase qui.
            </span>
          `;
    }

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        if (complete || button.disabled) {
          return;
        }

        const tile =
          tileLookup.get(button.dataset.tileId);

        const expected =
          correctTokens[placedCount];

        if (tile.token !== expected) {
          hadError = true;
          button.classList.remove("wrong");
          void button.offsetWidth;
          button.classList.add("wrong");

          feedback.innerHTML = `
            Riprova.
            <span>Try another word.</span>
          `;
          return;
        }

        placedTokens.push(tile.token);
        placedCount += 1;
        button.disabled = true;
        button.classList.add("used");
        feedback.textContent = "";
        renderPlaced();

        if (placedCount !== correctTokens.length) {
          return;
        }

        complete = true;
        saveAttempt(
          "assemble-sentences",
          !hadError
        );

        feedback.innerHTML = `
          🎉 Frase completa!
          <strong>${sentence}</strong>
          <span>Sentence complete!</span>
        `;

        buttons.forEach(tileButton => {
          tileButton.disabled = true;
        });

        resetButton.hidden = true;
        feedback.insertAdjacentHTML(
          "beforeend",
          window.PrimoVoloAudio
            .replayButtonMarkup(
              sentence,
              "Ascolta la frase di nuovo · Listen again"
            )
        );

        nextButton.hidden = false;
        speak(sentence);
      });
    });

    resetButton.addEventListener(
      "click",
      renderDaysAssemble
    );

    nextButton.addEventListener(
      "click",
      renderDaysAssemble
    );
  }

  document.addEventListener(
    "click",
    event => {
      if (!isDaysTopic()) {
        return;
      }

      const button =
        event.target.closest(".activity-button");

      if (button === wordsButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        renderDaysWordsInAction();
      }

      if (button === assembleButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        renderDaysAssemble();
      }
    },
    true
  );
})();
