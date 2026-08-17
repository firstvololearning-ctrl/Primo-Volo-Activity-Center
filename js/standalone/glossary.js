"use strict";

(function initializeGlossary() {
  const glossaryContent =
    document.querySelector("#glossaryContent");

  const searchInput =
    document.querySelector("#glossarySearch");

  const topicFilter =
    document.querySelector(
      "#glossaryTopicFilter"
    );

  const englishToggle =
    document.querySelector(
      "#glossaryEnglishToggle"
    );

  const glossaryCount =
    document.querySelector("#glossaryCount");

  const glossaryEmpty =
    document.querySelector("#glossaryEmpty");

  if (
    !glossaryContent ||
    !searchInput ||
    !topicFilter ||
    !englishToggle ||
    !glossaryCount ||
    !glossaryEmpty
  ) {
    console.error(
      "The glossary could not start because required page elements are missing."
    );

    return;
  }

  /*
    Each vocabulary array comes from data.js.

    A topic is included only when its array
    exists and contains at least one item.
  */
 const glossaryCarrierPhrases = [];

if (
  typeof carrierPhrases !== "undefined" &&
  carrierPhrases
) {
  const seenCarrierIds = new Set();

  Object.values(carrierPhrases)
    .flat()
    .forEach(phrase => {
      /*
        The same carrier phrase may be used
        for several topics. Add it only once.
      */
      if (
        !phrase ||
        seenCarrierIds.has(phrase.id)
      ) {
        return;
      }

      seenCarrierIds.add(phrase.id);

      glossaryCarrierPhrases.push({
        italian: phrase.italian,
        english: phrase.english,

      /*
  Use the no-text carrier image
  in the glossary.
*/
       image: phrase.image
      });
    });
}

  const autumnGlossaryVocabulary = [
    {
      italian: "l’autunno",
      english: "fall / autumn",
      image: "cultural-resources/harvest/fall-vocabulary/autunno.png"
    },
    {
      italian: "settembre",
      english: "September",
      image: "cultural-resources/harvest/fall-vocabulary/settembre.png"
    },
    {
      italian: "ottobre",
      english: "October",
      image: "cultural-resources/harvest/fall-vocabulary/ottobre.png"
    },
    {
      italian: "novembre",
      english: "November",
      image: "cultural-resources/harvest/fall-vocabulary/novembre.png"
    },
    {
      italian: "le foglie",
      english: "leaves",
      image: "cultural-resources/harvest/fall-vocabulary/foglie.png"
    },
    {
      italian: "la ghianda",
      english: "acorn",
      image: "cultural-resources/harvest/fall-vocabulary/ghianda.png"
    },
    {
      italian: "le castagne",
      english: "chestnuts",
      image: "cultural-resources/harvest/fall-vocabulary/castagne.png"
    },
    {
      italian: "la zucca",
      english: "pumpkin",
      image: "cultural-resources/harvest/fall-vocabulary/zucca.png"
    },
    {
      italian: "l’uva",
      english: "grapes",
      image: "cultural-resources/harvest/fall-vocabulary/uva.png"
    },
    {
      italian: "la vendemmia",
      english: "grape harvest",
      image: "cultural-resources/harvest/fall-vocabulary/vendemmia.png"
    },
    {
      italian: "i funghi",
      english: "mushrooms",
      image: "cultural-resources/harvest/fall-vocabulary/funghi.png"
    },
    {
      italian: "la pioggia",
      english: "rain",
      image: "cultural-resources/harvest/fall-vocabulary/pioggia.png"
    },
    {
      italian: "la nebbia",
      english: "fog",
      image: "cultural-resources/harvest/fall-vocabulary/nebbia.png"
    },
    {
      italian: "l’ombrello",
      english: "umbrella",
      image: "cultural-resources/harvest/fall-vocabulary/ombrello.png"
    }
  ];

  const possibleTopics = [
   {
  id: "carrier-phrases",
  icon: "💬",
  italian: "Frasi modello",
  english: "Carrier Phrases",
  vocabulary: glossaryCarrierPhrases
},
    {
      id: "introductions",
      icon: "👋",
      italian: "Saluti e presentazioni",
      english: "Greetings & Introductions",
      vocabulary:
        typeof introductions !== "undefined"
          ? introductions
          : []
    },
    {
      id: "hobbies",
      icon: "🎯",
      italian: "Hobby e tempo libero",
      english: "Hobbies & Free Time",
      vocabulary:
        typeof hobbies !== "undefined"
          ? hobbies
          : []
    },
    {
      id: "supplies",
      icon: "📚",
      italian: "Materiale scolastico",
      english: "School Supplies",
      vocabulary:
        typeof supplies !== "undefined"
          ? supplies
          : []
    },
    {
      id: "food",
      icon: "🍎",
      italian: "Il cibo e le bevande",
      english: "Food & Drinks",
      vocabulary:
        typeof food !== "undefined"
          ? food
          : []
    },
    {
      id: "clothing",
      icon: "👕",
      italian: "L'abbigliamento",
      english: "Clothing",
      vocabulary:
        typeof clothing !== "undefined"
          ? clothing
          : []
    },
    {
      id: "body",
      icon: "🧍",
      italian: "Le parti del corpo",
      english: "Body Parts",
      vocabulary:
        typeof body !== "undefined"
          ? body
          : []
    },
    {
      id: "home",
      icon: "🏠",
      italian: "La casa",
      english: "Home",
      vocabulary:
        typeof home !== "undefined"
          ? home
          : []
    },
    {
  id: "places",
  icon: "📍",
  italian: "I luoghi",
  english: "Places",
  vocabulary:
    typeof places !== "undefined"
      ? places
      : []
},
{
  id: "prepositions",
  icon: "📦",
  italian: "Le preposizioni",
  english: "Prepositions",
  vocabulary:
    typeof prepositions !== "undefined"
      ? prepositions
      : []
},
    {
      id: "family",
      icon: "👨‍👩‍👧",
      italian: "La famiglia",
      english: "Family",
      vocabulary:
        typeof family !== "undefined"
          ? family
          : []
    },
    {
      id: "colors",
      icon: "🎨",
      italian: "I colori",
      english: "Colors",
      vocabulary:
        typeof colors !== "undefined"
          ? colors
          : []
    },
    {
  id: "adjectives",
  icon: "🔎",
  italian: "Gli aggettivi",
  english: "Adjectives",
  vocabulary:
    typeof adjectives !== "undefined"
      ? adjectives
      : []
},
    {
      id: "feelings",
      icon: "😊",
      italian: "Le emozioni",
      english: "Feelings",
      vocabulary:
        typeof feelings !== "undefined"
          ? feelings
          : []
    },
    {
      id: "numbers",
      icon: "🔢",
      italian: "I numeri",
      english: "Numbers",
      vocabulary:
        typeof numbers !== "undefined"
          ? numbers
          : []
    },
    {
      id: "animals",
      icon: "🐶",
      italian: "Gli animali",
      english: "Animals",
      vocabulary:
        typeof animals !== "undefined"
          ? animals
          : []
    },
    {
      id: "routines",
      icon: "🌅",
      italian: "La mia giornata",
      english: "Daily Routines",
      vocabulary:
        typeof routines !== "undefined"
          ? routines
          : []
    },
    {
  id: "days",
  icon: "📅",
  italian: "I giorni della settimana",
  english: "Days of the Week",
  vocabulary:
    typeof days !== "undefined"
      ? days
      : []
},
{
  id: "months",
  icon: "🗓️",
  italian: "I mesi dell'anno",
  english: "Months of the Year",
  vocabulary:
    typeof months !== "undefined"
      ? months
      : []
},
    {
      id: "time",
      icon: "🕒",
      italian: "L'ora",
      english: "Time",
      vocabulary:
        typeof time !== "undefined"
          ? time
          : []
    },
    {
      id: "weather",
      icon: "🌦️",
      italian: "Il tempo",
      english: "Weather",
      vocabulary:
        typeof weather !== "undefined"
          ? weather
          : []
    },
    {
      id: "seasons",
      icon: "🍂",
      italian: "Le stagioni",
      english: "Seasons",
      vocabulary:
        typeof seasons !== "undefined"
          ? seasons
          : []
    },
    {
      id: "autumn",
      icon: "🍂",
      italian: "L’autunno",
      english: "Fall",
      vocabulary: autumnGlossaryVocabulary
    },
    {
      id: "classroom",
      icon: "🏫",
      italian: "Espressioni in classe",
      english: "Classroom Expressions",
      vocabulary:
        typeof classroomExpressions !==
        "undefined"
          ? classroomExpressions
          : []
    }
  ];

  const glossaryTopics =
    possibleTopics.filter(
      topic =>
        Array.isArray(topic.vocabulary) &&
        topic.vocabulary.length
    );

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function speakItalian(text) {
    if (
      !("speechSynthesis" in window)
    ) {
      alert(
        "Audio is not supported in this browser."
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "it-IT";
    utterance.rate = 0.82;
    utterance.pitch = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const italianVoice =
      voices.find(
        voice =>
          voice.lang &&
          voice.lang
            .toLowerCase()
            .startsWith("it")
      );

    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    window.speechSynthesis.speak(
      utterance
    );
  }

  /* ========================================
     PRINTABLE GLOSSARY TOPICS
     ======================================== */

  const glossaryPrintArea =
    document.createElement(
      "section"
    );

  glossaryPrintArea.id =
    "glossaryPrintArea";

  glossaryPrintArea.className =
    "glossary-print-area";

  glossaryPrintArea.hidden =
    true;

  document.body.appendChild(
    glossaryPrintArea
  );


  function createPrintableCard(
    item,
    includeEnglish
  ) {
    const articleLabel =
      item.english || item.italian;

    return `
      <article class="glossary-print-card">

        <div class="glossary-print-image-wrap">
          <img
            src="${item.image}"
            alt="${articleLabel}"
            class="glossary-print-image"
          >
        </div>

        <div class="glossary-print-card-text">
          <p class="glossary-print-italian">
            ${item.italian}
          </p>

          ${
            includeEnglish
              ? `
                <p class="glossary-print-english">
                  ${item.english}
                </p>
              `
              : ""
          }
        </div>

      </article>
    `;
  }


  async function printGlossaryTopic(
    topicId
  ) {
    const topic =
      glossaryTopics.find(
        item =>
          item.id === topicId
      );

    if (!topic) {
      return;
    }

    /*
      Build the print sheet from the complete
      topic vocabulary, not from the current
      search/filter results.

      Audio controls are intentionally omitted.
    */
    const includeEnglish =
      englishToggle.checked;

    glossaryPrintArea.classList.toggle(
      "glossary-print-roomy",
      topic.vocabulary.length <= 8
    );

    glossaryPrintArea.classList.toggle(
      "glossary-print-medium",
      topic.vocabulary.length >= 9 &&
      topic.vocabulary.length <= 12
    );

    glossaryPrintArea.classList.toggle(
      "glossary-print-compact",
      topic.vocabulary.length > 16
    );

    glossaryPrintArea.innerHTML = `
      <header class="glossary-print-header">
        <h1>
          ${topic.icon}
          ${topic.italian}
        </h1>

        ${
          includeEnglish
            ? `
              <p>
                ${topic.english}
              </p>
            `
            : ""
        }
      </header>

      <div class="glossary-print-grid">
        ${topic.vocabulary
          .map(item =>
            createPrintableCard(
              item,
              includeEnglish
            )
          )
          .join("")}
      </div>

      <footer class="glossary-print-footer">
        <span>
          First Volo Learning |
          firstvololearning.com
        </span>

        <span>
          Primo Volo d'Italiano
        </span>
      </footer>
    `;

    glossaryPrintArea.hidden =
      false;

    document.body.classList.add(
      "glossary-printing"
    );

    /*
      Wait for the vocabulary graphics before
      opening the browser print dialog.
    */
    const images =
      [
        ...glossaryPrintArea
          .querySelectorAll("img")
      ];

    await Promise.all(
      images.map(image => {
        if (
          image.complete &&
          image.naturalWidth
        ) {
          return Promise.resolve();
        }

        return new Promise(
          resolve => {
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
          }
        );
      })
    );

    window.setTimeout(
      () => {
        window.print();
      },
      80
    );
  }


  function finishGlossaryPrint() {
    document.body.classList.remove(
      "glossary-printing"
    );

    glossaryPrintArea.hidden =
      true;

    glossaryPrintArea.innerHTML =
      "";
  }


  window.addEventListener(
    "afterprint",
    finishGlossaryPrint
  );


  function createTopicOptions() {
    glossaryTopics.forEach(topic => {
      const option =
        document.createElement("option");

      option.value = topic.id;

      option.textContent =
        `${topic.icon} ${topic.italian} · ` +
        `${topic.english}`;

      topicFilter.appendChild(option);
    });
  }

  function getItalianForms(item) {
    const masculine =
      item.masculine || item.italian;

    const feminine =
      item.feminine || masculine;

    return {
      masculine,
      feminine
    };
  }

  function getItalianDisplay(item) {
    const {
      masculine,
      feminine
    } = getItalianForms(item);

    return masculine !== feminine
      ? `${masculine} / ${feminine}`
      : masculine;
  }

  function getItalianSpeech(item) {
    const {
      masculine,
      feminine
    } = getItalianForms(item);

    return masculine !== feminine
      ? `${masculine}. ${feminine}.`
      : masculine;
  }

  function itemMatchesSearch(
    item,
    searchTerm
  ) {
    if (!searchTerm) {
      return true;
    }

    const {
      masculine,
      feminine
    } = getItalianForms(item);

    const searchableText =
      normalizeText(
        `${item.italian} ${masculine} ${feminine} ${item.english}`
      );

    return searchableText.includes(
      searchTerm
    );
  }

  function createVocabularyCard(item) {
    const articleLabel =
      item.english || item.italian;

    const italianDisplay =
      getItalianDisplay(item);

    const italianSpeech =
      getItalianSpeech(item);

    return `
      <article class="glossary-card">

        <button
          type="button"
          class="glossary-audio-button"
          data-speak="${italianSpeech}"
          aria-label="Listen to ${italianDisplay}"
          title="Ascolta · Listen"
        >
          🔊
        </button>

        <div class="glossary-card-image-wrap">
          <img
            src="${item.image}"
            alt="${articleLabel}"
            class="glossary-card-image"
            loading="lazy"
          >
        </div>

        <div class="glossary-card-text">
          <p class="glossary-card-italian">
            ${italianDisplay}
          </p>

          <p class="glossary-card-english">
            ${item.english}
          </p>
        </div>

      </article>
    `;
  }

  function createTopicSection(
    topic,
    matchingItems
  ) {
    return `
      <section
        class="glossary-topic-section"
        data-topic="${topic.id}"
      >

        <header class="glossary-topic-heading">
          <span
            class="glossary-topic-icon"
            aria-hidden="true"
          >
            ${topic.icon}
          </span>

          <h2>
            ${topic.italian}

            <span>
              ${topic.english}
            </span>
          </h2>

          <button
            type="button"
            class="glossary-print-button"
            data-print-topic="${topic.id}"
          >
            🖨️ Stampa · Print
          </button>
        </header>

        <div class="glossary-grid">
          ${matchingItems
            .map(createVocabularyCard)
            .join("")}
        </div>

      </section>
    `;
  }

  function renderGlossary() {
    const selectedTopic =
      topicFilter.value;

    const searchTerm =
      normalizeText(searchInput.value);

    const sections = [];

    let visibleItemCount = 0;

    glossaryTopics.forEach(topic => {
      if (
        selectedTopic !== "all" &&
        selectedTopic !== topic.id
      ) {
        return;
      }

      const matchingItems =
        topic.vocabulary.filter(item =>
          itemMatchesSearch(
            item,
            searchTerm
          )
        );

      if (!matchingItems.length) {
        return;
      }

      visibleItemCount +=
        matchingItems.length;

      sections.push(
        createTopicSection(
          topic,
          matchingItems
        )
      );
    });

    glossaryContent.innerHTML =
      sections.join("");

    glossaryEmpty.hidden =
      visibleItemCount !== 0;

    glossaryContent.hidden =
      visibleItemCount === 0;

    glossaryCount.textContent =
      visibleItemCount === 1
        ? "1 parola · 1 word"
        : `${visibleItemCount} parole · ` +
          `${visibleItemCount} words`;

    document
      .querySelectorAll(
        ".glossary-audio-button"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            speakItalian(
              button.dataset.speak
            );
          }
        );
      });

    document
      .querySelectorAll(
        ".glossary-print-button"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            printGlossaryTopic(
              button.dataset.printTopic
            );
          }
        );
      });
  }

  createTopicOptions();

  /*
    A direct topic link such as
    glossary.html?topic=animals
    opens the glossary already filtered
    to that vocabulary set.
  */
  const requestedTopic =
    new URLSearchParams(
      window.location.search
    ).get("topic");

  if (
    requestedTopic &&
    glossaryTopics.some(
      topic =>
        topic.id === requestedTopic
    )
  ) {
    topicFilter.value =
      requestedTopic;
  }

  renderGlossary();

  searchInput.addEventListener(
    "input",
    renderGlossary
  );

  topicFilter.addEventListener(
    "change",
    renderGlossary
  );

  englishToggle.addEventListener(
    "change",
    () => {
      document.body.classList.toggle(
        "glossary-hide-english",
        !englishToggle.checked
      );
    }
  );

  /*
    Some browsers load voices asynchronously.
    Calling getVoices prepares the voice list.
  */
  window.speechSynthesis?.getVoices();
})();
