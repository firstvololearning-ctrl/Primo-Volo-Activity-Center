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

  const cultureSource =
    document.querySelector(
      ".culture-link"
    );

  function makeCultureHeaderLink() {
    const template =
      document.querySelector(
        'a[href="books.html"]'
      ) ||
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
      "cultural-resources/";

    link.textContent =
      "🏛️ Cultura · Culture";

    return link;
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
    makeCultureHeaderLink(),
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

    link.classList.add(
      "educator-guide-link"
    );

    link.innerHTML = `
      <span class="educator-guide-link-copy">
        <strong>
          👩‍🏫 Guida per insegnanti ·
          <span lang="en">Teacher Guide</span>
        </strong>

        <small>
          Come usare Primo Volo ·
          <span lang="en">How to use Primo Volo</span>
        </small>
      </span>

      <span
        class="educator-guide-link-arrow"
        aria-hidden="true"
      >→</span>
    `;

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

  function makeScopeButton() {
    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "header-link header-link-wide";

    button.dataset.openScope =
      "true";

    button.innerHTML = `
      <span class="header-link-label">
        🗺️ Panoramica del curricolo ·
        <span lang="en">Curriculum Overview &amp; Scope</span>
      </span>
    `;

    return button;
  }

  const educatorPlanningItems = [
    makeScopeButton(),
    monthlyCurriculumLink
  ].filter(Boolean);

  const educatorTeachingItems = [
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
    ),
    makeCultureHeaderLink()
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
    teacherGuideLink,
    ...educatorPlanningItems,
    ...educatorTeachingItems,
    ...educatorProgressItems
  ].filter(Boolean);

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

    if (teacherGuideLink) {
      const guideEntry =
        document.createElement(
          "div"
        );

      guideEntry.className =
        "educator-guide-entry";

      guideEntry.appendChild(
        teacherGuideLink
      );

      educatorItemRow.appendChild(
        guideEntry
      );
    }

    function appendEducatorSection(
      className,
      italian,
      english,
      items
    ) {
      const section =
        document.createElement(
          "details"
        );

      section.className =
        `educator-resource-section ${className}`;

      const summary =
        document.createElement(
          "summary"
        );

      summary.className =
        "educator-resource-section-title";

      summary.innerHTML = `
        <span class="educator-resource-section-title-copy">
          <strong>
            ${italian}
            <span aria-hidden="true"> · </span>
            <span lang="en">${english}</span>
          </strong>
        </span>

        <span
          class="educator-resource-section-chevron"
          aria-hidden="true"
        >▾</span>
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
        summary,
        grid
      );

      educatorItemRow.appendChild(
        section
      );
    }

    appendEducatorSection(
      "planning-resources",
      "📋 Pianificazione",
      "Planning",
      educatorPlanningItems
    );

    appendEducatorSection(
      "teaching-materials",
      "📚 Materiali didattici",
      "Teaching Materials",
      educatorTeachingItems
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

  /*
    Culture now lives inside both audience-specific
    resource groups, so the old standalone button below
    the groups is no longer needed.
  */
  cultureSource?.remove();
})();
