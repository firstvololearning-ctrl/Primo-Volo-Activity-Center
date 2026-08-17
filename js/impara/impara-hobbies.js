"use strict";

/*
  Primo Volo d'Italiano
  Hobby e tempo libero — Impara

  Modes:
  - Esplora
  - Mi piace / Non mi piace

  The preference activity is personal and
  intentionally non-scored.
*/

(function initializeHobbyImpara() {
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

  const sortWorkspace =
    document.querySelector(
      "#learnSortWorkspace"
    );

  if (
    !topicSelect ||
    !learnActivity ||
    !vocabularyGrid ||
    !learnButton ||
    !modeBar ||
    !sortWorkspace
  ) {
    console.error(
      "Hobby Impara could not start."
    );
    return;
  }

  const exploreButton =
    modeBar.querySelector(
      '[data-learn-mode="explore"]'
    );

  const preferenceButton =
    modeBar.querySelector(
      '[data-learn-mode="preference"]'
    );

  if (
    !exploreButton ||
    !preferenceButton
  ) {
    console.error(
      "Hobby Impara could not find its mode buttons."
    );
    return;
  }

  const originalPreferenceHTML =
    preferenceButton.innerHTML;

  const assignments =
    new Map();

  let selectedItalian = "";

  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#hobbyImparaStyles"
    )
  ) {
    const style =
      document.createElement("style");

    style.id =
      "hobbyImparaStyles";

    style.textContent = `
      .hobby-preference-panel {
        max-width: 1120px;
        margin: 0 auto;
      }

      .hobby-preference-intro {
        margin-bottom: 22px;
        text-align: center;
      }

      .hobby-preference-intro h3 {
        margin: 0;
        color: #173b66;
        font-size: 1.4rem;
        font-weight: 900;
      }

      .hobby-preference-intro p {
        margin: 8px auto 0;
        color: #53697f;
        font-weight: 700;
        line-height: 1.5;
      }

      .hobby-preference-intro small {
        display: block;
        margin-top: 3px;
        color: #6b7e91;
        font-weight: 650;
      }

      .hobby-preference-sentence {
        min-height: 58px;
        margin: 0 auto 22px;
        padding: 14px 18px;

        border: 2px solid #ccdaea;
        border-radius: 16px;

        background: #f7fbff;

        color: #173b66;
        font-size: 1.12rem;
        font-weight: 900;
        text-align: center;
      }

      .hobby-preference-sentence:empty {
        display: none;
      }

      .hobby-preference-bank {
        margin-bottom: 22px;
        padding: 18px;

        border: 2px solid #d9e3ed;
        border-radius: 18px;

        background: #ffffff;
      }

      .hobby-preference-bank h4 {
        margin: 0 0 5px;
        color: #173b66;
        font-size: 1rem;
        font-weight: 900;
        text-align: center;
      }

      .hobby-preference-bank > p {
        margin: 0 0 15px;
        color: #6b7e91;
        font-size: 0.86rem;
        font-weight: 700;
        text-align: center;
      }

      .hobby-preference-card-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(126px, 1fr)
          );
        gap: 10px;
      }

      .hobby-preference-card {
        display: grid;
        grid-template-rows:
          112px auto;
        align-items: center;
        justify-items: center;
        gap: 7px;

        min-height: 166px;
        padding: 9px;

        border: 2px solid #cddbeb;
        border-radius: 15px;

        background: #ffffff;

        color: #173b66;
        font: inherit;
        text-align: center;

        cursor: grab;

        box-shadow:
          0 3px 9px
          rgba(23, 59, 102, 0.08);

        transition:
          transform 0.15s ease,
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .hobby-preference-card:hover {
        transform: translateY(-2px);

        border-color: #7899bc;

        box-shadow:
          0 6px 14px
          rgba(23, 59, 102, 0.12);
      }

      .hobby-preference-card.selected {
        border-color: #173b66;

        box-shadow:
          0 0 0 4px
          rgba(23, 59, 102, 0.12);
      }

      .hobby-preference-card img {
        display: block;

        width: 100%;
        height: 112px;

        object-fit: contain;
      }

      .hobby-preference-card strong {
        display: block;

        font-size: 0.82rem;
        font-weight: 900;
        line-height: 1.25;
      }

      .hobby-preference-zones {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 22px;
      }

      .hobby-preference-zone {
        min-height: 170px;
        padding: 12px;

        border: 3px dashed #b9cadb;
        border-radius: 22px;

        background: #fbfdff;

        transition:
          border-color 0.15s ease,
          background 0.15s ease,
          transform 0.15s ease;
      }

      .hobby-preference-zone:focus-visible,
      .hobby-preference-zone.drag-over {
        outline: none;

        border-color: #173b66;

        transform: translateY(-2px);
      }

      .hobby-preference-zone[data-choice="like"] {
        background: #f7fff9;
      }

      .hobby-preference-zone[data-choice="dislike"] {
        background: #fff8f8;
      }

      .hobby-preference-zone-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;

        min-height: 86px;
        margin-bottom: 10px;

        text-align: left;
      }

      .hobby-preference-zone-header img {
        flex: 0 0 auto;

        width: 72px;
        height: 72px;

        object-fit: contain;
      }

      .hobby-preference-zone-header strong {
        display: block;

        color: #173b66;
        font-size: 1.15rem;
        font-weight: 900;
      }

      .hobby-preference-zone-header small {
        display: block;

        margin-top: 3px;

        color: #6b7e91;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .hobby-preference-zone
      .hobby-preference-card-grid:empty::after {
        content:
          "Trascina qui o seleziona una carta e poi questo spazio.";

        display: grid;
        place-items: center;

        min-height: 72px;
        padding: 10px;

        color: #708398;
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.4;
        text-align: center;
      }

      .hobby-preference-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px;

        margin-top: 20px;
      }

      .hobby-preference-reset {
        min-height: 44px;
        padding: 9px 18px;

        border: 2px solid #c7d6e5;
        border-radius: 999px;

        background: #ffffff;

        color: #173b66;
        font: inherit;
        font-weight: 900;

        cursor: pointer;
      }

      .hobby-preference-complete {
        color: #53697f;
        font-size: 0.88rem;
        font-weight: 800;
      }

      @media (max-width: 760px) {
        .hobby-preference-zones {
          grid-template-columns: 1fr;
        }

        .hobby-preference-card-grid {
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
        }

        .hobby-preference-zone-header {
          justify-content: flex-start;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }


  /* ========================================
     HELPERS
     ======================================== */

  function isHobbyTopic() {
    return (
      topicSelect.value ===
      "hobbies"
    );
  }

  function getHobbies() {
    if (
      typeof hobbies ===
        "undefined" ||
      !Array.isArray(hobbies)
    ) {
      return [];
    }

    return hobbies.filter(
      item =>
        item &&
        item.italian &&
        item.image
    );
  }

  function escapeHTML(value) {
    return String(
      value ?? ""
    )
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
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

  function getCarrierImage(
    id,
    fallback
  ) {
    const hobbyCarriers =
      window.carrierPhrases
        ?.hobbies || [];

    return (
      hobbyCarriers.find(
        phrase =>
          phrase.id === id
      )?.image ||
      fallback
    );
  }

  function setPressed(mode) {
    [
      ...modeBar.querySelectorAll(
        "[data-learn-mode]"
      )
    ].forEach(
      button => {
        const active =
          button.dataset.learnMode ===
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
  }

  function buildPhrase(
    item,
    choice
  ) {
    const carrier =
      choice === "like"
        ? "Mi piace"
        : "Non mi piace";

    return (
      `${carrier} ` +
      `${item.italian}.`
    );
  }


  function buildPreferenceSummary(
    items,
    choice
  ) {
    if (!items.length) {
      return "";
    }

    const carrier =
      choice === "like"
        ? "Mi piace"
        : "Non mi piace";

    const labels =
      items.map(
        item => item.italian
      );

    let list = "";

    if (labels.length === 1) {
      list = labels[0];
    } else if (labels.length === 2) {
      list =
        `${labels[0]} e ${labels[1]}`;
    } else {
      list =
        labels
          .slice(0, -1)
          .join(", ") +
        ` e ${labels.at(-1)}`;
    }

    return `${carrier} ${list}.`;
  }


  /* ========================================
     CARD MARKUP
     ======================================== */

  function cardMarkup(item) {
    const selected =
      selectedItalian ===
      item.italian;

    return `
      <button
        type="button"
        class="
          hobby-preference-card
          ${selected ? "selected" : ""}
        "
        draggable="true"
        data-hobby="${escapeHTML(
          item.italian
        )}"
        aria-pressed="${
          selected
            ? "true"
            : "false"
        }"
      >
        <img
          src="${escapeHTML(
            item.image
          )}"
          alt=""
          draggable="false"
        >

        <strong>
          ${escapeHTML(
            item.italian
          )}
        </strong>
      </button>
    `;
  }


  /* ========================================
     EXPLORE
     ======================================== */

  function showExplore() {
    selectedItalian = "";

    sortWorkspace.hidden =
      true;

    sortWorkspace.dataset
      .hobbyActive =
      "false";

    vocabularyGrid.hidden =
      false;

    setPressed(
      "explore"
    );
  }


  /* ========================================
     PREFERENCE SORT
     ======================================== */

  function renderPreference(
    lastChoice = ""
  ) {
    const items =
      getHobbies();

    const likeItems =
      items.filter(
        item =>
          assignments.get(
            item.italian
          ) === "like"
      );

    const dislikeItems =
      items.filter(
        item =>
          assignments.get(
            item.italian
          ) === "dislike"
      );

    const unassignedItems =
      items.filter(
        item =>
          !assignments.has(
            item.italian
          )
      );

    const summary =
      lastChoice === "like"
        ? buildPreferenceSummary(
            likeItems,
            "like"
          )
        : lastChoice === "dislike"
          ? buildPreferenceSummary(
              dislikeItems,
              "dislike"
            )
          : "";

    const likeImage =
      getCarrierImage(
        "piace",
        "images/carrier-phrases/mi-piace-no-text.png"
      );

    const dislikeImage =
      getCarrierImage(
        "nonPiace",
        "images/carrier-phrases/non-mi-piace-no-text.png"
      );

    vocabularyGrid.hidden =
      true;

    sortWorkspace.hidden =
      false;

    sortWorkspace.dataset
      .hobbyActive =
      "true";

    setPressed(
      "preference"
    );

    sortWorkspace.innerHTML = `
      <div
        class="hobby-preference-panel"
      >
        <header
          class="hobby-preference-intro"
        >
          <h3>
            ❤️ Mi piace o
            non mi piace?
          </h3>

          <p>
            Metti ogni attività
            dove preferisci.
            Non ci sono risposte
            giuste o sbagliate.
          </p>

          <small>
            Sort each activity by
            your own preference.
            There are no right or
            wrong answers.
          </small>
        </header>

        <div
          class="hobby-preference-sentence"
          aria-live="polite"
        >${escapeHTML(
          summary
        )}</div>

        <div
          class="hobby-preference-zones"
        >

          <section
            class="hobby-preference-zone"
            data-choice="like"
            tabindex="0"
            aria-label="Mi piace"
          >
            <header
              class="
                hobby-preference-zone-header
              "
            >
              <img
                src="${escapeHTML(
                  likeImage
                )}"
                alt=""
              >

              <div>
                <strong>
                  Mi piace…
                </strong>

                <small>
                  I like…
                </small>
              </div>
            </header>

            <div
              class="
                hobby-preference-card-grid
              "
            >
              ${likeItems
                .map(cardMarkup)
                .join("")}
            </div>
          </section>


          <section
            class="hobby-preference-zone"
            data-choice="dislike"
            tabindex="0"
            aria-label="Non mi piace"
          >
            <header
              class="
                hobby-preference-zone-header
              "
            >
              <img
                src="${escapeHTML(
                  dislikeImage
                )}"
                alt=""
              >

              <div>
                <strong>
                  Non mi piace…
                </strong>

                <small>
                  I don't like…
                </small>
              </div>
            </header>

            <div
              class="
                hobby-preference-card-grid
              "
            >
              ${dislikeItems
                .map(cardMarkup)
                .join("")}
            </div>
          </section>

        </div>

        <section
          class="hobby-preference-bank"
        >
          <h4>
            Scegli un'attività
          </h4>

          <p>
            Trascina una carta,
            oppure toccala e poi
            scegli una delle due
            colonne.
          </p>

          <div
            class="hobby-preference-card-grid"
          >
            ${unassignedItems
              .map(cardMarkup)
              .join("")}
          </div>
        </section>

        <footer
          class="hobby-preference-footer"
        >
          <button
            type="button"
            class="
              hobby-preference-reset
            "
          >
            ↺ Ricomincia
          </button>

          <span
            class="
              hobby-preference-complete
            "
          >
            ${
              assignments.size ===
              items.length
                ? "✓ Hai ordinato tutte le attività!"
                : `${assignments.size} / ${items.length}`
            }
          </span>
        </footer>
      </div>
    `;

    installPreferenceEvents();
  }


  function assignHobby(
    italian,
    choice
  ) {
    const item =
      getHobbies().find(
        candidate =>
          candidate.italian ===
          italian
      );

    if (!item) {
      return;
    }

    assignments.set(
      item.italian,
      choice
    );

    selectedItalian = "";

    const phrase =
      buildPhrase(
        item,
        choice
      );

    speak(
      phrase
    );

    markPractice();

    renderPreference(
      choice
    );
  }


  function installPreferenceEvents() {
    const cards =
      [
        ...sortWorkspace
          .querySelectorAll(
            ".hobby-preference-card"
          )
      ];

    const zones =
      [
        ...sortWorkspace
          .querySelectorAll(
            ".hobby-preference-zone"
          )
      ];

    cards.forEach(
      card => {

        card.addEventListener(
          "click",
          () => {
            selectedItalian =
              card.dataset.hobby ||
              "";

            cards.forEach(
              other => {
                const active =
                  other === card;

                other.classList.toggle(
                  "selected",
                  active
                );

                other.setAttribute(
                  "aria-pressed",
                  String(active)
                );
              }
            );
          }
        );

        card.addEventListener(
          "dragstart",
          event => {
            selectedItalian =
              card.dataset.hobby ||
              "";

            event.dataTransfer
              ?.setData(
                "text/plain",
                selectedItalian
              );

            if (
              event.dataTransfer
            ) {
              event.dataTransfer
                .effectAllowed =
                "move";
            }
          }
        );
      }
    );


    zones.forEach(
      zone => {

        zone.addEventListener(
          "dragover",
          event => {
            event.preventDefault();

            zone.classList.add(
              "drag-over"
            );
          }
        );

        zone.addEventListener(
          "dragleave",
          () => {
            zone.classList.remove(
              "drag-over"
            );
          }
        );

        zone.addEventListener(
          "drop",
          event => {
            event.preventDefault();

            zone.classList.remove(
              "drag-over"
            );

            const italian =
              event.dataTransfer
                ?.getData(
                  "text/plain"
                ) ||
              selectedItalian;

            if (!italian) {
              return;
            }

            assignHobby(
              italian,
              zone.dataset.choice
            );
          }
        );

        zone.addEventListener(
          "click",
          event => {
            if (
              event.target.closest(
                ".hobby-preference-card"
              )
            ) {
              return;
            }

            if (
              !selectedItalian
            ) {
              return;
            }

            assignHobby(
              selectedItalian,
              zone.dataset.choice
            );
          }
        );

        zone.addEventListener(
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

            if (
              !selectedItalian
            ) {
              return;
            }

            event.preventDefault();

            assignHobby(
              selectedItalian,
              zone.dataset.choice
            );
          }
        );
      }
    );


    sortWorkspace
      .querySelector(
        ".hobby-preference-reset"
      )
      ?.addEventListener(
        "click",
        () => {
          assignments.clear();

          selectedItalian = "";

          renderPreference();
        }
      );
  }


  /* ========================================
     HOBBY MODE BAR
     ======================================== */

  function configureHobbyModes(
    resetToExplore = false
  ) {
    if (
      !isHobbyTopic()
    ) {
      preferenceButton.innerHTML =
        originalPreferenceHTML;

      sortWorkspace.dataset
        .hobbyActive =
        "false";

      return;
    }

    modeBar.hidden =
      false;

    [
      ...modeBar.querySelectorAll(
        "[data-learn-mode]"
      )
    ].forEach(
      button => {
        const mode =
          button.dataset.learnMode;

        button.hidden =
          !(
            mode ===
              "explore" ||
            mode ===
              "preference"
          );
      }
    );

    preferenceButton.hidden =
      false;

    preferenceButton.innerHTML = `
      <span>
        ❤️ Mi piace /
        Non mi piace
      </span>

      <small>
        Sort Your Preferences
      </small>
    `;

    if (
      resetToExplore ||
      sortWorkspace.dataset
        .hobbyActive !==
        "true"
    ) {
      showExplore();
    }
  }


  /*
    Capture these two clicks only for
    the hobby topic so learn-sort.js
    keeps its existing behavior for food
    and every other topic.
  */

  exploreButton.addEventListener(
    "click",
    event => {
      if (
        !isHobbyTopic()
      ) {
        return;
      }

      event.preventDefault();

      event.stopImmediatePropagation();

      showExplore();
    },
    true
  );


  preferenceButton.addEventListener(
    "click",
    event => {
      if (
        !isHobbyTopic()
      ) {
        return;
      }

      event.preventDefault();

      event.stopImmediatePropagation();

      renderPreference();
    },
    true
  );


  topicSelect.addEventListener(
    "change",
    () => {
      window.setTimeout(
        () => {
          if (
            isHobbyTopic()
          ) {
            assignments.clear();

            selectedItalian = "";

            configureHobbyModes(
              true
            );

            return;
          }

          preferenceButton.innerHTML =
            originalPreferenceHTML;
        },
        0
      );
    }
  );


  learnButton.addEventListener(
    "click",
    () => {
      window.setTimeout(
        () => {
          if (
            isHobbyTopic()
          ) {
            configureHobbyModes();
          }
        },
        0
      );
    }
  );


  window.setTimeout(
    configureHobbyModes,
    0
  );

})();
