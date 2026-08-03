"use strict";
const genderChoice =
  document.querySelector("#genderChoice");

const genderChoiceButtons =
  document.querySelectorAll(
    ".gender-choice-button"
  );
const learnActivity =

  document.querySelector("#learnActivity");

 

const vocabularyGrid =

  document.querySelector("#vocabularyGrid");

 

const chooseActivity =

  document.querySelector("#chooseActivity");

 

const writeActivity =

  document.querySelector("#writeActivity");

const matchActivity =

  document.querySelector("#matchActivity");

 

const listenActivity =

  document.querySelector("#listenActivity");

 

const completeActivity =

  document.querySelector("#completeActivity");

 

const memoryActivity =

  document.querySelector("#memoryActivity");
const conversationActivity =
  document.querySelector("#conversationActivity");
  
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
const voloAgeSetup =
  document.querySelector("#voloAgeSetup");

const voloAgeForm =
  document.querySelector("#voloAgeForm");

const voloAgeInput =
  document.querySelector("#voloAgeInput");

const voloAgeFeedback =
  document.querySelector("#voloAgeFeedback");

const voloAgeSaved =
  document.querySelector("#voloAgeSaved");

const voloAgeNumber =
  document.querySelector("#voloAgeNumber");

const changeVoloAgeButton =
  document.querySelector(
    "#changeVoloAgeButton"
  );
 

const aboutButton =

  document.querySelector("#aboutButton");

 

const aboutModal =

  document.querySelector("#aboutModal");

 

const aboutClose =

  document.querySelector("#aboutClose");

 

const referenceButton =

  document.querySelector("#referenceButton");

 

const referenceModal =

  document.querySelector("#referenceModal");

 

const referenceClose =

  document.querySelector("#referenceClose");

 

/* ========================================

   PROGRESS TRACKING

   ======================================== */

 

const PROGRESS_STORAGE_KEY =

  "primoVoloActivityCenterProgress";

 

const emptyProgressData = {

  attempts: 0,

  correct: 0,

  byTopic: {},

  byActivity: {},

  sessions: []

};

 

function cloneEmptyProgress() {

  return {

    attempts: 0,

    correct: 0,

    byTopic: {},

    byActivity: {},

    sessions: []

  };

}

 

function loadProgressData() {

  try {

    const saved = window.localStorage.getItem(

      PROGRESS_STORAGE_KEY

    );

 

    if (!saved) {

      return cloneEmptyProgress();

    }

 

    const parsed = JSON.parse(saved);

 

    return {

      attempts: Number(parsed.attempts) || 0,

      correct: Number(parsed.correct) || 0,

      byTopic: parsed.byTopic || {},

      byActivity: parsed.byActivity || {},

      sessions: Array.isArray(parsed.sessions)

        ? parsed.sessions

        : []

    };

  } catch (error) {

    console.warn(

      "Progress data could not be loaded.",

      error

    );

 

    return cloneEmptyProgress();

  }

}

 

let progressData = loadProgressData();

 

function saveProgressData() {

  try {

    window.localStorage.setItem(

      PROGRESS_STORAGE_KEY,

      JSON.stringify(progressData)

    );

  } catch (error) {

    console.warn(

      "Progress data could not be saved.",

      error

    );

  }

}

 

function calculateAccuracy(correct, attempts) {

  if (!attempts) {

    return 0;

  }

 

  return Math.round((correct / attempts) * 100);

}

 

function ensureProgressGroup(collection, key) {

  if (!collection[key]) {

    collection[key] = {

      attempts: 0,

      correct: 0

    };

  }

 

  return collection[key];

}

 

function recordAttempt(activity, isCorrect) {

  progressData.attempts += 1;

 

  if (isCorrect) {

    progressData.correct += 1;

  }

 

  const activityData = ensureProgressGroup(

    progressData.byActivity,

    activity

  );

 

  activityData.attempts += 1;

 

  if (isCorrect) {

    activityData.correct += 1;

  }

 

  const topicData = ensureProgressGroup(

    progressData.byTopic,

    currentTopicKey

  );

 

  topicData.attempts += 1;

 

  if (isCorrect) {

    topicData.correct += 1;

  }

 

  progressData.sessions.push({

    date: new Date().toISOString(),

    topic: currentTopicKey,

    activity,

    correct: Boolean(isCorrect)

  });

 

  if (progressData.sessions.length > 500) {

    progressData.sessions =

      progressData.sessions.slice(-500);

  }

 

  saveProgressData();

  updateProgressBadge();

}

 

const activityLabels = {

  "match-word": "Abbina · Match",

  "match-sound": "Ascolta · Listen",

  choose: "Scegli · Choose",

  complete: "Completa · Complete",

  write: "Scrivi · Write",

  memory: "Memoria · Memory"

};

 

