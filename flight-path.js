"use strict";

/*
  Primo Volo d'Italiano
  Volo Flight Path
*/

(function initializeVoloFlightPath() {
  const topicSelect =
    document.querySelector("#topicSelect");

  const topicSelectorSection =
    document.querySelector(
      ".topic-selector-section"
    );

  const activityMenu =
    document.querySelector(".activity-menu");

  if (
    !topicSelect ||
    !topicSelectorSection ||
    !activityMenu
  ) {
    console.error(
      "Volo Flight Path could not start."
    );
    return;
  }

  /* ========================================
     CREATE FLIGHT PATH
     ======================================== */

  const flightPath =
    document.createElement("section");

  flightPath.id = "voloFlightPath";
  flightPath.className = "volo-flight-path";
  flightPath.hidden = true;

  flightPath.innerHTML = `
    <div class="flight-path-heading">

      <div>
        <strong class="flight-path-title">
          ✈️ Il viaggio di Volo
        </strong>

        <span class="flight-path-subtitle">
          Volo's Learning Journey
        </span>
      </div>

      <span
        id="flightPathTopic"
        class="flight-path-topic"
      ></span>

    </div>

    <div
      id="flightPathTrack"
      class="flight-path-track"
      aria-label="Learning activity path"
    ></div>
  `;

  topicSelectorSection.insertAdjacentElement(
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
      ...activityMenu.querySelectorAll(
        ".activity-button"
      )
    ].filter(button => !button.hidden);
  }

  function getButtonIcon(button) {
    return (
      button.querySelector(
        ".activity-icon"
      )?.textContent.trim() || "•"
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
        ? selectedOption.textContent
            .trim()
            .replace(/\s+/g, " ")
        : "";

    const buttons =
      getVisibleActivityButtons();

    track.innerHTML =
      buttons.map(button => {
        const mode =
          button.dataset.mode || "";

        const icon =
          getButtonIcon(button);

        const label =
          getButtonLabel(button);

        const isActive =
          button.classList.contains(
            "active"
          );

        const isDisabled =
          button.disabled;

        const isComingSoon =
          mode === "sentences";

        return `
          <button
            type="button"
            class="
              flight-stop
              ${isActive ? "active" : ""}
              ${isDisabled ? "disabled" : ""}
              ${isComingSoon ? "coming-soon" : ""}
            "
            data-mode="${mode}"
            ${isDisabled ? "disabled" : ""}
            aria-label="${label}"
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
            </span>

            <span class="flight-stop-label">
              ${label}
            </span>

          </button>
        `;
      }).join("");
  }

  /* ========================================
     PATH NAVIGATION
     ======================================== */

  track.addEventListener(
    "click",
    event => {
      const stop =
        event.target.closest(
          ".flight-stop"
        );

      if (
        !stop ||
        stop.disabled
      ) {
        return;
      }

      const mode =
        stop.dataset.mode;

      const activityButton =
        activityMenu.querySelector(
          `.activity-button[data-mode="${mode}"]`
        );

      if (
        activityButton &&
        !activityButton.disabled &&
        !activityButton.hidden
      ) {
        activityButton.click();
      }
    }
  );

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
    Presentiamoci and some other topic-
    specific controls can change visibility
    dynamically, so watch the activity menu.
  */

  const activityObserver =
    new MutationObserver(() => {
      window.setTimeout(
        renderFlightPath,
        0
      );
    });

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
