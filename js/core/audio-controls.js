"use strict";

/*
  Primo Volo — reusable Italian audio control

  Any learner-facing control with:
    data-speak-it="Italian text"

  is spoken in Italian.

  This helper intentionally manages Web Speech itself instead of
  delegating to another page helper. Chrome and Safari initialize
  speech voices differently, so this keeps the behavior consistent.
*/

(function initializePrimoVoloAudioControls() {
  let activeUtterance = null;
  let pendingSpeakTimer = null;
  let cachedVoices = [];

  function cleanSpeechText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeAttribute(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function replayButtonMarkup(
    text,
    label = "Ascolta di nuovo · Listen again"
  ) {
    const cleanText =
      cleanSpeechText(text);

    if (!cleanText) {
      return "";
    }

    const safeText =
      escapeAttribute(cleanText);

    const safeLabel =
      escapeAttribute(label);

    return `
      <button
        type="button"
        class="pv-audio-button pv-audio-replay"
        data-speak-it="${safeText}"
        aria-label="${safeLabel}"
        title="${safeLabel}"
      >🔊</button>
    `;
  }

  function refreshVoices() {
    if (!("speechSynthesis" in window)) {
      cachedVoices = [];
      return cachedVoices;
    }

    const voices =
      window.speechSynthesis.getVoices();

    if (Array.isArray(voices) && voices.length) {
      cachedVoices = voices;
    }

    return cachedVoices;
  }

  function findItalianVoice() {
    const voices =
      refreshVoices();

    return (
      voices.find(
        voice =>
          String(voice.lang || "")
            .toLowerCase() === "it-it"
      ) ||
      voices.find(
        voice =>
          String(voice.lang || "")
            .toLowerCase()
            .startsWith("it")
      ) ||
      null
    );
  }

  function browserSpeechAvailable() {
    return (
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window
    );
  }

  function stopSpeech() {
    if (!browserSpeechAvailable()) {
      return;
    }

    if (pendingSpeakTimer) {
      window.clearTimeout(
        pendingSpeakTimer
      );
      pendingSpeakTimer = null;
    }

    activeUtterance = null;

    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.warn(
        "Primo Volo audio could not stop speech.",
        error
      );
    }
  }

  function speakItalianText(text) {
    const cleanText =
      cleanSpeechText(text);

    if (!cleanText) {
      return false;
    }

    if (!browserSpeechAvailable()) {
      console.warn(
        "Italian audio is not supported in this browser."
      );
      return false;
    }

    const synth =
      window.speechSynthesis;

    if (pendingSpeakTimer) {
      window.clearTimeout(
        pendingSpeakTimer
      );
      pendingSpeakTimer = null;
    }

    /*
      Chrome can swallow an utterance when cancel() and speak()
      happen in the same event turn. Cancel first, then speak after
      a short delay while retaining the utterance in module scope.
    */
    try {
      synth.cancel();

      if (synth.paused) {
        synth.resume();
      }
    } catch (error) {
      console.warn(
        "Primo Volo audio reset failed.",
        error
      );
    }

    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );

    activeUtterance = utterance;

    utterance.lang = "it-IT";
    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.volume = 1;

    const initialVoice =
      findItalianVoice();

    if (initialVoice) {
      utterance.voice =
        initialVoice;
    }

    utterance.onend = () => {
      if (
        activeUtterance === utterance
      ) {
        activeUtterance = null;
      }
    };

    utterance.onerror = event => {
      /*
        Chrome reports "interrupted" or "canceled" when a learner
        quickly presses another audio button. Those are expected.
      */
      if (
        ![
          "interrupted",
          "canceled"
        ].includes(event.error)
      ) {
        console.warn(
          "Primo Volo Italian audio error:",
          event.error
        );
      }

      if (
        activeUtterance === utterance
      ) {
        activeUtterance = null;
      }
    };

    pendingSpeakTimer =
      window.setTimeout(
        () => {
          pendingSpeakTimer = null;

          if (
            activeUtterance !== utterance
          ) {
            return;
          }

          /*
            Chrome may populate voices only after the first user
            interaction. Re-check immediately before speaking.
          */
          if (!utterance.voice) {
            const lateVoice =
              findItalianVoice();

            if (lateVoice) {
              utterance.voice =
                lateVoice;
            }
          }

          try {
            synth.resume();
            synth.speak(utterance);

            /*
              A second resume is harmless in Safari and helps Chrome
              recover if its speech queue enters a paused state.
            */
            window.setTimeout(
              () => {
                if (
                  activeUtterance === utterance &&
                  synth.paused
                ) {
                  synth.resume();
                }
              },
              250
            );
          } catch (error) {
            console.warn(
              "Primo Volo could not play Italian audio.",
              error
            );
          }
        },
        90
      );

    return true;
  }

  /*
    Chrome often loads system voices asynchronously.
    Prime the list now and refresh it when the browser announces
    that voices are available.
  */
  refreshVoices();

  if (
    "speechSynthesis" in window &&
    typeof window.speechSynthesis
      .addEventListener === "function"
  ) {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      refreshVoices
    );
  }

  window.PrimoVoloAudio = {
    speakItalian: speakItalianText,
    replayButtonMarkup,
    stop: stopSpeech,
    getStatus() {
      return {
        supported:
          browserSpeechAvailable(),
        voices:
          refreshVoices().length,
        italianVoice:
          findItalianVoice()?.name ||
          null,
        speaking:
          browserSpeechAvailable()
            ? window.speechSynthesis
                .speaking
            : false,
        paused:
          browserSpeechAvailable()
            ? window.speechSynthesis
                .paused
            : false
      };
    }
  };

  document.addEventListener(
    "click",
    event => {
      const control =
        event.target.closest(
          "[data-speak-it]"
        );

      if (!control) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      speakItalianText(
        control.dataset.speakIt
      );
    }
  );
})();