function createProgressInterface() {

  const header = document.querySelector(

    ".site-header"

  );

 

  if (!header || document.querySelector(

    "#progressButton"

  )) {

    return;

  }

 

  const progressButton =

    document.createElement("button");

 

  progressButton.type = "button";

  progressButton.id = "progressButton";

  progressButton.className = "header-link";

  progressButton.setAttribute(

    "aria-haspopup",

    "dialog"

  );

  progressButton.setAttribute(

    "aria-controls",

    "progressModal"

  );

  progressButton.innerHTML = `

    📊 Progress

    <span

      id="progressBadge"

      class="progress-badge"

      aria-label="Saved attempts"

    >0</span>

  `;

 

  const referenceButtonElement =

    document.querySelector(

      "#referenceButton"

    );

 

  if (referenceButtonElement) {

    referenceButtonElement.insertAdjacentElement(

      "afterend",

      progressButton

    );

  } else {

    header.appendChild(progressButton);

  }

 

  const modal = document.createElement("div");

 

  modal.id = "progressModal";

  modal.className = "progress-modal";

  modal.hidden = true;

  modal.setAttribute("role", "dialog");

  modal.setAttribute("aria-modal", "true");

  modal.setAttribute(

    "aria-labelledby",

    "progressTitle"

  );

 

  modal.innerHTML = `

    <div class="progress-card">

      <button

        type="button"

        id="progressClose"

        class="progress-close"

        aria-label="Close progress report"

      >×</button>

 

      <div id="progressPrintable">

        <h2 id="progressTitle">

          📊 Progress Report

        </h2>

 

        <p class="progress-subtitle">

          Rapporto dei progressi ·

          Student Progress

        </p>

 

        <div

          id="progressSummary"

          class="progress-summary"

        ></div>

 

        <div

          id="progressActivityTable"

          class="progress-table-wrap"

        ></div>

 
<div
  id="progressTopicTable"
  class="progress-table-wrap"
></div>

<div
  id="progressAttemptTable"
  class="progress-table-wrap"
></div>

<p class="progress-note">

          Saved only in this browser on

          this device.

        </p>

      </div>

 

      <div class="progress-actions">

        <button

          type="button"

          id="progressPrint"

          class="progress-action-button"

        >🖨️ Print Report</button>

 

        <button

          type="button"

          id="progressClear"

          class="progress-action-button danger"

        >🗑️ Clear Saved Data</button>

      </div>

    </div>

  `;

 

  document.body.appendChild(modal);

 

  const style = document.createElement("style");

 

  style.textContent = `

    .progress-badge {

      display: inline-grid;

      place-items: center;

      min-width: 24px;

      height: 24px;

      margin-left: 6px;

      padding: 0 6px;

      border-radius: 999px;

      color: white;

      background: #d46c5c;

      font-size: 0.78rem;

      font-weight: 900;

    }

 

    .progress-modal {

      position: fixed;

      inset: 0;

      z-index: 1700;

      display: grid;

      place-items: center;

      padding: 24px;

      background: rgba(20, 32, 48, 0.72);

    }

 

    .progress-modal[hidden] {

      display: none;

    }

 

    .progress-card {

      position: relative;

      width: min(880px, 95vw);

      max-height: 92vh;

      overflow-y: auto;

      padding: 30px;

      border-radius: 22px;

      background: white;

      box-shadow: 0 18px 55px rgba(0,0,0,.3);

    }

 

    .progress-card h2 {

      margin: 0 48px 4px;

      color: #274b84;

      text-align: center;

    }

 

    .progress-subtitle,

    .progress-note {

      color: #66758d;

      text-align: center;

    }

 

    .progress-close {

      position: absolute;

      top: 12px;

      right: 14px;

      width: 42px;

      height: 42px;

      border: 0;

      border-radius: 50%;

      color: #274b84;

      background: #eef3fa;

      font-size: 1.8rem;

      line-height: 1;

      cursor: pointer;

    }

 

    .progress-summary {

      display: grid;

      grid-template-columns:

        repeat(3, minmax(0, 1fr));

      gap: 14px;

      margin: 24px 0;

    }

 

    .progress-stat {

      padding: 18px;

      border: 1px solid #d9e2ef;

      border-radius: 16px;

      background: #fffaf3;

      text-align: center;

    }

 

    .progress-stat strong {

      display: block;

      color: #274b84;

      font-size: 1.7rem;

    }

 

    .progress-stat span {

      color: #66758d;

      font-weight: 700;

    }

 

    .progress-table-wrap {

      margin-top: 22px;

      overflow-x: auto;

    }

 

    .progress-table-wrap h3 {

      margin-bottom: 8px;

      color: #274b84;

    }

 

    .progress-table {

      width: 100%;

      border-collapse: collapse;

    }

 

    .progress-table th,

    .progress-table td {

      padding: 10px 12px;

      border-bottom: 1px solid #d9e2ef;

      text-align: left;

    }

 

    .progress-table th {

      color: #274b84;

      background: #f4f7fb;

    }

 

    .progress-actions {

      display: flex;

      justify-content: center;

      flex-wrap: wrap;

      gap: 12px;

      margin-top: 24px;

    }

 

    .progress-action-button {

      padding: 11px 18px;

      border: 1px solid #d9e2ef;

      border-radius: 999px;

      color: #274b84;

      background: white;

      font-weight: 800;

      cursor: pointer;

    }

 

    .progress-action-button.danger {

      color: #9e3f35;

    }

 

    @media (max-width: 620px) {

      .progress-summary {

        grid-template-columns: 1fr;

      }

 

      .progress-card {

        padding: 24px 16px;

      }

    }

 

    @media print {

      body * {

        visibility: hidden !important;

      }

 

      #progressPrintable,

      #progressPrintable * {

        visibility: visible !important;

      }

 

      #progressPrintable {

        position: absolute;

        inset: 0;

        width: 100%;

        padding: 24px;

        background: white;

      }

 

      .progress-note {

        display: none;

      }

    }

  `;

 

  document.head.appendChild(style);

 

  const closeButton = modal.querySelector(

    "#progressClose"

  );

  const printButton = modal.querySelector(

    "#progressPrint"

  );

  const clearButton = modal.querySelector(

    "#progressClear"

  );

 

  progressButton.addEventListener(

    "click",

    () => {

      renderProgressReport();

      modal.hidden = false;

      document.body.style.overflow =

        "hidden";

      closeButton.focus();

    }

  );

 

  function closeProgressModal() {

    modal.hidden = true;

    document.body.style.overflow = "";

    progressButton.focus();

  }

 

  closeButton.addEventListener(

    "click",

    closeProgressModal

  );

 

  modal.addEventListener(

    "click",

    event => {

      if (event.target === modal) {

        closeProgressModal();

      }

    }

  );

 

  printButton.addEventListener(

    "click",

    () => {

      renderProgressReport();

      window.print();

    }

  );

 

  clearButton.addEventListener(

    "click",

    () => {

      const confirmed = window.confirm(

        "Clear all saved progress data on this device?"

      );

 

      if (!confirmed) {

        return;

      }

 

      progressData = cloneEmptyProgress();

      saveProgressData();

      updateProgressBadge();

      renderProgressReport();

    }

  );

 

  document.addEventListener(

    "keydown",

    event => {

      if (

        event.key === "Escape" &&

        !modal.hidden

      ) {

        closeProgressModal();

      }

    }

  );

 

  updateProgressBadge();

}

 

function updateProgressBadge() {

  const badge = document.querySelector(

    "#progressBadge"

  );

 

  if (badge) {

    badge.textContent = progressData.attempts;

  }

}

 

