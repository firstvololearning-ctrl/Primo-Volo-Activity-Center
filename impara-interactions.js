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
      italian: "il letto",
      english: "bed",
      sentence:
        "Nella camera c'è un letto.",
      x: 29,
      y: 57
    },
    {
      italian: "la finestra",
      english: "window",
      sentence:
        "Nella camera c'è una finestra.",
      x: 67,
      y: 23
    },
    {
      italian: "la lampada",
      english: "lamp",
      sentence:
        "Nella camera c'è una lampada.",
      x: 43,
      y: 43
    },
    {
      italian: "la libreria",
      english: "bookcase",
      sentence:
        "Nella camera c'è una libreria.",
      x: 84,
      y: 40
    },
    {
      italian: "la sedia",
      english: "chair",
      sentence:
        "Nella camera c'è una sedia.",
      x: 73,
      y: 69
    },
    {
      italian: "il tappeto",
      english: "rug",
      sentence:
        "Nella camera c'è un tappeto.",
      x: 49,
      y: 82
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

  const colorSortExamples = [
    {
      italian: "la fragola",
      english: "strawberry",
      image: "images/food/food-15.png",
      color: "rosso"
    },
    {
      italian: "l'arancia",
      english: "orange",
      image: "images/food/food-02.png",
      color: "arancione"
    },
    {
      italian: "la banana",
      english: "banana",
      image: "images/food/food-03.png",
      color: "giallo"
    },
    {
      italian: "l'insalata",
      english: "salad",
      image: "images/food/food-13.png",
      color: "verde"
    },
    {
      italian: "l'uva",
      english: "grapes",
      image: "images/food/food-07.png",
      color: "viola"
    },
    {
      italian: "il latte",
      english: "milk",
      image: "images/food/food-09.png",
      color: "bianco"
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
          Guarda l'oggetto e scegli il colore.
          <span class="expanded-result-english">
            Look at the object and choose its color.
          </span>
        </p>
      </div>

      <div class="color-noticing-scenes">
        <img
          src="images/scene-images/colors/color-dogs.png"
          alt="Dogs in different colors"
        >

        <img
          src="images/scene-images/colors/color-objects1.png"
          alt="Familiar objects in different colors"
        >
      </div>

      <div class="color-sort-workspace">
        <div class="color-sort-object-wrap">
          <button
            type="button"
            class="color-sort-object"
            draggable="true"
          >
          </button>
        </div>

        <div
          class="color-sort-buckets"
          aria-label="Color choices"
        ></div>
      </div>
    `;

    const objectButton =
      panel.querySelector(
        ".color-sort-object"
      );

    const buckets =
      panel.querySelector(
        ".color-sort-buckets"
      );

    const result =
      makeSceneResult(
        "Qual è il colore?",
        "What color is it?"
      );

    panel.appendChild(result);

    const colorChoices = [
      "rosso",
      "arancione",
      "giallo",
      "verde",
      "viola",
      "bianco"
    ];

    let index = 0;
    let selected = false;

    function currentItem() {
      return colorSortExamples[
        index % colorSortExamples.length
      ];
    }

    function renderObject() {
      const item =
        currentItem();

      objectButton.innerHTML = `
        <img
          src="${item.image}"
          alt="${item.english}"
        >

        <strong>
          ${item.italian}
        </strong>

        <span class="expanded-result-english">
          ${item.english}
        </span>
      `;

      objectButton.classList.remove(
        "is-selected"
      );

      selected = false;

      setSceneResult(
        result,
        "Qual è il colore?",
        "What color is it?"
      );
    }

    function chooseColor(color) {
      const item =
        currentItem();

      if (color !== item.color) {
        setSceneResult(
          result,
          "Guarda ancora.",
          "Look again."
        );

        return;
      }

      setSceneResult(
        result,
        `Sì! Il colore è ${item.color}.`,
        `Yes! The color is ${item.color}.`
      );

      speakItalian(
        `Il colore è ${item.color}.`
      );

      window.setTimeout(
        () => {
          index += 1;
          renderObject();
        },
        800
      );
    }

    objectButton.addEventListener(
      "click",
      () => {
        selected = true;

        objectButton.classList.add(
          "is-selected"
        );
      }
    );

    objectButton.addEventListener(
      "dragstart",
      event => {
        selected = true;

        event.dataTransfer.setData(
          "text/plain",
          currentItem().color
        );
      }
    );

    colorChoices.forEach(color => {
      const bucket =
        document.createElement("button");

      bucket.type = "button";
      bucket.className =
        "color-sort-bucket";

      bucket.dataset.color =
        color;

      bucket.textContent =
        color;

      bucket.addEventListener(
        "click",
        () => {
          if (!selected) {
            objectButton.classList.add(
              "needs-attention"
            );

            window.setTimeout(
              () => {
                objectButton.classList.remove(
                  "needs-attention"
                );
              },
              400
            );

            return;
          }

          chooseColor(color);
        }
      );

      bucket.addEventListener(
        "dragover",
        event => {
          event.preventDefault();
        }
      );

      bucket.addEventListener(
        "drop",
        event => {
          event.preventDefault();
          chooseColor(color);
        }
      );

      buckets.appendChild(bucket);
    });

    renderObject();

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
      x: 10,
      y: 66
    },
    {
      english: "sad",
      x: 27,
      y: 66
    },
    {
      english: "angry",
      x: 44,
      y: 66
    },
    {
      english: "confused",
      x: 61,
      y: 66
    },
    {
      english: "surprised",
      x: 78,
      y: 66
    },
    {
      english: "scared",
      x: 91,
      y: 66
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
