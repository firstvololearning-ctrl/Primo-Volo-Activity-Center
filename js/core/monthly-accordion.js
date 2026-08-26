"use strict";

/*
  Primo Volo d'Italiano
  Monthly Curriculum accordion

  Existing month content stays in the HTML.
  One month opens at a time.
  Month-jump links open the destination month.
*/

(function initializeMonthlyAccordion() {
  const cards =
    [...document.querySelectorAll(
      "article.month-card"
    )];

  if (!cards.length) {
    return;
  }

  function directHeader(card) {
    return [...card.children]
      .find(
        child =>
          child.matches?.(
            "header.month-heading"
          )
      ) || null;
  }

  function directBody(card) {
    return [...card.children]
      .find(
        child =>
          child.classList?.contains(
            "month-card-body"
          )
      ) || null;
  }

  function closeCard(card) {
    const body =
      directBody(card);

    const toggle =
      card.querySelector(
        ".month-toggle"
      );

    if (!body || !toggle) {
      return;
    }

    body.hidden = true;

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    card.classList.remove(
      "is-open"
    );
  }

  function openCard(
    card,
    {
      closeOthers = true,
      scroll = false
    } = {}
  ) {
    const body =
      directBody(card);

    const toggle =
      card.querySelector(
        ".month-toggle"
      );

    if (!body || !toggle) {
      return;
    }

    if (closeOthers) {
      cards.forEach(
        other => {
          if (other !== card) {
            closeCard(other);
          }
        }
      );
    }

    body.hidden = false;

    toggle.setAttribute(
      "aria-expanded",
      "true"
    );

    card.classList.add(
      "is-open"
    );

    if (scroll) {
      card.scrollIntoView({
        behavior:
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
        block: "start"
      });
    }
  }

  cards.forEach(
    (card, index) => {
      if (
        card.dataset.monthAccordionReady ===
        "true"
      ) {
        return;
      }

      const header =
        directHeader(card);

      if (!header) {
        return;
      }

      const monthName =
        header.querySelector(
          ".month-name"
        )?.textContent?.trim() ||
        `Mese ${index + 1}`;

      const title =
        header.querySelector(
          "h2"
        )?.textContent?.trim() ||
        "";

      const body =
        document.createElement(
          "div"
        );

      body.className =
        "month-card-body";

      body.id =
        `monthBody-${card.id || index + 1}`;

      const content =
        [...card.children]
          .filter(
            child =>
              child !== header
          );

      content.forEach(
        child => {
          body.appendChild(child);
        }
      );

      const toggle =
        document.createElement(
          "button"
        );

      toggle.type =
        "button";

      toggle.className =
        "month-toggle";

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      toggle.setAttribute(
        "aria-controls",
        body.id
      );

      toggle.setAttribute(
        "aria-label",
        `Apri o chiudi ${monthName}: ${title}`
      );

      toggle.innerHTML = `
        <span
          class="month-toggle-chevron"
          aria-hidden="true"
        >▾</span>
      `;

      header.appendChild(
        toggle
      );

      card.appendChild(
        body
      );

      header.addEventListener(
        "click",
        event => {
          if (
            event.target.closest("a")
          ) {
            return;
          }

          const wasOpen =
            card.classList.contains(
              "is-open"
            );

          if (wasOpen) {
            closeCard(card);
          } else {
            openCard(card);
          }
        }
      );

      card.dataset.monthAccordionReady =
        "true";

      closeCard(card);
    }
  );

  document
    .querySelectorAll(
      '.month-nav a[href^="#"]'
    )
    .forEach(
      link => {
        link.addEventListener(
          "click",
          event => {
            const href =
              link.getAttribute(
                "href"
              );

            if (
              !href ||
              href.length < 2
            ) {
              return;
            }

            const id =
              decodeURIComponent(
                href.slice(1)
              );

            const card =
              document.getElementById(
                id
              );

            if (
              !card ||
              !card.classList.contains(
                "month-card"
              )
            ) {
              return;
            }

            event.preventDefault();

            if (
              window.history
                ?.replaceState
            ) {
              window.history.replaceState(
                null,
                "",
                `#${id}`
              );
            }

            openCard(
              card,
              {
                closeOthers: true,
                scroll: true
              }
            );
          }
        );
      }
    );

  const requestedId =
    window.location.hash
      ? decodeURIComponent(
          window.location.hash.slice(1)
        )
      : "";

  const requestedCard =
    requestedId
      ? document.getElementById(
          requestedId
        )
      : null;

  if (
    requestedCard &&
    requestedCard.classList.contains(
      "month-card"
    )
  ) {
    openCard(
      requestedCard,
      {
        closeOthers: true,
        scroll: false
      }
    );
  } else {
    openCard(
      cards[0],
      {
        closeOthers: true,
        scroll: false
      }
    );
  }

  window.addEventListener(
    "hashchange",
    () => {
      const id =
        decodeURIComponent(
          window.location.hash.slice(1)
        );

      const card =
        document.getElementById(
          id
        );

      if (
        card &&
        card.classList.contains(
          "month-card"
        )
      ) {
        openCard(
          card,
          {
            closeOthers: true,
            scroll: true
          }
        );
      }
    }
  );
})();