function buildProgressRows(collection, labelLookup) {

  const entries = Object.entries(collection);

 

  if (!entries.length) {

    return `

      <tr>

        <td colspan="4">

          No saved attempts yet.

        </td>

      </tr>

    `;

  }

 

  return entries

    .sort((a, b) => a[0].localeCompare(b[0]))

    .map(([key, value]) => {

      const label = labelLookup[key] || key;

      const accuracy = calculateAccuracy(

        value.correct,

        value.attempts

      );

 

      return `

        <tr>

          <td>${label}</td>

          <td>${value.attempts}</td>

          <td>${value.correct}</td>

          <td>${accuracy}%</td>

        </tr>

      `;

    })

    .join("");

}

 function formatAttemptDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function buildAttemptHistoryRows() {
  if (!progressData.sessions.length) {
    return `
      <tr>
        <td colspan="5">
          No saved attempts yet.
        </td>
      </tr>
    `;
  }

  const topicLabels = Object.fromEntries(
    Object.entries(topics).map(
      ([key, topic]) => [
        key,
        `${topic.icon} ${topic.italian}`
      ]
    )
  );

  return [...progressData.sessions]
    .reverse()
    .map((attempt, index) => {
      const activity =
        activityLabels[attempt.activity] ||
        attempt.activity;

      const topic =
        topicLabels[attempt.topic] ||
        attempt.topic;

      const result = attempt.correct
        ? "✓ Correct"
        : "✗ Incorrect";

      return `
        <tr>
          <td>
            ${progressData.sessions.length - index}
          </td>
          <td>${formatAttemptDate(attempt.date)}</td>
          <td>${topic}</td>
          <td>${activity}</td>
          <td>${result}</td>
        </tr>
      `;
    })
    .join("");
}

function renderProgressReport() {
  const summary = document.querySelector(
    "#progressSummary"
  );

  const activityTable = document.querySelector(
    "#progressActivityTable"
  );

  const topicTable = document.querySelector(
    "#progressTopicTable"
  );

  const historyTable = document.querySelector(
    "#progressHistoryTable"
  );

  if (
    !summary ||
    !activityTable ||
    !topicTable
  ) {
    return;
  }

  const memoryData =
    progressData.byActivity.memory || {
      attempts: 0,
      correct: 0
    };

  const assessedAttempts =
    Math.max(
      0,
      progressData.attempts -
      memoryData.attempts
    );

  const assessedCorrect =
    Math.max(
      0,
      progressData.correct -
      memoryData.correct
    );

  const assessedAccuracy =
    calculateAccuracy(
      assessedCorrect,
      assessedAttempts
    );

  const memoryAccuracy =
    calculateAccuracy(
      memoryData.correct,
      memoryData.attempts
    );

  const assessedActivities =
    Object.fromEntries(
      Object.entries(
        progressData.byActivity
      ).filter(
        ([activity]) =>
          activity !== "memory"
      )
    );

  const topicTotalsWithoutMemory = {};

  progressData.sessions.forEach(session => {
    if (session.activity === "memory") {
      return;
    }

    const topicData =
      ensureProgressGroup(
        topicTotalsWithoutMemory,
        session.topic
      );

    topicData.attempts += 1;

    if (session.correct) {
      topicData.correct += 1;
    }
  });

  const topicLabels =
    Object.fromEntries(
      Object.entries(topics).map(
        ([key, topic]) => [
          key,
          `${topic.icon} ${topic.italian} · ${topic.english}`
        ]
      )
    );

  summary.innerHTML = `
    <div class="progress-stat">
      <strong>${assessedAttempts}</strong>
      <span>Scored Attempts</span>
    </div>

    <div class="progress-stat">
      <strong>${assessedCorrect}</strong>
      <span>Correct</span>
    </div>

    <div class="progress-stat">
      <strong>${assessedAccuracy}%</strong>
      <span>Overall Accuracy</span>
    </div>

    <div class="progress-stat">
      <strong>${memoryData.attempts}</strong>
      <span>Memoria Attempts</span>
    </div>

    <div class="progress-stat">
      <strong>${memoryAccuracy}%</strong>
      <span>Memoria Accuracy</span>
    </div>
  `;

  activityTable.innerHTML = `
    <h3>By Scored Activity</h3>

<p class="progress-note">
  Overall accuracy does not include
  Memoria because success in the memory
  game depends partly on chance.
</p>

    <table class="progress-table">
      <thead>
        <tr>
          <th>Activity</th>
          <th>Attempts</th>
          <th>Correct</th>
          <th>Accuracy</th>
        </tr>
      </thead>

      <tbody>
        ${buildProgressRows(
          assessedActivities,
          activityLabels
        )}
      </tbody>
    </table>

    <h3>Memoria</h3>

<p class="progress-note">
  Memoria results are shown separately
  and are not included in the overall
  percentage because performance depends
  partly on which cards are revealed.
</p>

    <table class="progress-table">
      <thead>
        <tr>
          <th>Activity</th>
          <th>Attempts</th>
          <th>Correct</th>
          <th>Accuracy</th>
        </tr>
      </thead>

      <tbody>
        ${
          memoryData.attempts
            ? `
              <tr>
                <td>Memoria · Memory</td>
                <td>${memoryData.attempts}</td>
                <td>${memoryData.correct}</td>
                <td>${memoryAccuracy}%</td>
              </tr>
            `
            : `
              <tr>
                <td colspan="4">
                  No Memoria attempts yet.
                </td>
              </tr>
            `
        }
      </tbody>
    </table>
  `;

  topicTable.innerHTML = `
    <h3>By Topic</h3>

<p class="progress-note">
  Topic percentages also exclude
  Memoria attempts because the activity
  is partly chance-based.
</p>

    <table class="progress-table">
      <thead>
        <tr>
          <th>Topic</th>
          <th>Attempts</th>
          <th>Correct</th>
          <th>Accuracy</th>
        </tr>
      </thead>

      <tbody>
        ${buildProgressRows(
          topicTotalsWithoutMemory,
          topicLabels
        )}
      </tbody>
    </table>
  `;

  if (historyTable) {
    historyTable.innerHTML = `
      <h3>Attempt History</h3>

      <table class="progress-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Topic</th>
            <th>Activity</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          ${buildAttemptHistoryRows()}
        </tbody>
      </table>
    `;
  }
}

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

  italian: "Il cibo e le bevande",

  english: "Food & Drinks",

  vocabulary: food,

  available: true

},

 adjectives: {
  icon: "🔎",
  italian: "Gli aggettivi",
  english: "Adjectives",
  vocabulary: adjectives,
  available: true
},

clothing: {

  icon: "👕",

  italian: "L'abbigliamento",

  english: "Clothing",

  vocabulary: clothing,

  available: true

},

bodyParts: {

  icon: "🧍",

  italian: "Le parti del corpo",

  english: "Body Parts",

  vocabulary: body,

  available: true

},

home: {

  icon: "🏠",

  italian: "La casa",

  english: "Home",

  vocabulary: home,

  available: true

},

 places: {
  icon: "📍",
  italian: "I luoghi",
  english: "Places",
  vocabulary: places,
  available: true
},

