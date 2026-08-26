"use strict";

/*
  Primo Volo d'Italiano
  Header navigation groups
*/

(function organizeHeaderNavigation() {
  const utilities =
    document.querySelector(
      ".header-utilities"
    );

  if (!utilities) {
    console.error(
      "Header groups could not start."
    );
    return;
  }

  const learnerItems = [
    document.querySelector(
      "#voloCityMapButton"
    ),
    document.querySelector(
      'a[href="starting-checks.html"]'
    ),
    document.querySelector(
      'a[href="glossary.html"]'
    ),
    document.querySelector(
      'a[href="books.html"]'
    ),
    document.querySelector(
      "#referenceButton"
    )
  ].filter(Boolean);

  const teacherGuideLink = (() => {
    const template =
      document.querySelector(
        'a[href="worksheets.html"]'
      );

    if (!template) {
      return null;
    }

    const link =
      template.cloneNode(true);

    link.removeAttribute("id");

    link.href =
      "teacher-guide.html";

    link.textContent =
      "👩‍🏫 Guida per insegnanti · Teacher Guide";

    return link;
  })();

  const monthlyCurriculumLink = (() => {
    const template =
      document.querySelector(
        'a[href="worksheets.html"]'
      );

    if (!template) {
      return null;
    }

    const link =
      template.cloneNode(true);

    link.removeAttribute("id");

    link.href =
      "monthly-curriculum.html";

    link.textContent =
      "📅 Materiali mensili · Monthly Curriculum Materials";

    return link;
  })();

  function cloneLink(selector) {
    const source =
      document.querySelector(
        selector
      );

    if (!source) {
      return null;
    }

    const clone =
      source.cloneNode(true);

    clone.removeAttribute("id");

    return clone;
  }

  const educatorInstructionalItems = [
    teacherGuideLink,
    monthlyCurriculumLink,
    cloneLink(
      'a[href="books.html"]'
    ),
    document.querySelector(
      'a[href="worksheets.html"]'
    ),
    document.querySelector(
      'a[href="games.html"]'
    ),
    document.querySelector(
      'a[href="printables/Che-cosa-mangi-Primo-Volo.pdf"]'
    )
  ].filter(Boolean);

  const educatorProgressItems = [
    cloneLink(
      'a[href="starting-checks.html"]'
    ),
    document.querySelector(
      "#progressButton"
    )
  ].filter(Boolean);

  const educatorItems = [
    ...educatorInstructionalItems,
    ...educatorProgressItems
  ];

  const infoItems = [
    document.querySelector(
      "#aboutItalianButton"
    ),
    document.querySelector(
      "#aboutEnglishButton"
    )
  ].filter(Boolean);

  function createGroup(
    className,
    italian,
    english,
    items
  ) {
    const group =
      document.createElement(
        "section"
      );

    group.className =
      `header-nav-group ${className}`;

    const itemsId =
      `header-nav-items-${className}`;

    group.innerHTML = `
      <div class="header-nav-group-title">
        <button
          type="button"
          class="header-nav-group-toggle"
          aria-expanded="false"
          aria-controls="${itemsId}"
        >
          <span class="header-nav-group-toggle-copy">
            <strong>
              ${italian}
            </strong>

            <span>
              ${english}
            </span>
          </span>

          <span
            class="header-nav-group-chevron"
            aria-hidden="true"
          >▾</span>
        </button>
      </div>

      <div
        class="header-nav-group-items"
        id="${itemsId}"
        hidden
      ></div>
    `;

    const itemRow =
      group.querySelector(
        ".header-nav-group-items"
      );

    const toggle =
      group.querySelector(
        ".header-nav-group-toggle"
      );

    items.forEach(item => {
      itemRow.appendChild(item);
    });

    const stateKey =
      `primoVoloHeaderGroup:${className}`;

    let isOpen = false;

    try {
      isOpen =
        window.sessionStorage.getItem(
          stateKey
        ) === "open";
    } catch (error) {
      console.warn(
        "Header group state could not be read.",
        error
      );
    }

    function renderGroupState() {
      itemRow.hidden =
        !isOpen;

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      group.classList.toggle(
        "is-open",
        isOpen
      );
    }

    toggle.addEventListener(
      "click",
      () => {
        isOpen =
          !isOpen;

        try {
          window.sessionStorage.setItem(
            stateKey,
            isOpen ? "open" : "closed"
          );
        } catch (error) {
          console.warn(
            "Header group state could not be saved.",
            error
          );
        }

        renderGroupState();
      }
    );

    renderGroupState();

    return group;
  }

  const learnerGroup =
    createGroup(
      "learner-tools",
      "Per chi impara",
      "Learning Tools",
      learnerItems
    );

  const educatorGroup =
    createGroup(
      "educator-tools",
      "Per educatori e famiglie",
      "Educators & Families",
      educatorItems
    );

  const educatorItemRow =
    educatorGroup.querySelector(
      ".header-nav-group-items"
    );

  if (educatorItemRow) {
    educatorItemRow.innerHTML = "";

    function appendEducatorSection(
      className,
      italian,
      english,
      items
    ) {
      const section =
        document.createElement(
          "section"
        );

      section.className =
        `educator-resource-section ${className}`;

      const heading =
        document.createElement(
          "div"
        );

      heading.className =
        "educator-resource-section-title";

      heading.innerHTML = `
        <strong>
          ${italian}
          <span aria-hidden="true"> · </span>
          <span lang="en">${english}</span>
        </strong>
      `;

      const grid =
        document.createElement(
          "div"
        );

      grid.className =
        "educator-resource-section-grid";

      items.forEach(
        item => {
          grid.appendChild(item);
        }
      );

      section.append(
        heading,
        grid
      );

      educatorItemRow.appendChild(
        section
      );
    }

    appendEducatorSection(
      "instructional-materials",
      "📚 Materiali didattici",
      "Instructional Materials",
      educatorInstructionalItems
    );

    appendEducatorSection(
      "progress-tracking",
      "📊 Valutazione e progressi",
      "Assessment & Progress",
      educatorProgressItems
    );
  }

  utilities.innerHTML = "";

  const infoRow =
    document.createElement(
      "div"
    );

  infoRow.className =
    "header-info-tools";

  infoItems.forEach(item => {
    infoRow.appendChild(item);
  });

  utilities.append(
    learnerGroup,
    educatorGroup,
    infoRow
  );
})();
