/* ==========================================
   IMPARA — EXTRA EXISTING INTERACTIVES
   Clothing: Dress Up
   Animals: Match Shapes
   ========================================== */

(() => {
  const extras = {
    clothing: {
      href: "dress-up.html",
      icon: "👕",
      italian: "Vesti",
      english: "Dress Up"
    },

    animals: {
      href: "animal-shapes.html",
      icon: "🐾",
      italian: "Abbina le sagome",
      english: "Match Shapes"
    }
  };

  function updateExtraInteractive() {
    const topicSelect =
      document.getElementById("topicSelect");

    const modeBar =
      document.getElementById(
        "learnSceneModeBar"
      );

    if (!topicSelect || !modeBar) {
      return;
    }

    let button =
      document.getElementById(
        "learnExtraInteractive"
      );

    if (!button) {
      button =
        document.createElement("button");

      button.id =
        "learnExtraInteractive";

      button.type = "button";

      button.className =
        "learn-scene-main-button";

      modeBar.appendChild(button);
    }

    const config =
      extras[topicSelect.value];

    if (!config) {
      button.hidden = true;
      button.onclick = null;
      return;
    }

    button.hidden = false;

    button.innerHTML = `
      <span>
        ${config.icon} ${config.italian}
      </span>
      <small class="expanded-inline-english">
        ${config.english}
      </small>
    `;

    button.onclick = () => {
      window.location.href =
        config.href;
    };
  }

  function start() {
    const topicSelect =
      document.getElementById("topicSelect");

    if (!topicSelect) return;

    topicSelect.addEventListener(
      "change",
      () => {
        setTimeout(
          updateExtraInteractive,
          50
        );
      }
    );

    updateExtraInteractive();
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }
})();