family: {
  icon: "👨‍👩‍👧",
  italian: "La famiglia",
  english: "Family",
  vocabulary: family,
  available: true
},

 

colors: {

  icon: "🎨",

  italian: "I colori",

  english: "Colors",

  vocabulary: colors,

  available: true

},
feelings: {
  icon: "😊",
  italian: "Le emozioni",
  english: "Feelings",
  vocabulary: feelings,
  available: true
},
 

numbers: {

  icon: "🔢",

  italian: "I numeri",

  english: "Numbers",

  vocabulary: numbers,

  available: true

},

 

animals: {

  icon: "🐶",

  italian: "Gli animali",

  english: "Animals",

  vocabulary: animals,

  available: true

},

 

time: {

  icon: "🕒",

  italian: "L’ora",

  english: "Telling Time",

  vocabulary: time,

  available: true

},

 

weather: {

  icon: "🌦️",

  italian: "Il tempo",

  english: "Weather",

  vocabulary: weather,

  available: true

},
seasons: {
  icon: "🌦️",
  italian: "Le stagioni",
  english: "Seasons",
  vocabulary: seasons,
  available: true
},

 

classroom: {

  icon: "🏫",

  italian: "Espressioni in classe",

  english: "Classroom Expressions",

  vocabulary: classroomExpressions,

  available: true

},

 

greetings: {
  icon: "👋",
  italian: "Saluti e presentazioni",
  english: "Greetings & Introductions",
  vocabulary: introductions,
  available: true
}

};

 let selectedGender = "masculine";
let voloAge = null;
let currentTopicKey = "";
let currentVocabulary = [];

function getTopicVocabulary(topicKey) {
  const topic = topics[topicKey];

  if (
    !topic ||
    !Array.isArray(topic.vocabulary)
  ) {
    return [];
  }

  if (topicKey === "feelings") {
    return topic.vocabulary.map(item => ({
      ...item,

      italian:
        selectedGender === "feminine"
          ? item.feminine
          : item.masculine
    }));
  }

  if (topicKey === "greetings") {
    return topic.vocabulary.map(item => {
      if (item.dynamic !== "age") {
        return { ...item };
      }

      return {
        ...item,

        italian:
          Number.isInteger(voloAge)
            ? `Ho ${voloAge} anni.`
            : "Ho ___ anni.",

        english:
          Number.isInteger(voloAge)
            ? `I am ${voloAge} years old.`
            : "I am ___ years old."
      };
    });
  }

  return topic.vocabulary.map(item => ({
    ...item
  }));
}
function hideAllActivityPanels() {
  document
    .querySelectorAll(
      `
        .activity-panel,
        #wordsInActionActivity,
        #assembleSentencesActivity,
        #conversationPracticeActivity,
        #introductionsPracticeActivity
      `
    )
    .forEach(panel => {
      panel.hidden = true;
    });
}

function setActivityButtonsDisabled(
  disabled
) {
  document
    .querySelectorAll(".activity-button")
    .forEach(button => {
      button.disabled = disabled;
    });
}

function updateVoloAgeSetup() {
  if (!voloAgeSetup) {
    return;
  }

  const isGreetings =
    currentTopicKey === "greetings";

  voloAgeSetup.hidden = !isGreetings;

  if (!isGreetings) {
    setActivityButtonsDisabled(false);
    return;
  }

  const hasAge =
    Number.isInteger(voloAge);

  voloAgeForm.hidden = hasAge;
  voloAgeSaved.hidden = !hasAge;

  if (hasAge) {
    voloAgeNumber.textContent = voloAge;
    setActivityButtonsDisabled(false);
  } else {
    setActivityButtonsDisabled(true);
    activityButtons.forEach(button => {
  button.classList.remove("active");
});
    hideAllActivityPanels();

    window.setTimeout(() => {
      voloAgeInput.focus();
    }, 50);
  }
}

function announceVoloAgeChange() {
  document.dispatchEvent(
    new CustomEvent("voloagechange", {
      detail: {
        age: voloAge
      }
    })
  );
}

function saveVoloAge(age) {
  voloAge = age;

  currentVocabulary =
    getTopicVocabulary(currentTopicKey);

  updateVoloAgeSetup();
  announceVoloAgeChange();

  showLearnMode();
}

function requestVoloAgeChange() {
  voloAge = null;

  currentVocabulary =
    getTopicVocabulary(currentTopicKey);

  updateVoloAgeSetup();
  announceVoloAgeChange();

  voloAgeInput.value = "";
  voloAgeFeedback.textContent = "";

  voloAgeSetup.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  window.setTimeout(() => {
    voloAgeInput.focus();
  }, 300);
}

/*
  These functions allow
  introductions-practice.js to use the
  same age as every other activity.
*/

window.getVoloAge = function getVoloAge() {
  return voloAge;
};

window.requestVoloAgeChange =
  requestVoloAgeChange;
if (voloAgeForm) {
  voloAgeForm.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const age =
        Number.parseInt(
          voloAgeInput.value,
          10
        );

      if (
        !Number.isInteger(age) ||
        age < 1 ||
        age > 99
      ) {
        voloAgeFeedback.textContent =
          "Inserisci un numero da 1 a 99. · Enter a number from 1 to 99.";

        voloAgeInput.focus();
        return;
      }

      voloAgeFeedback.textContent = "";

      saveVoloAge(age);
    }
  );
}

if (changeVoloAgeButton) {
  changeVoloAgeButton.addEventListener(
    "click",
    requestVoloAgeChange
  );
}
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

  utterance.rate = 0.70;

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

  listenActivity.hidden = true;

  chooseActivity.hidden = true;

  completeActivity.hidden = true;

  writeActivity.hidden = true;

  memoryActivity.hidden = true;

 

  englishToggleControl.hidden = false;

  learnInstructions.hidden = false;

 

  renderVocabulary();

}

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

 

    recordAttempt(

      "match-word",

      isCorrect

    );

 

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

  listenActivity.hidden = true;

  chooseActivity.hidden = true;

  completeActivity.hidden = true;

  writeActivity.hidden = true;

  memoryActivity.hidden = true;

 

  englishToggleControl.hidden = true;

  learnInstructions.hidden = true;

 

  createMatchRound();

}

/* ========================================

   LISTEN MODE

   ======================================== */

 

let currentListenItem = null;

let listenAnswered = false;

 

