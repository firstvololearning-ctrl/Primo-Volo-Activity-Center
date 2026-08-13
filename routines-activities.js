"use strict";

(function initializeRoutineActivities() {
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

  if (!assembleButton || !main) {
    console.error(
      "Daily Routines activity support could not start."
    );
    return;
  }

  function isRoutinesTopic() {
    return (
      typeof currentTopicKey !== "undefined" &&
      currentTopicKey === "routines"
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

  function saveAttempt(correct) {
    if (typeof recordAttempt === "function") {
      recordAttempt(
        "assemble-sentences",
        correct
      );
    }
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

  function shuffleUntilDifferent(items) {
    if (items.length < 2) {
      return [...items];
    }

    let result = shuffle(items);
    let attempts = 0;

    while (
      result.every(
        (item, index) =>
          item.id === items[index].id
      ) &&
      attempts < 12
    ) {
      result = shuffle(items);
      attempts += 1;
    }

    return result;
  }

  function getPanel() {
    let panel =
      document.querySelector(
        "#assembleSentencesActivity"
      );

    if (!panel) {
      panel =
        document.createElement("section");

      panel.id =
        "assembleSentencesActivity";

      panel.className =
        "assemble-sentences-activity activity-panel";

      main.appendChild(panel);
    }

    return panel;
  }

  function prepareActivity() {
    document
      .querySelectorAll(
        ".activity-button"
      )
      .forEach(button => {
        button.classList.toggle(
          "active",
          button === assembleButton
        );
      });

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

    if (englishToggleControlElement) {
      englishToggleControlElement.hidden =
        true;
    }

    if (learnInstructionsElement) {
      learnInstructionsElement.hidden =
        true;
    }
  }

  function renderRoutineAssemble() {
    const vocabulary = getVocabulary();
    const panel = getPanel();

    prepareActivity();
    panel.hidden = false;

    if (!vocabulary.length) {
      panel.innerHTML = `
        <div class="assemble-empty">
          Nessuna routine disponibile.
          <span>
            No routines are available.
          </span>
        </div>
      `;
      return;
    }

    const item =
      vocabulary[
        Math.floor(
          Math.random() *
          vocabulary.length
        )
      ];

    const sentence =
      String(item.italian).trim();

    const correctTokens =
      sentence
        .split(/\s+/)
        .filter(Boolean);

    const tileObjects =
      correctTokens.map(
        (token, index) => ({
          id: `routine-token-${index}`,
          token,
          index
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
            Assemble the Routine
          </p>
        </div>

        <div
          class="assemble-picture-frame"
          style="
            width:min(290px,80vw);
            margin:22px auto;
          "
        >
          <img
            src="${item.image}"
            alt="${item.english}"
          >
        </div>

        <p class="assemble-instruction">
          Tocca le parole nell'ordine corretto.
          <span>
            Tap the words in the correct order.
          </span>
        </p>

        <div
          id="routineAssembleSentenceArea"
          class="assemble-sentence-area"
          aria-live="polite"
        >
          <span class="assemble-placeholder">
            Costruisci la frase qui.
          </span>
        </div>

        <div
          id="routineAssembleWordBank"
          class="assemble-word-bank"
          aria-label="Mixed-up routine words"
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
          id="routineAssembleFeedback"
          class="assemble-feedback"
          aria-live="polite"
        ></p>

        <div class="assemble-actions">
          <button
            type="button"
            id="routineAssembleReset"
            class="assemble-secondary-button"
          >
            Ricomincia · Start Over
          </button>

          <button
            type="button"
            id="routineAssembleNext"
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
        "#routineAssembleSentenceArea"
      );

    const buttons =
      panel.querySelectorAll(
        ".assemble-word-tile"
      );

    const feedback =
      panel.querySelector(
        "#routineAssembleFeedback"
      );

    const resetButton =
      panel.querySelector(
        "#routineAssembleReset"
      );

    const nextButton =
      panel.querySelector(
        "#routineAssembleNext"
      );

    const tileLookup =
      new Map(
        tileObjects.map(
          tile => [tile.id, tile]
        )
      );

    const placedTokens = [];

    function renderPlaced() {
      area.innerHTML =
        placedTokens.length
          ? placedTokens
              .map(token => `
                <span class="assembled-word">
                  ${token}
                </span>
              `)
              .join("")
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
            !hadError
          );

          feedback.innerHTML = `
            🎉 Frase completa!
            <strong>
              ${sentence}
            </strong>
            <span>
              Sentence complete!
            </span>
          `;

          buttons.forEach(
            tileButton => {
              tileButton.disabled =
                true;
            }
          );

          resetButton.hidden = true;
          nextButton.hidden = false;

          speak(sentence);
        }
      );
    });

    resetButton.addEventListener(
      "click",
      renderRoutineAssemble
    );

    nextButton.addEventListener(
      "click",
      renderRoutineAssemble
    );
  }

  document.addEventListener(
    "click",
    event => {
      if (!isRoutinesTopic()) {
        return;
      }

      const button =
        event.target.closest(
          ".activity-button"
        );

      if (
        button === assembleButton
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        renderRoutineAssemble();
      }
    },
    true
  );
})();
