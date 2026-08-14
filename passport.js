"use strict";

/*
  Primo Volo d'Italiano
  Il Passaporto di Volo

  Stage 1:
  Visual passport shell only.

  Achievement rules will be added
  separately after the design is approved.
*/

(function initializeVoloPassport() {
  const headerUtilities =
    document.querySelector(
      ".header-utilities"
    );

  const topicSelect =
    document.querySelector(
      "#topicSelect"
    );

  if (
    !headerUtilities ||
    !topicSelect
  ) {
    console.error(
      "Volo Passport could not start."
    );
    return;
  }

  /* ========================================
     CREATE HEADER BUTTON
     ======================================== */

  let passportButton =
    document.querySelector(
      "#passportButton"
    );

  if (!passportButton) {
    passportButton =
      document.createElement(
        "button"
      );

    passportButton.type =
      "button";

    passportButton.id =
      "passportButton";

    passportButton.className =
      "header-link";

    passportButton.setAttribute(
      "aria-haspopup",
      "dialog"
    );

    passportButton.setAttribute(
      "aria-controls",
      "passportModal"
    );

    passportButton.innerHTML = `
      🛂 Passaporto
    `;

    const progressButton =
      document.querySelector(
        "#progressButton"
      );

    if (progressButton) {
      progressButton
        .insertAdjacentElement(
          "afterend",
          passportButton
        );
    } else {
      headerUtilities
        .appendChild(
          passportButton
        );
    }
  }

  /* ========================================
     BUILD TOPIC LIST
     ======================================== */

  function getTopicList() {
    return [
      ...topicSelect.options
    ]
      .filter(
        option =>
          Boolean(
            option.value
          )
      )
      .map(option => {
        const fullText =
          option.textContent
            .trim()
            .replace(
              /\s+/g,
              " "
            );

        const parts =
          fullText.split("·");

        return {
          key:
            option.value,

          italian:
            parts[0]
              ?.trim() ||
            fullText,

          english:
            parts
              .slice(1)
              .join("·")
              .trim()
        };
      });
  }

  /* ========================================
     CREATE MODAL
     ======================================== */

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "passportModal";

  modal.className =
    "passport-modal";

  modal.hidden = true;

  modal.setAttribute(
    "role",
    "dialog"
  );

  modal.setAttribute(
    "aria-modal",
    "true"
  );

  modal.setAttribute(
    "aria-labelledby",
    "passportTitle"
  );

  modal.innerHTML = `
    <div class="passport-window">

      <button
        type="button"
        id="passportClose"
        class="passport-close"
        aria-label="Close passport"
      >
        ×
      </button>

      <div class="passport-cover">
        <div
          class="passport-cover-plane"
          aria-hidden="true"
        >
          ✈️
        </div>

        <p class="passport-cover-brand">
          FIRST VOLO LEARNING
        </p>

        <h2 id="passportTitle">
          Il Passaporto di Volo
        </h2>

        <p>
          Volo's Learning Passport
        </p>

        <div
          class="passport-cover-mark"
          aria-hidden="true"
        >
          🌿
        </div>
      </div>

      <div class="passport-page">

        <header class="passport-page-heading">
          <div>
            <h3>
              I miei timbri
            </h3>

            <p>
              My Passport Stamps
            </p>
          </div>

          <div class="passport-flag-line"
               aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </header>

        <p class="passport-intro">
          Esplora gli argomenti e raccogli
          timbri lungo il tuo viaggio.
          <span>
            Explore topics and collect
            passport stamps along your journey.
          </span>
        </p>

        <div
          id="passportTopicGrid"
          class="passport-topic-grid"
        ></div>

        <div class="passport-key">
          <div>
            <strong>
              ESPLORATO
            </strong>

            <span>
              Practice most available
              activities (70% or more)
            </span>
          </div>

          <div>
            <strong>
              VOLO PERFETTO
            </strong>

            <span>
              A future error-free
              challenge accomplishment
            </span>
          </div>

          <div>
            <strong>
              IN AZIONE
            </strong>

            <span>
              Future sentence-level
              language use
            </span>
          </div>
        </div>

        <p class="passport-note">
          I timbri saranno guadagnati
          attraverso la pratica.
          <span>
            Stamps will be earned through
            meaningful practice.
          </span>
        </p>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  const closeButton =
    modal.querySelector(
      "#passportClose"
    );

  const topicGrid =
    modal.querySelector(
      "#passportTopicGrid"
    );

  let lastFocusedElement =
    null;

  /* ========================================
     PASSPORT ACHIEVEMENTS
     ======================================== */

  const PASSPORT_STORAGE_KEY =
    "primoVoloPassportAchievements";

  const EXPLORED_RATIO =
    0.70;

  function emptyPassportData() {
    return {
      version: 1,
      byTopic: {}
    };
  }

  function loadPassportData() {
    try {
      const saved =
        window.localStorage.getItem(
          PASSPORT_STORAGE_KEY
        );

      if (!saved) {
        return emptyPassportData();
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
        "Passport achievement data could not be loaded.",
        error
      );

      return emptyPassportData();
    }
  }

  let passportData =
    loadPassportData();

  function savePassportData() {
    try {
      window.localStorage.setItem(
        PASSPORT_STORAGE_KEY,
        JSON.stringify(
          passportData
        )
      );
    } catch (error) {
      console.warn(
        "Passport achievement data could not be saved.",
        error
      );
    }
  }

  function getTopicPracticeStatus(
    topicKey
  ) {
    const flightData =
      typeof window.getVoloFlightPathData ===
        "function"
        ? window.getVoloFlightPathData()
        : null;

    const topicData =
      flightData?.byTopic?.[
        topicKey
      ];

    const available =
      [
        ...new Set(
          Array.isArray(
            topicData?.available
          )
            ? topicData.available
            : []
        )
      ].filter(
        mode =>
          mode &&
          mode !== "sentences"
      );

    const practiced =
      new Set(
        Array.isArray(
          topicData?.practiced
        )
          ? topicData.practiced
          : []
      );

    const practicedAvailable =
      available.filter(
        mode =>
          practiced.has(mode)
      );

    const minimumForSmallSet =
      Math.min(
        4,
        available.length
      );

    const required =
      available.length
        ? Math.max(
            minimumForSmallSet,
            Math.ceil(
              available.length *
              EXPLORED_RATIO
            )
          )
        : 0;

    return {
      available,
      availableCount:
        available.length,

      practiced:
        practicedAvailable,

      practicedCount:
        practicedAvailable.length,

      required,

      qualifies:
        required > 0 &&
        practicedAvailable.length >=
          required
    };
  }

  function syncExploredAchievement(
    topicKey
  ) {
    const existing =
      passportData.byTopic[
        topicKey
      ];

    /*
      Once a regional timbro has been
      earned, keep it earned even if
      new activities are added later.
    */

    if (existing?.explored) {
      return false;
    }

    const status =
      getTopicPracticeStatus(
        topicKey
      );

    if (!status.qualifies) {
      return false;
    }

    const region =
      typeof window.getPassportRegionForTopic ===
        "function"
        ? window.getPassportRegionForTopic(
            topicKey
          )
        : null;

    if (!region) {
      return false;
    }

    passportData.byTopic[
      topicKey
    ] = {
      ...(existing || {}),

      explored: true,

      regionId:
        region.id,

      earnedAt:
        new Date().toISOString(),

      activitiesPracticedAtAward:
        status.practicedCount,

      activitiesAvailableAtAward:
        status.availableCount,

      requiredAtAward:
        status.required
    };

    savePassportData();

    document.dispatchEvent(
      new CustomEvent(
        "volopassportchange",
        {
          detail: {
            topic:
              topicKey,

            achievement:
              passportData.byTopic[
                topicKey
              ]
          }
        }
      )
    );

    return true;
  }

  function syncAllExploredAchievements() {
    getTopicList().forEach(
      topic => {
        syncExploredAchievement(
          topic.key
        );
      }
    );
  }

  window.getVoloPassportData =
    function getVoloPassportData() {
      return passportData;
    };

  window.getVoloPassportPracticeStatus =
    getTopicPracticeStatus;


  /* ========================================
     RENDER PASSPORT TOPICS
     ======================================== */

  function renderPassport() {
    syncAllExploredAchievements();

    const topics =
      getTopicList();

    topicGrid.innerHTML =
      topics.map(topic => {

        const region =
          typeof window.getPassportRegionForTopic ===
            "function"
            ? window.getPassportRegionForTopic(
                topic.key
              )
            : null;

        const landmark =
          region &&
          typeof window.getPrimaryPassportLandmark ===
            "function"
            ? window.getPrimaryPassportLandmark(
                region
              )
            : null;

        const achievement =
          passportData.byTopic[
            topic.key
          ];

        const explored =
          Boolean(
            achievement?.explored
          );

        const practiceStatus =
          getTopicPracticeStatus(
            topic.key
          );

        let statusMarkup;

        if (explored) {
          statusMarkup = `
            <small
              class="
                passport-stamp-status
                passport-stamp-earned-label
              "
            >
              ✓ ESPLORATO

              <span>
                Region explored
              </span>
            </small>
          `;
        } else if (
          practiceStatus.required > 0
        ) {
          const progressTowardStamp =
            Math.min(
              practiceStatus.practicedCount,
              practiceStatus.required
            );

          statusMarkup = `
            <small
              class="passport-stamp-status"
            >
              Timbro da ottenere

              <span>
                ${practiceStatus.practicedCount}/${practiceStatus.availableCount}
                praticate · practiced
                <br>
                ${practiceStatus.required}
                per timbro · for stamp
              </span>
            </small>
          `;
        } else {
          statusMarkup = `
            <small
              class="passport-stamp-status"
            >
              Timbro da ottenere

              <span>
                Stamp to earn
              </span>
            </small>
          `;
        }

        const regionalStampPreview =
          region && landmark
            ? `
              <div
                class="
                  passport-stamp-preview
                  ${
                    explored
                      ? "passport-stamp-earned"
                      : ""
                  }
                "
                aria-hidden="true"
              >
                <img
                  src="${landmark.image}"
                  alt=""
                >
              </div>

              <div
                class="passport-region-label"
              >
                <strong>
                  ${region.region}
                  ${
                    explored
                      ? " · Italia"
                      : ""
                  }
                </strong>

                ${
                  region.english &&
                  region.english !==
                    region.region
                    ? `
                      <span>
                        ${region.english}
                      </span>
                    `
                    : ""
                }
              </div>

              ${statusMarkup}
            `
            : `
              <span
                class="passport-stamp-placeholder"
                aria-hidden="true"
              >
                ✈️
              </span>

              ${statusMarkup}
            `;

        const stampLabel =
          explored && region
            ? `Timbro ${region.region} ottenuto: Esplorato`
            : region
              ? `Timbro della regione ${region.region} non ancora ottenuto`
              : "Timbro non ancora ottenuto";

        return `
          <article
            class="
              passport-topic-card
              ${
                explored
                  ? "passport-topic-earned"
                  : ""
              }
            "
            data-topic="${topic.key}"
            ${
              region
                ? `data-region="${region.id}"`
                : ""
            }
          >

            <div
              class="passport-topic-name"
            >
              <strong>
                ${topic.italian}
              </strong>

              ${
                topic.english
                  ? `
                    <span>
                      ${topic.english}
                    </span>
                  `
                  : ""
              }
            </div>

            <div
              class="
                passport-stamp-space
                passport-stamp-space-preview
              "
              aria-label="${stampLabel}"
            >
              ${regionalStampPreview}
            </div>

          </article>
        `;
      }).join("");
  }


  /* ========================================
     RESPOND TO NEW PRACTICE
     ======================================== */

  document.addEventListener(
    "voloflightpathchange",
    event => {
      const topicKey =
        event.detail?.topic;

      if (!topicKey) {
        return;
      }

      syncExploredAchievement(
        topicKey
      );

      if (!modal.hidden) {
        renderPassport();
      }
    }
  );


  /* ========================================
     OPEN / CLOSE
     ======================================== */

  function openPassport() {
    lastFocusedElement =
      document.activeElement;

    renderPassport();

    modal.hidden = false;

    document.body.style.overflow =
      "hidden";

    closeButton.focus();
  }

  function closePassport() {
    modal.hidden = true;

    document.body.style.overflow =
      "";

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  passportButton.addEventListener(
    "click",
    openPassport
  );

  closeButton.addEventListener(
    "click",
    closePassport
  );

  modal.addEventListener(
    "click",
    event => {
      if (
        event.target === modal
      ) {
        closePassport();
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        !modal.hidden
      ) {
        closePassport();
      }
    }
  );
})();
