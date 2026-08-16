"use strict";

const bookPages = [
  {
    image: "images/book2/book2-01.png",
    alt: "A group of familiar animals.",
    text: [
      "Gli animali!"
    ],
    audio:
      "Gli animali!"
  },

  {
    image: "images/book2/book2-02.png",
    alt: "One dog.",
    text: [
      "Io vedo un cane."
    ],
    audio:
      "Io vedo un cane."
  },

  {
    image: "images/book2/book2-03.png",
    alt: "Two cats.",
    text: [
      "Io vedo due gatti."
    ],
    audio:
      "Io vedo due gatti."
  },

  {
    image: "images/book2/book2-04.png",
    alt: "Three birds.",
    text: [
      "Io vedo tre uccelli."
    ],
    audio:
      "Io vedo tre uccelli."
  },

  {
    image: "images/book2/book2-05.png",
    alt: "Four rabbits.",
    text: [
      "Io vedo quattro conigli."
    ],
    audio:
      "Io vedo quattro conigli."
  },

  {
    image: "images/book2/book2-06.png",
    alt: "Five different animals to count.",
    text: [
      "Quanti animali vedi?"
    ],
    audio:
      "Quanti animali vedi?"
  },

  {
    image: "images/book2/book2-07.png",
    alt: "A small yellow dog is indicated by an arrow.",
    text: [
      "Il cane è piccolo e giallo."
    ],
    audio:
      "Il cane è piccolo e giallo."
  },

  {
    image: "images/book2/book2-08.png",
    alt: "A large white goat is indicated by an arrow.",
    text: [
      "La capra è grande e bianca."
    ],
    audio:
      "La capra è grande e bianca."
  },

  {
    image: "images/book2/book2-09.png",
    alt: "A large green turtle is indicated by an arrow.",
    text: [
      "La tartaruga è grande e verde."
    ],
    audio:
      "La tartaruga è grande e verde."
  },

  {
    image: "images/book2/book2-10.png",
    alt: "A small brown cow is indicated by an arrow.",
    text: [
      "La mucca è piccola e marrone."
    ],
    audio:
      "La mucca è piccola e marrone."
  },

  {
    image: "images/book2/book2-11.png",
    alt: "A large pink pig is indicated by an arrow.",
    text: [
      "Il maiale è grande e rosa."
    ],
    audio:
      "Il maiale è grande e rosa."
  },

  {
    image: "images/book2/book2-12.png",
    alt: "Two turtles with one turtle indicated by an arrow.",
    text: [
      "Di che colore è la tartaruga?"
    ],
    audio:
      "Di che colore è la tartaruga?"
  },

  {
    image: "images/book2/book2-13.png",
    alt: "A group of different familiar animals.",
    text: [
      "Quale animale ti piace?"
    ],
    audio:
      "Quale animale ti piace?"
  },

  {
    image: "images/book2/book2-14.png",
    alt: "A group of different familiar animals.",
    text: [
      "Mi piace il ____.",
      "E tu?"
    ],
    audio:
      "Mi piace il... E tu?"
  }
];

let currentBookPage = 0;

const bookImage =
  document.getElementById("bookImage");

const bookText =
  document.getElementById("bookText");

const bookPageCounter =
  document.getElementById(
    "bookPageCounter"
  );

const previousBookPage =
  document.getElementById(
    "previousBookPage"
  );

const nextBookPage =
  document.getElementById(
    "nextBookPage"
  );

const bookAudioButton =
  document.getElementById(
    "bookAudioButton"
  );

const printBookButton =
  document.getElementById(
    "printBookButton"
  );

const printableBook =
  document.getElementById(
    "printableBook"
  );

function renderBookPage() {
  const page =
    bookPages[currentBookPage];

  bookImage.src =
    page.image;

  bookImage.alt =
    page.alt;

  bookText.innerHTML =
    page.text
      .map(
        line =>
          `<p>${line}</p>`
      )
      .join("");

  bookPageCounter.textContent =
    `Pagina ${currentBookPage + 1} di ${bookPages.length}`;

  previousBookPage.disabled =
    currentBookPage === 0;

  nextBookPage.disabled =
    currentBookPage ===
    bookPages.length - 1;
}

function speakBookPage() {
  if (
    !("speechSynthesis" in window)
  ) {
    alert(
      "Audio is not supported in this browser."
    );

    return;
  }

  window.speechSynthesis.cancel();

  const page =
    bookPages[currentBookPage];

  const utterance =
    new SpeechSynthesisUtterance(
      page.audio
    );

  utterance.lang =
    "it-IT";

  utterance.rate =
    0.82;

  utterance.pitch =
    1;

  const italianVoice =
    window.speechSynthesis
      .getVoices()
      .find(
        voice =>
          voice.lang
            .toLowerCase()
            .startsWith("it")
      );

  if (italianVoice) {
    utterance.voice =
      italianVoice;
  }

  window.speechSynthesis.speak(
    utterance
  );
}

function buildPrintableBook() {
  printableBook.innerHTML =
    bookPages
      .map(
        (page, index) => `
          <section class="printable-page">

            <header class="printable-branding">
              <span>
                Primo Volo d'Italiano
              </span>

              <span>
                First Volo Learning
              </span>
            </header>

            <div class="printable-content">
              <div class="printable-image-wrap">
                <img
                  src="${page.image}"
                  alt="${page.alt}"
                >
              </div>

              <div class="printable-text">
                ${page.text
                  .map(line => `<p>${line}</p>`)
                  .join("")}
              </div>
            </div>

            <footer class="printable-footer">
              <span>
                First Volo Learning | firstvololearning.com
              </span>

              <span>
                Pagina ${index + 1}
              </span>
            </footer>

          </section>
        `
      )
      .join("");
}

async function printBook() {
  buildPrintableBook();

  const printableImages =
    printableBook.querySelectorAll(
      "img"
    );

  await Promise.all(
    Array.from(printableImages).map(
      image => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise(resolve => {
          image.addEventListener(
            "load",
            resolve,
            { once: true }
          );

          image.addEventListener(
            "error",
            resolve,
            { once: true }
          );
        });
      }
    )
  );

  window.print();
}

previousBookPage.addEventListener(
  "click",
  () => {
    if (currentBookPage > 0) {
      currentBookPage -= 1;
      renderBookPage();
    }
  }
);

nextBookPage.addEventListener(
  "click",
  () => {
    if (
      currentBookPage <
      bookPages.length - 1
    ) {
      currentBookPage += 1;
      renderBookPage();
    }
  }
);

bookAudioButton.addEventListener(
  "click",
  speakBookPage
);

printBookButton.addEventListener(
  "click",
  printBook
);

document.addEventListener(
  "keydown",
  event => {
    if (event.key === "ArrowLeft") {
      previousBookPage.click();
    }

    if (event.key === "ArrowRight") {
      nextBookPage.click();
    }
  }
);

renderBookPage();