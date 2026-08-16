"use strict";

(function initializeTopicPicker() {
  const select =
    document.querySelector("#topicSelect");

  const wrap =
    document.querySelector(".topic-select-wrap");

  if (!select || !wrap) {
    return;
  }

  const groups =
    window.PRIMO_VOLO_TOPIC_GROUPS || [];

  const style =
    document.createElement("style");

  style.id = "topicPickerStyles";

  style.textContent = `
    .topic-select-wrap {
      position: relative;
    }

    #topicSelect.topic-select-native {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    .topic-picker {
      position: relative;
      width: min(760px, 100%);
      margin: 0 auto;
    }

    .topic-picker-trigger {
      width: 100%;
      min-height: 62px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      padding: 10px 16px 10px 18px;

      background: #ffffff;
      border: 2px solid #d7e2ef;
      border-radius: 18px;

      box-shadow:
        0 8px 22px
        rgba(31, 75, 125, 0.08);

      cursor: pointer;
      text-align: left;

      color: #173f73;

      transition:
        border-color .18s ease,
        box-shadow .18s ease,
        transform .18s ease;
    }

    .topic-picker-trigger:hover {
      border-color: #9eb9d8;

      box-shadow:
        0 10px 26px
        rgba(31, 75, 125, 0.12);
    }

    .topic-picker-trigger:focus-visible {
      outline: 3px solid
        rgba(219, 105, 82, .22);

      outline-offset: 3px;
    }

    .topic-picker-trigger-main {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .topic-picker-trigger-icon {
      flex: 0 0 auto;
      font-size: 1.5rem;
    }

    .topic-picker-trigger-copy {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .topic-picker-trigger-italian {
      color: #173f73;
      font-size: 1rem;
      font-weight: 800;
      line-height: 1.15;
    }

    .topic-picker-trigger-english {
      color: #718097;
      font-size: .78rem;
      font-weight: 650;
      line-height: 1.15;
    }

    .topic-picker-chevron {
      width: 34px;
      height: 34px;

      display: grid;
      place-items: center;

      flex: 0 0 auto;

      border-radius: 50%;
      background: #f4f7fb;

      color: #315b8d;
      font-size: 1rem;

      transition:
        transform .18s ease;
    }

    .topic-picker.open
    .topic-picker-chevron {
      transform: rotate(180deg);
    }

    .topic-picker-panel {
      position: absolute;
      z-index: 1000;

      top: calc(100% + 10px);
      left: 50%;

      transform: translateX(-50%);

      width:
        min(
          920px,
          calc(100vw - 32px)
        );

      max-height:
        min(
          620px,
          72vh
        );

      overflow-y: auto;

      padding: 18px;

      background:
        rgba(255, 255, 255, .98);

      border:
        1px solid #dbe4ef;

      border-radius: 24px;

      box-shadow:
        0 22px 60px
        rgba(29, 54, 88, .18);
    }

    .topic-picker-groups {
      display: grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );

      gap: 16px;
    }

    .topic-picker-group {
      padding: 14px;

      background: #f8fafc;

      border:
        1px solid #e4ebf3;

      border-radius: 18px;
    }

    .topic-picker-group-heading {
      margin: -2px -2px 12px;
      padding: 9px 11px 9px 13px;

      background: #eef4fa;
      border-left: 4px solid #d96f5f;
      border-radius: 11px;

      color: #173f73;
    }

    .topic-picker-group-heading
    strong {
      display: block;

      font-size: .94rem;
      font-weight: 850;
      line-height: 1.15;
      letter-spacing: .01em;
    }

    .topic-picker-group-heading
    span {
      display: block;

      margin-top: 3px;

      color: #64758c;

      font-size: .72rem;
      font-weight: 700;
      line-height: 1.15;
    }

    .topic-picker-options {
      display: grid;
      gap: 7px;
    }

    .topic-picker-option {
      width: 100%;

      display: flex;
      align-items: center;
      gap: 10px;

      padding: 9px 11px;

      background: white;

      border:
        1px solid #dfe7f0;

      border-radius: 13px;

      color: #213f68;

      text-align: left;
      cursor: pointer;

      transition:
        border-color .15s ease,
        background .15s ease,
        transform .15s ease;
    }

    .topic-picker-option:hover {
      background: #fffaf8;

      border-color: #e6b4a8;

      transform:
        translateY(-1px);
    }

    .topic-picker-option.selected {
      background: #fff7f4;

      border-color: #dc806d;

      box-shadow:
        inset 0 0 0 1px
        rgba(220, 128, 109, .18);
    }

    .topic-picker-option-icon {
      width: 26px;
      flex: 0 0 26px;

      text-align: center;

      font-size: 1.05rem;
    }

    .topic-picker-option-copy {
      display: grid;
      gap: 1px;
      min-width: 0;
    }

    .topic-picker-option-italian {
      color: #173f73;

      font-size: .8rem;
      font-weight: 800;
      line-height: 1.15;
    }

    .topic-picker-option-english {
      color: #7a8798;

      font-size: .68rem;
      font-weight: 650;
      line-height: 1.15;
    }

    .topic-picker-resources {
      margin-top: 18px;
      padding: 15px 4px 2px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;

      border-top:
        1px solid #dbe4ef;
    }

    .topic-picker-resources-copy {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    .topic-picker-resources-copy
    strong {
      color: #173f73;

      font-size: .86rem;
      font-weight: 850;
      line-height: 1.2;
    }

    .topic-picker-resources-copy
    span {
      color: #718097;

      font-size: .7rem;
      font-weight: 650;
      line-height: 1.25;
    }

    .topic-picker-resource-links {
      display: flex;
      align-items: stretch;
      gap: 8px;
      flex: 0 0 auto;
    }

    .topic-picker-resource-link {
      min-width: 128px;

      display: flex;
      align-items: center;
      gap: 9px;

      padding: 9px 12px;

      background: #ffffff;

      border:
        1px solid #dbe4ef;

      border-radius: 13px;

      color: #173f73;

      text-decoration: none;

      box-shadow:
        0 4px 12px
        rgba(31, 75, 125, .05);

      transition:
        transform .15s ease,
        border-color .15s ease,
        background .15s ease;
    }

    .topic-picker-resource-link:hover {
      transform:
        translateY(-1px);

      border-color: #e3ab9f;

      background: #fffaf8;
    }

    .topic-picker-resource-icon {
      flex: 0 0 auto;

      font-size: 1.2rem;
    }

    .topic-picker-resource-link
    > span:last-child {
      display: grid;
      gap: 1px;
    }

    .topic-picker-resource-link
    strong {
      color: #173f73;

      font-size: .78rem;
      font-weight: 800;
      line-height: 1.15;
    }

    .topic-picker-resource-link
    small {
      color: #758399;

      font-size: .66rem;
      font-weight: 650;
      line-height: 1.15;
    }

    /* Make supporting resources easier to notice */
    .topic-picker-resources {
      margin-top: 18px;
      padding: 14px 16px;

      background: #fff8f5;

      border:
        1.5px solid #efc3b8;

      border-radius: 17px;

      box-shadow:
        0 6px 18px
        rgba(112, 70, 56, .07);
    }

    .topic-picker-resources-copy
    strong {
      color: #173f73;

      font-size: .94rem;
      font-weight: 850;
    }

    .topic-picker-resources-copy
    span {
      margin-top: 2px;

      color: #66758a;

      font-size: .72rem;
      line-height: 1.3;
    }

    .topic-picker-resource-links {
      gap: 10px;
    }

    .topic-picker-resource-link {
      min-width: 142px;

      padding: 10px 14px;

      background: #ffffff;

      border:
        1.5px solid #e2b5a9;

      box-shadow:
        0 4px 12px
        rgba(39, 72, 111, .06);
    }

    .topic-picker-resource-link
    strong {
      font-size: .82rem;
    }

    .topic-picker-resource-link
    small {
      font-size: .68rem;
    }

    @media (max-width: 720px) {
      .topic-picker-groups {
        grid-template-columns: 1fr;
      }

      .topic-picker-panel {
        max-height: 66vh;
      }

      .topic-picker-resources {
        align-items: stretch;
        flex-direction: column;
      }

      .topic-picker-resource-links {
        width: 100%;
      }

      .topic-picker-resource-link {
        flex: 1 1 0;
        min-width: 0;
      }
    }

    @media (max-width: 480px) {
      .topic-picker-trigger {
        min-height: 58px;
        border-radius: 16px;
      }

      .topic-picker-panel {
        width:
          calc(100vw - 20px);

        padding: 12px;

        border-radius: 20px;
      }

      .topic-picker-group {
        padding: 11px;
      }
    }
  `;

  document.head.appendChild(style);

  select.classList.add(
    "topic-select-native"
  );

  const picker =
    document.createElement("div");

  picker.className =
    "topic-picker";

  const trigger =
    document.createElement("button");

  trigger.type = "button";

  trigger.className =
    "topic-picker-trigger";

  trigger.setAttribute(
    "aria-haspopup",
    "listbox"
  );

  trigger.setAttribute(
    "aria-expanded",
    "false"
  );

  const panel =
    document.createElement("div");

  panel.className =
    "topic-picker-panel";

  panel.hidden = true;

  panel.innerHTML = `
    <div class="topic-picker-groups">
    </div>

    <div class="topic-picker-resources">
      <div class="topic-picker-resources-copy">
        <strong>
          📚 Risorse per continuare · Keep Learning
        </strong>

        <span>
          Continua a imparare con libri e schede.
          · Keep learning with books and worksheets.
        </span>
      </div>

      <div class="topic-picker-resource-links">
        <a
          class="topic-picker-resource-link"
          href="books.html"
        >
          <span class="topic-picker-resource-icon">
            📚
          </span>

          <span>
            <strong>
              Mini-libri
            </strong>
            <small>
              Books
            </small>
          </span>
        </a>

        <a
          class="topic-picker-resource-link"
          href="worksheets.html"
        >
          <span class="topic-picker-resource-icon">
            🖨️
          </span>

          <span>
            <strong>
              Schede
            </strong>
            <small>
              Worksheets
            </small>
          </span>
        </a>
      </div>
    </div>
  `;

  const groupsContainer =
    panel.querySelector(
      ".topic-picker-groups"
    );

  const optionMap =
    new Map(
      [...select.options]
        .filter(
          option =>
            option.value
        )
        .map(
          option => [
            option.value,
            option
          ]
        )
    );

  function parseLabel(option) {
    const text =
      option.textContent
        .replace(/\s+/g, " ")
        .trim();

    const parts =
      text.split(" · ");

    const italianWithIcon =
      parts[0] || text;

    const english =
      parts.slice(1).join(" · ");

    const firstSpace =
      italianWithIcon.indexOf(" ");

    let icon = "✦";
    let italian =
      italianWithIcon;

    if (firstSpace !== -1) {
      icon =
        italianWithIcon
          .slice(0, firstSpace)
          .trim();

      italian =
        italianWithIcon
          .slice(firstSpace + 1)
          .trim();
    }

    return {
      icon,
      italian,
      english
    };
  }

  function createTopicButton(
    key,
    option
  ) {
    const label =
      parseLabel(option);

    const button =
      document.createElement(
        "button"
      );

    button.type = "button";

    button.className =
      "topic-picker-option";

    button.dataset.topic = key;

    button.innerHTML = `
      <span
        class="topic-picker-option-icon"
      >
        ${label.icon}
      </span>

      <span
        class="topic-picker-option-copy"
      >
        <span
          class="topic-picker-option-italian"
        >
          ${label.italian}
        </span>

        <span
          class="topic-picker-option-english"
        >
          ${label.english}
        </span>
      </span>
    `;

    button.addEventListener(
      "click",
      () => {
        select.value = key;

        select.dispatchEvent(
          new Event(
            "change",
            {
              bubbles: true
            }
          )
        );

        closePicker();
      }
    );

    return button;
  }

  function renderGroups() {
    groupsContainer.innerHTML = "";

    const usedTopics =
      new Set();

    groups.forEach(group => {
      const availableTopics =
        group.topics.filter(
          key =>
            optionMap.has(key)
        );

      if (!availableTopics.length) {
        return;
      }

      const section =
        document.createElement(
          "section"
        );

      section.className =
        "topic-picker-group";

      section.innerHTML = `
        <h3
          class="
            topic-picker-group-heading
          "
        >
          <strong>
            ${group.titleItalian || group.italian}
          </strong>

          <span>
            ${group.titleEnglish || group.english}
          </span>
        </h3>

        <div
          class="topic-picker-options"
        >
        </div>
      `;

      const optionsContainer =
        section.querySelector(
          ".topic-picker-options"
        );

      availableTopics.forEach(
        key => {
          usedTopics.add(key);

          optionsContainer.appendChild(
            createTopicButton(
              key,
              optionMap.get(key)
            )
          );
        }
      );

      groupsContainer.appendChild(
        section
      );
    });

    const remaining =
      [...optionMap.keys()].filter(
        key =>
          !usedTopics.has(key)
      );

    if (!remaining.length) {
      return;
    }

    const section =
      document.createElement(
        "section"
      );

    section.className =
      "topic-picker-group";

    section.innerHTML = `
      <h3
        class="
          topic-picker-group-heading
        "
      >
        <strong>
          Altri argomenti
        </strong>

        <span>
          Other Topics
        </span>
      </h3>

      <div
        class="topic-picker-options"
      >
      </div>
    `;

    const optionsContainer =
      section.querySelector(
        ".topic-picker-options"
      );

    remaining.forEach(key => {
      optionsContainer.appendChild(
        createTopicButton(
          key,
          optionMap.get(key)
        )
      );
    });

    groupsContainer.appendChild(
      section
    );
  }

  function updateTrigger() {
    const option =
      select.options[
        select.selectedIndex
      ];

    if (
      !option ||
      !option.value
    ) {
      trigger.innerHTML = `
        <span
          class="
            topic-picker-trigger-main
          "
        >
          <span
            class="
              topic-picker-trigger-icon
            "
          >
            ✈️
          </span>

          <span
            class="
              topic-picker-trigger-copy
            "
          >
            <span
              class="
                topic-picker-trigger-italian
              "
            >
              Scegli un argomento
            </span>

            <span
              class="
                topic-picker-trigger-english
              "
            >
              Choose a Topic
            </span>
          </span>
        </span>

        <span
          class="
            topic-picker-chevron
          "
          aria-hidden="true"
        >
          ▾
        </span>
      `;
    } else {
      const label =
        parseLabel(option);

      trigger.innerHTML = `
        <span
          class="
            topic-picker-trigger-main
          "
        >
          <span
            class="
              topic-picker-trigger-icon
            "
          >
            ${label.icon}
          </span>

          <span
            class="
              topic-picker-trigger-copy
            "
          >
            <span
              class="
                topic-picker-trigger-italian
              "
            >
              ${label.italian}
            </span>

            <span
              class="
                topic-picker-trigger-english
              "
            >
              ${label.english}
            </span>
          </span>
        </span>

        <span
          class="
            topic-picker-chevron
          "
          aria-hidden="true"
        >
          ▾
        </span>
      `;
    }

    panel
      .querySelectorAll(
        ".topic-picker-option"
      )
      .forEach(button => {
        button.classList.toggle(
          "selected",
          button.dataset.topic ===
            select.value
        );
      });
  }

  function openPicker() {
    panel.hidden = false;

    picker.classList.add(
      "open"
    );

    trigger.setAttribute(
      "aria-expanded",
      "true"
    );

    updateTrigger();
  }

  function closePicker() {
    panel.hidden = true;

    picker.classList.remove(
      "open"
    );

    trigger.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  trigger.addEventListener(
    "click",
    () => {
      if (panel.hidden) {
        openPicker();
      } else {
        closePicker();
      }
    }
  );

  document.addEventListener(
    "click",
    event => {
      if (
        !panel.hidden &&
        !picker.contains(
          event.target
        )
      ) {
        closePicker();
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        !panel.hidden
      ) {
        closePicker();
        trigger.focus();
      }
    }
  );

  select.addEventListener(
    "change",
    updateTrigger
  );

  renderGroups();
  updateTrigger();

  picker.appendChild(
    trigger
  );

  picker.appendChild(
    panel
  );

  wrap.appendChild(
    picker
  );
})();
