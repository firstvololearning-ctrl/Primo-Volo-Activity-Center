"use strict";

/*
  Primo Volo d'Italiano
  Presentiamoci! · Introductions Practice
*/

(function initializeIntroductionsPractice() {
  const activityMenu =
    document.querySelector(".activity-menu");

  const main =
    document.querySelector("main.page");

  const topicSelect =
    document.querySelector("#topicSelect");

  const englishToggleControl =
    document.querySelector(
      "#englishToggleControl"
    );

  const learnInstructions =
    document.querySelector(
      "#learnInstructions"
    );

  if (
    !activityMenu ||
    !main ||
    !topicSelect
  ) {
    console.error(
      "Presentiamoci could not start."
    );

    return;
  }

  /* ========================================
     CREATE PRESENTIAMOCI BUTTON
     ======================================== */

  let introductionsButton =
    document.querySelector(
      '[data-mode="introductions-practice"]'
    );

  if (!introductionsButton) {
    introductionsButton =
      document.createElement("button");

    introductionsButton.type = "button";

    introductionsButton.className =
      "activity-button";

    introductionsButton.dataset.mode =
      "introductions-practice";

    introductionsButton.hidden = true;

    introductionsButton.innerHTML = `
      <span class="activity-icon" aria-hidden="true">
        👋
      </span>

      <span class="activity-italian">
        Presentiamoci!
      </span>

      <small>
        Let's Introduce Ourselves!
      </small>
    `;
    const assembleButton =
      activityMenu.querySelector(
        '[data-mode="assemble-sentences"]'
      );

    if (assembleButton) {
      assembleButton.before(
        introductionsButton
      );
    } else {
      activityMenu.appendChild(
        introductionsButton
      );
    }
  }

/* ========================================
   CREATE ACTIVITY PANEL
   ======================================== */


  let introductionsActivity =
    document.querySelector(
      "#introductionsPracticeActivity"
    );

  if (!introductionsActivity) {
    introductionsActivity =
      document.createElement("section");

    introductionsActivity.id =
      "introductionsPracticeActivity";

    introductionsActivity.className =
      "introductions-practice-activity";

    introductionsActivity.hidden = true;

    main.appendChild(
      introductionsActivity
    );
  }

  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#introductionsPracticeStyles"
    )
  ) {
    const style =
      document.createElement("style");

    style.id =
      "introductionsPracticeStyles";

    style.textContent = `
      .introductions-practice-activity {
        width: min(960px, 100%);
        margin: 0 auto;
      }

      .introductions-card {
        padding: 28px;
        border-radius: 24px;
        background: white;
        box-shadow:
          0 10px 28px
          rgba(36, 57, 87, 0.12);
        text-align: center;
      }

      .introductions-heading h4 {
        margin: 0;
        color: var(--blue, #274b84);
        font-size: clamp(
          1.4rem,
          3vw,
          1.8rem
        );
      }

      .introductions-heading p {
        margin: 7px 0 0;
        color: var(--muted, #66758d);
      }

      .introductions-age-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        margin-top: 26px;
      }

      .introductions-age-label {
        color: var(--blue, #274b84);
        font-size: 1.25rem;
        font-weight: 850;
      }

      .introductions-age-label span {
        display: block;
        margin-top: 5px;
        color: var(--muted, #66758d);
        font-size: 0.92rem;
        font-weight: 550;
      }

      .introductions-age-input {
        width: 130px;
        padding: 13px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 15px;
        color: var(--blue, #274b84);
        background: white;
        font-size: 1.4rem;
        font-weight: 900;
        text-align: center;
      }

      .introductions-age-input:focus {
        border-color:
          var(--blue, #274b84);
        outline: none;
        box-shadow:
          0 0 0 4px
          rgba(39, 75, 132, 0.14);
      }

      .introductions-primary-button,
      .introductions-secondary-button {
        padding: 12px 21px;
        border-radius: 999px;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }

      .introductions-primary-button {
        border: 0;
        color: white;
        background:
          var(--blue, #274b84);
      }

      .introductions-primary-button:hover,
      .introductions-primary-button:focus-visible {
        transform: translateY(-1px);
        outline: none;
      }

      .introductions-secondary-button {
        border: 2px solid
          var(--border, #d9e2ef);
        color: var(--blue, #274b84);
        background: white;
      }

      .introductions-age-feedback {
        min-height: 24px;
        margin: 0;
        color: #a33f35;
        font-weight: 750;
      }

      .introductions-progress {
        margin: 20px 0 8px;
        color: var(--muted, #66758d);
        font-size: 0.92rem;
        font-weight: 750;
      }

      .introductions-question-image {
        display: block;
        width: min(240px, 70%);
        aspect-ratio: 1;
        object-fit: contain;
        margin: 18px auto 4px;
      }

      .introductions-question {
        margin: 10px 0 4px;
        color: var(--blue, #274b84);
        font-size: clamp(
          1.45rem,
          4vw,
          2rem
        );
        font-weight: 900;
      }

      .introductions-question-english {
        margin: 0;
        color: var(--muted, #66758d);
        font-size: 0.95rem;
      }

      .introductions-question-audio {
        margin-top: 12px;
        border: 0;
        border-radius: 999px;
        padding: 9px 15px;
        color: var(--blue, #274b84);
        background:
          var(--cream, #fffaf3);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .introductions-choices {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-top: 24px;
      }

      .introductions-choice {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 0;
        padding: 12px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 18px;
        color: var(--blue, #274b84);
        background: white;
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          transform 0.16s ease,
          border-color 0.16s ease,
          box-shadow 0.16s ease;
      }

      .introductions-choice:hover,
      .introductions-choice:focus-visible {
        transform: translateY(-2px);
        border-color:
          var(--blue, #274b84);
        outline: none;
        box-shadow:
          0 8px 18px
          rgba(36, 57, 87, 0.1);
      }

      .introductions-choice img {
        flex: 0 0 90px;
        width: 90px;
        height: 90px;
        object-fit: contain;
        border-radius: 12px;
      }

      .introductions-choice-text {
        min-width: 0;
      }

      .introductions-choice-italian {
        display: block;
        font-size: 1.05rem;
        font-weight: 900;
        line-height: 1.25;
      }

      .introductions-choice-english {
        display: block;
        margin-top: 4px;
        color: var(--muted, #66758d);
        font-size: 0.8rem;
        line-height: 1.25;
      }

      .introductions-choice.correct {
        border-color: #4f9b66;
        background: #f2fbf4;
      }

      .introductions-choice.incorrect {
        border-color: #d46c5c;
        background: #fff5f2;
      }

      .introductions-choice:disabled {
        cursor: default;
      }

      .introductions-feedback {
        min-height: 32px;
        margin: 20px 0 0;
        font-size: 1.05rem;
        font-weight: 850;
      }

      .introductions-feedback.correct {
        color: #397a4d;
      }

      .introductions-feedback.incorrect {
        color: #a34438;
      }

      .introductions-next-button {
        margin-top: 14px;
      }

      .introductions-complete-image {
        display: block;
        width: min(220px, 65%);
        margin: 14px auto;
        object-fit: contain;
      }

      .introductions-full-sentence {
        margin: 20px auto;
        padding: 18px 20px;
        border-radius: 18px;
        color: var(--blue, #274b84);
        background:
          var(--cream, #fffaf3);
        font-size: clamp(
          1.15rem,
          2.7vw,
          1.5rem
        );
        font-weight: 850;
        line-height: 1.6;
      }

      .introductions-sequence {
        display: grid;
        grid-template-columns:
          repeat(5, minmax(0, 1fr));
        gap: 12px;
        margin-top: 20px;
      }

      .introductions-sequence-card {
        padding: 9px;
        border: 2px solid
          var(--border, #d9e2ef);
        border-radius: 16px;
        background: white;
      }

      .introductions-sequence-card img {
        display: block;
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
      }

      .introductions-sequence-card p {
        margin: 8px 0 0;
        color: var(--blue, #274b84);
        font-size: 0.88rem;
        font-weight: 850;
        line-height: 1.25;
      }

      .introductions-actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

    .introductions-question-english,
.introductions-choice-english {
  display: none;
}

      @media (max-width: 700px) {
        .introductions-choices {
          grid-template-columns: 1fr;
        }

        .introductions-sequence {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 480px) {
        .introductions-card {
          padding: 18px;
        }

        .introductions-choice img {
          flex-basis: 74px;
          width: 74px;
          height: 74px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ========================================
     ACTIVITY DATA
     ======================================== */

  const baseResponses = [
    {
      id: "name",
      italian: "Mi chiamo Volo.",
      english: "My name is Volo.",
      image:
        "images/introductions/introductions-02.png"
    },

    {
      id: "place",
      italian: "Sono di Roma.",
      english: "I am from Rome.",
      image:
        "images/introductions/introductions-03.png"
    },

    {
      id: "age",
      italian: "",
      english: "",
      image:
        "images/introductions/introductions-04.png"
    },

    {
      id: "feeling",
      italian: "Sto bene, grazie.",
      english: "I am well, thank you.",
      image:
        "images/introductions/introductions-05.png"
    }
  ];

let selectedAge =
  Number(window.getVoloAge?.()) || null;

let currentQuestionIndex = 0;
let answerLocked = false;
  /* ========================================
     HELPER FUNCTIONS
     ======================================== */

  function getCurrentTopicKey() {
    if (
      typeof currentTopicKey !==
      "undefined"
    ) {
      return currentTopicKey;
    }

    return topicSelect.value;
  }

  function speak(text) {
    if (
      typeof speakItalian === "function"
    ) {
      speakItalian(text);
      return;
    }

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "it-IT";
      utterance.rate = 0.82;

      window.speechSynthesis.speak(
        utterance
      );
    }
  }

  function shuffleArray(items) {
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

  function getResponses() {
    return baseResponses.map(item => {
      if (item.id !== "age") {
        return { ...item };
      }

      return {
        ...item,
        italian:
          `Ho ${selectedAge} anni.`,
        english:
          `I am ${selectedAge} years old.`
      };
    });
  }

  function getQuestions() {
    return [
      {
        question:
          "Come ti chiami?",
        english:
          "What is your name?",
        correctId:
          "name",
        image:
          "images/introductions/introductions-02.png"
      },

      {
        question:
          "Di dove sei?",
        english:
          "Where are you from?",
        correctId:
          "place",
        image:
          "images/introductions/introductions-03.png"
      },

      {
        question:
          "Quanti anni hai?",
        english:
          "How old are you?",
        correctId:
          "age",
        image:
          "images/introductions/introductions-04.png"
      },

      {
        question:
          "Come stai?",
        english:
          "How are you?",
        correctId:
          "feeling",
        image:
          "images/introductions/introductions-05.png"
      }
    ];
  }

  function hideOtherActivityPanels() {
    const selectors = [
      "#learnActivity",
      "#matchActivity",
      "#listenActivity",
      "#chooseActivity",
      "#memoryActivity",
      "#wordsInActionActivity",
      "#assembleSentencesActivity",
      "#conversationPracticeActivity",
      "#completeActivity",
      "#writeActivity"
    ];

    selectors.forEach(selector => {
      const panel =
        document.querySelector(selector);

      if (panel) {
        panel.hidden = true;
      }
    });
  }

  function activateIntroductionsButton() {
    document
      .querySelectorAll(
        ".activity-button"
      )
      .forEach(button => {
        button.classList.remove("active");
      });

    introductionsButton.classList.add(
      "active"
    );
  }

  /* ========================================
     AGE SETUP SCREEN
     ======================================== */

  function renderAgeScreen() {
    introductionsActivity.innerHTML = `
      <div class="introductions-card">

        <div class="introductions-heading">
          <h4>
            👋 Presentiamoci!
          </h4>

          <p>
            Let's introduce ourselves!
          </p>
        </div>

        <img
          src="images/introductions/introductions-04.png"
          alt="Volo with a birthday cake"
          class="introductions-complete-image"
        >

        <form
          id="introductionsAgeForm"
          class="introductions-age-form"
        >

          <label
            for="introductionsAgeInput"
            class="introductions-age-label"
          >
            Quanti anni vuoi che abbia Volo?

            <span>
              How old do you want Volo to be?
            </span>
          </label>

          <input
            id="introductionsAgeInput"
            class="introductions-age-input"
            type="number"
            min="1"
            max="99"
            inputmode="numeric"
            autocomplete="off"
            required
          >

          <button
            type="submit"
            class="introductions-primary-button"
          >
            Cominciamo! · Let's Begin!
          </button>

          <p
            id="introductionsAgeFeedback"
            class="introductions-age-feedback"
            aria-live="polite"
          ></p>

        </form>

      </div>
    `;

    const form =
      introductionsActivity.querySelector(
        "#introductionsAgeForm"
      );

    const input =
      introductionsActivity.querySelector(
        "#introductionsAgeInput"
      );

    const feedback =
      introductionsActivity.querySelector(
        "#introductionsAgeFeedback"
      );

    form.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        const age =
          Number.parseInt(
            input.value,
            10
          );

        if (
          !Number.isInteger(age) ||
          age < 1 ||
          age > 99
        ) {
          feedback.textContent =
            "Inserisci un numero da 1 a 99. · Enter a number from 1 to 99.";

          input.focus();

          return;
        }

        selectedAge = age;
        currentQuestionIndex = 0;
        answerLocked = false;

        renderQuestion();
      }
    );

    window.setTimeout(() => {
      input.focus();
    }, 50);
  }

  /* ========================================
     QUESTION SCREEN
     ======================================== */

  function renderQuestion() {
    const questions =
      getQuestions();

    const responses =
      getResponses();

    const currentQuestion =
      questions[currentQuestionIndex];

    const shuffledResponses =
      shuffleArray(responses);

    answerLocked = false;

    introductionsActivity.innerHTML = `
      <div class="introductions-card">

        <div class="introductions-heading">
          <h4>
            Presentiamoci!
          </h4>

          <p>
  Scegli la risposta di Volo. · Choose Volo's response.
</p>
        </div>

        <p class="introductions-progress">
          Domanda ${currentQuestionIndex + 1}
          di ${questions.length}
        </p>

        <img
          src="${currentQuestion.image}"
          alt=""
          class="introductions-question-image"
        >

        <h4 class="introductions-question">
          ${currentQuestion.question}
        </h4>

        <p class="introductions-question-english">
          ${currentQuestion.english}
        </p>

        <button
          type="button"
          id="listenToIntroductionQuestion"
          class="introductions-question-audio"
        >
          🔊 Ascolta la domanda
        </button>

        <div class="introductions-choices">

          ${shuffledResponses.map(
            response => `
              <button
                type="button"
                class="introductions-choice"
                data-response-id="${response.id}"
              >

                <img
                  src="${response.image}"
                  alt=""
                >

                <span
                  class="introductions-choice-text"
                >
                  <span
                    class="introductions-choice-italian"
                  >
                    ${response.italian}
                  </span>

                  <span
                    class="introductions-choice-english"
                  >
                    ${response.english}
                  </span>
                </span>

              </button>
            `
          ).join("")}

        </div>

        <p
          id="introductionsFeedback"
          class="introductions-feedback"
          aria-live="polite"
        ></p>

        <button
          type="button"
          id="introductionsNextButton"
          class="
            introductions-primary-button
            introductions-next-button
          "
          hidden
        >
          Avanti · Next
        </button>

      </div>
    `;

    const listenButton =
      introductionsActivity.querySelector(
        "#listenToIntroductionQuestion"
      );

    const choiceButtons =
      introductionsActivity.querySelectorAll(
        ".introductions-choice"
      );

    const feedback =
      introductionsActivity.querySelector(
        "#introductionsFeedback"
      );

    const nextButton =
      introductionsActivity.querySelector(
        "#introductionsNextButton"
      );

    listenButton.addEventListener(
      "click",
      () => {
        speak(currentQuestion.question);
      }
    );

    choiceButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          if (answerLocked) {
            return;
          }

          const selectedId =
            button.dataset.responseId;

          const selectedResponse =
            responses.find(
              response =>
                response.id === selectedId
            );

          speak(
            selectedResponse.italian
          );

          if (
            selectedId ===
            currentQuestion.correctId
          ) {
            answerLocked = true;

            button.classList.add(
              "correct"
            );

            feedback.textContent =
              "Bravissimo!";

            feedback.className =
              "introductions-feedback correct";

            choiceButtons.forEach(
              choiceButton => {
                choiceButton.disabled = true;
              }
            );

            nextButton.hidden = false;
          } else {
            button.classList.add(
              "incorrect"
            );

            feedback.textContent =
              "Riprova! · Try again!";

            feedback.className =
              "introductions-feedback incorrect";

            button.disabled = true;
          }
        }
      );
    });

    nextButton.addEventListener(
      "click",
      () => {
        currentQuestionIndex += 1;

        if (
          currentQuestionIndex >=
          questions.length
        ) {
          renderCompletionScreen();
          return;
        }

        renderQuestion();
      }
    );

    speak(currentQuestion.question);
  }

  /* ========================================
     COMPLETION SCREEN
     ======================================== */

  function renderCompletionScreen() {
    const responses =
      getResponses();

    const completeIntroduction = [
      "Ciao!",
      ...responses.map(
        response => response.italian
      )
    ].join(" ");

    const sequence = [
      {
        italian: "Ciao!",
        image:
          "images/introductions/introductions-01.png"
      },
      ...responses
    ];

    introductionsActivity.innerHTML = `
      <div class="introductions-card">

        <div class="introductions-heading">
          <h4>
            🎉 Bravissimo!
          </h4>

          <p>
            You completed Volo's introduction!
          </p>
        </div>

        <div class="introductions-full-sentence">
          ${completeIntroduction}
        </div>

        <div class="introductions-sequence">

          ${sequence.map(
            item => `
              <div
                class="introductions-sequence-card"
              >
                <img
                  src="${item.image}"
                  alt=""
                >

                <p>
                  ${item.italian}
                </p>
              </div>
            `
          ).join("")}

        </div>

        <div class="introductions-actions">

          <button
            type="button"
            id="listenToFullIntroduction"
            class="introductions-primary-button"
          >
            🔊 Ascolta tutto
          </button>

          <button
            type="button"
            id="playIntroductionsAgain"
            class="introductions-secondary-button"
          >
            Gioca ancora · Play Again
          </button>

          <button
            type="button"
            id="changeVoloAge"
            class="introductions-secondary-button"
          >
            Cambia l'età · Change Age
          </button>

        </div>

      </div>
    `;

    introductionsActivity
      .querySelector(
        "#listenToFullIntroduction"
      )
      .addEventListener(
        "click",
        () => {
          speak(completeIntroduction);
        }
      );

    introductionsActivity
      .querySelector(
        "#playIntroductionsAgain"
      )
      .addEventListener(
        "click",
        () => {
          currentQuestionIndex = 0;
          answerLocked = false;

          renderQuestion();
        }
      );

    introductionsActivity
      .querySelector(
        "#changeVoloAge"
      )
      .addEventListener(
        "click",
        () => {
    introductionsActivity.hidden = true;

introductionsButton.classList.remove(
  "active"
);

window.requestVoloAgeChange?.();
        }
      );

    speak(completeIntroduction);
  }

  /* ========================================
     SHOW ACTIVITY
     ======================================== */

  function showIntroductionsActivity() {
    if (
      getCurrentTopicKey() !==
      "greetings"
    ) {
      return;
    }

    hideOtherActivityPanels();

    introductionsActivity.hidden = false;

    activateIntroductionsButton();

    if (englishToggleControl) {
      englishToggleControl.hidden = true;
    }

selectedAge =
  Number(window.getVoloAge?.()) || null;

if (selectedAge === null) {
  window.requestVoloAgeChange?.();
  return;
}

currentQuestionIndex = 0;
answerLocked = false;

renderQuestion();
  }

  /* ========================================
     TOPIC AVAILABILITY
     ======================================== */

  function updateIntroductionsAvailability() {
    const isGreetingsTopic =
      getCurrentTopicKey() === "greetings";

    introductionsButton.hidden =
      !isGreetingsTopic;

   if (isGreetingsTopic) {
  selectedAge =
    Number(window.getVoloAge?.()) || null;

  introductionsButton.disabled =
    selectedAge === null;
} else {
      introductionsActivity.hidden = true;

      introductionsButton.classList.remove(
        "active"
      );
    }
  }

  introductionsButton.addEventListener(
    "click",
    showIntroductionsActivity
  );

  activityMenu.addEventListener(
    "click",
    event => {
      const clickedButton =
        event.target.closest(
          ".activity-button"
        );

      if (
        clickedButton &&
        clickedButton !==
          introductionsButton
      ) {
        introductionsActivity.hidden = true;

        introductionsButton.classList.remove(
          "active"
        );
      }
    }
  );

  topicSelect.addEventListener(
    "change",
    () => {
      window.setTimeout(
        updateIntroductionsAvailability,
        0
      );
    }
  );
document.addEventListener(
  "voloagechange",
  event => {
    const newAge =
      Number(event.detail?.age);

    selectedAge =
      Number.isInteger(newAge)
        ? newAge
        : null;

    if (
      getCurrentTopicKey() ===
      "greetings"
    ) {
      introductionsButton.disabled =
        selectedAge === null;
    }
  }
);
  updateIntroductionsAvailability();
})();