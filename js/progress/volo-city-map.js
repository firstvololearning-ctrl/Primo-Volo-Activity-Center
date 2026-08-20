
"use strict";

/*
  Primo Volo d'Italiano
  Mappa di Volo — City Unlock Journey

  This REPLACES the Passport UI as the motivational layer.
  It reuses Flight Path practice data and preserves previously
  earned Passport "explored" achievements during migration.

  Progress Report remains separate accuracy/performance evidence.
*/

(function initializeVoloCityJourney() {
  const headerUtilities =
    document.querySelector(".header-utilities");

  const topicSelect =
    document.querySelector("#topicSelect");

  const topicSelectorSection =
    document.querySelector(
      ".topic-selector-section"
    );

  if (
    !headerUtilities ||
    !topicSelect ||
    !topicSelectorSection
  ) {
    console.error("Mappa di Volo could not start.");
    return;
  }

  const CURRENT_STUDENT_STORAGE_KEY =
    "primoVoloCurrentStudentV1";

  const JOURNEY_STORAGE_KEY =
    "primoVoloCityJourneyV1";

  const OLD_PASSPORT_STORAGE_KEY =
    "primoVoloPassportAchievements";

  const EXPLORED_RATIO = 0.70;

  /*
    The 10-city journey is intentionally explicit and stable.
    Two explored topics unlock each new city.
    Route is geographically readable across the underlay.
  */
  const CITY_STOPS = [
    { id:"genova", name:"Genova", regionId:"liguria", x:39.0, y:34.0, labelDx:-18, labelDy:19, unlockAt:2 },
    { id:"torino", name:"Torino", regionId:"piemonte", x:35.5, y:27.0, labelDx:-27, labelDy:18, unlockAt:4 },
    { id:"milano", name:"Milano", regionId:"lombardia", x:40.5, y:26.0, labelDx:30, labelDy:10, unlockAt:6 },
    { id:"venezia", name:"Venezia", regionId:"veneto", x:50.5, y:27.5, labelDx:27, labelDy:18, unlockAt:8 },
    { id:"firenze", name:"Firenze", regionId:"toscana", x:45.0, y:40.0, labelDx:20, labelDy:19, unlockAt:10 },
    { id:"roma", name:"Roma", regionId:"lazio", x:52.0, y:51.0, labelDx:-10, labelDy:20, unlockAt:12 },
    { id:"napoli", name:"Napoli", regionId:"campania", x:60.0, y:59.0, labelDx:4, labelDy:20, unlockAt:14 },
    { id:"lecce", name:"Lecce", regionId:"puglia", x:72.0, y:61.0, labelDx:17, labelDy:20, unlockAt:16 },
    { id:"palermo", name:"Palermo", regionId:"sicilia", x:50.5, y:83.0, labelDx:-8, labelDy:21, unlockAt:18 },
    { id:"cagliari", name:"Cagliari", regionId:"sardegna", x:29.0, y:69.0, labelDx:-9, labelDy:21, unlockAt:20 }
  ];

  function studentSuffix() {
    const studentId =
      window.localStorage.getItem(
        CURRENT_STUDENT_STORAGE_KEY
      );

    return studentId
      ? ":student:" + studentId
      : "";
  }

  function journeyStorageKey() {
    return JOURNEY_STORAGE_KEY + studentSuffix();
  }

  function oldPassportStorageKey() {
    return OLD_PASSPORT_STORAGE_KEY + studentSuffix();
  }

  function emptyJourneyData() {
    return {
      version: 1,
      exploredTopics: {},
      celebratedCities: [],
      migratedPassport: false
    };
  }

  function loadJourneyData() {
    try {
      const saved =
        window.localStorage.getItem(
          journeyStorageKey()
        );

      if (!saved) {
        return emptyJourneyData();
      }

      const parsed = JSON.parse(saved);

      return {
        version: 1,
        exploredTopics:
          parsed &&
          typeof parsed.exploredTopics === "object"
            ? parsed.exploredTopics
            : {},
        celebratedCities:
          Array.isArray(parsed?.celebratedCities)
            ? parsed.celebratedCities
            : [],
        migratedPassport:
          Boolean(parsed?.migratedPassport)
      };
    } catch (error) {
      console.warn(
        "City journey data could not be loaded.",
        error
      );
      return emptyJourneyData();
    }
  }

  let journeyData = loadJourneyData();

  function saveJourneyData() {
    try {
      window.localStorage.setItem(
        journeyStorageKey(),
        JSON.stringify(journeyData)
      );
    } catch (error) {
      console.warn(
        "City journey data could not be saved.",
        error
      );
    }
  }

  function migrateOldPassportOnce() {
    if (journeyData.migratedPassport) {
      return;
    }

    try {
      const saved =
        window.localStorage.getItem(
          oldPassportStorageKey()
        );

      if (saved) {
        const oldData = JSON.parse(saved);
        const byTopic = oldData?.byTopic || {};

        Object.entries(byTopic)
          .forEach(([topicKey, achievement]) => {
            if (achievement?.explored) {
              journeyData.exploredTopics[topicKey] = {
                earnedAt:
                  achievement.earnedAt ||
                  new Date().toISOString(),
                source: "passport-migration"
              };
            }
          });
      }
    } catch (error) {
      console.warn(
        "Old Passport achievements could not be migrated.",
        error
      );
    }

    journeyData.migratedPassport = true;
    saveJourneyData();
  }

  function topicList() {
    return [...topicSelect.options]
      .filter(option => Boolean(option.value))
      .map(option => option.value);
  }

  function topicPracticeStatus(topicKey) {
    const flightData =
      typeof window.getVoloFlightPathData === "function"
        ? window.getVoloFlightPathData()
        : null;

    const topicData =
      flightData?.byTopic?.[topicKey];

    const available = [
      ...new Set(
        Array.isArray(topicData?.available)
          ? topicData.available
          : []
      )
    ].filter(
      mode =>
        mode &&
        mode !== "sentences"
    );

    const practiced = new Set(
      Array.isArray(topicData?.practiced)
        ? topicData.practiced
        : []
    );

    const practicedAvailable =
      available.filter(
        mode => practiced.has(mode)
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
      availableCount: available.length,
      practicedCount:
        practicedAvailable.length,
      required,
      qualifies:
        required > 0 &&
        practicedAvailable.length >= required
    };
  }

  function syncExploredTopics() {
    migrateOldPassportOnce();

    let changed = false;

    topicList().forEach(topicKey => {
      if (
        journeyData.exploredTopics[
          topicKey
        ]
      ) {
        return;
      }

      const status =
        topicPracticeStatus(topicKey);

      if (!status.qualifies) {
        return;
      }

      journeyData.exploredTopics[
        topicKey
      ] = {
        earnedAt:
          new Date().toISOString(),
        practicedCount:
          status.practicedCount,
        availableCount:
          status.availableCount,
        requiredAtAward:
          status.required,
        source: "flight-path"
      };

      changed = true;
    });

    if (changed) {
      saveJourneyData();
    }

    return changed;
  }

  function exploredCount() {
    return Object.keys(
      journeyData.exploredTopics
    ).length;
  }

  function unlockedCities() {
    const count = exploredCount();

    return CITY_STOPS.filter(
      city =>
        count >= city.unlockAt
    );
  }

  /* ========================================
     HOME-SCREEN ITALY JOURNEY CARD
     ======================================== */

  const journeyCard =
    document.createElement(
      "section"
    );

  journeyCard.id =
    "voloItalyJourneyCard";

  journeyCard.className =
    "volo-journey-home-card";

  journeyCard.setAttribute(
    "aria-labelledby",
    "voloJourneyHomeTitle"
  );

  journeyCard.innerHTML = `
    <div class="volo-journey-home-copy">
      <span class="volo-journey-home-kicker">
        🗺️ Viaggio in Italia
      </span>

      <h2 id="voloJourneyHomeTitle">
        Il tuo viaggio in Italia
        <span lang="en">
          Your Italy Journey
        </span>
      </h2>

      <p class="volo-journey-home-description">
        Pratica gli argomenti e raggiungi nuove città.
        Ogni due argomenti esplorati sblocchi una nuova tappa.
        <span lang="en">
          Practice across topics and unlock a new Italian city
          for every two topics explored.
        </span>
      </p>

      <div class="volo-journey-home-stats">
        <span id="voloJourneyHomeTopics"></span>
        <span id="voloJourneyHomeCities"></span>
      </div>

      <p
        id="voloJourneyHomeNext"
        class="volo-journey-home-next"
      ></p>

      <button
        type="button"
        id="voloJourneyCardButton"
        class="volo-journey-home-button"
        aria-haspopup="dialog"
        aria-controls="voloCityMapModal"
      >
        Apri la mappa
        <span lang="en">Open Map</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>

    <div
      class="volo-journey-home-preview"
      aria-hidden="true"
    >
      <span>10 città · 10 cities</span>
    </div>
  `;

  topicSelectorSection
    .insertAdjacentElement(
      "beforebegin",
      journeyCard
    );

  const journeyCardButton =
    journeyCard.querySelector(
      "#voloJourneyCardButton"
    );

  const journeyHomeTopics =
    journeyCard.querySelector(
      "#voloJourneyHomeTopics"
    );

  const journeyHomeCities =
    journeyCard.querySelector(
      "#voloJourneyHomeCities"
    );

  const journeyHomeNext =
    journeyCard.querySelector(
      "#voloJourneyHomeNext"
    );

  function renderJourneyCard() {
    syncExploredTopics();

    const count =
      exploredCount();

    const unlocked =
      unlockedCities();

    journeyHomeTopics.textContent =
      `✓ ${count} argomenti esplorati · topics explored`;

    journeyHomeCities.textContent =
      `📍 ${unlocked.length} / ${CITY_STOPS.length} città raggiunte · cities reached`;

    const nextCity =
      CITY_STOPS.find(
        city => count < city.unlockAt
      );

    if (!nextCity) {
      journeyHomeNext.textContent =
        `🎉 Tutte le ${CITY_STOPS.length} città raggiunte! · All cities reached!`;
      return;
    }

    const remaining =
      nextCity.unlockAt - count;

    journeyHomeNext.textContent =
      `Prossima tappa · Next stop: ${nextCity.name} — ${remaining} ${
        remaining === 1 ? "argomento" : "argomenti"
      } ancora · ${remaining} more ${
        remaining === 1 ? "topic" : "topics"
      }`;
  }

  /* ========================================
     BUTTON
     ======================================== */

  let mapButton =
    document.querySelector(
      "#voloCityMapButton"
    );

  if (!mapButton) {
    mapButton =
      document.createElement(
        "button"
      );

    mapButton.type = "button";
    mapButton.id = "voloCityMapButton";
    mapButton.className = "header-link";
    mapButton.setAttribute(
      "aria-haspopup",
      "dialog"
    );
    mapButton.setAttribute(
      "aria-controls",
      "voloCityMapModal"
    );
    mapButton.innerHTML =
      "🗺️ Viaggio in Italia";

    const progressButton =
      document.querySelector(
        "#progressButton"
      );

    if (progressButton) {
      progressButton.insertAdjacentElement(
        "afterend",
        mapButton
      );
    } else {
      headerUtilities.appendChild(
        mapButton
      );
    }
  }

  /* ========================================
     MODAL
     ======================================== */

  const modal =
    document.createElement("div");

  modal.id = "voloCityMapModal";
  modal.className =
    "volo-city-map-modal";
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
    "voloCityMapTitle"
  );

  modal.innerHTML = `
    <div class="volo-city-map-window">

      <button
        type="button"
        class="volo-city-map-close"
        aria-label="Chiudi la mappa · Close map"
      >×</button>

      <header class="volo-city-map-header">
        <h2 id="voloCityMapTitle">
          🗺️ Il tuo viaggio in Italia
        </h2>
        <p>
          Esplora gli argomenti e raggiungi nuove città in tutta Italia.
          <span lang="en">
            Your Italy Journey: explore topics and unlock new cities.
          </span>
        </p>
      </header>

      <div class="volo-city-map-summary">
        <span
          class="volo-city-map-pill"
          id="voloCityTopicCount"
        ></span>
        <span
          class="volo-city-map-pill"
          id="voloCityUnlockCount"
        ></span>
      </div>

      <div class="volo-city-map-board-wrap">
        <div
          class="volo-city-map-board"
          id="voloCityMapBoard"
        >
          <img
            class="volo-city-map-underlay"
            src="images/progress/italy-journey/italy-underlay-watercolor.png"
            alt="Mappa illustrata dell'Italia"
          >

          <svg
            class="volo-city-map-route"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              id="voloCityRouteBase"
              class="volo-city-route-base"
              points=""
            ></polyline>

            <polyline
              id="voloCityRouteProgress"
              class="volo-city-route-progress"
              points=""
            ></polyline>
          </svg>

          <div
            id="voloCityArrival"
            class="volo-city-arrival"
            hidden
          >
            <button
              type="button"
              class="volo-city-arrival-close"
              aria-label="Chiudi · Close"
            >×</button>

            <img
              id="voloCityArrivalDiorama"
              class="volo-city-arrival-diorama"
              alt=""
            >

            <div class="volo-city-arrival-copy">
              <h3 id="voloCityArrivalTitle"></h3>
              <p
                id="voloCityArrivalRegion"
                class="volo-city-arrival-region"
              ></p>

              <div
                id="voloCityCultureRow"
                class="volo-city-culture-row"
              ></div>

              <span
                id="voloCityArrivalBadge"
                class="volo-city-arrival-badge"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <p class="volo-city-map-note">
        Ogni due argomenti esplorati sblocchi una nuova città.
        <span lang="en">
          Every two explored topics unlock a new city.
        </span>
        La mappa riflette la pratica completata, non un livello
        di padronanza.
      </p>
    </div>
  `;

  document.body.appendChild(modal);

  const board =
    modal.querySelector(
      "#voloCityMapBoard"
    );

  const closeButton =
    modal.querySelector(
      ".volo-city-map-close"
    );

  const arrival =
    modal.querySelector(
      "#voloCityArrival"
    );

  const arrivalClose =
    modal.querySelector(
      ".volo-city-arrival-close"
    );

  const arrivalDiorama =
    modal.querySelector(
      "#voloCityArrivalDiorama"
    );

  const arrivalTitle =
    modal.querySelector(
      "#voloCityArrivalTitle"
    );

  const arrivalRegion =
    modal.querySelector(
      "#voloCityArrivalRegion"
    );

  const cultureRow =
    modal.querySelector(
      "#voloCityCultureRow"
    );

  const arrivalBadge =
    modal.querySelector(
      "#voloCityArrivalBadge"
    );

  const topicCountNode =
    modal.querySelector(
      "#voloCityTopicCount"
    );

  const unlockCountNode =
    modal.querySelector(
      "#voloCityUnlockCount"
    );

  const routeBase =
    modal.querySelector(
      "#voloCityRouteBase"
    );

  const routeProgress =
    modal.querySelector(
      "#voloCityRouteProgress"
    );

  let lastFocused = null;

  function routePoints(cities) {
    return cities
      .map(
        city =>
          `${city.x},${city.y}`
      )
      .join(" ");
  }

  function clearMapOverlay() {
    board
      .querySelectorAll(
        ".volo-city-stop," +
        ".volo-city-stop-label," +
        ".volo-city-plane"
      )
      .forEach(node => node.remove());
  }

  function cultureCard(
    label,
    item
  ) {
    if (!item?.image) {
      return "";
    }

    return `
      <div class="volo-city-culture-card">
        <img
          src="${item.image}"
          alt="${item.name || label}"
        >
        <strong>
          ${label}: ${item.name || ""}
        </strong>
      </div>
    `;
  }

  function showArrival(
    city,
    automatic = false
  ) {
    const region =
      typeof window.getPassportRegionById ===
        "function"
        ? window.getPassportRegionById(
            city.regionId
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

    const food =
      region &&
      typeof window.getPrimaryPassportFood ===
        "function"
        ? window.getPrimaryPassportFood(
            region
          )
        : null;

    arrivalDiorama.src =
      `images/progress/italy-journey/cities/${city.id}.png`;

    arrivalDiorama.alt =
      `Diorama di ${city.name}`;

    arrivalTitle.textContent =
      `Sei arrivato a ${city.name}!`;

    arrivalRegion.textContent =
      region
        ? `${region.region} · ${region.english}`
        : "";

    cultureRow.innerHTML =
      cultureCard(
        "Luogo",
        landmark
      ) +
      cultureCard(
        "Cibo",
        food
      );

    arrivalBadge.textContent =
      `${exploredCount()} argomenti esplorati · topics explored`;

    arrival.hidden = false;

    if (automatic) {
      const celebrated =
        new Set(
          journeyData.celebratedCities
        );

      celebrated.add(city.id);

      journeyData.celebratedCities =
        [...celebrated];

      saveJourneyData();
    }

    window.requestAnimationFrame(
      () => arrivalClose.focus()
    );
  }

  function hideArrival() {
    arrival.hidden = true;
  }

  function renderMap() {
    syncExploredTopics();

    const count =
      exploredCount();

    const unlocked =
      unlockedCities();

    const unlockedIds =
      new Set(
        unlocked.map(
          city => city.id
        )
      );

    const currentCity =
      unlocked[
        unlocked.length - 1
      ] || null;

    topicCountNode.textContent =
      `✓ ${count} argomenti esplorati · topics explored`;

    unlockCountNode.textContent =
      `📍 ${unlocked.length} / ${CITY_STOPS.length} città · cities`;

    routeBase.setAttribute(
      "points",
      routePoints(CITY_STOPS)
    );

    routeProgress.setAttribute(
      "points",
      routePoints(unlocked)
    );

    clearMapOverlay();

    CITY_STOPS.forEach(
      (city, index) => {
        const unlockedNow =
          unlockedIds.has(city.id);

        const marker =
          document.createElement(
            "button"
          );

        marker.type = "button";

        marker.className =
          "volo-city-stop" +
          (
            unlockedNow
              ? " is-unlocked"
              : ""
          ) +
          (
            currentCity?.id ===
              city.id
              ? " is-current"
              : ""
          );

        marker.style.left =
          `${city.x}%`;

        marker.style.top =
          `${city.y}%`;

        marker.textContent =
          String(index + 1);

        marker.setAttribute(
          "aria-label",
          unlockedNow
            ? `${city.name} — città raggiunta`
            : `${city.name} — si sblocca dopo ${city.unlockAt} argomenti esplorati`
        );

        if (unlockedNow) {
          marker.addEventListener(
            "click",
            () =>
              showArrival(
                city,
                false
              )
          );
        } else {
          marker.disabled = true;
        }

        board.appendChild(marker);

        const label =
          document.createElement(
            "span"
          );

        label.className =
          "volo-city-stop-label";

        label.style.left =
          `calc(${city.x}% + ${city.labelDx || 0}px)`;

        label.style.top =
          `calc(${city.y}% + ${city.labelDy || 18}px)`;

        label.textContent =
          city.name;

        board.appendChild(label);
      }
    );

    if (currentCity) {
      const plane =
        document.createElement(
          "span"
        );

      plane.className =
        "volo-city-plane";

      plane.style.left =
        `calc(${currentCity.x}% + 27px)`;

      plane.style.top =
        `calc(${currentCity.y}% - 20px)`;

      plane.textContent = "✈️";

      board.appendChild(plane);
    }
  }

  function celebrateNewestUnseenCity() {
    const unlocked =
      unlockedCities();

    const celebrated =
      new Set(
        journeyData.celebratedCities
      );

    const newest =
      [...unlocked]
        .reverse()
        .find(
          city =>
            !celebrated.has(
              city.id
            )
        );

    if (newest) {
      showArrival(
        newest,
        true
      );
    }
  }

  function openMap() {
    lastFocused =
      document.activeElement;

    renderMap();

    modal.hidden = false;

    document.body.style.overflow =
      "hidden";

    window.requestAnimationFrame(
      () => {
        celebrateNewestUnseenCity();

        if (arrival.hidden) {
          closeButton.focus();
        }
      }
    );
  }

  function closeMap() {
    hideArrival();
    modal.hidden = true;
    document.body.style.overflow = "";

    if (
      lastFocused &&
      typeof lastFocused.focus ===
        "function"
    ) {
      lastFocused.focus();
    }
  }

  mapButton.addEventListener(
    "click",
    openMap
  );

  journeyCardButton.addEventListener(
    "click",
    openMap
  );

  closeButton.addEventListener(
    "click",
    closeMap
  );

  arrivalClose.addEventListener(
    "click",
    hideArrival
  );

  modal.addEventListener(
    "click",
    event => {
      if (event.target === modal) {
        closeMap();
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
        if (!arrival.hidden) {
          hideArrival();
        } else {
          closeMap();
        }
      }
    }
  );

  document.addEventListener(
    "voloflightpathchange",
    () => {
      const changed =
        syncExploredTopics();

      renderJourneyCard();

      if (!modal.hidden) {
        renderMap();

        if (changed) {
          celebrateNewestUnseenCity();
        }
      }
    }
  );

  window.addEventListener(
    "primo-volo-student-changed",
    () => {
      journeyData =
        loadJourneyData();

      renderJourneyCard();

      if (!modal.hidden) {
        hideArrival();
        renderMap();
      }
    }
  );

  renderJourneyCard();

  window.getVoloCityJourneyData =
    function getVoloCityJourneyData() {
      syncExploredTopics();
      return {
        ...journeyData,
        exploredCount:
          exploredCount(),
        unlockedCities:
          unlockedCities()
            .map(city => city.id)
      };
    };
})();

