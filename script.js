"use strict";
const learnActivity =
  document.querySelector("#learnActivity");

const vocabularyGrid =
  document.querySelector("#vocabularyGrid");

const chooseActivity =
  document.querySelector("#chooseActivity");
const matchActivity =
  document.querySelector("#matchActivity");
const englishToggle =
  document.querySelector("#englishToggle");
const englishToggleControl =
  document.querySelector("#englishToggleControl");

const learnInstructions =
  document.querySelector("#learnInstructions");
const activityButtons =
  document.querySelectorAll(".activity-button");
const topicSelect =
  document.querySelector("#topicSelect");

const topicItalian =
  document.querySelector("#topicItalian");

const topicEnglish =
  document.querySelector("#topicEnglish");

const topicAvailability =
  document.querySelector("#topicAvailability");

const aboutButton =
  document.querySelector("#aboutButton");

const aboutModal =
  document.querySelector("#aboutModal");

const aboutClose =
  document.querySelector("#aboutClose");
let currentQuestion = null;
const topics = {
  supplies: {
    icon: "📚",
    italian: "Materiale scolastico",
    english: "School Supplies",
    vocabulary: supplies,
    available: true
  },

  food: {
    icon: "🍎",
    italian: "Il cibo",
    english: "Food",
    vocabulary: [],
    available: false
  },

  clothing: {
    icon: "👕",
    italian: "L’abbigliamento",
    english: "Clothing",
    vocabulary: [],
    available: false
  },

  home: {
    icon: "🏠",
    italian: "La casa",
    english: "Home",
    vocabulary: [],
    available: false
  },

  family: {
    icon: "👨‍👩‍👧",
    italian: "La famiglia",
    english: "Family",
    vocabulary: [],
    available: false
  },

  colors: {
    icon: "🎨",
    italian: "I colori",
    english: "Colors",
    vocabulary: [],
    available: false
  },

  numbers: {
    icon: "🔢",
    italian: "I numeri",
    english: "Numbers",
    vocabulary: [],
    available: false
  },

  animals: {
    icon: "🐶",
    italian: "Gli animali",
    english: "Animals",
    vocabulary: [],
    available: false
  },

  time: {
    icon: "🕒",
    italian: "L’ora",
    english: "Time",
    vocabulary: [],
    available: false
  },

  weather: {
    icon: "🌦️",
    italian: "Il tempo",
    english: "Weather",
    vocabulary: [],
    available: false
  },

  classroom: {
    icon: "🏫",
    italian: "Espressioni in classe",
    english: "Classroom Expressions",
    vocabulary: [],
    available: false
  },

  greetings: {
    icon: "👋",
    italian: "Saluti e presentazioni",
    english: "Greetings & Introductions",
    vocabulary: [],
    available: false
  }
};

let currentTopicKey = "supplies";
let currentVocabulary =
  topics[currentTopicKey].vocabulary;
/* ========================================
   AUDIO
   ======================================== */

function getItalianVoice() {
  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find(
      voice =>
        voice.lang.toLowerCase() === "it-it"
    ) ||
    voices.find(
      voice =>
        voice.lang.toLowerCase().startsWith("it")
    )
  );
}

function speakItalian(text) {
  if (!("speechSynthesis" in window)) {
    window.alert(
      "Audio is not supported in this browser."
    );

    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "it-IT";
  utterance.rate = 0.82;
  utterance.pitch = 1;

  const italianVoice = getItalianVoice();

  if (italianVoice) {
    utterance.voice = italianVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/* ========================================
   HELPERS
   ======================================== */

function shuffle(items) {
  return [...items].sort(
    () => Math.random() - 0.5
  );
}

function setActiveButton(mode) {
  activityButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );
  });
}

/* ========================================
   LEARN MODE
   ======================================== */

function createVocabularyCard(item) {
  const card = document.createElement("button");

  card.className = "vocabulary-card";
  card.type = "button";

  card.setAttribute(
    "aria-label",
    `Hear ${item.italian}`
  );

  card.innerHTML = `
    <div class="image-frame">
      <img
        src="${item.image}"
        alt="${item.english}"
      >
    </div>

    <div class="card-text">
      <p class="italian-word">
        ${item.italian}
      </p>

      <p class="english-word">
        ${item.english}
      </p>
    </div>

    <span
      class="audio-icon"
      aria-hidden="true"
    >
      🔊
    </span>
  `;

  card.addEventListener("click", () => {
    speakItalian(item.italian);

    card.classList.remove("is-speaking");

    void card.offsetWidth;

    card.classList.add("is-speaking");
  });

  card.addEventListener(
    "animationend",
    () => {
      card.classList.remove("is-speaking");
    }
  );

  return card;
}

