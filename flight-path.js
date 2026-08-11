"use strict";

/*
  Primo Volo d'Italiano
  Volo Flight Path

  The Flight Path tracks PRACTICE,
  not accuracy or mastery.

  Practice data is stored separately
  from the existing Progress Report.
*/

(function initializeVoloFlightPath() {
  const STORAGE_KEY =
    "primoVoloFlightPathPractice";

  const topicSelect =
    document.querySelector("#topicSelect");

  const topicSelectorSection =
    document.querySelector(
      ".topic-selector-section"
    );

  const activityMenu =
    document.querySelector(".activity-menu");

  const main =
    document.querySelector("main.page");

  if (
    !topicSelect ||
    !topicSelectorSection ||
    !activityMenu ||
    !main
  ) {
    console.error(
      "Volo Flight Path could not start."
    );

    return;
  }

  /* ========================================
     PRACTICE DATA
     ======================================== */

  function emptyPracticeData() {
    return {
      version: 1,
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
        version: 1,
        byTopic:
          parsed &&
          typeof parsed.byTopic ===
            "object"
            ? parsed.byTopic
            : {}
      };
    } catch (error) {
      console.warn(
        "Flight Path practice data could not be loaded.",
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
        JSON.stringify(practiceData)
      );
    } catch (error) {
      console.warn(
        "Flight Path practice data could not be saved.",
        error
      );
    }
  }

  function ensureTopicPractice(
    topicKey
  ) {
    if (
      !practiceData.byTopic[topicKey]
    ) {
      practiceData.byTopic[
        topicKey
      ] = {
        practiced: [],
        updatedAt: null
      };
    }

    return practiceData.byTopic[
      topicKey
    ];
  }

  function getPracticedModes(
    topicKey
  ) {
    const topicData =
      practiceData.byTopic[
        topicKey
      ];

    if (
      !topicData ||
      !Array.isArray(
        topicData.practiced
      )
    ) {
      return new Set();
    }

    return new Set(
      topicData.practiced
    );
  }

  function markPracticed(mode) {
    const topicKey =
      topicSelect.value;

    if (
      !topicKey ||
      !mode ||
      mode === "sentences"
    ) {
      return;
    }

    const topicData =
      ensureTopicPractice(
        topicKey
      );

    if (
      !topicData.practiced.includes(
        mode
      )
    ) {
      topicData.practiced.push(
        mode
      );

      topicData.updatedAt =
        new Date().toISOString();

      savePracticeData();
    }

    renderFlightPath();

    document.dispatchEvent(
      new CustomEvent(
        "voloflightpathchange",
        {
          detail: {
            topic: topicKey,
            activity: mode,
            practiceData
          }
        }
      )
    );
  }

  /*
    Expose this for future additions such
    as the Volo Passport and missions.
  */

  window.markVoloPractice =
    markPracticed;

  window.getVoloFlightPathData =
    function getVoloFlightPathData() {
      return practiceData;
    };

  /* ========================================
     CREATE FLIGHT PATH
     ======================================== */

  const flightPath =
    document.createElement(
      "section"
    );

  flightPath.id =
    "voloFlightPath";

  flightPath.className =
    "volo-flight-path";

  flightPath.hidden = true;

  flightPath.innerHTML = `
    <div class="flight-path-heading">

      <div>
        <strong
          class="flight-path-title"
        >
          ✈️ Il viaggio di Volo
        </strong>

        <span
          class="flight-path-subtitle"
        >
          Volo's Learning Journey
        </span>

        <span class="flight-path-instruction">
          Il tuo percorso di pratica · Your practice progress
        </span>
      </div>

      <div class="flight-path-heading-right">

        <span
          id="flightPathTopic"
          class="flight-path-topic"
        ></span>

        <span
          class="flight-path-legend"
        >
          ✓ Praticato · Practiced
        </span>

      </div>

    </div>

    <div
      id="flightPathTrack"
      class="flight-path-track"
      aria-label="Learning activity path"
    ></div>
  `;

  topicSelectorSection
    .insertAdjacentElement(
      "afterend",
      flightPath
    );

  const track =
    flightPath.querySelector(
      "#flightPathTrack"
    );

  const topicLabel =
    flightPath.querySelector(
      "#flightPathTopic"
    );

  /* ========================================
     HELPERS
     ======================================== */

  function getVisibleActivityButtons() {
    return [
      ...activityMenu
        .querySelectorAll(
          ".activity-button"
        )
    ].filter(
      button => !button.hidden
    );
  }

  function getButtonIcon(button) {
    return (
      button.querySelector(
        ".activity-icon"
      )?.textContent.trim() ||
      "•"
    );
  }

  function getButtonLabel(button) {
    return (
      button.querySelector(
        ".activity-italian"
      )?.textContent.trim() ||
      button.textContent.trim()
    );
  }

  /* ========================================
     RENDER
     ======================================== */

  function renderFlightPath() {
    const topicKey =
      topicSelect.value;

    if (!topicKey) {
      flightPath.hidden = true;
      return;
    }

    flightPath.hidden = false;

    const selectedOption =
      topicSelect.options[
        topicSelect.selectedIndex
      ];

    topicLabel.textContent =
      selectedOption
        ? selectedOption
            .textContent
            .trim()
            .replace(/\s+/g, " ")
        : "";

    const buttons =
      getVisibleActivityButtons();

    const practicedModes =
      getPracticedModes(
        topicKey
      );

    track.innerHTML =
      buttons
        .map(
          (button, index) => {
            const mode =
              button.dataset.mode ||
              "";

            const icon =
              getButtonIcon(
                button
              );

            const label =
              getButtonLabel(
                button
              );

            const isActive =
              button.classList
                .contains(
                  "active"
                );

            const isComingSoon =
              mode === "sentences";

            const isDisabled =
              button.disabled ||
              isComingSoon;

            const isPracticed =
              practicedModes.has(
                mode
              );

            const nextMode =
              buttons[
                index + 1
              ]?.dataset.mode;

            const segmentComplete =
              isPracticed &&
              Boolean(nextMode) &&
              practicedModes.has(
                nextMode
              );

            return `
              <button
                type="button"
                class="
                  flight-stop
                  ${
                    isActive
                      ? "active"
                      : ""
                  }
                  ${
                    isPracticed
                      ? "practiced"
                      : ""
                  }
                  ${
                    segmentComplete
                      ? "segment-complete"
                      : ""
                  }
                  ${
                    isComingSoon
                      ? "coming-soon"
                      : ""
                  }
                "
                data-mode="${mode}"
                ${
                  isDisabled
                    ? "disabled"
                    : ""
                }
                aria-label="${label}${
                  isPracticed
                    ? ", practiced"
                    : ""
                }"
              >

                ${
                  isActive
                    ? `
                      <span
                        class="flight-stop-plane"
                        aria-hidden="true"
                      >
                        ✈️
                      </span>
                    `
                    : ""
                }

                <span
                  class="flight-stop-node"
                  aria-hidden="true"
                >
                  ${icon}

                  ${
                    isPracticed
                      ? `
                        <span
                          class="flight-stop-check"
                        >
                          ✓
                        </span>
                      `
                      : ""
                  }
                </span>

                <span
                  class="flight-stop-label"
                >
                  ${label}
                </span>

              </button>
            `;
          }
        )
        .join("");
  }

  /* ========================================
     FLIGHT PATH IS DISPLAY ONLY
     ======================================== */

  /*
    Students choose activities using the
    activity cards below. The Flight Path
    only displays current location and
    practiced activities.
  */

  /* ========================================
     IMPARA PRACTICE
     ======================================== */

  /*
    Opening Impara alone does not count.
    The student must actually interact
    with a vocabulary card.
  */

  document.addEventListener(
    "click",
    event => {
      const vocabularyCard =
        event.target.closest(
          ".vocabulary-card"
        );

      if (!vocabularyCard) {
        return;
      }

      markPracticed("learn");
    }
  );

  /* ========================================
     SCORED ACTIVITY PRACTICE
     ======================================== */

  /*
    The existing recordAttempt function
    still handles accuracy.

    We simply add a practice marker after
    a real response occurs.

    Correctness does NOT affect the
    Flight Path.
  */

  if (
    typeof window.recordAttempt ===
      "function" &&
    !window.recordAttempt
      .__voloFlightPathWrapped
  ) {
    const originalRecordAttempt =
      window.recordAttempt;

    function wrappedRecordAttempt(
      activity,
      isCorrect
    ) {
      const result =
        originalRecordAttempt.apply(
          this,
          arguments
        );

      /*
        Memory is handled separately,
        because one pair attempt is not
        the same as completing the game.
      */

      if (
        activity !== "memory"
      ) {
        markPracticed(
          activity
        );
      }

      return result;
    }

    wrappedRecordAttempt
      .__voloFlightPathWrapped =
      true;

    window.recordAttempt =
      wrappedRecordAttempt;
  }

  /* ========================================
     MEMORY COMPLETION
     ======================================== */

  const memoryActivity =
    document.querySelector(
      "#memoryActivity"
    );

  if (memoryActivity) {
    const memoryObserver =
      new MutationObserver(() => {
        const completedButton =
          memoryActivity.querySelector(
            "#newMemoryGame:not([hidden])"
          );

        if (completedButton) {
          markPracticed(
            "memory"
          );
        }
      });

    memoryObserver.observe(
      memoryActivity,
      {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [
          "hidden"
        ]
      }
    );
  }

  /* ========================================
     PRESENTIAMOCI COMPLETION
     ======================================== */

  const introductionsActivity =
    document.querySelector(
      "#introductionsPracticeActivity"
    );

  if (introductionsActivity) {
    const introductionsObserver =
      new MutationObserver(() => {
        const completed =
          introductionsActivity
            .querySelector(
              "#playIntroductionsAgain"
            );

        if (completed) {
          markPracticed(
            "introductions-practice"
          );
        }
      });

    introductionsObserver.observe(
      introductionsActivity,
      {
        subtree: true,
        childList: true
      }
    );
  }

  /* ========================================
     KEEP PATH IN SYNC
     ======================================== */

  topicSelect.addEventListener(
    "change",
    () => {
      window.setTimeout(
        renderFlightPath,
        0
      );
    }
  );

  activityMenu.addEventListener(
    "click",
    () => {
      window.setTimeout(
        renderFlightPath,
        0
      );
    }
  );

  /*
    Topic-specific activity buttons such
    as Presentiamoci can appear and
    disappear dynamically.
  */

  const activityObserver =
    new MutationObserver(
      () => {
        window.setTimeout(
          renderFlightPath,
          0
        );
      }
    );

  activityObserver.observe(
    activityMenu,
    {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "hidden",
        "disabled",
        "class"
      ],
      childList: true
    }
  );

  renderFlightPath();
})();
