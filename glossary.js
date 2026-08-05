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

  function itemMatchesSearch(
    item,
    searchTerm
  ) {
    if (!searchTerm) {
      return true;
    }

    const searchableText =
      normalizeText(
        `${item.italian} ${item.english}`
      );

    return searchableText.includes(
      searchTerm
    );
  }

  function createVocabularyCard(item) {
    const articleLabel =
      item.english || item.italian;

    return `
      <article class="glossary-card">

        <button
          type="button"
          class="glossary-audio-button"
          data-speak="${item.italian}"
          aria-label="Listen to ${item.italian}"
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
            ${item.italian}
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
  }

  createTopicOptions();
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