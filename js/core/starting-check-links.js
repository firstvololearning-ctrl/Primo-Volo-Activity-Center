"use strict";

/*
  Primo Volo deep links for topic entry and Starting Checks.

  Examples:
    index.html?topic=supplies
    index.html?topic=supplies&startingCheck=1
    index.html?topic=numbers&startingCheck=1
    index.html?topic=colors&startingCheck=1
*/
(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  const topic = params.get("topic");
  const startRequested =
    params.get("startingCheck") === "1";

  if (!topic) {
    return;
  }

  const topicSelect =
    document.getElementById("topicSelect");

  if (!topicSelect) {
    return;
  }

  const topicExists = [
    ...topicSelect.options
  ].some(option => option.value === topic);

  if (!topicExists) {
    return;
  }

  topicSelect.value = topic;
  topicSelect.dispatchEvent(
    new Event("change", { bubbles: true })
  );

  if (!startRequested) {
    return;
  }

  const STARTING_CHECK_SELECTORS = {
    supplies:
      ".supplies-starting-check:not([hidden]) " +
      '[data-action="start"]',
    numbers:
      ".numbers-starting-check:not([hidden]) " +
      '[data-action="start"]',
    colors:
      ".colors-starting-check:not([hidden]) " +
      '[data-action="start"]',
    days:
      ".days-starting-check:not([hidden]) " +
      '[data-action="start"]',
    weather:
      ".weather-starting-check:not([hidden]) " +
      '[data-action="start"]',
    seasons:
      ".seasons-starting-check:not([hidden]) " +
      '[data-action="start"]'
  };

  const selector =
    STARTING_CHECK_SELECTORS[topic];

  if (!selector) {
    return;
  }

  let attempts = 0;

  const openStartingCheck = () => {
    attempts += 1;

    const startButton =
      document.querySelector(selector);

    if (startButton) {
      /*
        Remove only the auto-start flag so a refresh
        does not unexpectedly begin a new check.
      */
      params.delete("startingCheck");

      const nextQuery = params.toString();

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}` +
        `${nextQuery ? `?${nextQuery}` : ""}` +
        `${window.location.hash || ""}`
      );

      startButton.click();
      return;
    }

    if (attempts < 30) {
      window.setTimeout(
        openStartingCheck,
        100
      );
    }
  };

  window.setTimeout(
    openStartingCheck,
    100
  );
})();