function renderVocabulary() {
  vocabularyGrid.innerHTML = "";

  currentVocabulary.forEach(item => {
    vocabularyGrid.appendChild(
      createVocabularyCard(item)
    );
  });
}

function showLearnMode() {
  setActiveButton("learn");

  learnActivity.hidden = false;
  matchActivity.hidden = true;
  chooseActivity.hidden = true;

  englishToggleControl.hidden = false;
  learnInstructions.hidden = false;

  renderVocabulary();
}
/* ========================================
   MATCH MODE
   ======================================== */
/* ========================================
   MATCH MODE
   ======================================== */

let draggedWord = null;
let selectedMatchWord = null;
let matchedCount = 0;

function createMatchRound() {
  const roundItems =
    shuffle(currentVocabulary).slice(0, 6);

  const shuffledWords =
    shuffle(roundItems);

  draggedWord = null;
  selectedMatchWord = null;
  matchedCount = 0;

  matchActivity.innerHTML = `
    <div class="match-card">

      <div class="match-heading">
        <h4>
          Trascina ogni parola sotto
          l'immagine corretta.
        </h4>

        <p>
          Drag each word beneath the
          correct picture.
        </p>
      </div>

      <div
        class="match-picture-grid"
        aria-label="Picture drop zones"
      >
        ${roundItems.map(item => `
          <div
            class="match-picture"
            data-answer="${item.italian}"
          >
            <div class="match-image-frame">
              <img
                src="${item.image}"
                alt="${item.english}"
              >
            </div>

            <div
              class="match-drop-zone"
              data-answer="${item.italian}"
              tabindex="0"
              role="button"
              aria-label="
                Drop ${item.italian} here
              "
            >
              <span class="drop-placeholder">
                Trascina qui
              </span>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="match-word-bank">

        <p class="word-bank-label">
          Parole
          <span>Words</span>
        </p>

        <div
          class="match-word-grid"
          aria-label="Italian words"
        >
          ${shuffledWords.map(item => `
            <button
              type="button"
              class="match-word"
              draggable="true"
              data-answer="${item.italian}"
            >
              ${item.italian}
            </button>
          `).join("")}
        </div>

      </div>

      <p
        id="matchFeedback"
        class="match-feedback"
        aria-live="polite"
      >
        Trascina una parola
        sull'immagine corretta.

        <span>
          Drag a word to the correct
          picture.
        </span>
      </p>

      <button
        type="button"
        id="newMatchRound"
        class="next-question-button"
        hidden
      >
        Gioca ancora · Play Again
      </button>

    </div>
  `;

  const wordButtons =
    matchActivity.querySelectorAll(
      ".match-word"
    );

  const dropZones =
    matchActivity.querySelectorAll(
      ".match-drop-zone"
    );

  const feedback =
    matchActivity.querySelector(
      "#matchFeedback"
    );

  const newRoundButton =
    matchActivity.querySelector(
      "#newMatchRound"
    );

  function clearSelectedWord() {
    wordButtons.forEach(word => {
      word.classList.remove("selected");
    });

    selectedMatchWord = null;
  }

  function showIncorrectFeedback(
    dropZone,
    word
  ) {
    dropZone.classList.add("incorrect");
    word.classList.add("incorrect");

    feedback.innerHTML = `
      Riprova. · Try again.
    `;

    window.setTimeout(() => {
      dropZone.classList.remove("incorrect");
      word.classList.remove("incorrect");
    }, 600);
  }

  function completeMatch(dropZone, word) {
    const answer =
      word.dataset.answer;

    dropZone.classList.remove(
      "drag-over",
      "incorrect"
    );

    dropZone.classList.add("matched");

    dropZone.innerHTML = `
      <span class="matched-word">
        ${answer}
      </span>
    `;

    dropZone.removeAttribute("tabindex");
    dropZone.setAttribute(
      "aria-label",
      `${answer}, matched`
    );

    word.classList.add("matched");
    word.disabled = true;
    word.draggable = false;

    speakItalian(answer);

    matchedCount += 1;

    feedback.innerHTML = `
      Corretto! · Correct!
    `;

    clearSelectedWord();

    if (matchedCount === roundItems.length) {
      feedback.innerHTML = `
        🎉 Ottimo lavoro!

        <span>
          Great job!
        </span>
      `;

      newRoundButton.hidden = false;
    }
  }

  function attemptMatch(dropZone, word) {
    if (
      !word ||
      word.disabled ||
      dropZone.classList.contains("matched")
    ) {
      return;
    }

    const isCorrect =
      dropZone.dataset.answer ===
      word.dataset.answer;

    if (isCorrect) {
      completeMatch(dropZone, word);
    } else {
      showIncorrectFeedback(
        dropZone,
        word
      );
    }
  }

  wordButtons.forEach(word => {
    word.addEventListener(
      "dragstart",
      event => {
        if (word.disabled) {
          event.preventDefault();
          return;
        }

        draggedWord = word;

        word.classList.add("dragging");

        event.dataTransfer.effectAllowed =
          "move";

        event.dataTransfer.setData(
          "text/plain",
          word.dataset.answer
        );
      }
    );

    word.addEventListener(
      "dragend",
      () => {
        word.classList.remove("dragging");

        dropZones.forEach(dropZone => {
          dropZone.classList.remove(
            "drag-over"
          );
        });

        draggedWord = null;
      }
    );

    /*
      Tap or click support for tablets,
      phones, and keyboard users.
    */
    word.addEventListener("click", () => {
      if (word.disabled) {
        return;
      }

      const wasSelected =
        word === selectedMatchWord;

      clearSelectedWord();

      if (!wasSelected) {
        selectedMatchWord = word;
        word.classList.add("selected");

        feedback.innerHTML = `
          Ora seleziona l'immagine.

          <span>
            Now select the picture.
          </span>
        `;
      }
    });
  });

  dropZones.forEach(dropZone => {
    dropZone.addEventListener(
      "dragover",
      event => {
        if (
          dropZone.classList.contains(
            "matched"
          )
        ) {
          return;
        }

        event.preventDefault();

        event.dataTransfer.dropEffect =
          "move";

        dropZone.classList.add(
          "drag-over"
        );
      }
    );

    dropZone.addEventListener(
      "dragleave",
      () => {
        dropZone.classList.remove(
          "drag-over"
        );
      }
    );

    dropZone.addEventListener(
      "drop",
      event => {
        event.preventDefault();

        dropZone.classList.remove(
          "drag-over"
        );

        attemptMatch(
          dropZone,
          draggedWord
        );
      }
    );

    dropZone.addEventListener(
      "click",
      () => {
        attemptMatch(
          dropZone,
          selectedMatchWord
        );
      }
    );

    dropZone.addEventListener(
      "keydown",
      event => {
        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }

        event.preventDefault();

        attemptMatch(
          dropZone,
          selectedMatchWord
        );
      }
    );
  });

  newRoundButton.addEventListener(
    "click",
    createMatchRound
  );
}

function showMatchMode() {
  setActiveButton("match-word");

  learnActivity.hidden = true;
  matchActivity.hidden = false;
  chooseActivity.hidden = true;

  englishToggleControl.hidden = true;
  learnInstructions.hidden = true;

  createMatchRound();
}

/* ========================================
   CHOOSE MODE
   ======================================== */

function buildChoices(correctItem) {
  const incorrectChoices = shuffle(
    currentVocabulary.filter(
      item => item !== correctItem
    )
  ).slice(0, 3);

  return shuffle([
    correctItem,
    ...incorrectChoices
  ]);
}

function showChooseQuestion() {
currentQuestion =
  currentVocabulary[
    Math.floor(
      Math.random() * currentVocabulary.length
    )
  ];

  const choices =
    buildChoices(currentQuestion);

  chooseActivity.innerHTML = `
    <div class="quiz-card">

      <p class="quiz-label">
        Scegli la parola corretta.
        <span>Choose the correct word.</span>
      </p>

      <div class="quiz-image-frame">
        <img
          src="${currentQuestion.image}"
          alt="School supply"
        >
      </div>

      <div class="choice-grid">

        ${choices.map(item => `
          <button
            type="button"
            class="choice-button"
            data-answer="${item.italian}"
          >
            ${item.italian}
          </button>
        `).join("")}

      </div>

      <p
        id="quizFeedback"
        class="quiz-feedback"
        aria-live="polite"
      >
      </p>

      <button
        type="button"
        id="nextQuestionButton"
        class="next-question-button"
        hidden
      >
        Prossima domanda · Next Question
      </button>

    </div>
  `;

  const choiceButtons =
    chooseActivity.querySelectorAll(
      ".choice-button"
    );

  const feedback =
    chooseActivity.querySelector(
      "#quizFeedback"
    );

  const nextButton =
    chooseActivity.querySelector(
      "#nextQuestionButton"
    );

  choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
      const isCorrect =
        button.dataset.answer ===
        currentQuestion.italian;

      choiceButtons.forEach(choice => {
        choice.disabled = true;

        if (
          choice.dataset.answer ===
          currentQuestion.italian
        ) {
          choice.classList.add("correct");
        }
      });

      if (isCorrect) {
        feedback.textContent =
          "Corretto! · Correct!";

        feedback.className =
          "quiz-feedback correct-feedback";

        speakItalian(currentQuestion.italian);
      } else {
        button.classList.add("incorrect");

        feedback.textContent =
          `La risposta corretta è ${currentQuestion.italian}.`;

        feedback.className =
          "quiz-feedback incorrect-feedback";
      }

      nextButton.hidden = false;
    });
  });

  nextButton.addEventListener(
    "click",
    showChooseQuestion
  );
}

function showChooseMode() {
  setActiveButton("choose");

  learnActivity.hidden = true;
  matchActivity.hidden = true;
  chooseActivity.hidden = false;

  englishToggleControl.hidden = true;
  learnInstructions.hidden = true;

  showChooseQuestion();
}

/* ========================================
   TOPIC SELECTOR
   ======================================== */

function updateTopicHeading(topic) {
  topicItalian.textContent =
    `${topic.icon} ${topic.italian}`;

  topicEnglish.textContent =
    topic.english;

  vocabularyGrid.setAttribute(
    "aria-label",
    `${topic.english} vocabulary`
  );
}

function selectTopic(topicKey) {
  const topic = topics[topicKey];

  if (!topic) {
    return;
  }

  if (!topic.available) {
    topicAvailability.style.display =
      "block";

    topicAvailability.textContent =
      `${topic.italian} sarà disponibile presto. ` +
      `${topic.english} is coming soon.`;

    topicSelect.value = currentTopicKey;

    return;
  }

  currentTopicKey = topicKey;
  currentVocabulary = topic.vocabulary;

  topicAvailability.textContent = "";
  topicAvailability.style.display = "none";

  updateTopicHeading(topic);
  showLearnMode();
}

topicSelect.addEventListener(
  "change",
  () => {
    selectTopic(topicSelect.value);
  }
);
/* ========================================
   ABOUT MODAL
   ======================================== */

let lastFocusedElement = null;

function openAboutModal() {
  lastFocusedElement =
    document.activeElement;

  aboutModal.hidden = false;
  document.body.style.overflow = "hidden";

  aboutClose.focus();
}

function closeAboutModal() {
  aboutModal.hidden = true;
  document.body.style.overflow = "";

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

aboutButton.addEventListener(
  "click",
  openAboutModal
);

aboutClose.addEventListener(
  "click",
  closeAboutModal
);

aboutModal.addEventListener(
  "click",
  event => {
    if (event.target === aboutModal) {
      closeAboutModal();
    }
  }
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      !aboutModal.hidden
    ) {
      closeAboutModal();
    }
  }
);
/* ========================================
   MODE BUTTONS
   ======================================== */

activityButtons.forEach(button => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    if (mode === "learn") {
      showLearnMode();
      return;
    }

    if (mode === "match-word") {
      showMatchMode();
      return;
    }

    if (mode === "choose") {
      showChooseMode();
      return;
    }

    window.alert(
      "Questa attività sarà disponibile presto."
    );
  });
});

/* ========================================
   ENGLISH TOGGLE
   ======================================== */

englishToggle.addEventListener(
  "change",
  () => {
    document.body.classList.toggle(
      "hide-english",
      !englishToggle.checked
    );
  }
);

window.speechSynthesis.addEventListener(
  "voiceschanged",
  getItalianVoice
);

showLearnMode();