"use strict";

/*
  Expanded Impara interactions
  Body · Home · Colors · Feelings · Places

  This file is intentionally low-stakes.
  It does NOT call recordAttempt().
*/

(function initializeExpandedImparaInteractions() {

  if (
    typeof renderVocabulary !== "function" ||
    typeof installExpandedImparaTabs !== "function"
  ) {
    console.error(
      "Expanded Impara interactions could not start."
    );
    return;
  }

  const renderBeforeTheseInteractions =
    renderVocabulary;


  /* ========================================
     GENERAL HELPERS
     ======================================== */

  function makePanel() {
    const panel =
      document.createElement("section");

    panel.className =
      "expanded-learning-panel";

    return panel;
  }

  function makeSceneResult(
    italian = "Tocca per esplorare.",
    english = "Tap to explore."
  ) {
    const result =
      document.createElement("div");

    result.className =
      "expanded-scene-result";

    result.innerHTML = `
      <strong class="expanded-result-italian">
        ${italian}
      </strong>

      <span class="expanded-result-english">
        ${english}
      </span>
    `;

    return result;
  }

  function setSceneResult(
    result,
    italian,
    english
  ) {
    const italianElement =
      result.querySelector(
        ".expanded-result-italian"
      );

    const englishElement =
      result.querySelector(
        ".expanded-result-english"
      );

    if (italianElement) {
      italianElement.textContent =
        italian;
    }

    if (englishElement) {
      englishElement.textContent =
        english;
    }
  }

  function resetToExploreInstructions() {
    if (learnInstructions) {
      learnInstructions.innerHTML =
        primoVoloDefaultLearnInstructions;
    }
  }

  function renderExploreCards() {
    resetToExploreInstructions();

    primoVoloDefaultRenderVocabulary();
  }


  /* ========================================
     BODY · LE PARTI DEL CORPO
     ======================================== */

  const bodyHotspots = [
    {
      italian: "la testa",
      english: "head",
      model: "Ho una testa.",
      x: 50.4,
      y: 16.8
    },
    {
      italian: "l'occhio",
      english: "eye",
      model: "Ho due occhi.",
      x: 43.8,
      y: 26.1
    },
    {
      italian: "l'orecchio",
      english: "ear",
      model: "Ho due orecchie.",
      x: 66.5,
      y: 27.2
    },
    {
      italian: "il naso",
      english: "nose",
      model: "Ho un naso.",
      x: 50.6,
      y: 30.3
    },
    {
      italian: "la bocca",
      english: "mouth",
      model: "Ho una bocca.",
      x: 51.0,
      y: 35.3
    },
    {
      italian: "il collo",
      english: "neck",
      model: "Ho un collo.",
      x: 50.8,
      y: 42.6
    },
    {
      italian: "la spalla",
      english: "shoulder",
      model: "Ho due spalle.",
      x: 42.6,
      y: 44.5
    },
    {
      italian: "il braccio",
      english: "arm",
      model: "Ho due braccia.",
      x: 65.8,
      y: 57.9
    },
    {
      italian: "il gomito",
      english: "elbow",
      model: "Ho due gomiti.",
      x: 35.7,
      y: 53.9
    },
    {
      italian: "la mano",
      english: "hand",
      model: "Ho due mani.",
      x: 31.0,
      y: 68.1
    },
    {
      italian: "la pancia",
      english: "belly",
      model: "Ho una pancia.",
      x: 50.2,
      y: 61.4
    },
    {
      italian: "la gamba",
      english: "leg",
      model: "Ho due gambe.",
      x: 56.2,
      y: 71.7
    },
    {
      italian: "il ginocchio",
      english: "knee",
      model: "Ho due ginocchia.",
      x: 43.7,
      y: 76.6
    },
    {
      italian: "il piede",
      english: "foot",
      model: "Ho due piedi.",
      x: 40.0,
      y: 91.0
    }
  ];

  function buildBodyPanel() {
    const panel = makePanel();

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          👆 Tocca il corpo
        </h4>

        <p>
          Tocca una parte del corpo.
          <span class="expanded-result-english">
            Tap a body part.
          </span>
        </p>
      </div>

      <div class="interactive-scene body-scene">
        <img
          src="images/scene-images/body/body-alien.png"
          alt="Alien body for learning body parts"
        >

        <div
          class="scene-hotspot-layer"
          aria-label="Body part hotspots"
        ></div>
      </div>
    `;

    const stage =
      panel.querySelector(
        ".scene-hotspot-layer"
      );

    const result =
      makeSceneResult(
        "Tocca una parte del corpo.",
        "Tap a body part."
      );

    panel.appendChild(result);

    bodyHotspots.forEach(item => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className =
        "scene-hotspot body-hotspot";

      button.style.left =
        `${item.x}%`;

      button.style.top =
        `${item.y}%`;

      button.dataset.label =
        item.italian;

      button.setAttribute(
        "aria-label",
        `${item.italian}, ${item.english}`
      );

      button.addEventListener(
        "click",
        () => {
          stage
            .querySelectorAll(
              ".scene-hotspot"
            )
            .forEach(hotspot => {
              hotspot.classList.remove(
                "is-active"
              );
            });

          button.classList.add(
            "is-active"
          );

          setSceneResult(
            result,
            `${item.italian} · ${item.model}`,
            `${item.english}`
          );

          speakItalian(
            `${item.italian}. ${item.model}`
          );
        }
      );

      stage.appendChild(button);
    });

    return panel;
  }

  function renderBodyExpandedLearn() {
    clearExpandedImparaTabs();
    renderExploreCards();

    const bodyPanel =
      buildBodyPanel();

    installExpandedImparaTabs([
      {
        key: "explore",
        label: "📖 Esplora",
        english: "Explore",
        instructions:
          primoVoloDefaultLearnInstructions
      },
      {
        key: "body",
        label: "👆 Tocca il corpo",
        english: "Tap the Body",
        panel: bodyPanel,
        instructions:
          primoVoloDefaultLearnInstructions
      }
    ]);
  }


  /* ========================================
     CASA · BEDROOM SCENE
     ======================================== */

  const bedroomHotspots = [
    {
      italian: "la lampada",
      english: "lamp",
      sentence: "Nella camera c'è una lampada.",
      x: 8,
      y: 42
    },
    {
      italian: "il letto",
      english: "bed",
      sentence: "Nella camera c'è un letto.",
      x: 32,
      y: 57
    },
    {
      italian: "la finestra",
      english: "window",
      sentence: "Nella camera c'è una finestra.",
      x: 56,
      y: 24
    },
    {
      italian: "il comò",
      english: "dresser",
      sentence: "Nella camera c'è un comò.",
      x: 79,
      y: 53
    },
    {
      italian: "il tappeto",
      english: "rug",
      sentence: "Nella camera c'è un tappeto.",
      x: 60,
      y: 85
    }
  ];

  function buildHomePanel() {
    const panel = makePanel();

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          🛏️ Nella camera
        </h4>

        <p>
          Che cosa vedi nella camera?
          <span class="expanded-result-english">
            What do you see in the bedroom?
          </span>
        </p>
      </div>

      <div class="impara-language-focus">
        <strong>
          Nella camera c'è...
        </strong>

        <span>
          In the bedroom there is...
        </span>
      </div>

      <div class="interactive-scene bedroom-scene">
        <img
          src="images/scene-images/casa/bedroom.png"
          alt="Clay bedroom scene"
        >

        <div
          class="scene-hotspot-layer"
          aria-label="Bedroom object hotspots"
        ></div>
      </div>
    `;

    const stage =
      panel.querySelector(
        ".scene-hotspot-layer"
      );

    const result =
      makeSceneResult(
        "Tocca un oggetto nella camera.",
        "Tap an object in the bedroom."
      );

    panel.appendChild(result);

    bedroomHotspots.forEach(item => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className =
        "scene-hotspot bedroom-hotspot";

      button.style.left =
        `${item.x}%`;

      button.style.top =
        `${item.y}%`;

      button.dataset.label =
        item.italian;

      button.setAttribute(
        "aria-label",
        `${item.italian}, ${item.english}`
      );

      button.addEventListener(
        "click",
        () => {
          stage
            .querySelectorAll(
              ".scene-hotspot"
            )
            .forEach(hotspot => {
              hotspot.classList.remove(
                "is-active"
              );
            });

          button.classList.add(
            "is-active"
          );

          setSceneResult(
            result,
            item.sentence,
            item.english
          );

          speakItalian(
            item.sentence
          );
        }
      );

      stage.appendChild(button);
    });

    return panel;
  }

  function renderHomeExpandedLearn() {
    clearExpandedImparaTabs();
    renderExploreCards();

    const homePanel =
      buildHomePanel();

    installExpandedImparaTabs([
      {
        key: "explore",
        label: "📖 Esplora",
        english: "Explore",
        instructions:
          primoVoloDefaultLearnInstructions
      },
      {
        key: "bedroom",
        label: "🛏️ Nella camera",
        english: "In the Bedroom",
        panel: homePanel,
        instructions:
          primoVoloDefaultLearnInstructions
      }
    ]);
  }


  /* ========================================
     COLORS · LOW-STAKES SORT
     ======================================== */

  const colorSortItems = [
    {
      color: "rosso",
      english: "red",
      image: "images/scene-images/colors/balloons_separate/balloon-rosso.png"
    },
    {
      color: "arancione",
      english: "orange",
      image: "images/scene-images/colors/balloons_separate/balloon-arancione.png"
    },
    {
      color: "giallo",
      english: "yellow",
      image: "images/scene-images/colors/balloons_separate/balloon-giallo.png"
    },
    {
      color: "verde",
      english: "green",
      image: "images/scene-images/colors/balloons_separate/balloon-verde.png"
    },
    {
      color: "blu",
      english: "blue",
      image: "images/scene-images/colors/balloons_separate/balloon-blu.png"
    },
    {
      color: "viola",
      english: "purple",
      image: "images/scene-images/colors/balloons_separate/balloon-viola.png"
    },
    {
      color: "rosa",
      english: "pink",
      image: "images/scene-images/colors/balloons_separate/balloon-rosa.png"
    },
    {
      color: "bianco",
      english: "white",
      image: "images/scene-images/colors/balloons_separate/balloon-bianco.png"
    },
    {
      color: "nero",
      english: "black",
      image: "images/scene-images/colors/balloons_separate/balloon-nero.png"
    },
    {
      color: "grigio",
      english: "gray",
      image: "images/scene-images/colors/balloons_separate/balloon-grigio.png"
    },
    {
      color: "marrone",
      english: "brown",
      image: "images/scene-images/colors/balloons_separate/balloon-marrone.png"
    }
  ];

  function buildColorsPanel() {
    const panel = makePanel();

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          🎨 Raggruppa per colore
        </h4>

        <p>
          Trascina ogni palloncino
          nel riquadro del colore giusto.
          <span class="expanded-result-english">
            Drag each balloon into the matching color box.
          </span>
        </p>
      </div>

      <div
        class="balloon-color-bins"
        aria-label="Color sorting boxes"
      ></div>

      <div class="balloon-sort-divider">
        <strong>
          🎈 I palloncini
        </strong>

        <span class="expanded-result-english">
          Balloons
        </span>
      </div>

      <div
        class="balloon-sort-tray"
        aria-label="Balloons to sort"
      ></div>
    `;

    const bins =
      panel.querySelector(
        ".balloon-color-bins"
      );

    const tray =
      panel.querySelector(
        ".balloon-sort-tray"
      );

    const result =
      makeSceneResult(
        "Trascina un palloncino.",
        "Drag a balloon."
      );

    panel.appendChild(result);

    let sortedCount = 0;


    /* -------------------------------------
       CREATE THE 11 COLOR BOXES
       ------------------------------------- */

    colorSortItems.forEach(item => {
      const bin =
        document.createElement("div");

      bin.className =
        `balloon-color-bin color-${item.color}`;

      bin.dataset.color =
        item.color;

      bin.innerHTML = `
        <strong>
          ${item.color}
        </strong>

        <span class="expanded-result-english">
          ${item.english}
        </span>

        <div class="balloon-bin-drop-area"></div>
      `;

      bins.appendChild(bin);
    });


    /* -------------------------------------
       CREATE THE 11 BALLOONS
       ------------------------------------- */

    colorSortItems.forEach(item => {
      const card =
        document.createElement("button");

      card.type = "button";

      card.className =
        "balloon-drag-card";

      card.dataset.color =
        item.color;

      card.setAttribute(
        "aria-label",
        `${item.color} balloon`
      );

      card.innerHTML = `
        <img
          src="${item.image}"
          alt=""
          draggable="false"
        >
      `;

      let startX = 0;
      let startY = 0;
      let dragging = false;

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

          const dx =
            event.clientX - startX;

          const dy =
            event.clientY - startY;

          card.style.transform =
            `translate(${dx}px, ${dy}px) scale(1.06)`;
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

          const dropBins =
            [...bins.querySelectorAll(
              ".balloon-color-bin"
            )];

          const targetBin =
            dropBins.find(bin => {
              const rect =
                bin.getBoundingClientRect();

              return (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
              );
            });

          card.style.transform = "";

          if (!targetBin) {
            return;
          }

          if (
            targetBin.dataset.color !==
            item.color
          ) {
            targetBin.classList.add(
              "try-again"
            );

            setSceneResult(
              result,
              "Prova ancora.",
              "Try again."
            );

            window.setTimeout(
              () => {
                targetBin.classList.remove(
                  "try-again"
                );
              },
              450
            );

            return;
          }

          const dropArea =
            targetBin.querySelector(
              ".balloon-bin-drop-area"
            );

          const placedBalloon =
            document.createElement("img");

          placedBalloon.src =
            item.image;

          placedBalloon.alt = "";

          placedBalloon.className =
            "sorted-balloon";

          dropArea.appendChild(
            placedBalloon
          );

          targetBin.classList.add(
            "is-complete"
          );

          card.classList.add(
            "is-sorted"
          );

          sortedCount += 1;

          const sentence =
            `Il palloncino è ${item.color}.`;

          setSceneResult(
            result,
            sentence,
            `The balloon is ${item.english}.`
          );

          speakItalian(sentence);

          if (
            sortedCount ===
            colorSortItems.length
          ) {
            window.setTimeout(
              () => {
                setSceneResult(
                  result,
                  "Bravissimo! Hai raggruppato tutti i colori.",
                  "Great job! You sorted all the colors."
                );
              },
              600
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

      tray.appendChild(card);
    });

    return panel;
  }

  function renderColorsExpandedLearn() {
    clearExpandedImparaTabs();
    renderExploreCards();

    const colorsPanel =
      buildColorsPanel();

    installExpandedImparaTabs([
      {
        key: "explore",
        label: "📖 Esplora",
        english: "Explore",
        instructions:
          primoVoloDefaultLearnInstructions
      },
      {
        key: "colors-sort",
        label: "🎨 Raggruppa",
        english: "Sort Colors",
        panel: colorsPanel,
        instructions:
          primoVoloDefaultLearnInstructions
      }
    ]);
  }


  /* ========================================
     FEELINGS · MATCH TO PEOPLE
     ======================================== */

  const feelingTargets = [
    {
      english: "happy",
      x: 22,
      y: 35
    },
    {
      english: "sad",
      x: 50,
      y: 35
    },
    {
      english: "angry",
      x: 78,
      y: 35
    },
    {
      english: "scared",
      x: 32,
      y: 76
    },
    {
      english: "confused",
      x: 68,
      y: 76
    }
  ];

  function buildFeelingsPanel() {
    const panel = makePanel();

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          😊 Abbina le emozioni
        </h4>

        <p>
          Trascina l'emozione alla persona
          che la mostra.
          <span class="expanded-result-english">
            Drag the feeling to the person
            who shows it.
          </span>
        </p>
      </div>

      <div
        class="feeling-token-bank"
        aria-label="Feelings to match"
      ></div>

      <div class="interactive-scene feelings-scene">
        <img
          src="images/scene-images/feelings/feelings1.png"
          alt="Group of colorful people showing different feelings"
        >

        <div
          class="feeling-drop-layer"
          aria-label="People showing feelings"
        ></div>
      </div>
    `;

    const tokenBank =
      panel.querySelector(
        ".feeling-token-bank"
      );

    const dropLayer =
      panel.querySelector(
        ".feeling-drop-layer"
      );

    const result =
      makeSceneResult(
        "Scegli un'emozione.",
        "Choose a feeling."
      );

    panel.appendChild(result);

    const interactionVocabulary =
      currentVocabulary.filter(
        item =>
          feelingTargets.some(
            target =>
              target.english ===
              item.english
          )
      );

    let selectedEnglish = "";

    function getItem(english) {
      return interactionVocabulary.find(
        item =>
          item.english === english
      );
    }

    interactionVocabulary.forEach(
      item => {
        const token =
          document.createElement("button");

        token.type = "button";
        token.draggable = true;

        token.className =
          "feeling-token";

        token.dataset.feeling =
          item.english;

        token.innerHTML = `
          <img
            src="${item.image}"
            alt=""
          >

          <strong>
            ${item.italian}
          </strong>
        `;

        token.addEventListener(
          "click",
          () => {
            tokenBank
              .querySelectorAll(
                ".feeling-token"
              )
              .forEach(other => {
                other.classList.remove(
                  "is-selected"
                );
              });

            selectedEnglish =
              item.english;

            token.classList.add(
              "is-selected"
            );
          }
        );

        token.addEventListener(
          "dragstart",
          event => {
            selectedEnglish =
              item.english;

            event.dataTransfer.setData(
              "text/plain",
              item.english
            );
          }
        );

        tokenBank.appendChild(token);
      }
    );

    feelingTargets.forEach(target => {
      const zone =
        document.createElement("button");

      zone.type = "button";

      zone.className =
        "feeling-drop-zone";

      zone.style.left =
        `${target.x}%`;

      zone.style.top =
        `${target.y}%`;

      zone.dataset.target =
        target.english;

      zone.setAttribute(
        "aria-label",
        `Match a feeling to this person`
      );

      function tryMatch(
        feelingEnglish
      ) {
        if (!feelingEnglish) {
          setSceneResult(
            result,
            "Prima scegli un'emozione.",
            "Choose a feeling first."
          );

          return;
        }

        if (
          feelingEnglish !==
          target.english
        ) {
          setSceneResult(
            result,
            "Guarda l'espressione ancora.",
            "Look at the expression again."
          );

          return;
        }

        const item =
          getItem(feelingEnglish);

        if (!item) {
          return;
        }

        zone.classList.add(
          "is-matched"
        );

        zone.innerHTML = "✓";

        const token =
          tokenBank.querySelector(
            `[data-feeling="${feelingEnglish}"]`
          );

        if (token) {
          token.classList.add(
            "is-matched"
          );
        }

        selectedEnglish = "";

        const sentence =
          `Mi sento ${item.italian}.`;

        setSceneResult(
          result,
          sentence,
          item.english
        );

        speakItalian(sentence);
      }

      zone.addEventListener(
        "click",
        () => {
          tryMatch(
            selectedEnglish
          );
        }
      );

      zone.addEventListener(
        "dragover",
        event => {
          event.preventDefault();
        }
      );

      zone.addEventListener(
        "drop",
        event => {
          event.preventDefault();

          const feelingEnglish =
            event.dataTransfer.getData(
              "text/plain"
            );

          tryMatch(feelingEnglish);
        }
      );

      dropLayer.appendChild(zone);
    });

    return panel;
  }

  function renderFeelingsExpandedLearn() {
    clearExpandedImparaTabs();
    renderExploreCards();

    const feelingsPanel =
      buildFeelingsPanel();

    installExpandedImparaTabs([
      {
        key: "explore",
        label: "📖 Esplora",
        english: "Explore",
        instructions:
          primoVoloDefaultLearnInstructions
      },
      {
        key: "feelings-match",
        label: "😊 Abbina",
        english: "Match Feelings",
        panel: feelingsPanel,
        instructions:
          primoVoloDefaultLearnInstructions
      }
    ]);
  }


  /* ========================================
     PLACES · TOWN SCENE
     ======================================== */

  const townHotspots = [
    {
      italian: "la scuola",
      english: "school",
      x: 51,
      y: 24
    },
    {
      italian: "il ristorante",
      english: "restaurant",
      x: 26,
      y: 48
    },
    {
      italian: "il supermercato",
      english: "supermarket",
      x: 76,
      y: 48
    },
    {
      italian: "il parco",
      english: "park",
      x: 56,
      y: 56
    },
    {
      italian: "la biblioteca",
      english: "library",
      x: 51,
      y: 82
    }
  ];

  function buildPlacesPanel() {
    const panel = makePanel();

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          🏘️ Nella città
        </h4>

        <p>
          Tocca un luogo nella città.
          <span class="expanded-result-english">
            Tap a place in the town.
          </span>
        </p>
      </div>

      <div class="impara-language-focus">
        <strong>
          Che luogo è? → È...
        </strong>

        <span>
          What place is it? → It is...
        </span>
      </div>

      <div class="interactive-scene town-interactive-scene">
        <img
          src="images/scene-images/places/town1.png"
          alt="Clay town scene"
        >

        <div
          class="scene-hotspot-layer town-hotspot-layer"
          aria-label="Places in town"
        ></div>
      </div>
    `;

    const stage =
      panel.querySelector(
        ".town-hotspot-layer"
      );

    const result =
      makeSceneResult(
        "Tocca un luogo nella città.",
        "Tap a place in the town."
      );

    panel.appendChild(result);

    townHotspots.forEach(item => {
      const button =
        document.createElement("button");

      button.type = "button";

      button.className =
        "scene-hotspot town-hotspot";

      button.style.left =
        `${item.x}%`;

      button.style.top =
        `${item.y}%`;

      button.dataset.label =
        item.italian;

      button.setAttribute(
        "aria-label",
        `${item.italian}, ${item.english}`
      );

      button.addEventListener(
        "click",
        () => {
          stage
            .querySelectorAll(
              ".town-hotspot"
            )
            .forEach(hotspot => {
              hotspot.classList.remove(
                "is-active"
              );
            });

          button.classList.add(
            "is-active"
          );

          const sentence =
            `È ${item.italian}.`;

          setSceneResult(
            result,
            `Che luogo è? ${sentence}`,
            item.english
          );

          speakItalian(
            `Che luogo è? ${sentence}`
          );
        }
      );

      stage.appendChild(button);
    });

    return panel;
  }

  function renderPlacesExpandedLearn() {
    clearExpandedImparaTabs();
    renderExploreCards();

    const placesPanel =
      buildPlacesPanel();

    installExpandedImparaTabs([
      {
        key: "explore",
        label: "📖 Esplora",
        english: "Explore",
        instructions:
          primoVoloDefaultLearnInstructions
      },
      {
        key: "town",
        label: "🏘️ Nella città",
        english: "Around Town",
        panel: placesPanel,
        instructions:
          primoVoloDefaultLearnInstructions
      }
    ]);
  }


  /* ========================================
     ADD THESE FIVE TOPICS TO IMPARA
     ======================================== */

  renderVocabulary =
    function renderExpandedImparaSetTwo() {

      if (
        currentTopicKey ===
        "bodyParts"
      ) {
        renderBodyExpandedLearn();
        return;
      }

      if (
        currentTopicKey ===
        "home"
      ) {
        renderHomeExpandedLearn();
        return;
      }

      if (
        currentTopicKey ===
        "colors"
      ) {
        renderColorsExpandedLearn();
        return;
      }

      if (
        currentTopicKey ===
        "feelings"
      ) {
        renderFeelingsExpandedLearn();
        return;
      }

      if (
        currentTopicKey ===
        "places"
      ) {
        renderPlacesExpandedLearn();
        return;
      }

      renderBeforeTheseInteractions();
    };

})();
