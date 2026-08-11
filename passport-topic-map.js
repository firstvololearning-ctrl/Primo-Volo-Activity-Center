"use strict";

/*
  Primo Volo d'Italiano
  Topic → Italian Region Passport Map

  IMPORTANT:
  These assignments are intentionally explicit.

  Do NOT automatically recalculate them based on
  topic position. That prevents a future topic from
  changing stamps learners have already earned.

  Initial assignment:
  Primo Volo topics in site order
  →
  Italy's 20 regions in alphabetical order.
*/

window.PASSPORT_TOPIC_MAP = {

  greetings: {
    regionId: "abruzzo"
  },

  supplies: {
    regionId: "basilicata"
  },

  food: {
    regionId: "calabria"
  },

  clothing: {
    regionId: "campania"
  },

  bodyParts: {
    regionId: "emilia-romagna"
  },

  home: {
    regionId: "friuli-venezia-giulia"
  },

  places: {
    regionId: "lazio"
  },

  prepositions: {
    regionId: "liguria"
  },

  family: {
    regionId: "lombardia"
  },

  colors: {
    regionId: "marche"
  },

  adjectives: {
    regionId: "molise"
  },

  feelings: {
    regionId: "piemonte"
  },

  numbers: {
    regionId: "puglia"
  },

  animals: {
    regionId: "sardegna"
  },

  days: {
    regionId: "sicilia"
  },

  months: {
    regionId: "toscana"
  },

  time: {
    regionId: "trentino-alto-adige"
  },

  weather: {
    regionId: "umbria"
  },

  seasons: {
    regionId: "valle-daosta"
  },

  classroom: {
    regionId: "veneto"
  }

};


/* ========================================
   HELPERS
   ======================================== */

window.getPassportRegionForTopic =
  function getPassportRegionForTopic(topicId) {

    const assignment =
      window.PASSPORT_TOPIC_MAP[topicId];

    if (!assignment) {
      return null;
    }

    if (
      typeof window.getPassportRegionById !==
      "function"
    ) {
      return null;
    }

    return window.getPassportRegionById(
      assignment.regionId
    );
  };


window.getPassportTopicAssignment =
  function getPassportTopicAssignment(topicId) {

    return (
      window.PASSPORT_TOPIC_MAP[topicId] ||
      null
    );
  };


/*
  Development validation.

  If a mapped region is missing from
  passport-regions.js, show a warning
  rather than silently breaking.
*/

Object.entries(
  window.PASSPORT_TOPIC_MAP
).forEach(([topicId, assignment]) => {

  if (
    typeof window.getPassportRegionById !==
    "function"
  ) {
    return;
  }

  const region =
    window.getPassportRegionById(
      assignment.regionId
    );

  if (!region) {
    console.warn(
      `Passport region "${assignment.regionId}" ` +
      `for topic "${topicId}" was not found.`
    );
  }
});