function buildListenChoices(correctItem) {

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

 

function playCurrentListenWord() {

  if (!currentListenItem) {

    return;

  }

 

  speakItalian(currentListenItem.italian);

}

 

function showListenQuestion() {

  if (!currentVocabulary.length) {

    listenActivity.innerHTML = `

      <p class="listen-empty">

        Nessun vocabolario disponibile.

        <span>No vocabulary is available.</span>

      </p>

    `;

 

    return;

  }

 

  currentListenItem =

    currentVocabulary[

      Math.floor(

        Math.random() *

        currentVocabulary.length

      )

    ];

 

  listenAnswered = false;

 

  const choices =

    buildListenChoices(currentListenItem);

 

  listenActivity.innerHTML = `

    <div class="listen-card">

 

      <div class="listen-heading">

        <h4>

          Ascolta e scegli l'immagine corretta.

        </h4>

 

        <p>

          Listen and choose the correct picture.

        </p>

      </div>

 

      <button

        type="button"

        id="listenPlayButton"

        class="listen-play-button"

        aria-label="Listen to the Italian word"

      >

        <span

          class="listen-play-icon"

          aria-hidden="true"

        >

          🔊

        </span>

 

        <span>

          Ascolta

          <small>Listen</small>

        </span>

      </button>

 

      <p class="listen-replay-message">

        Puoi ascoltare la parola più volte.

        <span>

          You may replay the word as many times

          as you need.

        </span>

      </p>

 

      <div

        class="listen-choice-grid"

        aria-label="Picture choices"

      >

        ${choices.map(item => `

          <button

            type="button"

            class="listen-choice"

            data-answer="${item.italian}"

            aria-label="${item.english}"

          >

            <div class="listen-image-frame">

              <img

                src="${item.image}"

                alt="${item.english}"

              >

            </div>

          </button>

        `).join("")}

      </div>

 

      <p

        id="listenFeedback"

        class="listen-feedback"

        aria-live="polite"

      ></p>

 

      <button

        type="button"

        id="nextListenButton"

        class="next-question-button"

        hidden

      >

        Prossima domanda · Next Question

      </button>

 

    </div>

  `;

 

  const playButton =

    listenActivity.querySelector(

      "#listenPlayButton"

    );

 

  const choiceButtons =

    listenActivity.querySelectorAll(

      ".listen-choice"

    );

 

  const feedback =

    listenActivity.querySelector(

      "#listenFeedback"

    );

 

  const nextButton =

    listenActivity.querySelector(

      "#nextListenButton"

    );

 

  playButton.addEventListener(

    "click",

    () => {

      playCurrentListenWord();

 

      playButton.classList.remove(

        "is-playing"

      );

 

      void playButton.offsetWidth;

 

      playButton.classList.add(

        "is-playing"

      );

    }

  );

 

  playButton.addEventListener(

    "animationend",

    () => {

      playButton.classList.remove(

        "is-playing"

      );

    }

  );

 

  choiceButtons.forEach(button => {

    button.addEventListener(

      "click",

      () => {

        if (listenAnswered) {

          return;

        }

 

        const isCorrect =

          button.dataset.answer ===

          currentListenItem.italian;

 

        recordAttempt(

          "match-sound",

          isCorrect

        );

 

        if (isCorrect) {

          listenAnswered = true;

 

          button.classList.add("correct");

 

          feedback.innerHTML = `

            Corretto! Hai sentito

            <strong>

              ${currentListenItem.italian}

            </strong>.

 

            <span>

              Correct! You heard

              <strong>

                ${currentListenItem.italian}

              </strong>.

            </span>

          `;

 

          feedback.className =

            "listen-feedback correct-feedback";

 

          choiceButtons.forEach(choice => {

            choice.disabled = true;

          });

 

          speakItalian(

            currentListenItem.italian

          );

 

          nextButton.hidden = false;

        } else {

          button.classList.add(

            "incorrect"

          );

 

          feedback.innerHTML = `

            Riprova. Ascolta ancora.

 

            <span>

              Try again. Listen once more.

            </span>

          `;

 

          feedback.className =

            "listen-feedback incorrect-feedback";

 

          window.setTimeout(() => {

            button.classList.remove(

              "incorrect"

            );

          }, 600);

        }

      }

    );

  });

 

  nextButton.addEventListener(

    "click",

    showListenQuestion

  );

 

  /*

    Play automatically after the new

    question appears.

  */

  window.setTimeout(

    playCurrentListenWord,

    350

  );

}

 

function showListenMode() {

  setActiveButton("match-sound");

 

  learnActivity.hidden = true;

  matchActivity.hidden = true;

  listenActivity.hidden = false;

  chooseActivity.hidden = true;

  completeActivity.hidden = true;

  writeActivity.hidden = true;

  memoryActivity.hidden = true;

 

  englishToggleControl.hidden = true;

  learnInstructions.hidden = true;

 

  showListenQuestion();

}

/* ========================================

   COMPLETE MODE

   ======================================== */

 

let currentCompleteItem = null;

let currentMissingIndexes = [];

 

/*

  Normalize answers so capitalization and

  accent marks do not affect correctness.

*/

function normalizeAnswer(text) {

  return text

    .trim()

    .toLowerCase()

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "");

}

 

function chooseMissingIndexes(word) {

  const letterIndexes = [...word]

    .map((character, index) => ({

      character,

      index

    }))

    .filter(item =>

      /[a-zA-ZÀ-ÿ]/.test(item.character)

    )

    .map(item => item.index);

 

  const missingCount =

    word.length <= 5 ? 1 : 2;

 

  return shuffle(letterIndexes)

    .slice(0, missingCount)

    .sort((a, b) => a - b);

}

 

function createIncompleteWord(

  word,

  missingIndexes

) {

  return [...word]

    .map((character, index) => {

      if (character === " ") {

        return "\u00A0";

      }

 

      if (missingIndexes.includes(index)) {

        return "_";

      }

 

      return character;

    })

    .join("");

}

 

