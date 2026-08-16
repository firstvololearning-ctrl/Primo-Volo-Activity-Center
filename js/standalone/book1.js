"use strict";

const bookPages = [
  {
    image: "images/book1/book1-01.png",
    alt: "Volo waves and introduces himself.",
    text: [
      "Ciao!",
      "Mi chiamo Volo."
    ],
    audio:
      "Ciao! Mi chiamo Volo."
  },

  {
    image: "images/book1/book1-02.png",
    alt: "Volo presents a clay diorama of Rome.",
    text: [
      "Sono di Roma."
    ],
    audio:
      "Sono di Roma."
  },

  {
    image: "images/book1/book1-03.png",
    alt: "A spring map of Italy with sunshine.",
    text: [
      "È primavera.",
      "C’è il sole."
    ],
    audio:
      "È primavera. C’è il sole."
  },

  {
    image: "images/book1/book1-04.png",
    alt: "Volo eats a large chocolate chip cookie.",
    text: [
      "Mangio il biscotto.",
      "È grande.",
      "È buono.",
      "Mi piace il biscotto."
    ],
    audio:
      "Mangio il biscotto. È grande. È buono. Mi piace il biscotto."
  },

  {
    image: "images/book1/book1-05.png",
    alt: "Volo drinks milk.",
    text: [
      "Bevo il latte.",
      "È bianco.",
      "È buono.",
      "Mi piace il latte."
    ],
    audio:
      "Bevo il latte. È bianco. È buono. Mi piace il latte."
  },

  {
    image: "images/book1/book1-06.png",
    alt: "Volo points toward the reader and asks, E tu?",
    text: [
      "E tu?"
    ],
    audio:
      "E tu?"
  },

  {
    image: "images/book1/book1-07.png",
    alt: "Volo asks the reader their name.",
    text: [
      "Come ti chiami?"
    ],
    audio:
      "Come ti chiami?"
  },

  {
    image: "images/book1/book1-08.png",
    alt: "Volo asks where the reader is from.",
    text: [
      "Di dove sei?"
    ],
    audio:
      "Di dove sei?"
  },

  {
    image: "images/book1/book1-09.png",
    alt: "Volo asks which season it is.",
    text: [
      "Che stagione è?"
    ],
    audio:
      "Che stagione è?"
  },

  {
    image: "images/book1/book1-10.png",
    alt: "Volo asks about the weather.",
    text: [
      "Che tempo fa?"
    ],
    audio:
      "Che tempo fa?"
  },

  {
    image: "images/book1/book1-11.png",
    alt: "Volo asks whether the reader likes the cookie.",
    text: [
      "Ti piace il biscotto?"
    ],
    audio:
      "Ti piace il biscotto?"
  },

  {
    image: "images/book1/book1-12.png",
    alt: "Volo asks whether the reader likes milk.",
    text: [
      "Ti piace il latte?"
    ],
    audio:
      "Ti piace il latte?"
  },

  {
    image: "images/book1/book1-13.png",
    alt: "Volo waves goodbye and says, A presto!",
    text: [
      "A presto!"
    ],
    audio:
      "A presto!"
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