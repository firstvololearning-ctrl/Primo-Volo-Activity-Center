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
      "#passportButton"
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

  const educatorItems = [
    document.querySelector(
      "#progressButton"
    ),
    monthlyCurriculumLink,
    document.querySelector(
      'a[href="worksheets.html"]'
    ),
    document.querySelector(
      'a[href="games.html"]'
    )
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

    group.innerHTML = `
      <div class="header-nav-group-title">
        <strong>
          ${italian}
        </strong>

        <span>
          ${english}
        </span>
      </div>

      <div
        class="header-nav-group-items"
      ></div>
    `;

    const itemRow =
      group.querySelector(
        ".header-nav-group-items"
      );

    items.forEach(item => {
      itemRow.appendChild(item);
    });

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
