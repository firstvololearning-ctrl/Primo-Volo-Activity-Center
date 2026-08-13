"use strict";

/*
  Primo Volo d'Italiano
  Impara — Ordered Sequences

  Shared low-stakes learning activities for:
  - Days of the Week
  - Months of the Year

  Activities:
  - Riordina
  - Giorno/Mese mancante

  These are Learn & Practice activities.
  They do not record accuracy scores.
*/

(function initializeImparaSequences() {
  const topicSelect =
    document.querySelector("#topicSelect");

  const learnActivity =
    document.querySelector("#learnActivity");

  const vocabularyGrid =
    document.querySelector("#vocabularyGrid");

  const learnButton =
    document.querySelector(
      '.activity-button[data-mode="learn"]'
    );

  const modeBar =
    document.querySelector("#learnModeBar");

  if (
    !topicSelect ||
    !learnActivity ||
    !vocabularyGrid ||
    !learnButton ||
    !modeBar
  ) {
    console.error(
      "Ordered Impara activities could not start."
    );
    return;
  }

  const configs = {
    days: {
      itemItalian: "giorno",
      itemPluralItalian: "giorni",
      missingTitle:
        "❓ Giorno mancante",
      missingEnglish:
        "Missing Day",
      missingQuestion:
        "Quale giorno va nello spazio vuoto?",
      missingQuestionEnglish:
        "Which day goes in the blank?"
    },

    months: {
      itemItalian: "mese",
      itemPluralItalian: "mesi",
      missingTitle:
        "❓ Mese mancante",
      missingEnglish:
        "Missing Month",
      missingQuestion:
        "Quale mese va nello spazio vuoto?",
      missingQuestionEnglish:
        "Which month goes in the blank?"
    }
  };

  function getConfig() {
    return configs[
      topicSelect.value
    ] || null;
  }

  function getVocabulary() {
    if (
      typeof currentVocabulary ===
        "undefined" ||
      !Array.isArray(
        currentVocabulary
      )
    ) {
      return [];
    }

    return currentVocabulary.filter(
      item =>
        item &&
        item.italian
    );
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function shuffle(items) {
    const copy = [...items];

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

  function shuffledDifferent(
    items
  ) {
    let result =
      shuffle(items);

    const same =
      result.every(
        (item, index) =>
          item.italian ===
          items[index].italian
      );

    if (
      same &&
      result.length > 1
    ) {
      [
        result[0],
        result[1]
      ] = [
        result[1],
        result[0]
      ];
    }

    return result;
  }

  function speak(text) {
    if (
      typeof speakItalian ===
      "function"
    ) {
      speakItalian(text);
    }
  }

  function markPractice() {
    if (
      typeof window
        .markVoloPractice ===
      "function"
    ) {
      window.markVoloPractice(
        "learn"
      );
    }
  }

  /*
    Add the two new buttons to the
    existing Impara mode bar.
  */

  const reorderButton =
    document.createElement(
      "button"
    );

  reorderButton.type =
    "button";

  reorderButton.className =
    "learn-mode-button";

  reorderButton.dataset
    .learnMode =
    "sequence-order";

  reorderButton.setAttribute(
    "aria-pressed",
    "false"
  );

  reorderButton.innerHTML = `
    <span>
      🔀 Riordina
    </span>

    <small>
      Put in Order
    </small>
  `;

  const missingButton =
    document.createElement(
      "button"
    );

  missingButton.type =
    "button";

  missingButton.className =
    "learn-mode-button";

  missingButton.dataset
    .learnMode =
    "sequence-missing";

  missingButton.setAttribute(
    "aria-pressed",
    "false"
  );

  missingButton.innerHTML = `
    <span class="sequence-missing-label">
      ❓ Mese mancante
    </span>

    <small class="sequence-missing-english">
      Missing Month
    </small>
  `;

  modeBar.appendChild(
    reorderButton
  );

  modeBar.appendChild(
    missingButton
  );

  const workspace =
    document.createElement(
      "section"
    );

  workspace.id =
    "sequenceLearnWorkspace";

  workspace.className =
    "sequence-learn-workspace";

  workspace.hidden = true;

  learnActivity.insertBefore(
    workspace,
    vocabularyGrid
  );

  let currentMode =
    "explore";

  let reorderState = null;

  let selectedSwapIndex =
    null;

  function setActiveMode(
    mode
  ) {
    currentMode = mode;

    modeBar
      .querySelectorAll(
        "[data-learn-mode]"
      )
      .forEach(button => {
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
      });
  }

  function hideOtherWorkspace() {
    const sortWorkspace =
      document.querySelector(
        "#learnSortWorkspace"
      );

    if (sortWorkspace) {
      sortWorkspace.hidden =
        true;
    }
  }

  function showExplore() {
    setActiveMode("explore");

    workspace.hidden = true;
    workspace.innerHTML = "";

    vocabularyGrid.hidden =
      false;
  }

  function showSequenceMode(
    mode
  ) {
    const config =
      getConfig();

    if (!config) {
      showExplore();
      return;
    }

    setActiveMode(mode);

    hideOtherWorkspace();

    vocabularyGrid.hidden =
      true;

    workspace.hidden =
      false;

    if (
      mode ===
      "sequence-order"
    ) {
      startReorder();
      return;
    }

    startMissing();
  }

  /*
    RIORDINA
  */

  function startReorder() {
    const vocabulary =
      getVocabulary();

    if (
      vocabulary.length < 2
    ) {
      return;
    }

    reorderState = {
      correct:
        [...vocabulary],

      current:
        shuffledDifferent(
          vocabulary
        )
    };

    selectedSwapIndex =
      null;

    renderReorder();
  }

  function swapItems(
    firstIndex,
    secondIndex
  ) {
    if (
      !reorderState ||
      firstIndex ===
        secondIndex
    ) {
      return;
    }

    [
      reorderState
        .current[firstIndex],
      reorderState
        .current[secondIndex]
    ] = [
      reorderState
        .current[secondIndex],
      reorderState
        .current[firstIndex]
    ];

    selectedSwapIndex =
      null;

    renderReorder();
  }

  function renderReorder() {
    const config =
      getConfig();

    if (
      !config ||
      !reorderState
    ) {
      return;
    }

    workspace.innerHTML = `
      <div class="sequence-card">

        <div class="sequence-heading">
          <h4>
            🔀 Riordina
            ${
              config.itemPluralItalian
            }
          </h4>

          <span>
            Put the ${
              config.itemPluralItalian ===
              "giorni"
                ? "days"
                : "months"
            } in order
          </span>
        </div>

        <p class="sequence-directions">
          Metti ${
            config.itemPluralItalian ===
            "giorni"
              ? "i giorni"
              : "i mesi"
          } nell’ordine corretto.

          <span>
            Drag the cards, or tap two
            cards to switch their places.
          </span>
        </p>

        <div
          class="sequence-order-grid"
          aria-label="Items to put in order"
        >
          ${
            reorderState.current
              .map(
                (item, index) => `
                  <div
                    class="
                      sequence-order-item
                      ${
                        selectedSwapIndex ===
                        index
                          ? "selected"
                          : ""
                      }
                    "
                    draggable="true"
                    tabindex="0"
                    role="button"
                    data-sequence-index="${index}"
                  >
                    <img
                      src="${escapeHTML(
                        item.image
                      )}"
                      alt=""
                    >

                    <strong>
                      ${escapeHTML(
                        item.italian
                      )}
                    </strong>

                    <small class="english-word">
                      ${escapeHTML(
                        item.english || ""
                      )}
                    </small>

                    <button
                      type="button"
                      class="sequence-audio"
                      data-audio-index="${index}"
                      aria-label="Hear ${escapeHTML(
                        item.italian
                      )}"
                    >
                      🔊
                    </button>
                  </div>
                `
              )
              .join("")
          }
        </div>

        <p
          class="sequence-feedback"
          aria-live="polite"
        ></p>

        <div class="sequence-actions">

          <button
            type="button"
            class="sequence-secondary"
            id="sequenceShuffleAgain"
          >
            🔀 Mescola di nuovo
            <small>
              Shuffle Again
            </small>
          </button>

          <button
            type="button"
            class="sequence-check"
            id="sequenceCheckOrder"
          >
            ✓ Controlla
            <small>
              Check Order
            </small>
          </button>

        </div>

      </div>
    `;

    const cards =
      [
        ...workspace
          .querySelectorAll(
            ".sequence-order-item"
          )
      ];

    const feedback =
      workspace.querySelector(
        ".sequence-feedback"
      );

    let dragIndex = null;

    cards.forEach(card => {
      const index =
        Number(
          card.dataset
            .sequenceIndex
        );

      card.addEventListener(
        "dragstart",
        event => {
          dragIndex = index;

          event.dataTransfer
            .setData(
              "text/plain",
              String(index)
            );

          event.dataTransfer
            .effectAllowed =
            "move";
        }
      );

      card.addEventListener(
        "dragover",
        event => {
          event.preventDefault();

          event.dataTransfer
            .dropEffect =
            "move";
        }
      );

      card.addEventListener(
        "drop",
        event => {
          event.preventDefault();

          const source =
            dragIndex ??
            Number(
              event.dataTransfer
                .getData(
                  "text/plain"
                )
            );

          swapItems(
            source,
            index
          );
        }
      );

      card.addEventListener(
        "click",
        event => {
          if (
            event.target.closest(
              ".sequence-audio"
            )
          ) {
            return;
          }

          if (
            selectedSwapIndex ===
            null
          ) {
            selectedSwapIndex =
              index;

            renderReorder();
            return;
          }

          swapItems(
            selectedSwapIndex,
            index
          );
        }
      );

      card.addEventListener(
        "keydown",
        event => {
          if (
            event.key !==
              "Enter" &&
            event.key !==
              " "
          ) {
            return;
          }

          event.preventDefault();

          if (
            selectedSwapIndex ===
            null
          ) {
            selectedSwapIndex =
              index;

            renderReorder();
            return;
          }

          swapItems(
            selectedSwapIndex,
            index
          );
        }
      );
    });

    workspace
      .querySelectorAll(
        ".sequence-audio"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          event => {
            event.stopPropagation();

            const item =
              reorderState
                .current[
                  Number(
                    button.dataset
                      .audioIndex
                  )
                ];

            if (item) {
              speak(
                item.italian
              );
            }
          }
        );
      });

    workspace
      .querySelector(
        "#sequenceShuffleAgain"
      )
      ?.addEventListener(
        "click",
        startReorder
      );

    workspace
      .querySelector(
        "#sequenceCheckOrder"
      )
      ?.addEventListener(
        "click",
        () => {
          const correct =
            reorderState.current
              .every(
                (item, index) =>
                  item.italian ===
                  reorderState
                    .correct[index]
                    .italian
              );

          if (!correct) {
            feedback.innerHTML = `
              <strong>
                Quasi! Prova ancora.
              </strong>

              <span>
                Almost! Move the cards
                and try again.
              </span>
            `;

            return;
          }

          feedback.innerHTML = `
            <strong>
              🎉 Ottimo!
              L’ordine è corretto.
            </strong>

            <span>
              Great! The order is correct.
            </span>
          `;

          markPractice();

          speak(
            reorderState.correct
              .map(
                item =>
                  item.italian
              )
              .join(", ")
          );
        }
      );
  }

  /*
    GIORNO / MESE MANCANTE
  */

  function startMissing() {
    const config =
      getConfig();

    const vocabulary =
      getVocabulary();

    if (
      !config ||
      vocabulary.length < 4
    ) {
      return;
    }

    const windowSize = 4;

    const maxStart =
      vocabulary.length -
      windowSize;

    const start =
      Math.floor(
        Math.random() *
        (maxStart + 1)
      );

    const sequence =
      vocabulary.slice(
        start,
        start + windowSize
      );

    const missingPosition =
      Math.random() < 0.5
        ? 1
        : 2;

    const answer =
      sequence[
        missingPosition
      ];

    const visibleItalian =
      new Set(
        sequence.map(
          item => item.italian
        )
      );

    const distractors =
      shuffle(
        vocabulary.filter(
          item =>
            !visibleItalian.has(
              item.italian
            )
        )
      ).slice(0, 3);

    const choices =
      shuffle([
        answer,
        ...distractors
      ]);

    renderMissing({
      config,
      sequence,
      missingPosition,
      answer,
      choices
    });
  }

  function renderMissing(state) {
    workspace.innerHTML = `
      <div class="sequence-card">

        <div class="sequence-heading">
          <h4>
            ${
              state.config
                .missingTitle
            }
          </h4>

          <span>
            ${
              state.config
                .missingEnglish
            }
          </span>
        </div>

        <button
          type="button"
          class="sequence-question"
          id="sequenceQuestionAudio"
        >
          🔊
          <strong>
            ${
              state.config
                .missingQuestion
            }
          </strong>

          <span>
            ${
              state.config
                .missingQuestionEnglish
            }
          </span>
        </button>

        <div class="missing-sequence-row">
          ${
            state.sequence
              .map(
                (item, index) => {
                  if (
                    index ===
                    state.missingPosition
                  ) {
                    return `
                      <div
                        class="missing-sequence-item missing"
                        id="missingSequenceBlank"
                      >
                        <span>
                          ?
                        </span>
                      </div>
                    `;
                  }

                  return `
                    <div
                      class="missing-sequence-item"
                    >
                      <img
                        src="${escapeHTML(
                          item.image
                        )}"
                        alt=""
                      >

                      <strong>
                        ${escapeHTML(
                          item.italian
                        )}
                      </strong>
                    </div>
                  `;
                }
              )
              .join("")
          }
        </div>

        <div class="missing-choice-prompt">
          <strong>
            Scegli la risposta.
          </strong>

          <span>
            Choose an answer.
          </span>
        </div>

        <div
          class="missing-choice-grid"
          aria-label="Choose the missing item"
        >
          ${
            state.choices
              .map(
                item => `
                  <button
                    type="button"
                    class="missing-choice"
                    data-answer="${escapeHTML(
                      item.italian
                    )}"
                  >
                    <img
                      src="${escapeHTML(
                        item.image
                      )}"
                      alt=""
                    >

                    <strong>
                      ${escapeHTML(
                        item.italian
                      )}
                    </strong>

                    <small class="english-word">
                      ${escapeHTML(
                        item.english || ""
                      )}
                    </small>
                  </button>
                `
              )
              .join("")
          }
        </div>

        <p
          class="sequence-feedback"
          aria-live="polite"
        ></p>

        <button
          type="button"
          class="sequence-check sequence-next"
          id="sequenceMissingNext"
          hidden
        >
          Avanti
          <small>
            Next
          </small>
          →
        </button>

      </div>
    `;

    workspace
      .querySelector(
        "#sequenceQuestionAudio"
      )
      ?.addEventListener(
        "click",
        () => {
          speak(
            state.config
              .missingQuestion
          );
        }
      );

    const choices =
      [
        ...workspace
          .querySelectorAll(
            ".missing-choice"
          )
      ];

    const feedback =
      workspace.querySelector(
        ".sequence-feedback"
      );

    const nextButton =
      workspace.querySelector(
        "#sequenceMissingNext"
      );

    choices.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const selected =
            button.dataset
              .answer;

          if (
            selected !==
            state.answer.italian
          ) {
            button.classList
              .remove(
                "try-again"
              );

            void button
              .offsetWidth;

            button.classList
              .add(
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

            speak(selected);

            return;
          }

          choices.forEach(
            choice => {
              choice.disabled =
                true;
            }
          );

          button.classList.add(
            "correct"
          );

          const blank =
            workspace
              .querySelector(
                "#missingSequenceBlank"
              );

          if (blank) {
            blank.classList
              .remove(
                "missing"
              );

            blank.innerHTML = `
              <img
                src="${escapeHTML(
                  state.answer.image
                )}"
                alt=""
              >

              <strong>
                ${escapeHTML(
                  state.answer
                    .italian
                )}
              </strong>
            `;
          }

          feedback.innerHTML = `
            <strong>
              🎉 Sì!
              ${
                escapeHTML(
                  state.answer
                    .italian
                )
              }.
            </strong>

            <span>
              You completed the sequence.
            </span>
          `;

          markPractice();

          speak(
            state.sequence
              .map(
                item =>
                  item.italian
              )
              .join(", ")
          );

          nextButton.hidden =
            false;
        }
      );
    });

    nextButton
      ?.addEventListener(
        "click",
        startMissing
      );
  }

  /*
    MODE AVAILABILITY
  */

  function syncSequenceModes() {
    const config =
      getConfig();

    const normalPictureSort =
      modeBar.querySelector(
        '[data-learn-mode="pictures"]'
      );

    const normalWordSort =
      modeBar.querySelector(
        '[data-learn-mode="words"]'
      );

    reorderButton.hidden =
      !config;

    missingButton.hidden =
      !config;

    if (!config) {
      workspace.hidden =
        true;

      workspace.innerHTML =
        "";

      return;
    }

    /*
      Days and Months use their own
      sequence-learning modes instead of
      the Food sorting buttons.
    */

    if (normalPictureSort) {
      normalPictureSort.hidden =
        true;
    }

    if (normalWordSort) {
      normalWordSort.hidden =
        true;
    }

    modeBar.hidden = false;

    const label =
      missingButton.querySelector(
        ".sequence-missing-label"
      );

    const english =
      missingButton.querySelector(
        ".sequence-missing-english"
      );

    if (label) {
      label.textContent =
        config.missingTitle;
    }

    if (english) {
      english.textContent =
        config.missingEnglish;
    }

    showExplore();
  }

  reorderButton
    .addEventListener(
      "click",
      () => {
        showSequenceMode(
          "sequence-order"
        );
      }
    );

  missingButton
    .addEventListener(
      "click",
      () => {
        showSequenceMode(
          "sequence-missing"
        );
      }
    );

  const exploreButton =
    modeBar.querySelector(
      '[data-learn-mode="explore"]'
    );

  exploreButton
    ?.addEventListener(
      "click",
      () => {
        window.setTimeout(
          () => {
            if (getConfig()) {
              showExplore();
            }
          },
          0
        );
      }
    );

  topicSelect.addEventListener(
    "change",
    () => {
      window.setTimeout(
        syncSequenceModes,
        0
      );
    }
  );

  learnButton.addEventListener(
    "click",
    () => {
      window.setTimeout(
        syncSequenceModes,
        0
      );
    }
  );

  /*
    STYLES
  */

  if (
    !document.querySelector(
      "#sequenceLearnStyles"
    )
  ) {
    const style =
      document.createElement(
        "style"
      );

    style.id =
      "sequenceLearnStyles";

    style.textContent = `
      .sequence-learn-workspace {
        width: min(940px, 100%);
        margin: 0 auto;
      }

      .sequence-learn-workspace[hidden] {
        display: none;
      }

      .sequence-card {
        padding: 24px;
        border: 1px solid #d8e1ec;
        border-radius: 22px;
        background: #fffdf9;
        box-shadow:
          0 8px 24px
          rgba(43, 67, 97, .08);
        text-align: center;
      }

      .sequence-heading h4 {
        margin: 0;
        color: #274b84;
        font-size: 1.4rem;
      }

      .sequence-heading > span {
        display: block;
        margin-top: 4px;
        color: #6f7f93;
        font-weight: 700;
      }

      .sequence-directions {
        margin: 15px auto 20px;
        color: #40536b;
        font-weight: 850;
      }

      .sequence-directions span {
        display: block;
        margin-top: 4px;
        color: #758396;
        font-size: .88rem;
        font-weight: 650;
      }

      .sequence-order-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(115px, 1fr)
          );
        gap: 12px;
        margin: 20px auto;
      }

      .sequence-order-item {
        position: relative;
        display: grid;
        place-items: center;
        gap: 5px;
        min-height: 145px;
        padding: 10px 8px 34px;
        border: 2px solid #d2deeb;
        border-radius: 17px;
        background: white;
        color: #274b84;
        cursor: grab;
        user-select: none;
      }

      .sequence-order-item.selected {
        border-color: #e99d87;
        background: #fff4ef;
        box-shadow:
          0 0 0 3px
          rgba(233, 157, 135, .15);
      }

      .sequence-order-item img {
        width: 78px;
        height: 78px;
        object-fit: contain;
      }

      .sequence-order-item strong {
        font-size: 1rem;
      }

      .sequence-order-item small {
        color: #778599;
        font-size: .75rem;
        font-weight: 650;
      }

      .sequence-audio {
        position: absolute;
        right: 8px;
        bottom: 7px;
        width: 28px;
        height: 28px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: #eef5fc;
        cursor: pointer;
      }

      .sequence-feedback {
        min-height: 48px;
        margin: 16px auto 5px;
        color: #40536b;
      }

      .sequence-feedback strong,
      .sequence-feedback span {
        display: block;
      }

      .sequence-feedback strong {
        color: #315e53;
      }

      .sequence-feedback span {
        margin-top: 4px;
        color: #758396;
        font-size: .86rem;
      }

      .sequence-actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
      }

      .sequence-secondary,
      .sequence-check {
        display: grid;
        gap: 2px;
        min-width: 155px;
        padding: 10px 18px;
        border-radius: 999px;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .sequence-secondary {
        border: 1px solid #b9cbe0;
        color: #274b84;
        background: #eef5fc;
      }

      .sequence-check {
        border: 0;
        color: white;
        background: #274b84;
      }

      .sequence-secondary small,
      .sequence-check small {
        font-size: .72rem;
        font-weight: 700;
      }

      .sequence-question {
        display: grid;
        place-items: center;
        gap: 3px;
        margin: 16px auto 20px;
        padding: 10px 18px;
        border: 0;
        border-radius: 15px;
        color: #274b84;
        background: #eef5fc;
        font: inherit;
        cursor: pointer;
      }

      .sequence-question strong {
        font-size: 1.1rem;
      }

      .sequence-question span {
        color: #718198;
        font-size: .82rem;
        font-weight: 700;
      }

      .missing-sequence-row {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap: 12px;
        width: min(700px, 100%);
        margin: 0 auto 22px;
      }

      .missing-sequence-item {
        display: grid;
        place-items: center;
        gap: 6px;
        min-height: 135px;
        padding: 10px;
        border: 2px solid #d4dfeb;
        border-radius: 18px;
        background: white;
        color: #274b84;
      }

      .missing-sequence-item img {
        width: 75px;
        height: 75px;
        object-fit: contain;
      }

      .missing-sequence-item.missing {
        border-style: dashed;
        background: #fff7ef;
      }

      .missing-sequence-item.missing span {
        color: #d47e66;
        font-size: 2.5rem;
        font-weight: 900;
      }

      .missing-choice-prompt {
        margin: 4px auto 12px;
        text-align: center;
        color: #40536b;
      }

      .missing-choice-prompt strong,
      .missing-choice-prompt span {
        display: block;
      }

      .missing-choice-prompt span {
        margin-top: 2px;
        color: #758396;
        font-size: .82rem;
        font-weight: 650;
      }

      .missing-choice-grid {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap: 12px;
        width: min(760px, 100%);
        margin: 0 auto;
      }

      .missing-choice {
        display: grid;
        place-items: center;
        gap: 4px;
        min-height: 125px;
        padding: 10px;
        border: 2px solid #cbd8e7;
        border-radius: 17px;
        color: #274b84;
        background: white;
        font: inherit;
        cursor: pointer;
      }

      .missing-choice img {
        width: 68px;
        height: 68px;
        object-fit: contain;
      }

      .missing-choice small {
        color: #76859a;
        font-size: .76rem;
        font-weight: 650;
      }

      .missing-choice.try-again {
        border-color: #d8a39a;
        background: #fff4f2;
      }

      .missing-choice.correct {
        border-color: #79aa95;
        background: #f0faf5;
      }

      .sequence-next {
        margin: 10px auto 0;
      }

      @media (max-width: 700px) {
        .sequence-card {
          padding: 19px 13px;
        }

        .sequence-order-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .missing-sequence-row,
        .missing-choice-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  syncSequenceModes();
})();