function showCompleteQuestion() {

  if (!currentVocabulary.length) {

    completeActivity.innerHTML = `

      <p class="complete-empty">

        Nessun vocabolario disponibile.

 

        <span>

          No vocabulary is available.

        </span>

      </p>

    `;

 

    return;

  }

 

  currentCompleteItem =

    currentVocabulary[

      Math.floor(

        Math.random() *

        currentVocabulary.length

      )

    ];

 

  currentMissingIndexes =

    chooseMissingIndexes(

      currentCompleteItem.italian

    );

 

  const incompleteWord =

    createIncompleteWord(

      currentCompleteItem.italian,

      currentMissingIndexes

    );

 

  completeActivity.innerHTML = `

    <div class="complete-card">

 

      <div class="complete-heading">

        <h4>

          Scrivi la parola completa.

        </h4>

 

        <p>

          Complete the word.

        </p>

      </div>

 

      <div class="complete-prompt-row">

 

        <div class="complete-image-frame">

          <img

            src="${currentCompleteItem.image}"

            alt="${currentCompleteItem.english}"

          >

        </div>

 

        <p

          class="complete-word"

          aria-label="Incomplete Italian word"

        >

          ${incompleteWord}

        </p>

 

      </div>

 

      <form

        id="completeForm"

        class="complete-form"

      >

        <label

          for="completeInput"

          class="complete-label"

        >

          Scrivi la parola completa.

 

          <span>

            Type the complete word.

          </span>

        </label>

 

        <input

          type="text"

          id="completeInput"

          class="complete-input"

          autocomplete="off"

          autocapitalize="none"

          spellcheck="false"

          aria-describedby="completeFeedback"

        >

 

        <button

          type="submit"

          class="complete-check-button"

        >

          Controlla · Check

        </button>

      </form>

 

      <p

        id="completeFeedback"

        class="complete-feedback"

        aria-live="polite"

      ></p>

 

      <button

        type="button"

        id="nextCompleteButton"

        class="next-question-button"

        hidden

      >

        Prossima domanda · Next Question

      </button>

 

    </div>

  `;

 

  const form =

    completeActivity.querySelector(

      "#completeForm"

    );

 

  const input =

    completeActivity.querySelector(

      "#completeInput"

    );

 

  const feedback =

    completeActivity.querySelector(

      "#completeFeedback"

    );

 

  const nextButton =

    completeActivity.querySelector(

      "#nextCompleteButton"

    );

 

  const checkButton =

    completeActivity.querySelector(

      ".complete-check-button"

    );

 

  form.addEventListener(

    "submit",

    event => {

      event.preventDefault();

 

      const studentAnswer =

        normalizeAnswer(input.value);

 

      const correctAnswer =

        normalizeAnswer(

          currentCompleteItem.italian

        );

 

      if (!studentAnswer) {

        feedback.innerHTML = `

          Scrivi la parola completa.

 

          <span>

            Type the complete word.

          </span>

        `;

 

        feedback.className =

          "complete-feedback incorrect-feedback";

 

        input.focus();

        return;

      }

 

      const isCorrect =

        studentAnswer === correctAnswer;

 

      recordAttempt(

        "complete",

        isCorrect

      );

 

      if (isCorrect) {

        input.disabled = true;

        checkButton.disabled = true;

 

        feedback.innerHTML = `

          Corretto! La parola è

          <strong>

            ${currentCompleteItem.italian}

          </strong>.

 

          <span>

            Correct! The word is

            <strong>

              ${currentCompleteItem.italian}

            </strong>.

          </span>

        `;

 

        feedback.className =

          "complete-feedback correct-feedback";

 

        speakItalian(

          currentCompleteItem.italian

        );

 

        nextButton.hidden = false;

      } else {

        input.classList.add("incorrect");

 

        feedback.innerHTML = `

          Riprova.

 

          <span>

            Try again.

          </span>

        `;

 

        feedback.className =

          "complete-feedback incorrect-feedback";

 

        window.setTimeout(() => {

          input.classList.remove(

            "incorrect"

          );

        }, 500);

 

        input.select();

      }

    }

  );

 

  nextButton.addEventListener(

    "click",

    showCompleteQuestion

  );

 

  input.focus();

}

 

function showCompleteMode() {

  setActiveButton("complete");

 

  learnActivity.hidden = true;

  matchActivity.hidden = true;

  listenActivity.hidden = true;

  chooseActivity.hidden = true;

  completeActivity.hidden = false;

  writeActivity.hidden = true;

  memoryActivity.hidden = true;

 

  englishToggleControl.hidden = true;

  learnInstructions.hidden = true;

 

  showCompleteQuestion();

}

 

/* ========================================

   WRITE MODE

   ======================================== */

 

let currentWriteItem = null;

 

function showWriteQuestion() {

  if (!currentVocabulary.length) {

    writeActivity.innerHTML = `

      <p class="complete-empty">

        Nessun vocabolario disponibile.

 

        <span>

          No vocabulary is available.

        </span>

      </p>

    `;

 

    return;

  }

 

  currentWriteItem =

    currentVocabulary[

      Math.floor(

        Math.random() *

        currentVocabulary.length

      )

    ];

 

  writeActivity.innerHTML = `

    <div class="complete-card">

 

      <div class="complete-heading">

        <h4>

          Scrivi la parola.

        </h4>

 

        <p>

          Write the Italian word.

        </p>

      </div>

 

      <div class="write-image-row">

 

        <div class="complete-image-frame">

          <img

            src="${currentWriteItem.image}"

            alt="${currentWriteItem.english}"

          >

        </div>

 

      </div>

 

      <form

        id="writeForm"

        class="complete-form"

      >

       <label

  for="writeInput"

  class="sr-only"

>

  Scrivi la parola

</label>

 

        <input

          type="text"

          id="writeInput"

          class="complete-input"

          autocomplete="off"

          autocapitalize="none"

          spellcheck="false"

          aria-describedby="writeFeedback"

        >

 

        <button

          type="submit"

          class="complete-check-button"

        >

          Controlla · Check

        </button>

      </form>

 

      <p

        id="writeFeedback"

        class="complete-feedback"

        aria-live="polite"

      ></p>

 

      <button

        type="button"

        id="nextWriteButton"

        class="next-question-button"

        hidden

      >

        Prossima domanda · Next Question

      </button>

 

    </div>

  `;

 

  const form =

    writeActivity.querySelector(

      "#writeForm"

    );

 

  const input =

    writeActivity.querySelector(

      "#writeInput"

    );

 

  const feedback =

    writeActivity.querySelector(

      "#writeFeedback"

    );

 

  const nextButton =

    writeActivity.querySelector(

      "#nextWriteButton"

    );

 

  const checkButton =

    writeActivity.querySelector(

      ".complete-check-button"

    );

 

  form.addEventListener(

    "submit",

    event => {

      event.preventDefault();

 

      const studentAnswer =

        normalizeAnswer(input.value);

 

      const correctAnswer =

        normalizeAnswer(

          currentWriteItem.italian

        );

 

      if (!studentAnswer) {

        feedback.innerHTML = `

          Scrivi la parola.

 

          <span>

            Type the word.

          </span>

        `;

 

        feedback.className =

          "complete-feedback incorrect-feedback";

 

        input.focus();

        return;

      }

 

      const isCorrect =

        studentAnswer === correctAnswer;

 

      recordAttempt(

        "write",

        isCorrect

      );

 

      if (isCorrect) {

        input.disabled = true;

        checkButton.disabled = true;

 

        feedback.innerHTML = `

          Corretto!

 

          <strong>

            ${currentWriteItem.italian}

          </strong>

 

          <span>

            Correct!

          </span>

        `;

 

        feedback.className =

          "complete-feedback correct-feedback";

 

        speakItalian(

          currentWriteItem.italian

        );

 

        nextButton.hidden = false;

      } else {

        input.classList.add("incorrect");

 

        feedback.innerHTML = `

          Riprova.

 

          <span>

            Try again.

          </span>

        `;

 

        feedback.className =

          "complete-feedback incorrect-feedback";

 

        window.setTimeout(() => {

          input.classList.remove(

            "incorrect"

          );

        }, 500);

 

        input.select();

      }

    }

  );

 

  nextButton.addEventListener(

    "click",

    showWriteQuestion

  );

 

  input.focus();

}

 

