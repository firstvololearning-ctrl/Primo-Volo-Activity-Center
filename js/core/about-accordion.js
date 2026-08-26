"use strict";

/*
  Primo Volo d'Italiano
  Digestible About accordion

  Keeps all existing About content and language-switch behavior.
  Only changes how much is visible at one time.
*/

(function initializeAboutAccordion() {
  function directHeading(section) {
    return [...section.children]
      .find(
        child =>
          child.tagName === "H3"
      ) || null;
  }

  function buildAccordion() {
    const sections =
      [...document.querySelectorAll(
        ".about-section"
      )];

    if (!sections.length) {
      return;
    }

    sections.forEach(
      (section, index) => {
        if (
          section.dataset.aboutAccordionReady ===
          "true"
        ) {
          return;
        }

        const heading =
          directHeading(section);

        if (!heading) {
          return;
        }

        const body =
          document.createElement("div");

        body.className =
          "about-section-body";

        body.id =
          `aboutSectionBody${index + 1}`;

        const contentNodes =
          [...section.children]
            .filter(
              child =>
                child !== heading
            );

        contentNodes.forEach(
          child => {
            body.appendChild(child);
          }
        );

        const button =
          document.createElement("button");

        button.type =
          "button";

        button.className =
          "about-section-toggle";

        button.setAttribute(
          "aria-controls",
          body.id
        );

        const label =
          document.createElement("span");

        label.className =
          "about-section-toggle-label";

        while (heading.firstChild) {
          label.appendChild(
            heading.firstChild
          );
        }

        const chevron =
          document.createElement("span");

        chevron.className =
          "about-section-toggle-chevron";

        chevron.setAttribute(
          "aria-hidden",
          "true"
        );

        chevron.textContent =
          "▾";

        button.append(
          label,
          chevron
        );

        heading.appendChild(button);
        section.appendChild(body);

        /*
          Keep the first About section open as the
          immediate overview; collapse the rest.
        */
        let isOpen =
          index === 0;

        function render() {
          body.hidden =
            !isOpen;

          button.setAttribute(
            "aria-expanded",
            String(isOpen)
          );

          section.classList.toggle(
            "is-open",
            isOpen
          );
        }

        button.addEventListener(
          "click",
          () => {
            isOpen =
              !isOpen;

            render();
          }
        );

        section.dataset.aboutAccordionReady =
          "true";

        render();
      }
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      buildAccordion,
      { once: true }
    );
  } else {
    buildAccordion();
  }
})();
