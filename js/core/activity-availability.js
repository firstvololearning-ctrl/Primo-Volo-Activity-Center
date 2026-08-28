"use strict";

/*
  Canonical topic/activity availability.

  These rules describe which top-level activities belong to each
  topic. Temporary UI prerequisites, practiced status, accuracy,
  mastery, and learner storage intentionally do not live here.
*/
(function initializePrimoVoloActivityAvailability() {
  if (window.PrimoVoloActivityAvailability) {
    return;
  }

  const TOPIC_KEYS = new Set([
    "greetings",
    "hobbies",
    "supplies",
    "food",
    "clothing",
    "bodyParts",
    "home",
    "places",
    "prepositions",
    "family",
    "colors",
    "adjectives",
    "feelings",
    "numbers",
    "animals",
    "routines",
    "days",
    "months",
    "time",
    "weather",
    "seasons",
    "classroom"
  ]);

  const DEFAULT_MODES = Object.freeze([
    "learn",
    "choose",
    "match-word",
    "match-sound",
    "memory",
    "words-in-action",
    "assemble-sentences",
    "complete",
    "write"
  ]);

  const TOPIC_OVERRIDES = Object.freeze({
    greetings: Object.freeze({
      add: Object.freeze([
        "introductions-practice"
      ])
    }),
    time: Object.freeze({
      remove: Object.freeze([
        "words-in-action"
      ])
    }),
    weather: Object.freeze({
      remove: Object.freeze([
        "words-in-action"
      ]),
      add: Object.freeze([
        "conversation-practice"
      ])
    }),
    classroom: Object.freeze({
      remove: Object.freeze([
        "words-in-action",
        "assemble-sentences"
      ]),
      add: Object.freeze([
        "conversation-practice"
      ])
    })
  });

  const COMING_SOON_MODES = Object.freeze([
    "sentences"
  ]);

  function isKnownTopic(topicKey) {
    return TOPIC_KEYS.has(topicKey);
  }

  function getCanonicalModes(topicKey) {
    if (!isKnownTopic(topicKey)) {
      return [];
    }

    const override =
      TOPIC_OVERRIDES[topicKey] || {};
    const removed = new Set(
      override.remove || []
    );

    return [
      ...DEFAULT_MODES.filter(
        mode => !removed.has(mode)
      ),
      ...(override.add || [])
    ];
  }

  function isCanonicalMode(
    topicKey,
    mode
  ) {
    return getCanonicalModes(
      topicKey
    ).includes(mode);
  }

  function getComingSoonModes(topicKey) {
    return isKnownTopic(topicKey)
      ? [...COMING_SOON_MODES]
      : [];
  }

  function getTemporaryRequirements(
    topicKey,
    mode
  ) {
    if (
      topicKey === "greetings" &&
      isCanonicalMode(topicKey, mode)
    ) {
      return [
        {
          id: "volo-age",
          type: "setup"
        }
      ];
    }

    return [];
  }

  /*
    Read-only developer check for the rules most likely to drift.
  */
  function validate() {
    const checks = {
      timeExcludesWords:
        !isCanonicalMode(
          "time",
          "words-in-action"
        ),
      weatherHasConversation:
        isCanonicalMode(
          "weather",
          "conversation-practice"
        ),
      weatherExcludesWords:
        !isCanonicalMode(
          "weather",
          "words-in-action"
        ),
      classroomHasConversation:
        isCanonicalMode(
          "classroom",
          "conversation-practice"
        ),
      classroomExcludesWords:
        !isCanonicalMode(
          "classroom",
          "words-in-action"
        ),
      classroomExcludesAssemble:
        !isCanonicalMode(
          "classroom",
          "assemble-sentences"
        ),
      greetingsHasIntroductions:
        isCanonicalMode(
          "greetings",
          "introductions-practice"
        ),
      sentencesNeverCanonical:
        [...TOPIC_KEYS].every(
          topicKey =>
            !isCanonicalMode(
              topicKey,
              "sentences"
            )
        )
    };

    return {
      valid: Object.values(checks)
        .every(Boolean),
      checks: { ...checks }
    };
  }

  window.PrimoVoloActivityAvailability =
    Object.freeze({
      isKnownTopic,
      getCanonicalModes,
      isCanonicalMode,
      getComingSoonModes,
      getTemporaryRequirements,
      validate
    });
})();
