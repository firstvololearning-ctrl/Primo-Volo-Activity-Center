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
  const storage = window.PrimoVoloStorage;

  if (!storage) {
    console.error(
      "Volo Flight Path could not start because PrimoVoloStorage was not found."
    );
    return;
  }

  const STORAGE_KEY = storage.keys.practice;

  function getPracticeStorageKey() {
    return storage.studentKey(STORAGE_KEY);
  }

  function normalizePracticeMode(mode) {
    if (
      mode === "conversation-choice" ||
      mode === "conversation-write"
    ) {
      return "conversation-practice";
    }

    return mode;
  }

  window.getPrimoVoloFlightPathStorageKey =
    getPracticeStorageKey;

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
        storage.getItem(
          getPracticeStorageKey()
        );

      if (!saved) {
        return emptyPracticeData();
      }

      const parsed =
        JSON.parse(saved);

      const byTopic =
        parsed &&
        typeof parsed.byTopic ===
          "object"
          ? parsed.byTopic
          : {};

      Object.values(byTopic)
        .forEach(topicData => {
          if (
            !topicData ||
            !Array.isArray(
              topicData.practiced
            )
          ) {
            return;
          }

          topicData.practiced = [
            ...new Set(
              topicData.practiced
                .map(
                  normalizePracticeMode
                )
                .filter(Boolean)
            )
          ];
        });

      return {
        version: 1,
        byTopic
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
      storage.setItem(
        getPracticeStorageKey(),
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
        available: [],
        updatedAt: null,
        availabilityUpdatedAt: null
      };
    }

    const topicData =
      practiceData.byTopic[
        topicKey
      ];

    if (
      !Array.isArray(
        topicData.practiced
      )
    ) {
      topicData.practiced = [];
    }

    if (
      !Array.isArray(
        topicData.available
      )
    ) {
      topicData.available = [];
    }

    return topicData;
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
    mode =
      normalizePracticeMode(mode);

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

  window.addEventListener(
    "primo-volo-student-changed",
    () => {
      practiceData = loadPracticeData();

      window.requestAnimationFrame(() => {
        renderFlightPath();

        document.dispatchEvent(
          new CustomEvent(
            "voloflightpathchange",
            {
              detail: {
                practiceData
              }
            }
          )
        );
      });
    }
  );

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
        <span class="flight-path-title-audio-row">
          <strong
            class="flight-path-title"
          >
            🧭 Percorso di pratica
          </strong>

          <button
            type="button"
            class="pv-audio-button pv-audio-small"
            data-speak-it="Percorso di pratica"
            aria-label="Ascolta: Percorso di pratica"
            title="Ascolta"
          >🔊</button>
        </span>

        <span
          class="flight-path-subtitle"
        >
          Practice Path
        </span>

        <span class="flight-path-instruction">
          Le attività di questo argomento · Steps for this topic
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
      aria-label="Practice activity path"
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

  function getEligibleActivityModes(
    buttons = getVisibleActivityButtons()
  ) {
    return [
      ...new Set(
        buttons
          .filter(button => {
            const mode =
              button.dataset.mode;

            return (
              mode &&
              mode !== "sentences" &&
              !button.disabled &&
              button.getAttribute(
                "aria-disabled"
              ) !== "true" &&
              !button.classList.contains(
                "coming-soon"
              )
            );
          })
          .map(
            button =>
              button.dataset.mode
          )
      )
    ];
  }

  function sameModeList(
    first,
    second
  ) {
    return (
      JSON.stringify(
        [...first].sort()
      ) ===
      JSON.stringify(
        [...second].sort()
      )
    );
  }

  function saveAvailableModes(
    topicKey,
    buttons
  ) {
    const topicData =
      ensureTopicPractice(
        topicKey
      );

    const availableModes =
      getEligibleActivityModes(
        buttons
      );

    if (
      !sameModeList(
        topicData.available,
        availableModes
      )
    ) {
      topicData.available =
        availableModes;

      topicData.availabilityUpdatedAt =
        new Date().toISOString();

      savePracticeData();
    }

    return availableModes;
  }

  window.getVoloAvailableModesForTopic =
    function getVoloAvailableModesForTopic(
      topicKey
    ) {
      const topicData =
        practiceData.byTopic[
          topicKey
        ];

      return Array.isArray(
        topicData?.available
      )
        ? [...topicData.available]
        : [];
    };


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

    saveAvailableModes(
      topicKey,
      buttons
    );

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