function showWriteMode() {

  setActiveButton("write");

 

  learnActivity.hidden = true;

  matchActivity.hidden = true;

  listenActivity.hidden = true;

  chooseActivity.hidden = true;

  completeActivity.hidden = true;

  writeActivity.hidden = false;

  memoryActivity.hidden = true;

 

  englishToggleControl.hidden = true;

  learnInstructions.hidden = true;

 

  showWriteQuestion();

}

/* ========================================

   MEMORY MODE

   ======================================== */

 

let firstMemoryCard = null;

let secondMemoryCard = null;

let memoryLocked = false;

let memoryMoves = 0;

let memoryMatches = 0;

 

function createMemoryDeck(items) {

  const cards = [];

 

  items.forEach((item, index) => {

    cards.push({

      matchId: index,

      type: "picture",

      item

    });

 

    cards.push({

      matchId: index,

      type: "word",

      item

    });

  });

 

  return shuffle(cards);

}

 

function createMemoryGame() {

  if (!currentVocabulary.length) {

    memoryActivity.innerHTML = `

      <p class="memory-empty">

        Nessun vocabolario disponibile.

 

        <span>

          No vocabulary is available.

        </span>

      </p>

    `;

 

    return;

  }

 

  const pairCount =

    Math.min(6, currentVocabulary.length);

 

  const gameItems =

    shuffle(currentVocabulary).slice(

      0,

      pairCount

    );

 

  const memoryDeck =

    createMemoryDeck(gameItems);

 

  firstMemoryCard = null;

  secondMemoryCard = null;

  memoryLocked = false;

  memoryMoves = 0;

  memoryMatches = 0;

 

  memoryActivity.innerHTML = `

    <div class="memory-game-card">

 

      <div class="memory-heading">

        <h4>

          Trova le coppie.

        </h4>

 

        <p>

          Match each picture with its Italian word.

        </p>

      </div>

 

      <div class="memory-status">

 

        <span>

          Mosse · Moves:

          <strong id="memoryMoveCount">

            0

          </strong>

        </span>

 

        <span>

          Coppie · Matches:

          <strong id="memoryMatchCount">

            0

          </strong>

          /

          <strong>

            ${pairCount}

          </strong>

        </span>

 

      </div>

 

      <div

        class="memory-grid"

        aria-label="Memory matching cards"

      >

        ${memoryDeck.map((card, index) => `

          <button

            type="button"

            class="memory-card"

            data-card-index="${index}"

            data-match-id="${card.matchId}"

            aria-label="Hidden memory card"

          >

            <span class="memory-card-inner">

 

              <span class="memory-card-back">

                <span aria-hidden="true">

                  ?

                </span>

              </span>

 

              <span class="memory-card-front">

 

                ${

                  card.type === "picture"

                    ? `

                      <img

                        src="${card.item.image}"

                        alt="${card.item.english}"

                      >

                    `

                    : `

                      <span class="memory-word">

                        ${card.item.italian}

                      </span>

                    `

                }

 

              </span>

 

            </span>

          </button>

        `).join("")}

      </div>

 

      <p

        id="memoryFeedback"

        class="memory-feedback"

        aria-live="polite"

      >

        Seleziona due carte.

 

        <span>

          Select two cards.

        </span>

      </p>

 

      <button

        type="button"

        id="newMemoryGame"

        class="next-question-button"

        hidden

      >

        Gioca ancora · Play Again

      </button>

 

    </div>

  `;

 

  const memoryCards =

    memoryActivity.querySelectorAll(

      ".memory-card"

    );

 

  const moveCount =

    memoryActivity.querySelector(

      "#memoryMoveCount"

    );

 

  const matchCount =

    memoryActivity.querySelector(

      "#memoryMatchCount"

    );

 

  const feedback =

    memoryActivity.querySelector(

      "#memoryFeedback"

    );

 

  const newGameButton =

    memoryActivity.querySelector(

      "#newMemoryGame"

    );

 

  function resetSelectedCards() {

    firstMemoryCard = null;

    secondMemoryCard = null;

    memoryLocked = false;

  }

 

  function completeMemoryMatch() {

    firstMemoryCard.classList.add(

      "matched"

    );

 

    secondMemoryCard.classList.add(

      "matched"

    );

 

    firstMemoryCard.disabled = true;

    secondMemoryCard.disabled = true;

 

    const matchedItem =

      memoryDeck[

        Number(

          firstMemoryCard.dataset.cardIndex

        )

      ].item;

 

    memoryMatches += 1;

    matchCount.textContent =

      memoryMatches;

 

    feedback.innerHTML = `

      Corretto!

      <strong>

        ${matchedItem.italian}

      </strong>

 

      <span>

        Correct!

      </span>

    `;

 

    speakItalian(matchedItem.italian);

 

    window.setTimeout(() => {

      resetSelectedCards();

 

      if (memoryMatches === pairCount) {

        feedback.innerHTML = `

          🎉 Ottimo lavoro!

 

          <span>

            You found all the pairs

            in ${memoryMoves} moves.

          </span>

        `;

 

        newGameButton.hidden = false;

      }

    }, 500);

  }

 

  function hideIncorrectCards() {

    memoryLocked = true;

 

    feedback.innerHTML = `

      Riprova.

 

      <span>

        Try again.

      </span>

    `;

 

    window.setTimeout(() => {

      firstMemoryCard.classList.remove(

        "flipped"

      );

 

      secondMemoryCard.classList.remove(

        "flipped"

      );

 

      resetSelectedCards();

    }, 850);

  }

 

  function selectMemoryCard(card) {

    if (

      memoryLocked ||

      card.disabled ||

      card === firstMemoryCard

    ) {

      return;

    }

 

    card.classList.add("flipped");

 

    card.setAttribute(

      "aria-label",

      "Revealed memory card"

    );

 

    if (!firstMemoryCard) {

      firstMemoryCard = card;

 

      feedback.innerHTML = `

        Seleziona un'altra carta.

 

        <span>

          Select another card.

        </span>

      `;

 

      return;

    }

 

    secondMemoryCard = card;

    memoryMoves += 1;

    moveCount.textContent = memoryMoves;

 

    const isMatch =

      firstMemoryCard.dataset.matchId ===

      secondMemoryCard.dataset.matchId;

 

    recordAttempt(

      "memory",

      isMatch

    );

 

    if (isMatch) {

      memoryLocked = true;

      completeMemoryMatch();

    } else {

      hideIncorrectCards();

    }

  }

 

  memoryCards.forEach(card => {

    card.addEventListener("click", () => {

      selectMemoryCard(card);

    });

  });

 

  newGameButton.addEventListener(

    "click",

    createMemoryGame

  );

}

 

