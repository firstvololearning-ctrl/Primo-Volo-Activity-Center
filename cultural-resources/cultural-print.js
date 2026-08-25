"use strict";

(function configureCulturalPrinting() {
  const body = document.body;

  if (
    document.querySelector(".resource-image-frame") ||
    document.querySelector(".resource-pages")
  ) {
    body.classList.add("pv-print-illustrated");
  }

  if (document.querySelector(".resource-pages")) {
    body.classList.add("pv-print-multipage-images");
  }

  const articleCardImage = document.querySelector(".article-card img");
  const hasContextCard = document.querySelector(".context-card");

  if (articleCardImage && !hasContextCard) {
    body.classList.add("pv-print-single-image");
  }

  document.querySelectorAll("a").forEach(function (link) {
    const text = (link.textContent || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    const href = (link.getAttribute("href") || "").toLowerCase();

    if (
      text.includes("leggi l'articolo") ||
      text.includes("read the article")
    ) {
      link.classList.add("pv-print-hide");
    }

    if (
      href.includes("da-colorare") &&
      href.endsWith(".pdf")
    ) {
      const card = link.closest(".context-card");
      if (card) {
        card.classList.add("pv-print-hide");
      }
    }
  });

  if (!document.querySelector(".pv-print-button")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pv-print-button";
    button.setAttribute(
      "aria-label",
      "Stampa questa lettura"
    );
    button.innerHTML =
      "&#128424;&#65039; Stampa &middot; Print";

    button.addEventListener("click", function () {
      window.print();
    });

    body.appendChild(button);
  }
})();
