"use strict";

(function initializeTimeInstruction() {
  const topicSelect = document.querySelector("#topicSelect");
  const learnButton = document.querySelector('[data-mode="learn"]');
  const learnActivity = document.querySelector("#learnActivity");
  const learnInstructions = document.querySelector("#learnInstructions");

  if (!topicSelect || !learnButton || !learnActivity) {
    console.error("L’ora instruction could not start.");
    return;
  }

  function isTimeTopic() {
    return (
      typeof currentTopicKey !== "undefined" &&
      currentTopicKey === "time"
    );
  }

  function timeVocabulary() {
    if (typeof time === "undefined" || !Array.isArray(time)) {
      return [];
    }
    return time;
  }

  function findTime(italian) {
    return timeVocabulary().find(item => item.italian === italian) || null;
  }

  function speak(text) {
    if (typeof speakItalian === "function") {
      speakItalian(text);
      return;
    }

    if (
      window.PrimoVoloAudio &&
      typeof window.PrimoVoloAudio.speak === "function"
    ) {
      window.PrimoVoloAudio.speak(text);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "it-IT";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }

  const steps = [
    {
      id: "hour",
      tab: "1 · L’ora",
      title: "Che ore sono?",
      english: "What time is it?",
      teaching: `
        <div class="time-hour-branch">
          <div class="time-hour-branch-lines" aria-hidden="true">
            <span class="time-branch-stem"></span>
            <span class="time-branch-left"></span>
            <span class="time-branch-right"></span>
          </div>

          <div class="time-hour-branch-row">
            <div class="time-hour-branch-case">
              <div class="time-hour-branch-images single">
                <img
                  src="images/time/time-01.png"
                  alt="1:00"
                  class="time-hour-branch-image"
                >
              </div>
              <div class="time-hour-branch-label">È l’una.</div>
            </div>

            <div class="time-hour-branch-case">
              <div class="time-hour-branch-tag">
                Tutte le altre ore · All other hours
              </div>
              <div class="time-hour-branch-images">
                <img
                  src="images/time/time-17.png"
                  alt="3:00"
                  class="time-hour-branch-image"
                >
                <img
                  src="images/time/time-14.png"
                  alt="6:00"
                  class="time-hour-branch-image"
                >
                <img
                  src="images/time/time-11.png"
                  alt="10:00"
                  class="time-hour-branch-image"
                >
              </div>
              <div class="time-hour-branch-label">Sono le + numero.</div>
            </div>
          </div>
        </div>
        <p class="time-teaching-note">
          L’una è speciale. Per le altre ore usa <strong>Sono le</strong>.
          <span class="time-learn-english" lang="en">
            One o’clock is special. For the other hours, use <strong>Sono le</strong>.
          </span>
        </p>
      `,
      models: [],
      challengePool: [
        { phrase: "È l'una.", correct: "È l’una", choices: ["È l’una", "Sono le"] },
        { phrase: "Sono le tre.", correct: "Sono le", choices: ["È l’una", "Sono le"] },
        { phrase: "Sono le sei.", correct: "Sono le", choices: ["È l’una", "Sono le"] }
      ],
      question: "Quale inizio serve?",
      questionEnglish: "Which beginning do you need?"
    },
    {
      id: "quarter",
      tab: "2 · :15",
      title: "E un quarto",
      english: "Quarter past",
      teaching: `
        <div class="time-pattern-line">
          <span class="time-pattern-number">:15</span>
          <span class="time-pattern-arrow">→</span>
          <strong>e un quarto</strong>
        </div>
        <p class="time-teaching-note">
          Dopo l’ora, aggiungi <strong>e un quarto</strong>.
          <span class="time-learn-english" lang="en">
            After the hour, add <strong>e un quarto</strong>.
          </span>
        </p>
      `,
      models: [
        "È l'una e un quarto.",
        "Sono le due e un quarto.",
        "Sono le otto e un quarto."
      ],
      challengePool: [
        { phrase: "È l'una e un quarto.", correct: "e un quarto", choices: ["e un quarto", "e mezza", "meno un quarto"] },
        { phrase: "Sono le due e un quarto.", correct: "e un quarto", choices: ["e mezza", "meno un quarto", "e un quarto"] }
      ],
      question: "Come finisce questa ora?",
      questionEnglish: "How does this time end?"
    },
    {
      id: "half",
      tab: "3 · :30",
      title: "E mezza",
      english: "Half past",
      teaching: `
        <div class="time-pattern-line">
          <span class="time-pattern-number">:30</span>
          <span class="time-pattern-arrow">→</span>
          <strong>e mezza</strong>
        </div>
        <p class="time-teaching-note">
          Per trenta minuti dopo l’ora, usa <strong>e mezza</strong>.
          <span class="time-learn-english" lang="en">
            For thirty minutes after the hour, use <strong>e mezza</strong>.
          </span>
        </p>
      `,
      models: [
        "È l'una e mezza.",
        "Sono le nove e mezza.",
        "Sono le cinque e mezza."
      ],
      challengePool: [
        { phrase: "Sono le nove e mezza.", correct: "e mezza", choices: ["e un quarto", "e mezza", "meno un quarto"] },
        { phrase: "Sono le cinque e mezza.", correct: "e mezza", choices: ["e mezza", "meno un quarto", "e un quarto"] }
      ],
      question: "Come finisce questa ora?",
      questionEnglish: "How does this time end?"
    },
    {
      id: "minus",
      tab: "4 · :45",
      title: "Meno un quarto",
      english: "Quarter to",
      teaching: `
        <div class="time-pattern-line">
          <span class="time-pattern-number">:45</span>
          <span class="time-pattern-arrow">→</span>
          <strong>guarda l’ora successiva</strong>
        </div>

        <div class="time-quarter-to-example">
          <span>7:45</span>
          <span class="time-pattern-arrow">→</span>
          <span>8</span>
          <span class="time-pattern-arrow">→</span>
          <strong>Sono le otto meno un quarto.</strong>
        </div>

        <p class="time-teaching-note">
          Prima trova l’ora che viene dopo. Poi usa <strong>meno un quarto</strong>.
          <span class="time-learn-english" lang="en">
            First find the next hour. Then use <strong>meno un quarto</strong>.
          </span>
        </p>
      `,
      models: [
        "Sono le due meno un quarto.",
        "Sono le otto meno un quarto.",
        "È l'una meno un quarto."
      ],
      challengePool: [
        { phrase: "Sono le otto meno un quarto.", correct: "otto", choices: ["sette", "otto", "nove"] },
        { phrase: "Sono le cinque meno un quarto.", correct: "cinque", choices: ["quattro", "cinque", "sei"] },
        { phrase: "È l'una meno un quarto.", correct: "l’una", choices: ["dodici", "l’una", "due"] }
      ],
      question: "Quale ora serve?",
      questionEnglish: "Which hour do you need?"
    },
    {
      id: "at",
      tab: "5 · A che ora?",
      title: "A che ora?",
      english: "At what time?",
      teaching: `
        <div class="time-bridge-grid">
          <article>
            <span>Che ore sono?</span>
            <strong>È l’una.</strong>
            <em>→ all’una</em>
          </article>
          <article>
            <span>Che ore sono?</span>
            <strong>Sono le tre.</strong>
            <em>→ alle tre</em>
          </article>
        </div>
        <p class="time-teaching-note">
          Per dire <strong>a che ora</strong> fai qualcosa: <strong>all’una</strong>, ma <strong>alle + ora</strong> per le altre ore.
          <span class="time-learn-english" lang="en">
            To say <strong>at what time</strong> you do something: use <strong>all’una</strong>, but <strong>alle + hour</strong> for the other hours.
          </span>
        </p>
      `,
      models: [],
      challengePool: [
        { phrase: "È l'una.", correct: "all’una", choices: ["all’una", "alle una", "È l’una"] },
        { phrase: "Sono le tre.", correct: "alle tre", choices: ["Sono le tre", "all’una", "alle tre"] },
        { phrase: "Sono le sei.", correct: "alle sei", choices: ["alle sei", "Sono le sei", "all’una"] }
      ],
      question: "A che ora?",
      questionEnglish: "At what time?"
    }
  ];

  let currentStepIndex = 0;
  let challengeIndex = 0;

  function injectStyles() {
    if (document.querySelector("#timeInstructionStyles")) return;

    const style = document.createElement("style");
    style.id = "timeInstructionStyles";
    style.textContent = `
      .time-instruction {
        width: min(980px, 100%);
        margin: 0 auto;
      }
      .time-step-tabs {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin: 0 0 18px;
      }
      .time-step-tab {
        min-height: 40px;
        padding: 8px 12px;
        border: 1px solid #d9e2ef;
        border-radius: 999px;
        color: #274b84;
        background: white;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }
      .time-step-tab.active {
        border-color: #4774b8;
        background: #edf4ff;
      }
      .time-lesson-card {
        padding: clamp(18px, 3vw, 30px);
        border: 1px solid #d9e2ef;
        border-radius: 24px;
        background: white;
        box-shadow: 0 10px 28px rgba(36,57,87,.10);
      }
      .time-lesson-heading {
        text-align: center;
      }
      .time-lesson-heading h4 {
        margin: 0;
        color: #274b84;
        font-size: clamp(1.5rem, 4vw, 2.15rem);
      }
      .time-lesson-heading p {
        margin: 5px 0 0;
        color: #66758d;
        font-weight: 700;
      }
      .time-teaching {
        max-width: 760px;
        margin: 20px auto;
      }
      .time-hour-branch {
        position: relative;
        padding: 20px 12px 8px;
      }
      .time-hour-branch-lines {
        position: relative;
        height: 70px;
        margin: 0 auto 6px;
        max-width: 720px;
      }
      .time-branch-stem,
      .time-branch-left,
      .time-branch-right {
        position: absolute;
        display: block;
        background: #d9e2ef;
        border-radius: 999px;
      }
      .time-branch-stem {
        left: 50%;
        top: 0;
        width: 3px;
        height: 28px;
        transform: translateX(-50%);
      }
      .time-branch-left,
      .time-branch-right {
        top: 32px;
        width: 180px;
        height: 3px;
      }
      .time-branch-left {
        left: calc(50% - 178px);
        transform: rotate(-18deg);
        transform-origin: right center;
      }
      .time-branch-right {
        right: calc(50% - 178px);
        transform: rotate(18deg);
        transform-origin: left center;
      }
      .time-hour-branch-row {
        display: grid;
        grid-template-columns: 0.9fr 1.1fr;
        gap: 20px;
        align-items: end;
      }
      .time-hour-branch-case {
        text-align: center;
      }
      .time-hour-branch-tag {
        display: inline-block;
        margin-bottom: 12px;
        padding: 7px 14px;
        border-radius: 999px;
        background: #eef3fa;
        color: #5b6d88;
        font-size: 0.96rem;
        font-weight: 800;
      }
      .time-hour-branch-images {
        display: flex;
        justify-content: center;
        align-items: end;
        gap: 14px;
        flex-wrap: nowrap;
      }
      .time-hour-branch-images.single {
        justify-content: center;
      }
      .time-hour-branch-image {
        width: 120px;
        max-width: 100%;
        height: auto;
        display: block;
      }
      .time-hour-branch-label {
        display: inline-block;
        margin-top: 14px;
        padding: 10px 18px;
        border-radius: 14px;
        background: #f5f8fc;
        color: #274b84;
        font-size: 1.2rem;
        font-weight: 900;
      }

      .time-quarter-to-example {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin: 14px auto 4px;
        padding: 14px 18px;
        max-width: 620px;
        border-radius: 16px;
        background: #f5f8fc;
        color: #274b84;
        font-size: 1.08rem;
        font-weight: 850;
      }
      .time-quarter-to-example strong {
        color: #274b84;
      }

      .time-bridge-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .time-bridge-grid article {
        padding: 16px;
        border: 2px solid #d9e2ef;
        border-radius: 18px;
        text-align: center;
        background: #fbfcfe;
      }
      .time-bridge-grid span,
      .time-bridge-grid strong,
      .time-bridge-grid em {
        display: block;
      }
      .time-bridge-grid strong {
        margin-top: 5px;
        color: #274b84;
        font-size: 1.12rem;
        font-weight: 900;
      }
      .time-bridge-grid em {
        display: block;
      }
      .time-rule-card strong {
        color: #d46c5c;
        font-size: 1.2rem;
      }
      .time-rule-card span,
      .time-bridge-grid strong {
        margin-top: 5px;
        color: #274b84;
        font-size: 1.12rem;
        font-weight: 900;
      }
      .time-bridge-grid em {
        margin-top: 7px;
        color: #337a4d;
        font-size: 1.12rem;
        font-style: normal;
        font-weight: 900;
      }
      .time-pattern-line {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px;
        border-radius: 18px;
        background: #f5f8fc;
        color: #274b84;
      }
      .time-pattern-number {
        font-size: 1.4rem;
        font-weight: 950;
      }
      .time-pattern-arrow {
        color: #d46c5c;
        font-size: 1.4rem;
        font-weight: 950;
      }
      .time-pattern-line strong {
        font-size: 1.16rem;
      }
      .time-teaching-note {
        margin: 13px 0 0;
        color: #4f5f72;
        line-height: 1.55;
        text-align: center;
      }
      .time-learn-english {
        display: block;
        margin-top: 4px;
        color: #7a8797;
        font-size: .9rem;
      }
      body.hide-english .time-learn-english {
        display: none;
      }
      .time-model-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin: 22px 0;
      }
      .time-model-card {
        padding: 10px;
        border: 1px solid #d9e2ef;
        border-radius: 18px;
        background: #fff;
        text-align: center;
      }
      .time-model-card img {
        display: block;
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: contain;
        border-radius: 12px;
        background: white;
      }
      .time-model-card strong {
        display: block;
        margin-top: 8px;
        color: #274b84;
        font-size: .97rem;
      }
      .time-audio-button {
        margin-top: 7px;
        border: 0;
        background: transparent;
        color: #4774b8;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }
      .time-try-box {
        margin-top: 22px;
        padding: 18px;
        border-radius: 20px;
        background: #f8fbff;
        border: 1px solid #d9e2ef;
      }
      .time-try-box h5 {
        margin: 0;
        color: #274b84;
        font-size: 1.08rem;
        text-align: center;
      }
      .time-try-prompt {
        display: grid;
        grid-template-columns: minmax(130px, 220px) 1fr;
        gap: 18px;
        align-items: center;
        margin-top: 15px;
      }
      .time-try-prompt img {
        display: block;
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: contain;
        border-radius: 16px;
        background: white;
      }
      .time-choice-grid {
        display: grid;
        gap: 9px;
      }
      .time-choice {
        min-height: 48px;
        padding: 9px 12px;
        border: 2px solid #d9e2ef;
        border-radius: 14px;
        color: #274b84;
        background: white;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }
      .time-choice.correct {
        border-color: #3f8f5b;
        background: #eef9f1;
      }
      .time-choice.incorrect {
        border-color: #bc5145;
        background: #fff1ef;
      }
      .time-feedback {
        min-height: 28px;
        margin: 12px 0 0;
        color: #337a4d;
        font-weight: 900;
        text-align: center;
      }
      .time-step-actions {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 22px;
      }
      .time-step-button {
        min-height: 44px;
        padding: 9px 15px;
        border: 1px solid #d9e2ef;
        border-radius: 999px;
        color: #274b84;
        background: white;
        font: inherit;
        font-weight: 850;
        cursor: pointer;
      }
      .time-step-button.primary {
        border-color: #4774b8;
        background: #4774b8;
        color: white;
      }
      .time-step-button:disabled {
        opacity: .35;
        cursor: default;
      }
      @media (max-width: 650px) {
        .time-bridge-grid,
        .time-try-prompt,
        .time-hour-branch-row {
          grid-template-columns: 1fr;
        }
        .time-hour-branch-lines {
          height: 32px;
          max-width: none;
        }
        .time-branch-left,
        .time-branch-right {
          display: none;
        }
        .time-branch-stem {
          height: 24px;
        }
        .time-hour-branch-tag {
          margin-top: 8px;
        }
        .time-hour-branch-images {
          flex-wrap: wrap;
        }
        .time-hour-branch-image {
          width: 100px;
        }
        .time-try-prompt img {
          width: min(220px, 80%);
          margin: 0 auto;
        }
        .time-step-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function modelCards(step) {
    return step.models
      .map(findTime)
      .filter(Boolean)
      .map(item => `
        <article class="time-model-card">
          <img src="${item.image}" alt="${item.english}">
          <strong>${item.italian}</strong>
          <button type="button" class="time-audio-button" data-speak="${item.italian}">
            🔊 Ascolta
          </button>
        </article>
      `)
      .join("");
  }

  function currentChallenge(step) {
    const challenge = step.challengePool[
      challengeIndex % step.challengePool.length
    ];
    const item = findTime(challenge.phrase);
    return { challenge, item };
  }

  function renderTimeInstruction() {
    if (!isTimeTopic()) return;

    injectStyles();

    const step = steps[currentStepIndex];
    challengeIndex = challengeIndex % step.challengePool.length;
    const { challenge, item } = currentChallenge(step);

    learnButton.classList.add("active");
    learnActivity.hidden = false;

    if (learnInstructions) {
      learnInstructions.innerHTML = `
        Scopri come si costruisce l’ora, poi prova ogni passaggio.
        <span lang="en">Learn how Italian time is built, then try each step.</span>
      `;
    }

    learnActivity.innerHTML = `
      <div class="time-instruction">
        <nav class="time-step-tabs" aria-label="Passaggi per imparare l’ora">
          ${steps.map((item, index) => `
            <button
              type="button"
              class="time-step-tab ${index === currentStepIndex ? "active" : ""}"
              data-time-step="${index}"
            >${item.tab}</button>
          `).join("")}
        </nav>

        <section class="time-lesson-card">
          <header class="time-lesson-heading">
            <h4>${step.title}</h4>
            <p class="time-learn-english" lang="en">${step.english}</p>
          </header>

          <div class="time-teaching">${step.teaching}</div>

          <div class="time-model-grid">
            ${modelCards(step)}
          </div>

          ${item ? `
            <section class="time-try-box">
              <h5>
                Prova · ${step.question}
                <span class="time-learn-english" lang="en">${step.questionEnglish}</span>
              </h5>
              <div class="time-try-prompt">
                <img src="${item.image}" alt="${item.english}">
                <div class="time-choice-grid">
                  ${challenge.choices.map(choice => `
                    <button
                      type="button"
                      class="time-choice"
                      data-answer="${choice}"
                    >${choice}</button>
                  `).join("")}
                </div>
              </div>
              <p class="time-feedback" aria-live="polite"></p>
            </section>
          ` : ""}

          <div class="time-step-actions">
            <button
              type="button"
              class="time-step-button"
              data-time-action="previous"
              ${currentStepIndex === 0 ? "disabled" : ""}
            >← Prima · Previous</button>

            <button
              type="button"
              class="time-step-button primary"
              data-time-action="next"
              ${currentStepIndex === steps.length - 1 ? "disabled" : ""}
            >Avanti · Next →</button>
          </div>
        </section>
      </div>
    `;

    learnActivity.querySelectorAll("[data-speak]").forEach(button => {
      button.addEventListener("click", () => speak(button.dataset.speak));
    });

    learnActivity.querySelectorAll("[data-time-step]").forEach(button => {
      button.addEventListener("click", () => {
        currentStepIndex = Number(button.dataset.timeStep);
        challengeIndex = 0;
        renderTimeInstruction();
      });
    });

    learnActivity.querySelectorAll("[data-time-action]").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.timeAction === "previous") {
          currentStepIndex = Math.max(0, currentStepIndex - 1);
        } else {
          currentStepIndex = Math.min(steps.length - 1, currentStepIndex + 1);
        }
        challengeIndex = 0;
        renderTimeInstruction();
      });
    });

    const feedback = learnActivity.querySelector(".time-feedback");
    const choiceButtons = learnActivity.querySelectorAll(".time-choice");

    choiceButtons.forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.answer === challenge.correct) {
          button.classList.add("correct");
          feedback.textContent = "✓ Esatto!";
          choiceButtons.forEach(choice => { choice.disabled = true; });
          speak(item.italian);

          window.setTimeout(() => {
            challengeIndex += 1;
            renderTimeInstruction();
          }, 900);
        } else {
          button.classList.add("incorrect");
          feedback.textContent = "Riprova.";
        }
      });
    });
  }

  learnButton.addEventListener("click", () => {
    if (!isTimeTopic()) return;
    window.setTimeout(renderTimeInstruction, 0);
  });

  topicSelect.addEventListener("change", () => {
    if (!isTimeTopic()) {
      currentStepIndex = 0;
      challengeIndex = 0;
      return;
    }
    window.setTimeout(renderTimeInstruction, 0);
  });

  if (isTimeTopic()) {
    window.setTimeout(renderTimeInstruction, 0);
  }
})();