function showMemoryMode() {

  setActiveButton("memory");

 

  learnActivity.hidden = true;

  matchActivity.hidden = true;

  listenActivity.hidden = true;

  chooseActivity.hidden = true;

  completeActivity.hidden = true;

  writeActivity.hidden = true;

  memoryActivity.hidden = false;

 

  englishToggleControl.hidden = true;

  learnInstructions.hidden = true;

 

  createMemoryGame();

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

    alt="${currentQuestion.english}"

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

 

      recordAttempt(

        "choose",

        isCorrect

      );

 

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

  listenActivity.hidden = true;

  chooseActivity.hidden = false;

completeActivity.hidden = true;

writeActivity.hidden = true;

memoryActivity.hidden = true;

  englishToggleControl.hidden = true;

  learnInstructions.hidden = true;

  

 

  showChooseQuestion();

}

 

/* ========================================

   TOPIC SELECTOR

   ======================================== */

 function showTopicWelcome() {
  currentTopicKey = "";
  currentVocabulary = [];

  topicItalian.textContent =
    "👋 Scegli un argomento";

  topicEnglish.textContent =
    "Choose a Topic";

  topicAvailability.textContent = "";
  topicAvailability.style.display = "none";

  if (genderChoice) {
    genderChoice.hidden = true;
  }

  if (voloAgeSetup) {
    voloAgeSetup.hidden = true;
  }

  setActivityButtonsDisabled(true);
  hideAllActivityPanels();

  englishToggleControl.hidden = true;
  learnInstructions.hidden = true;

  vocabularyGrid.innerHTML = `
    <div class="topic-welcome">
      <h3>Benvenuto!</h3>

      <p>
        Scegli un argomento per iniziare.
      </p>

      <span>
        Choose a topic to begin.
      </span>
    </div>
  `;
}

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
  if (!topicKey) {
    showTopicWelcome();
    return;
  }
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

currentVocabulary =
  getTopicVocabulary(currentTopicKey);
  setActivityButtonsDisabled(false);
if (genderChoice) {
  genderChoice.hidden =
    currentTopicKey !== "feelings";
}
 

  topicAvailability.textContent = "";

  topicAvailability.style.display = "none";

 

updateTopicHeading(topic);
updateVoloAgeSetup();

if (
  currentTopicKey === "greetings" &&
  !Number.isInteger(voloAge)
) {
  return;
}

showLearnMode();
}

 

topicSelect.addEventListener(

  "change",

  () => {

    selectTopic(topicSelect.value);

  }

);
genderChoiceButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedGender =
      button.dataset.gender;

    genderChoiceButtons.forEach(
      choiceButton => {
        const isActive =
          choiceButton === button;

        choiceButton.classList.toggle(
          "active",
          isActive
        );

        choiceButton.setAttribute(
          "aria-pressed",
          String(isActive)
        );
      }
    );

    if (currentTopicKey !== "feelings") {
      return;
    }

    currentVocabulary =
      getTopicVocabulary(
        currentTopicKey
      );

    showLearnMode();
  });
});
 

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

/* ========================================

   REFERENCE MODAL

   ======================================== */

 

let lastReferenceFocus = null;

 

function openReferenceModal() {

  lastReferenceFocus = document.activeElement;

 

  referenceModal.hidden = false;

  document.body.style.overflow = "hidden";

 

  referenceClose.focus();

}

 

function closeReferenceModal() {

  referenceModal.hidden = true;

  document.body.style.overflow = "";

 

  if (lastReferenceFocus) {

    lastReferenceFocus.focus();

  }

}

 

referenceButton.addEventListener(

  "click",

  openReferenceModal

);

 

referenceClose.addEventListener(

  "click",

  closeReferenceModal

);

 

referenceModal.addEventListener(

  "click",

  event => {

    if (event.target === referenceModal) {

      closeReferenceModal();

    }

  }

);

document.addEventListener(

  "keydown",

  event => {

    if (event.key !== "Escape") {

      return;

    }

 

    if (!referenceModal.hidden) {

      closeReferenceModal();

      return;

    }

 

    if (!aboutModal.hidden) {

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

    if (mode === "match-sound") {
      showListenMode();
      return;
    }

    if (mode === "choose") {
      showChooseMode();
      return;
    }

    if (mode === "complete") {
      showCompleteMode();
      return;
    }

    if (mode === "write") {
      showWriteMode();
      return;
    }

    if (mode === "memory") {
      showMemoryMode();
      return;
    }

    /*
      These activities are handled by their
      own JavaScript files. Do not show the
      generic "coming soon" alert.
    */
    if (
      mode === "words-in-action" ||
      mode === "assemble-sentences" ||
      mode === "conversation-practice"
    ) {
      return;
    }

    if (mode === "sentences") {
      window.alert(
`📝 Frasi · Sentences

Coming Soon!

Students will write complete Italian sentences using the vocabulary they have learned.`
      );

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

 

createProgressInterface();

topicSelect.value = "";
showTopicWelcome();