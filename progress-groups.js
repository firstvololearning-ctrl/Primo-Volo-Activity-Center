"use strict";

(function initializeGroupedProgress() {
  const groups =
    window.PRIMO_VOLO_TOPIC_GROUPS || [];

  if (!groups.length) {
    return;
  }

  const style =
    document.createElement("style");

  style.textContent = `
    .progress-area-group {
      grid-column: 1 / -1;
      margin: 4px 0 12px;
    }

    .progress-area-heading {
      margin: 0 0 10px;
      padding: 10px 13px;

      background: #eef4fa;
      border-left: 4px solid #d96f5f;
      border-radius: 11px;

      color: #173f73;
    }

    .progress-area-heading strong {
      display: block;

      font-size: .9rem;
      font-weight: 850;
      line-height: 1.15;
    }

    .progress-area-heading span {
      display: block;

      margin-top: 2px;

      color: #6d7c90;

      font-size: .69rem;
      font-weight: 700;
      line-height: 1.15;
    }

    .progress-area-cards {
      display: grid;

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 14px;
    }

    .progress-area-group-other
    .progress-area-heading {
      border-left-color: #a8b5c5;
    }

    @media (max-width: 760px) {
      .progress-area-cards {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);


  function normalize(text) {
    return String(text || "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }


  function getTopicVariants() {
    const select =
      document.querySelector("#topicSelect");

    const map =
      new Map();

    if (!select) {
      return map;
    }

    [...select.options]
      .filter(option => option.value)
      .forEach(option => {
        const raw =
          option.textContent
            .replace(/\s+/g, " ")
            .trim();

        const parts =
          raw.split(" · ");

        const italian =
          normalize(parts[0]);

        const english =
          normalize(
            parts.slice(1).join(" · ")
          );

        map.set(
          option.value,
          [italian, english]
            .filter(Boolean)
        );
      });

    return map;
  }


  function findHeading() {
    return [...document.querySelectorAll(
      "h2, h3, h4"
    )].find(el =>
      normalize(el.textContent) ===
      "by topic"
    );
  }


  function getEndBoundary(heading) {
    const headings =
      [...document.querySelectorAll(
        "h2, h3, h4"
      )];

    const index =
      headings.indexOf(heading);

    for (
      let i = index + 1;
      i < headings.length;
      i += 1
    ) {
      const text =
        normalize(
          headings[i].textContent
        );

      if (
        text.includes("by word") ||
        text.includes("attempt history")
      ) {
        return headings[i];
      }
    }

    return null;
  }


  function isBetween(
    element,
    start,
    end
  ) {
    const afterStart =
      start.compareDocumentPosition(
        element
      ) &
      Node.DOCUMENT_POSITION_FOLLOWING;

    if (!afterStart) {
      return false;
    }

    if (!end) {
      return true;
    }

    const beforeEnd =
      element.compareDocumentPosition(
        end
      ) &
      Node.DOCUMENT_POSITION_FOLLOWING;

    return Boolean(beforeEnd);
  }


  function matchTopic(
    element,
    variants
  ) {
    const text =
      normalize(
        element.textContent
      );

    for (
      const [key, labels]
      of variants.entries()
    ) {
      if (
        labels.some(label =>
          label &&
          text.includes(label)
        )
      ) {
        return key;
      }
    }

    return null;
  }


  function findTopicGrid(
    heading,
    end,
    variants
  ) {
    const candidates =
      [...document.querySelectorAll("div")]
        .filter(div =>
          isBetween(
            div,
            heading,
            end
          )
        );

    let best = null;
    let bestScore = 0;

    candidates.forEach(div => {
      if (
        div.dataset.progressAreaGrouped ===
        "true"
      ) {
        return;
      }

      const children =
        [...div.children];

      if (children.length < 2) {
        return;
      }

      const score =
        children.filter(child =>
          matchTopic(
            child,
            variants
          )
        ).length;

      if (score > bestScore) {
        best = div;
        bestScore = score;
      }
    });

    return bestScore >= 2
      ? best
      : null;
  }


  function createGroup(
    group,
    cards
  ) {
    const section =
      document.createElement("section");

    section.className =
      "progress-area-group";

    section.dataset.progressArea =
      group.id;

    section.innerHTML = `
      <div class="progress-area-heading">
        <strong>
          ${group.italian}
        </strong>

        <span>
          ${group.english}
        </span>
      </div>

      <div class="progress-area-cards">
      </div>
    `;

    const cardWrap =
      section.querySelector(
        ".progress-area-cards"
      );

    cards.forEach(card => {
      cardWrap.appendChild(card);
    });

    return section;
  }


  function organizeProgress() {
    /*
      Once the topic cards have been grouped,
      do not group the generated sections again.
    */
    if (
      document.querySelector(
        ".progress-area-group"
      )
    ) {
      return;
    }

    const heading =
      findHeading();

    if (!heading) {
      return;
    }

    const end =
      getEndBoundary(heading);

    const variants =
      getTopicVariants();

    const grid =
      findTopicGrid(
        heading,
        end,
        variants
      );

    if (!grid) {
      return;
    }

    if (
      grid.dataset.progressAreaGrouped ===
      "true"
    ) {
      return;
    }

    const cards =
      [...grid.children];

    const cardsByTopic =
      new Map();

    cards.forEach(card => {
      const key =
        matchTopic(
          card,
          variants
        );

      if (key) {
        cardsByTopic.set(
          key,
          card
        );
      }
    });

    if (!cardsByTopic.size) {
      return;
    }

    const used =
      new Set();

    const fragment =
      document.createDocumentFragment();

    groups.forEach(group => {
      const groupCards =
        group.topics
          .map(key =>
            cardsByTopic.get(key)
          )
          .filter(Boolean);

      if (!groupCards.length) {
        return;
      }

      groupCards.forEach(card =>
        used.add(card)
      );

      fragment.appendChild(
        createGroup(
          group,
          groupCards
        )
      );
    });

    const remaining =
      cards.filter(card =>
        !used.has(card)
      );

    if (remaining.length) {
      const other =
        createGroup(
          {
            id: "other",
            italian:
              "Altri argomenti",
            english:
              "Other Topics"
          },
          remaining
        );

      other.classList.add(
        "progress-area-group-other"
      );

      fragment.appendChild(other);
    }

    grid.innerHTML = "";
    grid.appendChild(fragment);

    grid.dataset.progressAreaGrouped =
      "true";

    /*
      Grouping is complete. Stop observing so
      our generated markup cannot trigger another pass.
    */
    observer.disconnect();
  }


  let timer = null;

  const observer =
    new MutationObserver(() => {
      clearTimeout(timer);

      timer =
        setTimeout(
          organizeProgress,
          40
        );
    });

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  document.addEventListener(
    "click",
    () => {
      setTimeout(
        organizeProgress,
        70
      );
    }
  );

  organizeProgress();
})();
