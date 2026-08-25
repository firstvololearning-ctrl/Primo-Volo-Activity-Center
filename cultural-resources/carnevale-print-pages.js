"use strict";

(function configureCarnevalePrintPages() {
  const original = document.querySelector("main.carnevale-page");

  if (!original) {
    return;
  }

  function clone(selector) {
    const node = original.querySelector(selector);

    if (!node) {
      return null;
    }

    const copy = node.cloneNode(true);

    copy
      .querySelectorAll(".back-link, .full-link")
      .forEach(function (element) {
        element.remove();
      });

    return copy;
  }

  function footer() {
    const element = document.createElement("footer");
    element.className = "carnevale-print-page-footer";
    element.innerHTML = `
      <span>First Volo Learning | firstvololearning.com</span>
      <span>Primo Volo d'Italiano</span>
    `;
    return element;
  }

  function page(number) {
    const element = document.createElement("section");
    element.className =
      "carnevale-page carnevale-print-page " +
      "carnevale-print-page-" + number;
    return element;
  }

  function addIfPresent(target, node) {
    if (node) {
      target.appendChild(node);
    }
  }

  function buildPrintStage() {
    const existing =
      document.querySelector(".carnevale-print-stage");

    if (existing) {
      existing.remove();
    }

    const stage = document.createElement("div");
    stage.className = "carnevale-print-stage";

    const pageOne = page("one");
    addIfPresent(pageOne, clone(".culture-header"));
    addIfPresent(pageOne, clone(".hero-section"));
    addIfPresent(pageOne, clone(".origins-card"));
    pageOne.appendChild(footer());

    const pageTwo = page("two");
    addIfPresent(pageTwo, clone(".masks-card"));
    addIfPresent(pageTwo, clone(".dates-card"));
    addIfPresent(pageTwo, clone(".did-you-know"));
    pageTwo.appendChild(footer());

    const pageThree = page("three");
    addIfPresent(pageThree, clone(".costume-section"));
    addIfPresent(pageThree, clone(".source-box"));
    pageThree.appendChild(footer());

    stage.append(pageOne, pageTwo, pageThree);
    original.insertAdjacentElement("afterend", stage);
  }

  function removePrintStage() {
    const stage =
      document.querySelector(".carnevale-print-stage");

    if (stage) {
      stage.remove();
    }
  }

  window.addEventListener("beforeprint", buildPrintStage);
  window.addEventListener("afterprint", removePrintStage);
})();
