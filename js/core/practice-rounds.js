"use strict";

/*
  Primo Volo d'Italiano
  Coverage-first practice rounds

  Instructional rule:
  - random order
  - every eligible target appears once before repetition
  - finite round endpoint
  - Practice Again starts a fresh shuffled round
  - round completion means coverage, not mastery

  Round state is intentionally session-only. It resets on refresh
  and when the current student changes.
*/
(function initializePrimoVoloPracticeRounds() {
  if (window.PrimoVoloPracticeRounds) {
    return;
  }

  const states = new Map();
  const lastItemByRound = new Map();

  function shuffle(items) {
    const result = [...items];

    for (
      let index = result.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(
          Math.random() * (index + 1)
        );

      [
        result[index],
        result[randomIndex]
      ] = [
        result[randomIndex],
        result[index]
      ];
    }

    return result;
  }

  function defaultItemKey(item, index) {
    if (item && typeof item === "object") {
      return [
        item.id || "",
        item.italian || "",
        item.english || "",
        item.image || "",
        index
      ].join("|");
    }

    return `${String(item)}|${index}`;
  }

  function roundKey(activity, topicKey) {
    return `${topicKey || "no-topic"}::${activity}`;
  }

  function itemKeys(items, keyFn) {
    return items.map(
      (item, index) =>
        keyFn(item, index)
    );
  }

  function signatureFor(items, keyFn) {
    return itemKeys(items, keyFn)
      .join("~~~");
  }

  function buildState(
    activity,
    topicKey,
    items,
    keyFn
  ) {
    const key =
      roundKey(activity, topicKey);

    const source = [...items];
    const keys =
      itemKeys(source, keyFn);

    let queue =
      shuffle(
        source.map((item, index) => ({
          item,
          itemKey: keys[index]
        }))
      );

    /*
      Avoid an immediate apparent repeat when a
      new round starts with the same target that
      ended the previous round.
    */
    const previousLast =
      lastItemByRound.get(key);

    if (
      previousLast &&
      queue.length > 1 &&
      queue[0].itemKey === previousLast
    ) {
      const swapIndex =
        queue.findIndex(
          entry =>
            entry.itemKey !== previousLast
        );

      if (swapIndex > 0) {
        [
          queue[0],
          queue[swapIndex]
        ] = [
          queue[swapIndex],
          queue[0]
        ];
      }
    }

    const state = {
      activity,
      topicKey,
      signature:
        signatureFor(source, keyFn),
      keyFn,
      total: source.length,
      queue,
      presented: 0,
      startedAt:
        new Date().toISOString()
    };

    states.set(key, state);
    return state;
  }

  function getState(
    activity,
    topicKey,
    items,
    keyFn = defaultItemKey
  ) {
    const key =
      roundKey(activity, topicKey);

    const current =
      states.get(key);

    const signature =
      signatureFor(items, keyFn);

    if (
      !current ||
      current.signature !== signature
    ) {
      return buildState(
        activity,
        topicKey,
        items,
        keyFn
      );
    }

    return current;
  }

  function next(
    activity,
    topicKey,
    items,
    keyFn = defaultItemKey
  ) {
    const source =
      Array.isArray(items)
        ? items
        : [];

    const state =
      getState(
        activity,
        topicKey,
        source,
        keyFn
      );

    if (!state.queue.length) {
      return {
        complete: true,
        item: null,
        total: state.total,
        presented: state.presented,
        remaining: 0
      };
    }

    const entry =
      state.queue.shift();

    state.presented += 1;

    lastItemByRound.set(
      roundKey(activity, topicKey),
      entry.itemKey
    );

    return {
      complete: false,
      item: entry.item,
      total: state.total,
      presented: state.presented,
      remaining: state.queue.length
    };
  }

  function nextBatch(
    activity,
    topicKey,
    items,
    batchSize = 6,
    keyFn = defaultItemKey
  ) {
    const source =
      Array.isArray(items)
        ? items
        : [];

    const state =
      getState(
        activity,
        topicKey,
        source,
        keyFn
      );

    if (!state.queue.length) {
      return {
        complete: true,
        items: [],
        total: state.total,
        presented: state.presented,
        remaining: 0
      };
    }

    const count =
      Math.max(
        1,
        Math.min(
          Number(batchSize) || 1,
          state.queue.length
        )
      );

    const entries =
      state.queue.splice(0, count);

    state.presented +=
      entries.length;

    const lastEntry =
      entries[entries.length - 1];

    if (lastEntry) {
      lastItemByRound.set(
        roundKey(activity, topicKey),
        lastEntry.itemKey
      );
    }

    return {
      complete: false,
      items:
        entries.map(entry => entry.item),
      total: state.total,
      presented: state.presented,
      remaining: state.queue.length
    };
  }

  function restart(
    activity,
    topicKey
  ) {
    states.delete(
      roundKey(activity, topicKey)
    );
  }

  function resetAll() {
    states.clear();
  }

  function ensureStyles() {
    if (
      document.querySelector(
        "#pvPracticeRoundStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "pvPracticeRoundStyles";

    style.textContent = `
      .pv-round-complete {
        width: min(720px, 100%);
        margin: 0 auto;
        padding: 30px 24px;
        border: 2px solid #d8e4ef;
        border-radius: 24px;
        background: white;
        box-shadow:
          0 10px 28px rgba(36, 57, 87, .10);
        text-align: center;
      }

      .pv-round-complete h4 {
        margin: 0;
        color: var(--blue-dark, #274b84);
        font-size: clamp(1.45rem, 3vw, 1.9rem);
      }

      .pv-round-complete-count {
        margin: 14px 0 0;
        color: #337a4d;
        font-size: 1.08rem;
        font-weight: 900;
      }

      .pv-round-complete-note {
        max-width: 580px;
        margin: 10px auto 0;
        color: var(--muted, #66758d);
        line-height: 1.5;
      }

      .pv-round-complete-actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
      }

      .pv-round-secondary {
        padding: 10px 16px;
        border: 1px solid
          var(--border, #d9e2ef);
        border-radius: 999px;
        color: var(--blue-dark, #274b84);
        background: white;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }
    `;

    document.head.appendChild(style);
  }

  function renderComplete(
    container,
    {
      activity,
      topicKey,
      total,
      onRestart
    }
  ) {
    if (!container) {
      return;
    }

    ensureStyles();

    container.innerHTML = `
      <div
        class="pv-round-complete"
        role="status"
        aria-live="polite"
      >
        <h4>
          🎉 Giro completato
          <span lang="en">
            · Round Complete
          </span>
        </h4>

        <p class="pv-round-complete-count">
          ${total}
          ${
            total === 1
              ? "obiettivo presentato"
              : "obiettivi presentati"
          }
          ·
          ${total}
          ${
            total === 1
              ? "target presented"
              : "targets presented"
          }
        </p>

        <p class="pv-round-complete-note">
          Hai incontrato ogni obiettivo disponibile
          almeno una volta in questo giro.
          <span lang="en">
            You were presented with every available
            target at least once in this round.
          </span>
        </p>

        <p class="pv-round-complete-note">
          Il giro indica copertura della pratica,
          non padronanza.
          <span lang="en">
            Round completion shows practice coverage,
            not mastery.
          </span>
        </p>

        <div class="pv-round-complete-actions">
          <button
            type="button"
            class="next-question-button"
            data-pv-round-restart
          >
            🔄 Pratica ancora
            · Practice Again
          </button>

          <button
            type="button"
            class="pv-round-secondary"
            data-pv-round-choose
          >
            Scegli un’altra attività
            · Choose Another Activity
          </button>
        </div>
      </div>
    `;

    container
      .querySelector(
        "[data-pv-round-restart]"
      )
      ?.addEventListener(
        "click",
        () => {
          restart(
            activity,
            topicKey
          );

          if (
            typeof onRestart ===
            "function"
          ) {
            onRestart();
          }
        }
      );

    container
      .querySelector(
        "[data-pv-round-choose]"
      )
      ?.addEventListener(
        "click",
        () => {
          document
            .querySelector(
              ".activity-menu"
            )
            ?.scrollIntoView({
              behavior:
                window.matchMedia(
                  "(prefers-reduced-motion: reduce)"
                ).matches
                  ? "auto"
                  : "smooth",
              block: "center"
            });
        }
      );
  }

  window.addEventListener(
    "primo-volo-student-changed",
    resetAll
  );

  window.PrimoVoloPracticeRounds =
    Object.freeze({
      next,
      nextBatch,
      restart,
      resetAll,
      renderComplete
    });
})();
