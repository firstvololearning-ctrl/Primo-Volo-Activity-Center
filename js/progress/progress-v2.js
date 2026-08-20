"use strict";

/*
  Primo Volo d'Italiano
  Progress Report V2

  Adds ACTFL-informed communication categories,
  topic snapshots, recent accuracy, practice breadth,
  productive-practice indicators, and word/expression
  accuracy while preserving the existing progress store.

  Important: these categories are instructional and
  ACTFL-informed. They are not ACTFL proficiency ratings.
*/

(function initializePrimoVoloProgressV2() {
  if (
    typeof progressData === "undefined" ||
    typeof saveProgressData !== "function" ||
    typeof recordAttempt !== "function" ||
    typeof calculateAccuracy !== "function"
  ) {
    console.error(
      "Progress V2 could not start because the existing progress system was not found."
    );
    return;
  }

  const LABELS = {
    learn: "Impara · Learn",
    choose: "Scegli · Choose",
    "match-word": "Abbina · Match",
    "match-sound": "Ascolta · Listen",
    memory: "Memoria · Memory",
    "words-in-action": "Parole in azione · Words in Action",
    "conversation-choice": "Conversiamo: Scegli · Choose",
    "conversation-write": "Conversiamo: Scrivi · Write",
    "conversation-practice": "Conversiamo · Conversation",
    "introductions-practice": "Presentiamoci! · Introductions",
    "assemble-sentences": "Assembla · Assemble",
    complete: "Completa · Complete",
    write: "Scrivi · Write",
    sentences: "Frasi · Sentences"
  };

  const MODE_FROM_ACTIVITY = {
    "conversation-choice": "conversation-practice",
    "conversation-write": "conversation-practice"
  };

  const BASE_EXPECTED_MODES = [
    "learn",
    "choose",
    "match-word",
    "match-sound",
    "memory",
    "words-in-action",
    "assemble-sentences",
    "complete",
    "write"
  ];

  const ACTFL_GROUPS = [
    {
      title: "Interpretive-supporting",
      subtitle: "Recognition and understanding",
      activities: [
        "choose",
        "match-word",
        "match-sound"
      ]
    },
    {
      title: "Interpersonal-supporting",
      subtitle: "Guided question-and-response",
      activities: [
        "conversation-choice",
        "conversation-write"
      ]
    },
    {
      title: "Presentational-supporting",
      subtitle: "Supported language production",
      activities: [
        "assemble-sentences",
        "write"
      ]
    }
  ];

  if (typeof activityLabels !== "undefined") {
    Object.assign(activityLabels, LABELS);
  }

  /* ========================================
     TARGET METADATA FOR NEW ATTEMPTS
     ======================================== */

  function normalizeTarget(target) {
    if (!target) {
      return null;
    }

    if (typeof target === "string") {
      const italian = target.trim();
      return italian
        ? { italian, english: "" }
        : null;
    }

    const italian = String(
      target.italian ||
      target.answer ||
      ""
    ).trim();

    const english = String(
      target.english ||
      target.answerEnglish ||
      ""
    ).trim();

    return italian
      ? { italian, english }
      : null;
  }

  function findVocabularyItemByImage(selector) {
    const image =
      document.querySelector(selector);

    if (
      !image ||
      typeof currentVocabulary === "undefined" ||
      !Array.isArray(currentVocabulary)
    ) {
      return null;
    }

    const src =
      image.getAttribute("src") || "";

    const alt =
      image.getAttribute("alt") || "";

    return (
      currentVocabulary.find(
        item => item.image === src
      ) ||
      currentVocabulary.find(
        item => item.english === alt
      ) ||
      null
    );
  }

  function findMatchWordTarget() {
    const word =
      document.querySelector(
        "#matchActivity .match-word.dragging, #matchActivity .match-word.selected"
      );

    if (!word) {
      return null;
    }

    const italian =
      word.dataset.answer || "";

    if (
      typeof currentVocabulary !== "undefined" &&
      Array.isArray(currentVocabulary)
    ) {
      return (
        currentVocabulary.find(
          item => item.italian === italian
        ) ||
        { italian, english: "" }
      );
    }

    return { italian, english: "" };
  }

  function findWordsInActionTarget() {
    const imageTarget =
      findVocabularyItemByImage(
        "#wordsInActionActivity .words-action-image-frame img"
      );

    if (imageTarget) {
      return imageTarget;
    }

    /*
      Greetings uses answer phrases rather than
      the standard vocabulary-image pattern.
    */
    const correctChoice =
      document.querySelector(
        "#wordsInActionActivity .words-action-choice.correct"
      );

    if (correctChoice) {
      return {
        italian:
          correctChoice.dataset.answer ||
          correctChoice.textContent.trim(),
        english: ""
      };
    }

    return null;
  }

  function inferTarget(activity) {
    switch (activity) {
      case "choose":
        return typeof currentQuestion !== "undefined"
          ? currentQuestion
          : null;

      case "match-word":
        return findMatchWordTarget();

      case "match-sound":
        return typeof currentListenItem !== "undefined"
          ? currentListenItem
          : null;

      case "complete":
        return typeof currentCompleteItem !== "undefined"
          ? currentCompleteItem
          : null;

      case "write":
        return typeof currentWriteItem !== "undefined"
          ? currentWriteItem
          : null;

      case "words-in-action":
        return findWordsInActionTarget();

      case "assemble-sentences":
        return findVocabularyItemByImage(
          "#assembleSentencesActivity .assemble-picture-frame img"
        );

      case "conversation-choice":
      case "conversation-write":
        return findVocabularyItemByImage(
          "#conversationPracticeActivity .conversation-image-frame img"
        );

      default:
        return null;
    }
  }

  const originalRecordAttempt =
    recordAttempt;

  recordAttempt = function recordAttemptWithTarget(
    activity,
    isCorrect,
    explicitTarget = null
  ) {
    const target = normalizeTarget(
      explicitTarget || inferTarget(activity)
    );

    originalRecordAttempt(
      activity,
      isCorrect
    );

    if (
      activity === "memory" ||
      !target ||
      !progressData.sessions.length
    ) {
      return;
    }

    const lastSession =
      progressData.sessions[
        progressData.sessions.length - 1
      ];

    if (
      !lastSession ||
      lastSession.activity !== activity
    ) {
      return;
    }

    lastSession.targetItalian =
      target.italian;

    lastSession.targetEnglish =
      target.english;

    saveProgressData();
  };

  window.recordAttempt = recordAttempt;

  /* ========================================
     DATA HELPERS
     ======================================== */

  function isScoredSession(session) {
    return Boolean(
      session &&
      session.activity !== "memory" &&
      typeof session.correct === "boolean"
    );
  }

  function accuracyFromSessions(sessions) {
    const attempts = sessions.length;
    const correct = sessions.filter(
      session => session.correct
    ).length;

    return {
      attempts,
      correct,
      accuracy: calculateAccuracy(
        correct,
        attempts
      )
    };
  }

  function activityToMode(activity) {
    return (
      MODE_FROM_ACTIVITY[activity] ||
      activity
    );
  }

  function getFlightData() {
    try {
      if (
        typeof window.getVoloFlightPathData ===
        "function"
      ) {
        return (
          window.getVoloFlightPathData() ||
          { byTopic: {} }
        );
      }

      const saved =
        window.localStorage.getItem(
          "primoVoloFlightPathPractice"
        );

      if (!saved) {
        return { byTopic: {} };
      }

      const parsed = JSON.parse(saved);

      return {
        byTopic:
          parsed &&
          typeof parsed.byTopic === "object"
            ? parsed.byTopic
            : {}
      };
    } catch (error) {
      console.warn(
        "Progress V2 could not read Flight Path practice data.",
        error
      );

      return { byTopic: {} };
    }
  }

  function getExpectedModes(topicKey) {
    let modes;

    if (topicKey === "weather") {
      modes = BASE_EXPECTED_MODES.filter(
        mode =>
          mode !== "words-in-action"
      );

      modes.push("conversation-practice");
    } else if (topicKey === "classroom") {
      modes = BASE_EXPECTED_MODES.filter(
        mode =>
          mode !== "words-in-action" &&
          mode !== "assemble-sentences"
      );

      modes.push("conversation-practice");
    } else if (topicKey === "greetings") {
      modes = [
        ...BASE_EXPECTED_MODES,
        "introductions-practice"
      ];
    } else {
      modes = [...BASE_EXPECTED_MODES];
    }

    return modes;
  }

  function getTopicPracticeSet(topicKey) {
    const practice = new Set();
    const flight = getFlightData();
    const flightTopic =
      flight.byTopic?.[topicKey];

    if (
      flightTopic &&
      Array.isArray(flightTopic.practiced)
    ) {
      flightTopic.practiced.forEach(
        mode => {
          if (
            mode &&
            mode !== "sentences"
          ) {
            practice.add(mode);
          }
        }
      );
    }

    progressData.sessions
      .filter(
        session =>
          session.topic === topicKey
      )
      .forEach(session => {
        const mode =
          activityToMode(
            session.activity
          );

        if (
          mode &&
          mode !== "sentences"
        ) {
          practice.add(mode);
        }
      });

    return practice;
  }

  function getExpectedModesWithFutureEvidence(
    topicKey
  ) {
    const flightTopic =
      getFlightData().byTopic?.[topicKey];

    const savedAvailable =
      Array.isArray(
        flightTopic?.available
      )
        ? flightTopic.available.filter(
            mode =>
              mode &&
              mode !== "sentences"
          )
        : [];

    const expected =
      new Set(
        savedAvailable.length
          ? savedAvailable
          : getExpectedModes(topicKey)
      );

    getTopicPracticeSet(topicKey)
      .forEach(mode => {
        if (mode !== "sentences") {
          expected.add(mode);
        }
      });

    return [...expected];
  }

  function getTopicLabel(topicKey) {
    if (
      typeof topics !== "undefined" &&
      topics[topicKey]
    ) {
      const topic = topics[topicKey];

      return {
        icon: topic.icon || "•",
        italian:
          topic.italian || topicKey,
        english:
          topic.english || ""
      };
    }

    return {
      icon: "•",
      italian: topicKey,
      english: ""
    };
  }

  function validDateValue(value) {
    const time = new Date(value).getTime();
    return Number.isNaN(time)
      ? null
      : time;
  }

  function getTopicLastPracticed(topicKey) {
    const values = [];

    progressData.sessions
      .filter(
        session =>
          session.topic === topicKey
      )
      .forEach(session => {
        const value =
          validDateValue(session.date);

        if (value !== null) {
          values.push(value);
        }
      });

    const flightTopic =
      getFlightData().byTopic?.[topicKey];

    const flightValue =
      validDateValue(
        flightTopic?.updatedAt
      );

    if (flightValue !== null) {
      values.push(flightValue);
    }

    return values.length
      ? new Date(Math.max(...values))
      : null;
  }

  function getOverallLastPracticed() {
    const topicKeys =
      getPracticedTopicKeys();

    const dates = topicKeys
      .map(getTopicLastPracticed)
      .filter(Boolean)
      .map(date => date.getTime());

    return dates.length
      ? new Date(Math.max(...dates))
      : null;
  }

  function getPracticedTopicKeys() {
    const topicKeys = new Set();

    progressData.sessions.forEach(
      session => {
        if (session.topic) {
          topicKeys.add(session.topic);
        }
      }
    );

    const flight = getFlightData();

    Object.entries(
      flight.byTopic || {}
    ).forEach(([topicKey, value]) => {
      if (
        Array.isArray(value?.practiced) &&
        value.practiced.length
      ) {
        topicKeys.add(topicKey);
      }
    });

    return [...topicKeys];
  }

  function aggregateByActivity(sessions) {
    const result = {};

    sessions.forEach(session => {
      if (!isScoredSession(session)) {
        return;
      }

      if (!result[session.activity]) {
        result[session.activity] = {
          attempts: 0,
          correct: 0
        };
      }

      result[session.activity].attempts += 1;

      if (session.correct) {
        result[session.activity].correct += 1;
      }
    });

    return result;
  }

  function getActivitySignalText(
    activityStats,
    type
  ) {
    const evaluated =
      Object.entries(activityStats)
        .map(([activity, value]) => ({
          activity,
          attempts: value.attempts,
          accuracy: calculateAccuracy(
            value.correct,
            value.attempts
          )
        }))
        .filter(
          item => item.attempts >= 3
        );

    let selected;

    if (type === "higher") {
      selected = evaluated
        .filter(
          item => item.accuracy >= 85
        )
        .sort(
          (a, b) =>
            b.accuracy - a.accuracy
        );
    } else {
      selected = evaluated
        .filter(
          item => item.accuracy < 70
        )
        .sort(
          (a, b) =>
            a.accuracy - b.accuracy
        );
    }

    if (!selected.length) {
      return "More evidence needed";
    }

    return selected
      .slice(0, 3)
      .map(
        item =>
          LABELS[item.activity] ||
          item.activity
      )
      .join(", ");
  }

  function getCumulativeActivityStats(
    activityKeys
  ) {
    let attempts = 0;
    let correct = 0;

    activityKeys.forEach(key => {
      const value =
        progressData.byActivity[key];

      if (!value) {
        return;
      }

      attempts +=
        Number(value.attempts) || 0;

      correct +=
        Number(value.correct) || 0;
    });

    return {
      attempts,
      correct,
      accuracy: calculateAccuracy(
        correct,
        attempts
      )
    };
  }

  function getProductivePracticeHtml(
    topicKey,
    practiceSet,
    topicSessions
  ) {
    const items = [
      ["Completa", "complete"],
      ["Assembla", "assemble-sentences"],
      ["Scrivi", "write"]
    ];

    if (
      topicKey === "weather" ||
      topicKey === "classroom"
    ) {
      items.push([
        "Conversiamo: Scrivi",
        "conversation-write"
      ]);
    }

    return items
      .map(([label, key]) => {
        const practiced =
          key === "conversation-write"
            ? topicSessions.some(
                session =>
                  session.activity === key
              )
            : practiceSet.has(key);

        return `
          <span class="pv2-productive-chip ${
            practiced ? "is-practiced" : ""
          }">
            ${escapeHtml(label)}
            <strong>${practiced ? "✓" : "—"}</strong>
          </span>
        `;
      })
      .join("");
  }

  function aggregateWords() {
    const records = new Map();

    progressData.sessions.forEach(
      session => {
        if (
          !isScoredSession(session) ||
          !session.targetItalian
        ) {
          return;
        }

        const italian =
          String(
            session.targetItalian
          ).trim();

        if (!italian) {
          return;
        }

        const topicKey =
          session.topic || "";

        const key =
          `${topicKey}::${italian.toLocaleLowerCase("it")}`;

        if (!records.has(key)) {
          records.set(key, {
            topic: topicKey,
            italian,
            english:
              session.targetEnglish || "",
            attempts: 0,
            correct: 0,
            activities: new Set()
          });
        }

        const record = records.get(key);

        record.attempts += 1;

        if (session.correct) {
          record.correct += 1;
        }

        record.activities.add(
          session.activity
        );

        if (
          !record.english &&
          session.targetEnglish
        ) {
          record.english =
            session.targetEnglish;
        }
      }
    );

    return [...records.values()];
  }

  /* ========================================
     FORMAT + ESCAPE
     ======================================== */

  const HTML_ESCAPE = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      character =>
        HTML_ESCAPE[character]
    );
  }

  function formatShortDate(date) {
    if (!date) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  }

  function formatAttemptDateV2(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );
  }

  /* ========================================
     SUGGESTED NEXT PRACTICE
     ======================================== */

  const SUPPORT_FALLBACKS = {
    choose: [
      "learn"
    ],
    "match-word": [
      "choose",
      "learn"
    ],
    "match-sound": [
      "learn",
      "match-word",
      "choose"
    ],
    "words-in-action": [
      "match-word",
      "choose",
      "learn"
    ],
    "conversation-choice": [
      "words-in-action",
      "match-word",
      "choose",
      "learn"
    ],
    "conversation-write": [
      "conversation-choice",
      "words-in-action",
      "match-word",
      "choose",
      "learn"
    ],
    "introductions-practice": [
      "words-in-action",
      "match-word",
      "choose",
      "learn"
    ],
    "assemble-sentences": [
      "words-in-action",
      "match-word",
      "choose",
      "learn"
    ],
    complete: [
      "match-word",
      "choose",
      "learn"
    ],
    write: [
      "complete",
      "assemble-sentences",
      "words-in-action",
      "match-word",
      "choose",
      "learn"
    ]
  };

  function activityAvailableForTopic(
    activity,
    availableModes
  ) {
    if (
      activity === "conversation-choice" ||
      activity === "conversation-write"
    ) {
      return availableModes.includes(
        "conversation-practice"
      );
    }

    return availableModes.includes(
      activityToMode(activity)
    );
  }

  function findSupportActivity(
    activity,
    availableModes
  ) {
    const candidates =
      SUPPORT_FALLBACKS[activity] || [
        "learn"
      ];

    return (
      candidates.find(
        candidate =>
          activityAvailableForTopic(
            candidate,
            availableModes
          )
      ) ||
      (availableModes.includes("learn")
        ? "learn"
        : null)
    );
  }

  function getTopicEvidence(topicKey) {
    const scored =
      progressData.sessions.filter(
        session =>
          session.topic === topicKey &&
          isScoredSession(session)
      );

    const stats =
      aggregateByActivity(scored);

    return Object.entries(stats)
      .map(([activity, value]) => ({
        activity,
        attempts: value.attempts,
        correct: value.correct,
        accuracy: calculateAccuracy(
          value.correct,
          value.attempts
        )
      }));
  }

  function getNextUnpracticedMode(
    topicKey,
    sourceActivity
  ) {
    const availableModes =
      getExpectedModesWithFutureEvidence(
        topicKey
      );

    const practiceSet =
      getTopicPracticeSet(topicKey);

    const sourceMode =
      activityToMode(sourceActivity);

    const sourceIndex =
      availableModes.indexOf(sourceMode);

    if (sourceIndex < 0) {
      return (
        availableModes.find(
          mode =>
            !practiceSet.has(mode) &&
            mode !== "sentences"
        ) || null
      );
    }

    return (
      availableModes
        .slice(sourceIndex + 1)
        .find(
          mode =>
            !practiceSet.has(mode) &&
            mode !== "sentences"
        ) || null
    );
  }

  function getNextPracticeRecommendations() {
    const topicKeys =
      getPracticedTopicKeys();

    if (!topicKeys.length) {
      return [
        {
          type: "evidence",
          typeLabel: "Start building evidence",
          topicIcon: "🧭",
          topicItalian: "Scegli un argomento",
          topicEnglish: "Choose a topic",
          action: "Begin with Impara · Learn",
          detail:
            "No saved practice is available yet. Start with a topic and use the Practice Path to build a first picture of what has been practiced."
        }
      ];
    }

    const support = [];
    const stretch = [];
    const breadth = [];

    topicKeys.forEach(topicKey => {
      const label =
        getTopicLabel(topicKey);

      const evidence =
        getTopicEvidence(topicKey);

      const availableModes =
        getExpectedModesWithFutureEvidence(
          topicKey
        );

      const practiceSet =
        getTopicPracticeSet(topicKey);

      const practicedCount =
        availableModes.filter(
          mode => practiceSet.has(mode)
        ).length;

      const lastPracticed =
        getTopicLastPracticed(topicKey);

      evidence
        .filter(
          item =>
            item.attempts >= 3 &&
            item.accuracy < 70
        )
        .forEach(item => {
          const supportActivity =
            findSupportActivity(
              item.activity,
              availableModes
            );

          support.push({
            type: "support",
            typeLabel:
              "A little more support may help",
            topicKey,
            topicIcon: label.icon,
            topicItalian: label.italian,
            topicEnglish: label.english,
            score: item.accuracy,
            attempts: item.attempts,
            activity: item.activity,
            targetMode:
              activityToMode(
                supportActivity ||
                item.activity
              ),
            action:
              supportActivity
                ? `Revisit ${
                    LABELS[supportActivity] ||
                    supportActivity
                  }`
                : `Revisit ${
                    LABELS[item.activity] ||
                    item.activity
                  }`,
            detail:
              `Scored responses in ${
                LABELS[item.activity] ||
                item.activity
              } are ${item.accuracy}% across ${
                item.attempts
              } responses. A more-supported activity may be useful before trying this demand again.`,
            sortTime:
              lastPracticed?.getTime() || 0
          });
        });

      evidence
        .filter(
          item =>
            item.attempts >= 3 &&
            item.accuracy >= 85
        )
        .forEach(item => {
          const nextMode =
            getNextUnpracticedMode(
              topicKey,
              item.activity
            );

          if (!nextMode) {
            return;
          }

          stretch.push({
            type: "stretch",
            typeLabel:
              "Try a next step",
            topicKey,
            topicIcon: label.icon,
            topicItalian: label.italian,
            topicEnglish: label.english,
            score: item.accuracy,
            attempts: item.attempts,
            activity: item.activity,
            nextMode,
            targetMode: nextMode,
            action:
              `Try ${
                LABELS[nextMode] ||
                nextMode
              } next`,
            detail:
              `Higher accuracy in ${
                LABELS[item.activity] ||
                item.activity
              } (${item.accuracy}% across ${
                item.attempts
              } responses) supports trying another available step in the Practice Path.`,
            sortTime:
              lastPracticed?.getTime() || 0
          });
        });

      const nextUnpracticed =
        availableModes.find(
          mode =>
            !practiceSet.has(mode) &&
            mode !== "sentences"
        );

      if (
        practicedCount > 0 &&
        nextUnpracticed
      ) {
        breadth.push({
          type: "breadth",
          typeLabel:
            "Build practice breadth",
          topicKey,
          topicIcon: label.icon,
          topicItalian: label.italian,
          topicEnglish: label.english,
          targetMode:
            nextUnpracticed,
          action:
            `Try ${
              LABELS[nextUnpracticed] ||
              nextUnpracticed
            }`,
          detail:
            `${practicedCount} of ${
              availableModes.length
            } currently available activities have been practiced in this topic. Trying another available activity broadens the practice picture without requiring a mastery threshold.`,
          practicedCount,
          availableCount:
            availableModes.length,
          sortTime:
            lastPracticed?.getTime() || 0
        });
      }
    });

    support.sort(
      (a, b) =>
        a.score - b.score ||
        b.sortTime - a.sortTime
    );

    stretch.sort(
      (a, b) =>
        b.score - a.score ||
        b.sortTime - a.sortTime
    );

    breadth.sort(
      (a, b) =>
        b.sortTime - a.sortTime ||
        a.practicedCount -
          b.practicedCount
    );

    const selected = [];
    const usedTopics = new Set();

    function addDistinct(items) {
      for (const item of items) {
        if (
          selected.length >= 3
        ) {
          break;
        }

        if (
          item.topicKey &&
          usedTopics.has(
            item.topicKey
          )
        ) {
          continue;
        }

        selected.push(item);

        if (item.topicKey) {
          usedTopics.add(
            item.topicKey
          );
        }
      }
    }

    addDistinct(support);
    addDistinct(stretch);
    addDistinct(breadth);

    if (!selected.length) {
      return [
        {
          type: "evidence",
          typeLabel:
            "Keep building evidence",
          topicIcon: "🌱",
          topicItalian:
            "Continua la pratica",
          topicEnglish:
            "Keep practicing",
          action:
            "Use the Practice Path to try another available activity",
          detail:
            "There is not enough scored evidence yet to identify a higher-accuracy or additional-practice signal. More practice will build a clearer picture."
        }
      ];
    }

    return selected;
  }

  window.getPrimoVoloNextPracticeRecommendations =
    getNextPracticeRecommendations;

  function navigateToRecommendedPractice(
    topicKey,
    mode
  ) {
    const topicSelect =
      document.querySelector(
        "#topicSelect"
      );

    if (
      !topicSelect ||
      !topicKey ||
      !mode
    ) {
      return false;
    }

    const optionExists =
      [...topicSelect.options]
        .some(
          option =>
            option.value === topicKey
        );

    if (!optionExists) {
      return false;
    }

    topicSelect.value =
      topicKey;

    topicSelect.dispatchEvent(
      new Event(
        "change",
        { bubbles: true }
      )
    );

    const progressModal =
      document.querySelector(
        "#progressModal"
      );

    if (progressModal) {
      progressModal.hidden = true;
    }

    window.setTimeout(
      () => {
        const activityButton =
          [
            ...document.querySelectorAll(
              ".activity-button"
            )
          ].find(
            button =>
              button.dataset.mode ===
                mode &&
              !button.hidden &&
              !button.disabled &&
              button.getAttribute(
                "aria-disabled"
              ) !== "true"
          );

        if (activityButton) {
          activityButton.click();

          activityButton
            .scrollIntoView({
              behavior: "smooth",
              block: "center"
            });

          return;
        }

        const topicHeader =
          document.querySelector(
            ".topic-header"
          );

        topicHeader
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      },
      120
    );

    return true;
  }

  window.navigatePrimoVoloRecommendation =
    navigateToRecommendedPractice;

  document.addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          ".pv2-next-action-button"
        );

      if (!button) {
        return;
      }

      navigateToRecommendedPractice(
        button.dataset.topic,
        button.dataset.mode
      );
    }
  );

  function buildNextPracticeSection() {
    const recommendations =
      getNextPracticeRecommendations();

    const cards =
      recommendations
        .map(item => `
          <article
            class="pv2-next-card is-${escapeHtml(item.type)}"
          >
            <div class="pv2-next-card-top">
              <span class="pv2-next-type">
                ${escapeHtml(item.typeLabel)}
              </span>

              <span
                class="pv2-next-topic-icon"
                aria-hidden="true"
              >
                ${escapeHtml(item.topicIcon)}
              </span>
            </div>

            <h4>
              ${escapeHtml(item.topicItalian)}
            </h4>

            ${
              item.topicEnglish
                ? `
                  <p class="pv2-next-topic-english">
                    ${escapeHtml(item.topicEnglish)}
                  </p>
                `
                : ""
            }

            ${
              item.topicKey &&
              item.targetMode
                ? `
                  <button
                    type="button"
                    class="pv2-next-action pv2-next-action-button"
                    data-topic="${escapeHtml(item.topicKey)}"
                    data-mode="${escapeHtml(item.targetMode)}"
                    aria-label="${escapeHtml(
                      `${item.action} — ${item.topicItalian}`
                    )}"
                  >
                    ${escapeHtml(item.action)}
                    <span aria-hidden="true">→</span>
                  </button>
                `
                : `
                  <strong class="pv2-next-action">
                    ${escapeHtml(item.action)}
                  </strong>
                `
            }

            <p class="pv2-next-detail">
              ${escapeHtml(item.detail)}
            </p>
          </article>
        `)
        .join("");

    return `
      <section
        class="pv2-report-section pv2-next-section"
        aria-labelledby="pv2NextPracticeTitle"
      >
        <div class="pv2-next-heading">
          <div>
            <span class="pv2-next-kicker">
              Suggested Next Practice
            </span>

            <h3 id="pv2NextPracticeTitle">
              What could help next?
            </h3>

            <p>
              Suggestions combine saved Practice Path
              completion with scored response patterns.
              They guide practice; they are not mastery
              decisions.
            </p>
          </div>
        </div>

        <div class="pv2-next-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  /* ========================================
     REPORT SECTIONS
     ======================================== */

  function buildActflCards() {
    return ACTFL_GROUPS.map(group => {
      const stats =
        getCumulativeActivityStats(
          group.activities
        );

      const evidence = stats.attempts
        ? `
          <strong>${stats.accuracy}%</strong>
          <span>
            ${stats.correct} / ${stats.attempts} correct responses
          </span>
        `
        : `
          <strong>—</strong>
          <span>No scored practice yet</span>
        `;

      const activityNames =
        group.activities
          .map(
            activity =>
              LABELS[activity] ||
              activity
          )
          .join(" · ");

      return `
        <article class="pv2-actfl-card">
          <h4>${escapeHtml(group.title)}</h4>
          <p>${escapeHtml(group.subtitle)}</p>
          <div class="pv2-actfl-result">
            ${evidence}
          </div>
          <small>
            ${escapeHtml(activityNames)}
          </small>
        </article>
      `;
    }).join("");
  }

  function buildTopicCards() {
    const topicKeys =
      getPracticedTopicKeys();

    if (!topicKeys.length) {
      return `
        <p class="pv2-empty">
          No topic practice has been saved yet.
        </p>
      `;
    }

    return topicKeys
      .sort((a, b) => {
        const aLabel =
          getTopicLabel(a).italian;
        const bLabel =
          getTopicLabel(b).italian;

        return aLabel.localeCompare(
          bLabel,
          "it"
        );
      })
      .map(topicKey => {
        const label =
          getTopicLabel(topicKey);

        const topicSessions =
          progressData.sessions.filter(
            session =>
              session.topic === topicKey
          );

        const scored =
          topicSessions.filter(
            isScoredSession
          );

        const totals =
          accuracyFromSessions(scored);

        const recent =
          accuracyFromSessions(
            scored.slice(-10)
          );

        const activityStats =
          aggregateByActivity(scored);

        const practiceSet =
          getTopicPracticeSet(topicKey);

        const expected =
          getExpectedModesWithFutureEvidence(
            topicKey
          );

        const practicedCount =
          expected.filter(
            mode => practiceSet.has(mode)
          ).length;

        const higher =
          getActivitySignalText(
            activityStats,
            "higher"
          );

        const suggested =
          getActivitySignalText(
            activityStats,
            "suggested"
          );

        const lastPracticed =
          getTopicLastPracticed(topicKey);

        return `
          <article class="pv2-topic-card">
            <div class="pv2-topic-heading">
              <span class="pv2-topic-icon">
                ${escapeHtml(label.icon)}
              </span>
              <div>
                <h4>${escapeHtml(label.italian)}</h4>
                <p>${escapeHtml(label.english)}</p>
              </div>
            </div>

            <div class="pv2-topic-metrics">
              <div>
                <strong>${practicedCount} of ${expected.length}</strong>
                <span>Activities practiced</span>
              </div>
              <div>
                <strong>${totals.attempts}</strong>
                <span>Scored responses</span>
              </div>
              <div>
                <strong>${totals.correct}</strong>
                <span>Correct</span>
              </div>
              <div>
                <strong>${totals.attempts ? `${totals.accuracy}%` : "—"}</strong>
                <span>Accuracy</span>
              </div>
              <div>
                <strong>${recent.attempts ? `${recent.accuracy}%` : "—"}</strong>
                <span>Recent accuracy · last ${recent.attempts || 0}</span>
              </div>
              <div>
                <strong>${escapeHtml(formatShortDate(lastPracticed))}</strong>
                <span>Last practiced</span>
              </div>
            </div>

            <div class="pv2-topic-signals">
              <p>
                <strong>Higher accuracy:</strong>
                ${escapeHtml(higher)}
              </p>
              <p>
                <strong>Practice signal:</strong>
                ${escapeHtml(suggested)}
              </p>
            </div>

            <div class="pv2-productive-row">
              <strong>Productive practice</strong>
              <div>
                ${getProductivePracticeHtml(
                  topicKey,
                  practiceSet,
                  topicSessions
                )}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function buildScoredActivityRows() {
    const entries =
      Object.entries(
        progressData.byActivity || {}
      )
      .filter(
        ([activity]) =>
          activity !== "memory"
      )
      .sort(
        (a, b) =>
          (LABELS[a[0]] || a[0])
            .localeCompare(
              LABELS[b[0]] || b[0]
            )
      );

    if (!entries.length) {
      return `
        <tr>
          <td colspan="4">
            No scored responses yet.
          </td>
        </tr>
      `;
    }

    return entries
      .map(([activity, value]) => {
        const attempts =
          Number(value.attempts) || 0;
        const correct =
          Number(value.correct) || 0;

        return `
          <tr>
            <td>${escapeHtml(LABELS[activity] || activity)}</td>
            <td>${attempts}</td>
            <td>${correct}</td>
            <td>${calculateAccuracy(correct, attempts)}%</td>
          </tr>
        `;
      })
      .join("");
  }

  function buildWordRows() {
    const records = aggregateWords();

    if (!records.length) {
      return `
        <tr>
          <td colspan="7">
            No word/expression-level attempts have been recorded yet.
          </td>
        </tr>
      `;
    }

    return records
      .sort((a, b) => {
        const topicCompare =
          getTopicLabel(a.topic).italian
            .localeCompare(
              getTopicLabel(b.topic).italian,
              "it"
            );

        if (topicCompare !== 0) {
          return topicCompare;
        }

        return a.italian.localeCompare(
          b.italian,
          "it"
        );
      })
      .map(record => {
        const topic =
          getTopicLabel(record.topic);

        const activityText =
          [...record.activities]
            .map(
              activity =>
                LABELS[activity] ||
                activity
            )
            .join(", ");

        return `
          <tr>
            <td>
              ${escapeHtml(topic.icon)}
              ${escapeHtml(topic.italian)}
            </td>
            <td><strong>${escapeHtml(record.italian)}</strong></td>
            <td>${escapeHtml(record.english || "—")}</td>
            <td>${record.attempts}</td>
            <td>${record.correct}</td>
            <td>${calculateAccuracy(record.correct, record.attempts)}%</td>
            <td>${escapeHtml(activityText)}</td>
          </tr>
        `;
      })
      .join("");
  }

  function buildAttemptHistoryRowsV2() {
    if (!progressData.sessions.length) {
      return `
        <tr>
          <td colspan="6">
            No saved attempts yet.
          </td>
        </tr>
      `;
    }

    return [...progressData.sessions]
      .reverse()
      .map((attempt, index) => {
        const topic =
          getTopicLabel(attempt.topic);

        const activity =
          LABELS[attempt.activity] ||
          attempt.activity;

        const result =
          attempt.activity === "memory"
            ? attempt.correct
              ? "Pair found"
              : "Not a pair"
            : attempt.correct
              ? "✓ Correct"
              : "✗ Incorrect";

        const target =
          attempt.targetItalian || "—";

        return `
          <tr>
            <td>${progressData.sessions.length - index}</td>
            <td>${escapeHtml(formatAttemptDateV2(attempt.date))}</td>
            <td>
              ${escapeHtml(topic.icon)}
              ${escapeHtml(topic.italian)}
            </td>
            <td>${escapeHtml(activity)}</td>
            <td>${escapeHtml(target)}</td>
            <td>${escapeHtml(result)}</td>
          </tr>
        `;
      })
      .join("");
  }

  /* ========================================
     RENDER
     ======================================== */

  function renderProgressReportV2() {
    const summary =
      document.querySelector(
        "#progressSummary"
      );

    const activityTable =
      document.querySelector(
        "#progressActivityTable"
      );

    const topicTable =
      document.querySelector(
        "#progressTopicTable"
      );

    const historyTable =
      document.querySelector(
        "#progressAttemptTable"
      );

    if (
      !summary ||
      !activityTable ||
      !topicTable
    ) {
      return;
    }

    const memory =
      progressData.byActivity.memory || {
        attempts: 0,
        correct: 0
      };

    const scoredAttempts = Math.max(
      0,
      Number(progressData.attempts) -
        (Number(memory.attempts) || 0)
    );

    const scoredCorrect = Math.max(
      0,
      Number(progressData.correct) -
        (Number(memory.correct) || 0)
    );

    const scoredAccuracy =
      calculateAccuracy(
        scoredCorrect,
        scoredAttempts
      );

    const scoredSessions =
      progressData.sessions.filter(
        isScoredSession
      );

    const recent =
      accuracyFromSessions(
        scoredSessions.slice(-10)
      );

    const topicsPracticed =
      getPracticedTopicKeys().length;

    const lastPracticed =
      getOverallLastPracticed();

    const currentStudent =
      window.PrimoVoloStudent &&
      typeof window.PrimoVoloStudent.getCurrent ===
        "function"
        ? window.PrimoVoloStudent.getCurrent()
        : null;

    const studentName =
      currentStudent?.name
        ? String(currentStudent.name)
        : "";

    summary.innerHTML = `
      ${
        studentName
          ? `
            <div class="pv2-student-heading">
              <strong>Student:</strong>
              ${escapeHtml(studentName)}
            </div>
          `
          : ""
      }

      <div class="progress-stat">
        <strong>${scoredAttempts}</strong>
        <span>Scored Responses</span>
      </div>

      <div class="progress-stat">
        <strong>${scoredCorrect}</strong>
        <span>Correct</span>
      </div>

      <div class="progress-stat">
        <strong>${scoredAttempts ? `${scoredAccuracy}%` : "—"}</strong>
        <span>Overall Accuracy</span>
      </div>

      <div class="progress-stat">
        <strong>${recent.attempts ? `${recent.accuracy}%` : "—"}</strong>
        <span>Recent Accuracy · Last ${recent.attempts || 0}</span>
      </div>

      <div class="progress-stat">
        <strong>${topicsPracticed}</strong>
        <span>Topics Practiced</span>
      </div>

      <div class="progress-stat">
        <strong class="pv2-date-stat">${escapeHtml(formatShortDate(lastPracticed))}</strong>
        <span>Last Practiced</span>
      </div>
    `;

    activityTable.innerHTML = `
      ${buildNextPracticeSection()}

      <section class="pv2-report-section pv2-actfl-section">
        <div class="pv2-section-heading">
          <div>
            <h3>ACTFL-Informed Communication Practice</h3>
            <p>
              Practice groupings informed by ACTFL’s three communication modes; these activities are not treated as full mode assessments.
            </p>
          </div>
        </div>

        <div class="pv2-actfl-grid">
          ${buildActflCards()}
        </div>

        <div class="pv2-bridge-box">
          <strong>Foundational / bridge practice</strong>
          <span>
            Impara · Memoria · Parole in azione · Completa · Presentiamoci!
          </span>
        </div>

        <p class="pv2-standards-note">
          These site data summarize practice and response accuracy. They do not constitute an ACTFL proficiency rating.
        </p>
      </section>

      <section class="pv2-report-section">
        <h3>By Scored Activity</h3>
        <p class="progress-note">
          Accuracy is response-attempt accuracy. A retry is counted as another response attempt.
        </p>

        <table class="progress-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Responses</th>
              <th>Correct</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            ${buildScoredActivityRows()}
          </tbody>
        </table>
      </section>

      <section class="pv2-report-section pv2-memory-section">
        <h3>Practice / Exposure</h3>
        <div class="pv2-memory-box">
          <strong>Memoria · Memory</strong>
          <span>
            ${Number(memory.attempts) || 0} card-pair selections recorded
          </span>
          <small>
            Memoria is kept separate from accuracy because successful card selection depends partly on which cards are revealed.
          </small>
        </div>
      </section>
    `;

    topicTable.innerHTML = `
      <section class="pv2-report-section">
        <h3>By Topic</h3>
        <p class="progress-note">
          “Higher accuracy” and “Practice signal” appear only after at least 3 scored responses in an activity. Higher accuracy = 85% or above; a practice signal appears below 70%.
          ${progressData.sessions.length >= 500 ? " Detailed topic and attempt-history views use the most recent 500 saved response records; lifetime cumulative totals remain preserved in the overall and activity summaries." : ""}
        </p>

        <div class="pv2-topic-grid">
          ${buildTopicCards()}
        </div>
      </section>

      <section class="pv2-report-section">
        <h3>By Word / Expression</h3>
        <p class="pv2-tracking-note">
          Word/expression detail begins with attempts recorded after this tracking update. Older saved attempts remain included in the overall, activity, and topic totals but cannot be assigned retroactively to a specific word or expression.
        </p>

        <div class="progress-table-wrap pv2-word-table-wrap">
          <table class="progress-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Word / Expression</th>
                <th>English</th>
                <th>Responses</th>
                <th>Correct</th>
                <th>Accuracy</th>
                <th>Activities</th>
              </tr>
            </thead>
            <tbody>
              ${buildWordRows()}
            </tbody>
          </table>
        </div>
      </section>
    `;

    if (historyTable) {
      historyTable.innerHTML = `
        <section class="pv2-report-section">
          <h3>Attempt History</h3>

          <div class="progress-table-wrap">
            <table class="progress-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Activity</th>
                  <th>Word / Expression</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                ${buildAttemptHistoryRowsV2()}
              </tbody>
            </table>
          </div>
        </section>
      `;
    }
  }

  renderProgressReport =
    renderProgressReportV2;

  window.renderProgressReport =
    renderProgressReportV2;

  /* ========================================
     STYLES
     ======================================== */

  if (
    !document.querySelector(
      "#progressV2Styles"
    )
  ) {
    const style =
      document.createElement("style");

    style.id = "progressV2Styles";

    style.textContent = `
      .progress-card {
        width: min(1080px, 96vw);
      }

      .progress-summary {
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
      }

      .pv2-student-heading {
        grid-column: 1 / -1;
        margin: 0 0 2px;
        padding: 2px 2px 4px;
        font-size: 1rem;
        color: #43536b;
        text-align: left;
      }

      .pv2-student-heading strong {
        color: #274b84;
      }

      .pv2-date-stat {
        font-size: 1.18rem !important;
        line-height: 1.15;
      }

      .pv2-report-section {
        margin-top: 28px;
      }

      .pv2-report-section > h3,
      .pv2-section-heading h3 {
        margin: 0 0 8px;
        color: #274b84;
      }

      .pv2-section-heading p,
      .pv2-standards-note,
      .pv2-tracking-note {
        margin: 4px 0 0;
        color: #66758d;
        line-height: 1.45;
      }

      .pv2-next-section {
        margin-top: 22px;
        padding: 20px;
        border: 1px solid #d8e4f0;
        border-radius: 22px;
        background:
          linear-gradient(
            135deg,
            #f7fbff 0%,
            #ffffff 58%,
            #fffaf1 100%
          );
        box-shadow:
          0 7px 20px rgba(36, 57, 87, .06);
      }

      .pv2-next-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .pv2-next-kicker {
        display: block;
        margin-bottom: 4px;
        color: #d46c5c;
        font-size: .75rem;
        font-weight: 900;
        letter-spacing: .065em;
        text-transform: uppercase;
      }

      .pv2-next-heading h3 {
        margin: 0;
        color: #274b84;
        font-size: 1.28rem;
      }

      .pv2-next-heading p {
        max-width: 760px;
        margin: 6px 0 0;
        color: #66758d;
        font-size: .86rem;
        line-height: 1.48;
      }

      .pv2-next-grid {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 15px;
      }

      .pv2-next-card {
        min-width: 0;
        padding: 15px 16px 16px;
        border: 1px solid #dbe4ee;
        border-radius: 17px;
        background: #ffffff;
      }

      .pv2-next-card.is-support {
        border-top: 4px solid #d46c5c;
      }

      .pv2-next-card.is-stretch {
        border-top: 4px solid #498565;
      }

      .pv2-next-card.is-breadth {
        border-top: 4px solid #d9a93e;
      }

      .pv2-next-card.is-evidence {
        border-top: 4px solid #6f83a0;
      }

      .pv2-next-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .pv2-next-type {
        color: #66758d;
        font-size: .7rem;
        font-weight: 900;
        letter-spacing: .025em;
        text-transform: uppercase;
      }

      .pv2-next-topic-icon {
        font-size: 1.2rem;
        line-height: 1;
      }

      .pv2-next-card h4 {
        margin: 9px 0 0;
        color: #274b84;
        font-size: 1rem;
      }

      .pv2-next-topic-english {
        margin: 2px 0 0;
        color: #7a8798;
        font-size: .76rem;
      }

      .pv2-next-action {
        display: block;
        margin-top: 12px;
        color: #344f70;
        font-size: .92rem;
        line-height: 1.35;
      }

      .pv2-next-action-button {
        width: 100%;
        padding: 9px 11px;
        border: 1px solid #cad8e7;
        border-radius: 12px;
        background: #f7fbff;
        font: inherit;
        font-weight: 850;
        text-align: left;
        cursor: pointer;
        transition:
          transform .15s ease,
          border-color .15s ease,
          background .15s ease;
      }

      .pv2-next-action-button span {
        float: right;
        margin-left: 8px;
        font-size: 1rem;
      }

      .pv2-next-action-button:hover,
      .pv2-next-action-button:focus-visible {
        transform: translateY(-1px);
        border-color: #91aed0;
        background: #eef6ff;
      }

      .pv2-next-action-button:focus-visible {
        outline: 3px solid
          rgba(39, 75, 132, .18);
        outline-offset: 2px;
      }

      .pv2-next-detail {
        margin: 7px 0 0;
        color: #617188;
        font-size: .79rem;
        line-height: 1.45;
      }

      @media (max-width: 900px) {
        .pv2-next-grid {
          grid-template-columns: 1fr;
        }
      }

      .pv2-actfl-grid {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin-top: 15px;
      }

      .pv2-actfl-card {
        padding: 18px;
        border: 1px solid #d7e2ef;
        border-radius: 18px;
        background: #f8fbff;
      }

      .pv2-actfl-card h4 {
        margin: 0;
        color: #274b84;
        font-size: 1rem;
      }

      .pv2-actfl-card p {
        min-height: 38px;
        margin: 5px 0 12px;
        color: #66758d;
        font-size: .86rem;
      }

      .pv2-actfl-result strong {
        display: block;
        color: #274b84;
        font-size: 1.55rem;
      }

      .pv2-actfl-result span {
        display: block;
        margin-top: 2px;
        color: #465c78;
        font-size: .82rem;
        font-weight: 750;
      }

      .pv2-actfl-card small {
        display: block;
        margin-top: 11px;
        color: #718096;
        font-size: .74rem;
        line-height: 1.35;
      }

      .pv2-bridge-box,
      .pv2-memory-box {
        display: grid;
        gap: 4px;
        margin-top: 14px;
        padding: 14px 16px;
        border: 1px solid #ded7ca;
        border-radius: 16px;
        background: #fffaf3;
      }

      .pv2-bridge-box strong,
      .pv2-memory-box strong {
        color: #274b84;
      }

      .pv2-bridge-box span,
      .pv2-memory-box span,
      .pv2-memory-box small {
        color: #66758d;
      }

      .pv2-standards-note {
        margin-top: 12px;
        padding-left: 2px;
        font-size: .82rem;
        font-style: italic;
      }

      .pv2-topic-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-top: 15px;
      }

      .pv2-topic-card {
        min-width: 0;
        padding: 18px;
        border: 1px solid #d9e2ef;
        border-radius: 18px;
        background: #ffffff;
        box-shadow:
          0 5px 16px rgba(36, 57, 87, .06);
      }

      .pv2-topic-heading {
        display: flex;
        align-items: center;
        gap: 11px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e3e9f1;
      }

      .pv2-topic-icon {
        font-size: 1.7rem;
      }

      .pv2-topic-heading h4 {
        margin: 0;
        color: #274b84;
        font-size: 1.02rem;
      }

      .pv2-topic-heading p {
        margin: 2px 0 0;
        color: #718096;
        font-size: .82rem;
      }

      .pv2-topic-metrics {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .pv2-topic-metrics > div {
        min-width: 0;
        padding: 9px 7px;
        border-radius: 12px;
        background: #f6f9fd;
        text-align: center;
      }

      .pv2-topic-metrics strong {
        display: block;
        color: #274b84;
        font-size: 1rem;
      }

      .pv2-topic-metrics span {
        display: block;
        margin-top: 2px;
        color: #718096;
        font-size: .68rem;
        line-height: 1.2;
      }

      .pv2-topic-signals {
        margin-top: 13px;
      }

      .pv2-topic-signals p {
        margin: 6px 0;
        color: #53667f;
        font-size: .82rem;
        line-height: 1.35;
      }

      .pv2-topic-signals strong {
        color: #274b84;
      }

      .pv2-productive-row {
        margin-top: 13px;
        padding-top: 12px;
        border-top: 1px solid #e3e9f1;
      }

      .pv2-productive-row > strong {
        display: block;
        margin-bottom: 7px;
        color: #274b84;
        font-size: .82rem;
      }

      .pv2-productive-row > div {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pv2-productive-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 8px;
        border: 1px solid #d9e2ef;
        border-radius: 999px;
        color: #7a8798;
        background: #f7f8fa;
        font-size: .72rem;
        font-weight: 750;
      }

      .pv2-productive-chip.is-practiced {
        border-color: #bfd7c6;
        color: #356b48;
        background: #f1f8f3;
      }

      .pv2-tracking-note {
        padding: 12px 14px;
        border-left: 4px solid #c8d7e8;
        border-radius: 8px;
        background: #f7faff;
        font-size: .82rem;
      }

      .pv2-word-table-wrap {
        max-height: 520px;
        overflow: auto;
      }

      .pv2-empty {
        color: #718096;
      }

      /* =====================================
         PROGRESS VISUAL POLISH
         Keeps reporting logic unchanged.
         ===================================== */

      .progress-card {
        width: min(1120px, 96vw);
        max-height: 94vh;
        padding: 34px;
        border: 1px solid #dce6f2;
        border-radius: 30px;
        background:
          linear-gradient(
            180deg,
            #ffffff 0%,
            #fbfdff 100%
          );
        box-shadow:
          0 24px 70px
          rgba(25, 42, 68, .28);
      }

      .progress-card h2 {
        margin: 2px 56px 3px;
        color: #274b84;
        font-size: 1.72rem;
        line-height: 1.15;
        letter-spacing: -.015em;
      }

      .progress-subtitle {
        width: fit-content;
        margin: 0 auto 4px;
        padding: 5px 11px;
        border: 1px solid #dfe8f3;
        border-radius: 999px;
        background: #f6f9fd;
        color: #60718a;
        font-size: .8rem;
        font-weight: 800;
      }

      .progress-close {
        top: 15px;
        right: 16px;
        width: 40px;
        height: 40px;
        border: 1px solid #d7e2ef;
        background: #f6f9fd;
        box-shadow:
          0 3px 10px
          rgba(39, 75, 132, .08);
      }

      .progress-close:hover,
      .progress-close:focus-visible {
        background: #edf4fc;
      }

      .progress-summary {
        gap: 11px;
        margin: 22px 0 8px;
      }

      .pv2-student-heading {
        width: fit-content;
        margin: 0 0 3px;
        padding: 7px 11px;
        border: 1px solid #dce6f2;
        border-radius: 999px;
        background: #f8fbff;
        color: #52647c;
        font-size: .86rem;
        font-weight: 750;
      }

      .progress-stat {
        min-height: 86px;
        display: grid;
        align-content: center;
        padding: 13px 12px;
        border: 1px solid #dde6f0;
        border-top: 4px solid #7aa5cc;
        border-radius: 17px;
        background: #ffffff;
        box-shadow:
          0 4px 13px
          rgba(36, 57, 87, .045);
      }

      .progress-stat strong {
        color: #274b84;
        font-size: 1.48rem;
        line-height: 1.05;
      }

      .progress-stat span {
        margin-top: 4px;
        color: #66758d;
        font-size: .77rem;
        font-weight: 800;
        line-height: 1.2;
      }

      .pv2-date-stat {
        font-size: 1.03rem !important;
      }

      .progress-table-wrap {
        margin-top: 18px;
      }

      .pv2-report-section:not(.pv2-next-section) {
        margin-top: 20px;
        padding: 20px;
        border: 1px solid #e0e7f0;
        border-radius: 20px;
        background: #ffffff;
        box-shadow:
          0 4px 14px
          rgba(36, 57, 87, .04);
      }

      .pv2-report-section > h3,
      .pv2-section-heading h3 {
        margin-bottom: 5px;
        font-size: 1.08rem;
        letter-spacing: -.008em;
      }

      .pv2-next-section {
        margin-top: 20px;
        padding: 21px;
        border-color: #d6e3ef;
        box-shadow:
          0 7px 20px
          rgba(36, 57, 87, .055);
      }

      .pv2-next-grid {
        gap: 10px;
      }

      .pv2-next-card {
        padding: 14px 15px 15px;
        border-radius: 16px;
        box-shadow:
          0 3px 10px
          rgba(36, 57, 87, .035);
      }

      .pv2-next-action-button {
        background:
          linear-gradient(
            180deg,
            #f9fcff 0%,
            #f1f7fd 100%
          );
      }

      .pv2-actfl-grid {
        gap: 10px;
      }

      .pv2-actfl-card {
        padding: 15px;
        border-radius: 16px;
        background: #f9fbfe;
      }

      .pv2-bridge-box,
      .pv2-memory-box {
        border-color: #e5ddcf;
        background: #fffaf4;
      }

      .pv2-topic-grid {
        gap: 12px;
      }

      .pv2-topic-card {
        padding: 16px;
        border-radius: 16px;
        box-shadow:
          0 3px 11px
          rgba(36, 57, 87, .045);
      }

      .pv2-topic-metrics > div {
        border: 1px solid #e8edf4;
        background: #f8fafc;
      }

      .pv2-productive-chip {
        background: #f9fafc;
      }

      .progress-table {
        border: 1px solid #e0e7f0;
        border-radius: 14px;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
        background: #ffffff;
      }

      .progress-table th,
      .progress-table td {
        padding: 9px 11px;
      }

      .progress-table th {
        border-bottom: 1px solid #dbe4ee;
        background: #f3f7fb;
        color: #35577e;
        font-size: .78rem;
        letter-spacing: .01em;
      }

      .progress-table tbody tr:nth-child(even) td {
        background: #fbfcfe;
      }

      .progress-table tbody tr:last-child td {
        border-bottom: 0;
      }

      .progress-note {
        margin: 5px 0 11px;
        color: #718096;
        font-size: .8rem;
        line-height: 1.42;
        text-align: left;
      }

      .pv2-tracking-note {
        margin-bottom: 12px;
        border-left-color: #8eb2d2;
        background: #f7faff;
      }

      .progress-actions {
        gap: 9px;
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px solid #e5ebf2;
      }

      .progress-action-button {
        padding: 10px 16px;
        border-color: #cfdbe9;
        background: #f8fbff;
        box-shadow:
          0 2px 7px
          rgba(36, 57, 87, .04);
      }

      .progress-action-button:hover,
      .progress-action-button:focus-visible {
        background: #eef5fc;
      }

      @media (max-width: 800px) {
        .progress-card {
          padding: 26px 20px;
          border-radius: 24px;
        }

        .pv2-actfl-grid,
        .pv2-topic-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 620px) {
        .progress-summary,
        .pv2-topic-metrics {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }
      }

      @media print {
        .pv2-next-action-button {
          padding: 0;
          border: 0;
          background: transparent;
          pointer-events: none;
        }

        .pv2-next-action-button span {
          display: none;
        }

        .pv2-topic-grid {
          grid-template-columns: 1fr 1fr;
        }

        .pv2-word-table-wrap {
          max-height: none;
          overflow: visible;
        }
      }
    `;

    document.head.appendChild(style);
  }
})();
