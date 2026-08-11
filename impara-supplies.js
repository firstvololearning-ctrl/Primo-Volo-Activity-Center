/* ========================================
   EXPANDED IMPARA — SCHOOL SUPPLIES
   Explore cards + interactive classroom
   ======================================== */

(() => {
  const ITEMS = [
    { n: "01", it: "il foglio", en: "sheet of paper", x: 22.0, y: 63.1 },
    { n: "02", it: "le forbici", en: "scissors", x: 71.2, y: 43.2 },
    { n: "03", it: "la colla", en: "glue", x: 65.5, y: 38.1 },
    { n: "04", it: "la matita", en: "pencil", x: 72.5, y: 78.7 },
    { n: "05", it: "la penna", en: "pen", x: 22.4, y: 42.0 },
    { n: "06", it: "la matita colorata", en: "colored pencil", x: 26.1, y: 70.4 },
    { n: "07", it: "il gesso", en: "chalk", x: 86.7, y: 24.5 },
    { n: "08", it: "il pennarello", en: "marker", x: 40.1, y: 68.6 },
    { n: "09", it: "il righello", en: "ruler", x: 88.8, y: 83.0 },
    { n: "10", it: "la spillatrice", en: "stapler", x: 83.3, y: 42.7 },
    { n: "11", it: "il nastro adesivo", en: "tape", x: 93.9, y: 48.5 },
    { n: "12", it: "la gomma", en: "eraser", x: 91, y: 70, overlay: true },
    { n: "13", it: "lo zaino", en: "backpack", x: 6.1, y: 81.8 },
    { n: "14", it: "il quaderno", en: "notebook", x: 14.0, y: 39.0 }
  ];

  const SCENE =
    "images/scene-images/supplies/supplies1.png";

  function speakItalian(text) {
    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "it-IT";
    utterance.rate = 0.82;

    speechSynthesis.speak(utterance);
  }

  function getSuppliesGrid() {
    const imgs = [
      ...document.querySelectorAll(
        'img[src*="supplies-"]'
      )
    ].filter(img =>
      !img.src.includes("scene-images/supplies")
    );

    if (imgs.length < 10) return null;

    let node = imgs[0].parentElement;

    while (
      node &&
      node !== document.body
    ) {
      const count =
        node.querySelectorAll(
          'img[src*="supplies-"]'
        ).length;

      if (count >= 10) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  function getOriginalImage(number) {
    return document.querySelector(
      `img[src*="supplies-${number}"]`
    );
  }

  function makeHotspot(item, result) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className =
      "supplies-scene-hotspot";

    button.style.left = `${item.x}%`;
    button.style.top = `${item.y}%`;

    button.dataset.label = item.it;
    button.dataset.item = item.n;

    button.setAttribute(
      "aria-label",
      `${item.it}: ${item.en}`
    );

    button.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".supplies-scene-hotspot"
          )
          .forEach(el =>
            el.classList.remove(
              "is-active"
            )
          );

        button.classList.add(
          "is-active"
        );

        result.innerHTML = `
          <strong>${item.it}</strong>
          <span class="supplies-result-english">
            ${item.en}
          </span>
        `;

        speakItalian(item.it);
      }
    );

    return button;
  }

  function buildPanel(grid) {
    if (
      document.getElementById(
        "suppliesExpandedImpara"
      )
    ) {
      return;
    }

    const wrapper =
      document.createElement("section");

    wrapper.id =
      "suppliesExpandedImpara";

    wrapper.className =
      "supplies-expanded-impara";

    const nav =
      document.createElement("div");

    nav.className =
      "supplies-impara-tabs";

    const explore =
      document.createElement("button");

    explore.type = "button";
    explore.className =
      "supplies-impara-tab is-active";

    explore.innerHTML = `
      <strong>📖 Esplora</strong>
      <span>Explore</span>
    `;

    const sceneTab =
      document.createElement("button");

    sceneTab.type = "button";
    sceneTab.className =
      "supplies-impara-tab";

    sceneTab.innerHTML = `
      <strong>🔎 Trova nella classe</strong>
      <span>Find It in the Classroom</span>
    `;

    nav.append(
      explore,
      sceneTab
    );

    const panel =
      document.createElement("div");

    panel.className =
      "supplies-scene-panel";

    panel.hidden = true;

    panel.innerHTML = `
      <div class="expanded-panel-heading">
        <h4>
          🔎 Trova nella classe
        </h4>

        <p>
          Tocca un oggetto per ascoltare
          la parola.
          <span class="supplies-result-english">
            · Tap an object to hear the word.
          </span>
        </p>
      </div>

      <div class="supplies-classroom-scene">
        <img
          class="supplies-scene-image"
          src="${SCENE}"
          alt="A clay classroom with school supplies placed around the room"
        >

        <div
          class="supplies-hotspot-layer"
          aria-label="Interactive school supplies"
        ></div>
      </div>

      <div
        class="supplies-scene-result"
        aria-live="polite"
      >
        <strong>
          Tocca un oggetto.
        </strong>

        <span class="supplies-result-english">
          Tap an object.
        </span>
      </div>
    `;

    wrapper.append(
      nav,
      panel
    );

    grid.parentNode.insertBefore(
      wrapper,
      grid
    );

    const scene =
      panel.querySelector(
        ".supplies-classroom-scene"
      );

    const layer =
      panel.querySelector(
        ".supplies-hotspot-layer"
      );

    const result =
      panel.querySelector(
        ".supplies-scene-result"
      );

    ITEMS.forEach(item => {
      if (item.overlay) {
        const original =
          getOriginalImage(item.n);

        if (original) {
          const overlay =
            document.createElement("img");

          overlay.src =
            original.src;

          overlay.alt = "";

          overlay.className =
            "supplies-scene-overlay";

          overlay.style.left =
            `${item.x}%`;

          overlay.style.top =
            `${item.y}%`;

          scene.appendChild(
            overlay
          );
        }
      }

      layer.appendChild(
        makeHotspot(
          item,
          result
        )
      );
    });

    function showExplore() {
      explore.classList.add(
        "is-active"
      );

      sceneTab.classList.remove(
        "is-active"
      );

      panel.hidden = true;
      grid.style.display = "";
    }

    function showScene() {
      sceneTab.classList.add(
        "is-active"
      );

      explore.classList.remove(
        "is-active"
      );

      grid.style.display = "none";
      panel.hidden = false;
    }

    explore.addEventListener(
      "click",
      showExplore
    );

    sceneTab.addEventListener(
      "click",
      showScene
    );
  }

  function init() {
    const grid =
      getSuppliesGrid();

    if (!grid) return;

    buildPanel(grid);
  }

  const observer =
    new MutationObserver(() => {
      init();
    });

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  init();
})();
