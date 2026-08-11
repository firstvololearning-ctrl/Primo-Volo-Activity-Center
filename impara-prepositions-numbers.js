(() => {
  "use strict";

  /* ========================================
     QUICK EXPANDED IMPARA
     Prepositions + Numbers
     ======================================== */

  if (
    typeof renderVocabulary !== "function" ||
    !learnActivity ||
    !vocabularyGrid
  ) {
    console.warn(
      "Prepositions/Numbers Impara could not attach."
    );
    return;
  }

  const originalRenderVocabulary =
    renderVocabulary;


  /* ========================================
     HELPERS
     ======================================== */

  function speak(text) {
    if (typeof speakItalian === "function") {
      speakItalian(text);
    }
  }

  function removeOldExtraLearn() {
    document
      .querySelectorAll(
        ".quick-impara-more"
      )
      .forEach(element => element.remove());
  }

  function createTabs(
    interactiveItalian,
    interactiveEnglish
  ) {
    const nav =
      document.createElement("div");

    nav.className =
      "quick-impara-tabs quick-impara-more";

    nav.innerHTML = `
      <button
        type="button"
        class="quick-impara-tab active"
        data-view="explore"
      >
        📖 Esplora
        <small>Explore</small>
      </button>

      <button
        type="button"
        class="quick-impara-tab"
        data-view="interactive"
      >
        ${interactiveItalian}
        <small>
          ${interactiveEnglish}
        </small>
      </button>
    `;

    vocabularyGrid.insertAdjacentElement(
      "beforebegin",
      nav
    );

    return nav;
  }

  function connectTabs(
    nav,
    panel
  ) {
    const buttons =
      [...nav.querySelectorAll(
        ".quick-impara-tab"
      )];

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const interactive =
            button.dataset.view ===
            "interactive";

          buttons.forEach(choice => {
            choice.classList.toggle(
              "active",
              choice === button
            );
          });

          vocabularyGrid.hidden =
            interactive;

          panel.hidden =
            !interactive;

          if (interactive) {
            panel.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }
      );
    });
  }


  /* ========================================
     PREPOSITIONS
     ======================================== */

  const prepositionPositions = [
    {
      id: "in",
      italian: "in",
      english: "in",
      sentence:
        "La palla è nella scatola."
    },
    {
      id: "su",
      italian: "su",
      english: "on",
      sentence:
        "La palla è sulla scatola."
    },
    {
      id: "sotto",
      italian: "sotto",
      english: "under",
      sentence:
        "La palla è sotto la scatola."
    },
    {
      id: "sopra",
      italian: "sopra",
      english: "above",
      sentence:
        "La palla è sopra la scatola."
    },
    {
      id: "davanti",
      italian: "davanti a",
      english: "in front of",
      sentence:
        "La palla è davanti alla scatola."
    },
    {
      id: "dietro",
      italian: "dietro",
      english: "behind",
      sentence:
        "La palla è dietro la scatola."
    },
    {
      id: "accanto",
      italian: "accanto a",
      english: "next to",
      sentence:
        "La palla è accanto alla scatola."
    },
    {
      id: "vicino",
      italian: "vicino a",
      english: "near",
      sentence:
        "La palla è vicino alla scatola."
    },
    {
      id: "lontano",
      italian: "lontano da",
      english: "far from",
      sentence:
        "La palla è lontano dalla scatola."
    }
  ];

  function buildPrepositionsPanel() {
    const panel =
      document.createElement("section");

    panel.className =
      "quick-prep-panel quick-impara-more";

    panel.hidden = true;

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          📦 Muovi e guarda
        </h4>

        <p>
          Scegli una preposizione.
          Guarda come cambia la posizione
          della palla.

          <span class="expanded-result-english">
            Choose a preposition and watch
            the ball change position.
          </span>
        </p>
      </div>

      <div
        class="quick-prep-buttons"
        role="group"
        aria-label="Prepositions"
      >
        ${prepositionPositions.map(
          item => `
            <button
              type="button"
              class="quick-prep-button"
              data-position="${item.id}"
            >
              <strong>
                ${item.italian}
              </strong>

              <small
                class="expanded-result-english"
              >
                ${item.english}
              </small>
            </button>
          `
        ).join("")}
      </div>

      <div class="quick-prep-stage" data-scene="table">
        <div
          class="quick-prep-ball"
          data-position="su"
          aria-hidden="true"
        ></div>

        <div
          class="quick-prep-box"
          aria-hidden="true"
        >
          <div class="quick-prep-box-inside"></div>
          <div class="quick-prep-box-front"></div>
        </div>
      </div>

      <div
        class="expanded-scene-result"
        id="quickPrepResult"
        aria-live="polite"
      >
        <strong>
          La palla è sulla scatola.
        </strong>

        <span>
          The ball is on the box.
        </span>
      </div>
    `;

    vocabularyGrid.insertAdjacentElement(
      "afterend",
      panel
    );

    const ball =
      panel.querySelector(
        ".quick-prep-ball"
      );

    const result =
      panel.querySelector(
        "#quickPrepResult"
      );

    const buttons =
      [...panel.querySelectorAll(
        ".quick-prep-button"
      )];

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const item =
            prepositionPositions.find(
              choice =>
                choice.id ===
                button.dataset.position
            );

          if (!item) return;

          buttons.forEach(choice => {
            choice.classList.toggle(
              "active",
              choice === button
            );
          });

          ball.dataset.position =
            item.id;

          const stage =
            panel.querySelector(
              ".quick-prep-stage"
            );

          stage.dataset.scene =
            ["su", "sotto", "sopra"].includes(item.id)
              ? "table"
              : "box";

          const englishSentence = {
            in:
              "The ball is in the box.",
            su:
              "The ball is on the box.",
            sotto:
              "The ball is under the box.",
            sopra:
              "The ball is above the box.",
            davanti:
              "The ball is in front of the box.",
            dietro:
              "The ball is behind the box.",
            accanto:
              "The ball is next to the box.",
            vicino:
              "The ball is near the box.",
            lontano:
              "The ball is far from the box."
          }[item.id];

          result.innerHTML = `
            <strong>
              ${item.sentence}
            </strong>

            <span>
              ${englishSentence}
            </span>
          `;

          speak(item.sentence);
        }
      );
    });

    panel
      .querySelector(
        '[data-position="su"]'
      )
      ?.classList.add("active");

    return panel;
  }


  /* ========================================
     NUMBERS
     ======================================== */

  const numberWords = {
    1: "uno",
    2: "due",
    3: "tre",
    4: "quattro",
    5: "cinque",
    6: "sei",
    7: "sette",
    8: "otto",
    9: "nove",
    10: "dieci"
  };

  function findImage(
    collections,
    pattern
  ) {
    for (const collection of collections) {
      if (!Array.isArray(collection)) {
        continue;
      }

      const item =
        collection.find(entry => {
          const text =
            `${entry.italian || ""} ${
              entry.english || ""
            }`;

          return pattern.test(text);
        });

      if (item?.image) {
        return item.image;
      }
    }

    return "";
  }

  function availableCollections() {
    return [
      typeof home !== "undefined"
        ? home
        : [],
      typeof animals !== "undefined"
        ? animals
        : [],
      typeof supplies !== "undefined"
        ? supplies
        : [],
      typeof food !== "undefined"
        ? food
        : []
    ];
  }

  function getNumberGroups() {
    const collections =
      availableCollections();

    return [
      {
        number: 2,
        singularFallback: "🛁",
        image:
          findImage(
            collections,
            /vasca|bathtub/i
          ),
        noun: "vasche da bagno",
        english: "bathtubs",
        sentence:
          "Ci sono due vasche da bagno."
      },
      {
        number: 3,
        singularFallback: "🐶",
        image:
          findImage(
            collections,
            /\bcane\b|\bdog\b/i
          ),
        noun: "cani",
        english: "dogs",
        sentence:
          "Ci sono tre cani."
      },
      {
        number: 4,
        singularFallback: "🍎",
        image:
          findImage(
            collections,
            /\bmela\b|\bapple\b/i
          ),
        noun: "mele",
        english: "apples",
        sentence:
          "Ci sono quattro mele."
      },
      {
        number: 5,
        singularFallback: "🎈",
        image:
          "images/scene-images/colors/balloons_separate/balloon-rosso.png",
        noun: "palloncini",
        english: "balloons",
        sentence:
          "Ci sono cinque palloncini."
      },
      {
        number: 6,
        singularFallback: "📓",
        image:
          findImage(
            collections,
            /quaderno|notebook/i
          ),
        noun: "quaderni",
        english: "notebooks",
        sentence:
          "Ci sono sei quaderni."
      }
    ];
  }

  function buildRepeatedObjects(item) {
    return Array.from(
      { length: item.number },
      (_, index) => {
        if (item.image) {
          return `
            <img
              src="${item.image}"
              alt=""
              draggable="false"
              data-count-item="${index + 1}"
            >
          `;
        }

        return `
          <span
            class="quick-number-emoji"
            aria-hidden="true"
          >
            ${item.singularFallback}
          </span>
        `;
      }
    ).join("");
  }

  function buildNumbersPanel() {
    const groups =
      getNumberGroups();

    const panel =
      document.createElement("section");

    panel.className =
      "quick-numbers-panel quick-impara-more";

    panel.hidden = true;

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          🔢 Conta e abbina
        </h4>

        <p>
          Conta gli oggetti.
          Trascina ogni gruppo
          al numero giusto.

          <span class="expanded-result-english">
            Count the objects.
            Drag each group to the
            matching number.
          </span>
        </p>
      </div>

      <div
        class="quick-number-targets"
        aria-label="Numbers one through ten"
      >
        ${Object.entries(numberWords)
          .map(
            ([number, word]) => `
              <div
                class="quick-number-target"
                data-number="${number}"
              >
                <strong>
                  ${number}
                </strong>

                <span>
                  ${word}
                </span>

                <div
                  class="quick-number-landed"
                ></div>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="quick-number-group-bank">
        ${groups.map(
          (item, index) => `
            <button
              type="button"
              class="quick-number-group"
              data-number="${item.number}"
              data-index="${index}"
              aria-label="
                ${item.number} ${item.english}
              "
            >
              <div
                class="quick-number-object-grid"
              >
                ${buildRepeatedObjects(item)}
              </div>

              <strong>
                ${item.number}
                ${item.noun}
              </strong>
            </button>
          `
        ).join("")}
      </div>

      <div
        class="expanded-scene-result"
        id="quickNumberResult"
        aria-live="polite"
      >
        <strong>
          Conta gli oggetti.
        </strong>

        <span>
          Count the objects.
        </span>
      </div>
    `;

    vocabularyGrid.insertAdjacentElement(
      "afterend",
      panel
    );

    const targets =
      [...panel.querySelectorAll(
        ".quick-number-target"
      )];

    const cards =
      [...panel.querySelectorAll(
        ".quick-number-group"
      )];

    const result =
      panel.querySelector(
        "#quickNumberResult"
      );

    let completed = 0;

    cards.forEach(card => {
      let dragging = false;
      let startX = 0;
      let startY = 0;

      const item =
        groups[
          Number(card.dataset.index)
        ];

      card.addEventListener(
        "pointerdown",
        event => {
          if (
            card.classList.contains(
              "is-sorted"
            )
          ) {
            return;
          }

          dragging = true;

          startX =
            event.clientX;

          startY =
            event.clientY;

          card.classList.add(
            "is-dragging"
          );

          card.setPointerCapture(
            event.pointerId
          );

          event.preventDefault();
        }
      );

      card.addEventListener(
        "pointermove",
        event => {
          if (!dragging) return;

          const x =
            event.clientX - startX;

          const y =
            event.clientY - startY;

          card.style.transform =
            `translate(${x}px, ${y}px) scale(1.04)`;
        }
      );

      card.addEventListener(
        "pointerup",
        event => {
          if (!dragging) return;

          dragging = false;

          card.classList.remove(
            "is-dragging"
          );

          card.style.transform = "";

          const target =
            targets.find(tile => {
              const rect =
                tile.getBoundingClientRect();

              return (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
              );
            });

          if (!target) {
            return;
          }

          if (
            Number(
              target.dataset.number
            ) !== item.number
          ) {
            target.classList.add(
              "try-again"
            );

            result.innerHTML = `
              <strong>
                Prova ancora.
              </strong>

              <span>
                Try again.
              </span>
            `;

            window.setTimeout(
              () => {
                target.classList.remove(
                  "try-again"
                );
              },
              400
            );

            return;
          }

          target.classList.add(
            "is-complete"
          );

          target
            .querySelector(
              ".quick-number-landed"
            )
            .textContent = "✓";

          card.classList.add(
            "is-sorted"
          );

          completed += 1;

          result.innerHTML = `
            <strong>
              ${item.sentence}
            </strong>

            <span>
              There are
              ${item.number}
              ${item.english}.
            </span>
          `;

          speak(item.sentence);

          if (
            completed === groups.length
          ) {
            window.setTimeout(
              () => {
                result.innerHTML = `
                  <strong>
                    Bravissimo!
                    Hai contato tutti i gruppi.
                  </strong>

                  <span>
                    Great job!
                    You counted all the groups.
                  </span>
                `;
              },
              500
            );
          }
        }
      );

      card.addEventListener(
        "pointercancel",
        () => {
          dragging = false;

          card.classList.remove(
            "is-dragging"
          );

          card.style.transform = "";
        }
      );
    });

    return panel;
  }


  /* ========================================
     ADD TO IMPARA
     ======================================== */

  function renderQuickExpandedLearn() {
    removeOldExtraLearn();

    vocabularyGrid.hidden = false;

    if (
      currentTopicKey ===
      "prepositions"
    ) {
      const nav =
        createTabs(
          "📦 Muovi e guarda",
          "Move & Look"
        );

      const panel =
        buildPrepositionsPanel();

      connectTabs(
        nav,
        panel
      );

      return;
    }

    if (
      currentTopicKey ===
      "numbers"
    ) {
      const nav =
        createTabs(
          "🔢 Conta e abbina",
          "Count & Match"
        );

      const panel =
        buildNumbersPanel();

      connectTabs(
        nav,
        panel
      );
    }
  }

  renderVocabulary =
    function enhancedRenderVocabulary() {
      originalRenderVocabulary();

      window.requestAnimationFrame(
        renderQuickExpandedLearn
      );
    };

})();
