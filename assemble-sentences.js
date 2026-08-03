"use strict";

 

/*

  Primo Volo d'Italiano

  Assembla · Assemble Sentences

 

  Load this file AFTER words-in-action.js:

 

  <script src="data.js"></script>

  <script src="script.js"></script>

  <script src="words-in-action.js"></script>

  <script src="assemble-sentences.js"></script>

*/

 

(function initializeSentenceAssembly() {

  const menu =

    document.querySelector(".activity-menu");

 

  const main =

    document.querySelector("main.page");

 

  const topicSelectElement =

    document.querySelector("#topicSelect");

 

  const englishToggleControlElement =

    document.querySelector(

      "#englishToggleControl"

    );

 

  const learnInstructionsElement =

    document.querySelector(

      "#learnInstructions"

    );

 

  if (!menu || !main) {

    console.error(

      "Sentence Assembly could not start because the activity menu or main page was not found."

    );


    return;

  }

 

  /* ========================================

     CREATE BUTTON

     ======================================== */

 

  let assembleButton =

    document.querySelector(

      '[data-mode="assemble-sentences"]'

    );

 

  if (!assembleButton) {

    assembleButton =

      document.createElement("button");

 

    assembleButton.type = "button";

    assembleButton.className =

      "activity-button";

    assembleButton.dataset.mode =

      "assemble-sentences";

 

    assembleButton.innerHTML = `

      <span class="activity-icon">

        🧩

      </span>

 

      <span class="activity-italian">

        Assembla

      </span>

 

      <small>

        Assemble

      </small>

    `;

 

    const completeButton =

      menu.querySelector(

        '[data-mode="complete"]'

      );

 

    if (completeButton) {

      completeButton.before(

        assembleButton

      );

    } else {

      menu.appendChild(

        assembleButton

      );

    }

  }

 

  /* Add a readable label to the Progress report. */

  if (

    typeof activityLabels !== "undefined"

  ) {

    activityLabels["assemble-sentences"] =

      "Assembla · Assemble";

  }

 

  /* ========================================

     CREATE ACTIVITY PANEL

     ======================================== */

 

  let assembleActivity =

    document.querySelector(

      "#assembleSentencesActivity"

    );

 

  if (!assembleActivity) {

    assembleActivity =

      document.createElement("section");

 

    assembleActivity.id =

      "assembleSentencesActivity";


 

    assembleActivity.className =

      "assemble-sentences-activity activity-panel";

 

    assembleActivity.hidden = true;

 

    main.appendChild(

      assembleActivity

    );

  }

 

  /* ========================================

     STYLES

     ======================================== */

 

  if (

    !document.querySelector(

      "#assembleSentencesStyles"

    )

  ) {

    const style =

      document.createElement("style");

 

    style.id =

      "assembleSentencesStyles";

 

    style.textContent = `

      .activity-menu {

        grid-template-columns:

          repeat(9, minmax(0, 1fr));

      }

 

      .assemble-sentences-activity {

        width: min(900px, 100%);

        margin: 0 auto;

      }

 

      .assemble-card {

        padding: 26px;

        border-radius: 24px;

        background: white;

        box-shadow: var(

          --shadow,

          0 10px 28px rgba(36, 57, 87, 0.12)

        );

      }

 

      .assemble-heading {

        text-align: center;

      }

 

      .assemble-heading h4 {

        margin: 0;

        color: var(--blue-dark, #274b84);

        font-size: 1.3rem;

      }

 

      .assemble-heading p {

        margin: 6px 0 0;

        color: var(--muted, #66758d);

      }

 

      .assemble-prompt-row {

    display: grid;

    grid-template-columns: 190px 300px;

    justify-content: center;

    align-items: center;

    column-gap: 70px;

    margin: 22px auto;

}

 

    .assemble-carrier-visual {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 170px;
    min-width: 170px;

    margin: 0 auto;
}

.assemble-carrier-image {
    display: block;

    width: 170px;

    max-width: 100%;

    height: auto;

    object-fit: contain;
}

 

      .assemble-picture-frame {
  display: grid;
  place-items: center;
  width: 300px;
  height: 300px;
  padding: 20px;
  border: 2px solid
    var(--border, #d9e2ef);
  border-radius: 22px;
  background: white;
}

.assemble-picture-frame img {
  display: block;
  width: 72%;
  height: 72%;
  object-fit: contain;
}
 

      .assemble-instruction {

        margin: 0 0 14px;

        color: var(--blue-dark, #274b84);

        font-weight: 850;

        text-align: center;

      }

 

      .assemble-instruction span {

        display: block;

        margin-top: 3px;

        color: var(--muted, #66758d);

        font-size: 0.9rem;

        font-weight: 550;

      }

 

      .assemble-sentence-area {

        min-height: 78px;

        display: flex;

        justify-content: center;

        align-items: center;

        flex-wrap: wrap;

        gap: 9px;

        margin: 0 auto 20px;

        padding: 15px;

        border: 2px dashed

          var(--border, #d9e2ef);

        border-radius: 18px;

        background: var(--cream, #fffaf3);

      }

 

      .assemble-placeholder {

        color: var(--muted, #66758d);

        font-weight: 750;

      }

 

      .assembled-word {

        display: inline-flex;

        align-items: center;

        min-height: 43px;

        padding: 8px 13px;

        border: 2px solid #b9cae0;

        border-radius: 13px;

        color: var(--blue-dark, #274b84);

        background: white;

        font-size: 1.08rem;

        font-weight: 900;

        box-shadow:

          0 4px 10px rgba(36, 57, 87, 0.08);

      }


 

      .assemble-word-bank {

        display: flex;

        justify-content: center;

        flex-wrap: wrap;

        gap: 12px;

        margin: 0 auto;

      }

 

      .assemble-word-tile {

        min-width: 78px;

        min-height: 52px;

        padding: 10px 16px;

        border: 2px solid

          var(--border, #d9e2ef);

        border-radius: 15px;

        color: var(--blue-dark, #274b84);

        background: white;

        font: inherit;

        font-size: 1.05rem;

        font-weight: 900;

        cursor: pointer;

        box-shadow:

          0 5px 13px rgba(36, 57, 87, 0.09);

        transition:

          transform 0.15s ease,

          border-color 0.15s ease,

          background 0.15s ease;

      }

 

      .assemble-word-tile:hover:not(:disabled),

      .assemble-word-tile:focus-visible {

        transform: translateY(-2px);

        border-color: var(--blue, #274b84);

        outline: none;

      }

 

      .assemble-word-tile.used {

        opacity: 0.32;

        cursor: default;

        transform: none;

      }

 

      .assemble-word-tile.wrong {

        border-color: #bc5145;

        background: #fff1ef;

        animation: assembleShake 0.32s ease;

      }

 

      @keyframes assembleShake {

        0%, 100% {

          transform: translateX(0);

        }

 

        25% {

          transform: translateX(-6px);

        }

 

        75% {

          transform: translateX(6px);

        }

      }

 

      .assemble-feedback {

        min-height: 74px;

        margin: 20px 0 0;

        color: var(--blue-dark, #274b84);

        font-weight: 850;

        line-height: 1.45;

        text-align: center;

      }

 

      .assemble-feedback strong {

        display: block;

        margin-top: 7px;


        color: #337a4d;

        font-size: clamp(

          1.25rem,

          3vw,

          1.8rem

        );

      }

 

      .assemble-feedback span {

        display: block;

        margin-top: 4px;

        color: var(--muted, #66758d);

        font-size: 0.9rem;

        font-weight: 550;

      }

 

      .assemble-actions {

        display: flex;

        justify-content: center;

        flex-wrap: wrap;

        gap: 12px;

        margin-top: 14px;

      }

 

      .assemble-secondary-button {

        padding: 10px 16px;

        border: 1px solid

          var(--border, #d9e2ef);

        border-radius: 999px;

        color: var(--blue-dark, #274b84);

        background: white;

        font-weight: 800;

        cursor: pointer;

      }

 

      .assemble-empty {

        padding: 28px;

        color: var(--blue-dark, #274b84);

        text-align: center;

      }

 

      .assemble-empty span {

        display: block;

        margin-top: 5px;

        color: var(--muted, #66758d);

      }

 

      body.hide-english

      .assemble-heading p,

      body.hide-english

      .assemble-instruction span,

      body.hide-english

      .assemble-feedback span {

        display: none;

      }

 

      @media (max-width: 520px) {

  .activity-menu {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .assemble-card {
    padding: 18px;
  }

  .assemble-prompt-row {
    grid-template-columns: 1fr;
    width: min(270px, 100%);
  }

  .assemble-carrier-visual {
    width: 150px;
    min-width: 150px;
    margin: 0 auto;
  }

  .assemble-carrier-image {
    width: 150px;
  }

  .assemble-picture-frame {
    width: 260px;
    height: 260px;
    margin: 0 auto;
  }
}

`;

document.head.appendChild(style);

}
 

  /* ========================================

     GAME STATE

     ======================================== */

 

  let currentItem = null;

  let correctTokens = [];

  let placedTokens = [];

  let sentenceHadError = false;

  let sentenceComplete = false;

 

  function shuffleSentenceItems(items) {

    const shuffled = [...items];

 

    for (

      let index = shuffled.length - 1;

      index > 0;

      index -= 1

    ) {

      const randomIndex =

        Math.floor(

          Math.random() * (index + 1)

        );

 

      [

        shuffled[index],

        shuffled[randomIndex]

      ] = [

        shuffled[randomIndex],

        shuffled[index]

      ];

    }

 

    return shuffled;

  }

 

  function arraysMatch(first, second) {

    return (

      first.length === second.length &&

      first.every(

        (value, index) =>

          value === second[index]

      )

    );

  }


 

  function shuffleUntilDifferent(items) {

    if (items.length < 2) {

      return [...items];

    }

 

    let shuffled =

      shuffleSentenceItems(items);

 

    let attempts = 0;

 

    while (

      arraysMatch(shuffled, items) &&

      attempts < 12

    ) {

      shuffled =

        shuffleSentenceItems(items);

      attempts += 1;

    }

 

    return shuffled;

  }

 

  function getVocabulary() {

    if (

      typeof currentVocabulary ===

        "undefined" ||

      !Array.isArray(currentVocabulary)

    ) {

      return [];

    }

 

    return currentVocabulary;

  }

 

  function speakSentence(text) {

    if (

      typeof speakItalian === "function"

    ) {

      speakItalian(text);

    }

  }

 

  function saveSentenceAttempt(

    isCorrect

  ) {

    if (

      typeof recordAttempt ===

        "function"

    ) {

      recordAttempt(

        "assemble-sentences",

        isCorrect

      );

    }

  }

 let currentCarrierPhrase = null;

function cleanCarrierPhrase(text) {
  return String(text || "")
    .replace(/\.{3}$/g, "")
    .trim();
}

function getTopicCarrierPhrases() {
  if (
    typeof window.carrierPhrases !== "object" ||
    !window.carrierPhrases
  ) {
    return [];
  }

  const phrases =
    window.carrierPhrases[currentTopicKey];

  return Array.isArray(phrases)
    ? phrases
    : [];
}

function chooseCarrierPhrase() {
  const phrases =
    getTopicCarrierPhrases();

  if (!phrases.length) {
    return {
      id: "vedo",
      italian: "Io vedo...",
      english: "I see...",
      image:
        "images/carrier-phrases/io-vedo-no-text.png"
    };
  }

  return phrases[
    Math.floor(
      Math.random() * phrases.length
    )
  ];
}

function createSentenceTokens(item) {
  currentCarrierPhrase =
    chooseCarrierPhrase();

  const starter =
    cleanCarrierPhrase(
      currentCarrierPhrase.italian
    );

  const starterTokens =
    starter
      .split(/\s+/)
      .filter(Boolean);

  const vocabularyTokens =
    item.italian
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return [
    ...starterTokens,
    ...vocabularyTokens
  ];
}

function createCompleteSentence(item) {
  const starter =
    cleanCarrierPhrase(
      currentCarrierPhrase?.italian
    );

  return `${starter} ${item.italian}.`;
}

 


  function renderPlacedTokens() {

    const sentenceArea =

      assembleActivity.querySelector(

        "#assembleSentenceArea"

      );

 

    if (!sentenceArea) {

      return;

    }

 

    if (!placedTokens.length) {
  sentenceArea.innerHTML = `
    <span
      class="assemble-placeholder"
      aria-hidden="true"
    >
      · · · ·
    </span>
  `;
  return;
}

sentenceArea.innerHTML =

      placedTokens

        .map(token => `

          <span class="assembled-word">

            ${token}

          </span>

        `)

        .join("");

  }

 

  function showAssemblyQuestion() {

    const vocabulary =

      getVocabulary();

 

    if (!vocabulary.length) {

      assembleActivity.innerHTML = `

        <div class="assemble-empty">

          Nessun vocabolario disponibile.

 

          <span>

            No vocabulary is available.

          </span>

        </div>

      `;

      return;

    }

 

    currentItem =

      vocabulary[

        Math.floor(

          Math.random() *

          vocabulary.length

        )

      ];

 

    correctTokens =

      createSentenceTokens(

        currentItem

      );

 

    placedTokens = [];

    sentenceHadError = false;

    sentenceComplete = false;

 

    const tileObjects =

      correctTokens.map(

        (token, index) => ({

          token,

          originalIndex: index,

          id: `${index}-${token}`

        })

      );

 

    const shuffledTiles =

      shuffleUntilDifferent(

        tileObjects


      );

 

    assembleActivity.innerHTML = `

      <div class="assemble-card">

 

<div class="assemble-heading">
  <h4>
    Metti le parole nell'ordine corretto.
  </h4>

  <p>
    Put the words in the correct order.
  </p>
</div>

 

        <div class="assemble-prompt-row">

<div class="assemble-carrier-visual">
  <img
    src="${
      currentCarrierPhrase?.image ||
      "images/carrier-phrases/io-vedo-no-text.png"
    }"
    alt="${
      currentCarrierPhrase?.english || ""
    }"
    class="assemble-carrier-image"
  >
</div>

          <div class="assemble-picture-frame">

            <img

              src="${currentItem.image}"

              alt="${currentItem.english}"

            >

          </div>

        </div>

 

        <p class="assemble-instruction">

          Tocca le parole nell'ordine corretto.

 

          <span>

            Tap the words in the correct order.

          </span>

        </p>

 

        <div

          id="assembleSentenceArea"

          class="assemble-sentence-area"

          aria-live="polite"

          aria-label="Sentence being built"


        ></div>

 

        <div

          id="assembleWordBank"

          class="assemble-word-bank"

          aria-label="Mixed-up sentence words"

        >

          ${shuffledTiles.map(tile => `

            <button

              type="button"

              class="assemble-word-tile"

              data-token="${tile.token}"

              data-tile-id="${tile.id}"

            >

              ${tile.token}

            </button>

          `).join("")}

        </div>

 

        <p

          id="assembleFeedback"

          class="assemble-feedback"

          aria-live="polite"

        ></p>

 

        <div class="assemble-actions">

          <button

            type="button"

            id="assembleReset"

            class="assemble-secondary-button"

          >

            Ricomincia · Start Over

          </button>

 

          <button

            type="button"

            id="assembleNext"

            class="next-question-button"

            hidden

          >

            Prossima frase · Next Sentence

          </button>

        </div>

 

      </div>

    `;

 

    renderPlacedTokens();



    const wordTiles =

      assembleActivity.querySelectorAll(

        ".assemble-word-tile"

      );

 

    const feedback =

      assembleActivity.querySelector(

        "#assembleFeedback"

      );

 

    const resetButton =

      assembleActivity.querySelector(

        "#assembleReset"

      );

 

    const nextButton =

      assembleActivity.querySelector(

        "#assembleNext"

      );


 

    function completeSentence() {

      sentenceComplete = true;

 

      const sentence =

        createCompleteSentence(

          currentItem

        );

 

      saveSentenceAttempt(

        !sentenceHadError

      );

 

      feedback.innerHTML = `

        🎉 Frase completa!

 

        <strong>

          ${sentence}

        </strong>

 

        <span>

          Sentence complete!

        </span>

      `;

 

      wordTiles.forEach(tile => {

        tile.disabled = true;

      });

 

      resetButton.hidden = true;

      nextButton.hidden = false;

 

      speakSentence(sentence);

    }

 

    function selectTile(tile) {

      if (

        sentenceComplete ||

        tile.disabled

      ) {

        return;

      }

 

      const expectedToken =


        correctTokens[

          placedTokens.length

        ];

 

      const selectedToken =

        tile.dataset.token;

 

      if (

        selectedToken !==

        expectedToken

      ) {

        sentenceHadError = true;

 

        tile.classList.remove(

          "wrong"

        );

 

        void tile.offsetWidth;

 

        tile.classList.add(

          "wrong"

        );

 

        feedback.innerHTML = `

          Riprova.

 

          <span>

            Try another word.

          </span>

        `;

 

        tile.addEventListener(

          "animationend",

          () => {

            tile.classList.remove(

              "wrong"

            );

          },

          { once: true }

        );

 

        return;

      }

 

      placedTokens.push(

        selectedToken

      );

 

      tile.disabled = true;

      tile.classList.add("used");

 

      feedback.textContent = "";

 

      renderPlacedTokens();

 

      if (

        placedTokens.length ===

        correctTokens.length

      ) {

        completeSentence();

      }

    }

 

    wordTiles.forEach(tile => {

      tile.addEventListener(

        "click",

        () => {

          selectTile(tile);

        }

      );

    });

 

    resetButton.addEventListener(

      "click",

      () => {


        showAssemblyQuestion();

      }

    );

 

    nextButton.addEventListener(

      "click",

      showAssemblyQuestion

    );

  }

 

  /* ========================================

     MODE CONTROL

     ======================================== */

 

  function hideStandardPanels() {

    [

      "#learnActivity",

      "#matchActivity",

      "#listenActivity",

      "#chooseActivity",

      "#completeActivity",

      "#writeActivity",

      "#memoryActivity",

      "#wordsInActionActivity"

    ].forEach(selector => {

      const panel =

        document.querySelector(

          selector

        );

 

      if (panel) {

        panel.hidden = true;

      }

    });

  }

 

  function showAssembleMode() {

    document

      .querySelectorAll(

        ".activity-button"

      )

      .forEach(button => {

        button.classList.toggle(

          "active",

          button === assembleButton

        );

      });

 

    hideStandardPanels();

 

    assembleActivity.hidden = false;

 

    if (

      englishToggleControlElement

    ) {

      englishToggleControlElement.hidden =

        true;

    }

 

    if (

      learnInstructionsElement

    ) {

      learnInstructionsElement.hidden =

        true;

    }

 

    showAssemblyQuestion();

  }

 

  assembleButton.addEventListener(

    "click",

    showAssembleMode

  );

 

  document


    .querySelectorAll(

      ".activity-button"

    )

    .forEach(button => {

      if (button === assembleButton) {

        return;

      }

 

      button.addEventListener(

        "click",

        () => {

          assembleActivity.hidden = true;

        }

      );

    });

 

  if (topicSelectElement) {

    topicSelectElement.addEventListener(

      "change",

      () => {

        assembleActivity.hidden = true;

      }

    );

  }

})();