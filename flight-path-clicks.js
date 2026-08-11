"use strict";

/*
  Primo Volo
  Flight Path Navigation

  The Flight Path remains a progress/practice display,
  but each path step can also open the corresponding
  activity card below.
*/

(function enableFlightPathNavigation() {

  const STEP_LABELS = [
    "Impara",
    "Scegli",
    "Abbina",
    "Ascolta",
    "Memoria",
    "Parole in azione",
    "Assembla",
    "Completa",
    "Scrivi",
    "Frasi"
  ];


  function normalize(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim();
  }


  function findFlightPath() {

    const direct =
      document.querySelector(
        "#voloFlightPath, " +
        "#flightPath, " +
        ".volo-flight-path, " +
        ".flight-path"
      );

    if (direct) {
      return direct;
    }

    /*
      Fallback:
      locate the smallest section/div containing
      the Flight Path headings.
    */
    const candidates =
      [...document.querySelectorAll("section, div")]
        .filter(element => {
          const text =
            normalize(element.textContent);

          return (
            text.includes("Il viaggio di Volo") &&
            text.includes("Volo's Learning Journey") &&
            text.includes("Impara") &&
            text.includes("Scegli") &&
            text.includes("Abbina")
          );
        });

    if (!candidates.length) {
      return null;
    }

    candidates.sort(
      (a, b) =>
        normalize(a.textContent).length -
        normalize(b.textContent).length
    );

    return candidates[0];
  }


  function getStepLabel(target, path) {

    let node = target;

    while (
      node &&
      node !== path
    ) {
      const text =
        normalize(node.textContent);

      const matches =
        STEP_LABELS.filter(
          label =>
            text === label ||
            text.startsWith(label + " ") ||
            text.endsWith(" " + label)
        );

      if (matches.length === 1) {
        return matches[0];
      }

      node =
        node.parentElement;
    }

    return null;
  }


  function findActivityButton(label) {

    const buttons =
      [
        ...document.querySelectorAll(
          ".activity-button"
        )
      ];

    return buttons.find(
      button => {
        const text =
          normalize(button.textContent);

        return (
          text === label ||
          text.startsWith(label + " ") ||
          text.includes(label)
        );
      }
    ) || null;
  }


  function decorateSteps(path) {

    const allElements =
      [
        ...path.querySelectorAll("*")
      ];

    STEP_LABELS.forEach(
      label => {

        const candidates =
          allElements.filter(
            element => {
              const text =
                normalize(
                  element.textContent
                );

              return (
                text === label ||
                text.startsWith(
                  label + " "
                )
              );
            });

        if (!candidates.length) {
          return;
        }

        /*
          Prefer the smallest element containing
          this individual path step.
        */
        candidates.sort(
          (a, b) =>
            a.children.length -
            b.children.length
        );

        let step =
          candidates[0];

        /*
          Usually the label is inside the circular
          step wrapper. Move upward until we find
          the useful clickable unit, without leaving
          the Flight Path.
        */
        while (
          step.parentElement &&
          step.parentElement !== path
        ) {
          const parentText =
            normalize(
              step.parentElement.textContent
            );

          const labelCount =
            STEP_LABELS.filter(
              item =>
                parentText.includes(item)
            ).length;

          if (labelCount !== 1) {
            break;
          }

          step =
            step.parentElement;
        }

        const activityButton =
          findActivityButton(label);

        const unavailable =
          !activityButton ||
          activityButton.disabled ||
          activityButton
            .getAttribute(
              "aria-disabled"
            ) === "true";

        step.dataset
          .voloPathNavigation =
          label;

        step.style.cursor =
          unavailable
            ? "default"
            : "pointer";

        if (!unavailable) {
          step.setAttribute(
            "role",
            "button"
          );

          step.setAttribute(
            "tabindex",
            "0"
          );

          step.setAttribute(
            "aria-label",
            `${label}: open activity`
          );
        }
      }
    );
  }


  function openActivity(label) {

    const activityButton =
      findActivityButton(label);

    if (
      !activityButton ||
      activityButton.disabled ||
      activityButton
        .getAttribute(
          "aria-disabled"
        ) === "true"
    ) {
      return;
    }

    activityButton.click();

    /*
      Bring the actual activity into view,
      but do not jump abruptly.
    */
    window.setTimeout(
      () => {
        activityButton.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      },
      80
    );
  }


  function initialize() {

    const path =
      findFlightPath();

    if (!path) {
      return false;
    }

    if (
      path.dataset
        .voloNavigationReady ===
      "true"
    ) {
      decorateSteps(path);
      return true;
    }

    path.dataset
      .voloNavigationReady =
      "true";

    decorateSteps(path);


    path.addEventListener(
      "click",
      event => {

        const explicitStep =
          event.target.closest(
            "[data-volo-path-navigation]"
          );

        let label =
          explicitStep?.dataset
            .voloPathNavigation;

        if (!label) {
          label =
            getStepLabel(
              event.target,
              path
            );
        }

        if (!label) {
          return;
        }

        event.preventDefault();

        openActivity(label);
      }
    );


    path.addEventListener(
      "keydown",
      event => {

        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }

        const step =
          event.target.closest(
            "[data-volo-path-navigation]"
          );

        if (!step) {
          return;
        }

        const label =
          step.dataset
            .voloPathNavigation;

        if (!label) {
          return;
        }

        event.preventDefault();

        openActivity(label);
      }
    );

    return true;
  }


  /*
    Flight Path is rendered dynamically,
    so try immediately and also watch briefly
    for topic/activity rerenders.
  */

  initialize();

  const observer =
    new MutationObserver(
      () => {
        initialize();
      }
    );

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

})();
