"use strict";

/*
  Primo Volo teacher-facing Curriculum Overview & Scope.

  JS-only enhancement:
  - keeps the existing modal HTML untouched
  - shows current vocabulary / target-language inventories
  - shows existing useful language plus carrier phrases
  - keeps the five communicative areas collapsible
  - removes teacher-guide-style meta notes from the scope view only
*/

(function initializeScopeModal() {
  const modal =
    document.getElementById(
      "scopeModal"
    );

  if (!modal) {
    return;
  }

  const closeButton =
    modal.querySelector(
      ".scope-modal-close"
    );

  let previousFocus = null;

  const coverage = new Map([
    [
      "Saluti e presentazioni",
      {
        key: "greetings",
        items: () => [],
        existingAsTarget: true
      }
    ],
    ["Hobby e tempo libero", { key: "hobbies", items: () => typeof hobbies !== "undefined" ? hobbies : [] }],
    ["Le emozioni", { key: "feelings", items: () => typeof feelings !== "undefined" ? feelings : [] }],
    ["Espressioni in classe", { key: "classroom", items: () => typeof classroomExpressions !== "undefined" ? classroomExpressions : [] }],
    ["La famiglia", { key: "family", items: () => typeof family !== "undefined" ? family : [] }],
    ["Le parti del corpo", { key: "bodyParts", items: () => typeof body !== "undefined" ? body : [] }],
    ["L’abbigliamento", { key: "clothing", items: () => typeof clothing !== "undefined" ? clothing : [] }],
    ["I colori", { key: "colors", items: () => typeof colors !== "undefined" ? colors : [] }],
    ["Gli aggettivi", { key: "adjectives", items: () => typeof adjectives !== "undefined" ? adjectives : [] }],
    ["Gli animali", { key: "animals", items: () => typeof animals !== "undefined" ? animals : [] }],
    ["La casa", { key: "home", items: () => typeof home !== "undefined" ? home : [] }],
    ["I luoghi", { key: "places", items: () => typeof places !== "undefined" ? places : [] }],
    ["Le preposizioni", { key: "prepositions", items: () => typeof prepositions !== "undefined" ? prepositions : [] }],
    ["Materiale scolastico", { key: "supplies", items: () => typeof supplies !== "undefined" ? supplies : [] }],
    ["Il cibo e le bevande", { key: "food", items: () => typeof food !== "undefined" ? food : [] }],
    [
      "La mia giornata",
      {
        key: "routines",
        items: () => typeof routines !== "undefined" ? routines : [],
        extraLanguage: ["Prima…", "Poi…", "Dopo…", "Infine…"]
      }
    ],
    ["I numeri", { key: "numbers", items: () => typeof numbers !== "undefined" ? numbers : [] }],
    ["I giorni della settimana", { key: "days", items: () => typeof days !== "undefined" ? days : [] }],
    ["I mesi dell’anno", { key: "months", items: () => typeof months !== "undefined" ? months : [] }],
    ["L’ora", { key: "time", items: () => typeof time !== "undefined" ? time : [] }],
    ["Il tempo", { key: "weather", items: () => typeof weather !== "undefined" ? weather : [] }],
    [
      "Le stagioni",
      {
        key: "seasons",
        items: () =>
          typeof seasons !== "undefined"
            ? seasons
            : [],
        extraVocabulary: [
          { italian: "le foglie" },
          { italian: "la ghianda" },
          { italian: "le castagne" },
          { italian: "la zucca" },
          { italian: "l’uva" },
          { italian: "la vendemmia" },
          { italian: "i funghi" },
          { italian: "la pioggia" },
          { italian: "la nebbia" },
          { italian: "l’ombrello" }
        ]
      }
    ]
  ]);

  function installStyles() {
    if (document.getElementById("scopeCoverageRuntimeStyles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "scopeCoverageRuntimeStyles";
    style.textContent = `
      .scope-modal-header {
        padding: 17px 22px 14px;
      }

      .scope-modal-kicker {
        display: none !important;
      }

      .scope-modal-header h2 {
        margin: 0;
        font-size: clamp(1.28rem, 2.3vw, 1.7rem);
        line-height: 1.15;
      }

      .scope-modal-title-secondary {
        display: block;
        margin-top: 3px;
        color: #68798f;
        font-size: .66em;
        font-weight: 800;
      }

      .scope-modal-intro {
        margin-top: 6px !important;
        font-size: .79rem !important;
        line-height: 1.4 !important;
      }

      .scope-modal-scroll {
        padding-top: 14px !important;
      }

      .scope-modal .about-scope-topic {
        padding: 11px 12px;
      }

      .scope-coverage-block {
        margin-top: 8px;
      }

      .scope-coverage-label {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 8px;
        align-items: baseline;
        margin-bottom: 5px;
        color: #65778d;
        font-size: .67rem;
        font-weight: 850;
        line-height: 1.25;
      }

      .scope-coverage-label strong {
        color: #385879;
        font-size: .69rem;
      }

      .scope-coverage-label [lang="en"] {
        color: #8793a2;
      }

      .scope-vocab-list {
        color: #345271;
        font-size: .73rem;
        font-weight: 720;
        line-height: 1.5;
      }

      .scope-vocab-item + .scope-vocab-item::before {
        content: " · ";
        color: #a0adba;
      }

      .scope-vocab-en {
        color: #7d8998;
        font-size: .9em;
        font-weight: 650;
      }

      .scope-language-block {
        padding-top: 7px;
        border-top: 1px solid #edf1f5;
      }

      .scope-frame-list {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .scope-frame {
        display: inline-flex;
        padding: 3px 7px;
        border: 1px solid #eadfae;
        border-radius: 999px;
        color: #596579;
        background: #fffaf0;
        font-size: .69rem;
        font-weight: 800;
        line-height: 1.25;
      }

      .scope-existing-language {
        margin: 6px 0 0 !important;
        color: #405773 !important;
        font-size: .74rem !important;
        line-height: 1.42 !important;
      }

      .scope-view-meta-hidden {
        display: none !important;
      }

      @media (max-width: 700px) {
        .scope-modal-header h2 {
          font-size: 1.2rem;
        }

        .scope-vocab-list,
        .scope-existing-language {
          font-size: .7rem !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function simplifyHeader() {
    const title = modal.querySelector("#scopeModalTitle");
    const intro = modal.querySelector(".scope-modal-intro");

    if (title && title.dataset.scopeSimplified !== "true") {
      title.innerHTML = `
        🗺️ Panoramica del curricolo
        <span class="scope-modal-title-secondary" lang="en">
          Curriculum Overview &amp; Scope
        </span>
      `;
      title.dataset.scopeSimplified = "true";
    }

    if (intro && intro.dataset.scopeSimplified !== "true") {
      intro.innerHTML = `
        Ambiti comunicativi, vocabolario e lingua utile.
        <span lang="en">
          · Communicative areas, vocabulary, and useful language.
        </span>
      `;
      intro.dataset.scopeSimplified = "true";
    }
  }

  function hideMetaNotes() {
    modal
      .querySelector(".about-scope-development")
      ?.classList.add("scope-view-meta-hidden");

    modal
      .querySelector(".scope-modal-footnote")
      ?.classList.add("scope-view-meta-hidden");

    const paragraphs =
      [...modal.querySelectorAll(".scope-modal-section > p")];

    paragraphs.forEach(paragraph => {
      const text =
        paragraph.textContent
          ?.replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

      if (!text) {
        return;
      }

      if (
        text.startsWith("la pratica varia") ||
        text.startsWith("practice varies") ||
        text.includes("questa sezione presenta i principali ambiti") ||
        text.includes("this section outlines the major communicative areas") ||
        text.includes("queste espansioni sono attività") ||
        text.includes("these expansions are optional guided practice") ||
        text.includes("gli argomenti sono organizzati in ampie aree") ||
        text.includes("topics are grouped into broad communicative areas")
      ) {
        paragraph.classList.add("scope-view-meta-hidden");
      }
    });
  }

  function directChildByClass(parent, className) {
    return [...parent.children]
      .find(child => child.classList?.contains(className)) || null;
  }

  function makeLabel(italian, english) {
    const row = document.createElement("div");
    row.className = "scope-coverage-label";
    row.innerHTML = `
      <strong>${italian}</strong>
      <span lang="en">${english}</span>
    `;
    return row;
  }

  function makeVocabulary(items) {
    if (!Array.isArray(items)) {
      return null;
    }

    const usable =
      items.filter(item => item?.italian);

    if (!usable.length) {
      return null;
    }

    const block = document.createElement("div");
    block.className =
      "scope-coverage-block scope-vocabulary-block";

    block.appendChild(
      makeLabel(
        "Vocabolario / lingua target",
        "Vocabulary / Target Language"
      )
    );

    const list = document.createElement("div");
    list.className = "scope-vocab-list";

    usable.forEach(item => {
      const entry = document.createElement("span");
      entry.className = "scope-vocab-item";

      const it = document.createElement("span");
      it.textContent = item.italian;
      entry.appendChild(it);

      if (item.english) {
        const en = document.createElement("span");
        en.className = "scope-vocab-en";
        en.lang = "en";
        en.textContent = ` (${item.english})`;
        entry.appendChild(en);
      }

      list.appendChild(entry);
    });

    block.appendChild(list);
    return block;
  }

  function carrierLanguage(key) {
    const list = window.carrierPhrases?.[key];

    if (!Array.isArray(list)) {
      return [];
    }

    return list
      .map(item => item?.italian)
      .filter(Boolean);
  }

  function normalized(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[.…]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function makeFrames(phrases) {
    if (!phrases.length) {
      return null;
    }

    const list = document.createElement("div");
    list.className = "scope-frame-list";

    phrases.forEach(phrase => {
      const chip = document.createElement("span");
      chip.className = "scope-frame";
      chip.textContent = phrase;
      list.appendChild(chip);
    });

    return list;
  }

  function enhanceCard(card) {
    if (card.dataset.scopeCoverageReady === "true") {
      return;
    }

    const titleNode =
      card.querySelector(".about-scope-topic-title strong");

    const title =
      titleNode?.textContent
        ?.replace(/\s+/g, " ")
        .trim();

    const config = coverage.get(title);

    if (!config) {
      console.warn(
        "Scope coverage mapping missing:",
        title
      );
      return;
    }

    const titleRow =
      card.querySelector(".about-scope-topic-title");

    if (!titleRow) {
      return;
    }

    let items = [];

    try {
      items = config.items();
    } catch (error) {
      console.warn(
        "Scope vocabulary unavailable:",
        title,
        error
      );
    }

    const vocabularyItems = [
      ...(Array.isArray(items) ? items : []),
      ...(config.extraVocabulary || [])
    ];

    const vocab =
      makeVocabulary(
        vocabularyItems
      );

    if (vocab) {
      titleRow.insertAdjacentElement(
        "afterend",
        vocab
      );
    }

    const existingParagraphs =
      [...card.children]
        .filter(child => child.tagName === "P");

    const existingText =
      normalized(
        existingParagraphs
          .map(paragraph => paragraph.textContent)
          .join(" ")
      );

    const candidates = [
      ...carrierLanguage(config.key),
      ...(config.extraLanguage || [])
    ];

    const additions = [];
    const seen = new Set();

    candidates.forEach(phrase => {
      const key = normalized(phrase);

      if (
        !key ||
        seen.has(key) ||
        existingText.includes(key)
      ) {
        return;
      }

      seen.add(key);
      additions.push(phrase);
    });

    if (
      existingParagraphs.length ||
      additions.length
    ) {
      const language = document.createElement("div");
      language.className =
        "scope-coverage-block scope-language-block";

      language.appendChild(
        makeLabel(
          config.existingAsTarget
            ? "Lingua target"
            : "Lingua utile",
          config.existingAsTarget
            ? "Target Language"
            : "Useful Language"
        )
      );

      const frames = makeFrames(additions);

      if (frames) {
        language.appendChild(frames);
      }

      existingParagraphs.forEach(paragraph => {
        paragraph.classList.add(
          "scope-existing-language"
        );
        language.appendChild(paragraph);
      });

      if (vocab) {
        vocab.insertAdjacentElement(
          "afterend",
          language
        );
      } else {
        titleRow.insertAdjacentElement(
          "afterend",
          language
        );
      }
    }

    card.dataset.scopeCoverageReady = "true";
  }

  function enhanceCoverage() {
    [...modal.querySelectorAll(".about-scope-topic")]
      .forEach(enhanceCard);
  }

  function buildScopeGroups() {
    const groups =
      [...modal.querySelectorAll(".about-scope-group")];

    groups.forEach((group, index) => {
      if (group.dataset.scopeReady === "true") {
        return;
      }

      const heading =
        directChildByClass(
          group,
          "about-scope-group-heading"
        );

      const list =
        directChildByClass(
          group,
          "about-scope-topic-list"
        );

      if (!heading || !list) {
        return;
      }

      const listId =
        `scopeGroupContent${index + 1}`;

      list.id = listId;

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "scope-group-toggle";
      button.setAttribute(
        "aria-controls",
        listId
      );

      const labelSpan =
        document.createElement("span");

      labelSpan.className =
        "scope-group-toggle-label";

      while (heading.firstChild) {
        labelSpan.appendChild(
          heading.firstChild
        );
      }

      const chevron =
        document.createElement("span");

      chevron.className =
        "scope-group-chevron";

      chevron.setAttribute(
        "aria-hidden",
        "true"
      );

      chevron.textContent = "▾";

      button.append(
        labelSpan,
        chevron
      );

      heading.appendChild(button);

      let isOpen = index === 0;

      function render() {
        list.hidden = !isOpen;

        button.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        group.classList.toggle(
          "is-open",
          isOpen
        );
      }

      button.addEventListener(
        "click",
        () => {
          isOpen = !isOpen;
          render();
        }
      );

      group.dataset.scopeReady = "true";
      render();
    });
  }

  function prepareScope() {
    installStyles();
    simplifyHeader();
    hideMetaNotes();
    enhanceCoverage();
    buildScopeGroups();
  }

  function openScope() {
    prepareScope();

    previousFocus =
      document.activeElement;

    modal.hidden = false;

    document.body.classList.add(
      "scope-modal-open"
    );

    closeButton?.focus();
  }

  function closeScope() {
    modal.hidden = true;

    document.body.classList.remove(
      "scope-modal-open"
    );

    previousFocus?.focus?.();
  }

  document.addEventListener(
    "click",
    event => {
      if (
        event.target.closest(
          "[data-open-scope]"
        )
      ) {
        event.preventDefault();
        openScope();
        return;
      }

      if (
        event.target.closest(
          "[data-scope-close]"
        )
      ) {
        closeScope();
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
        closeScope();
      }
    }
  );
})();
