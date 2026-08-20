"use strict";

(function initializePrimoVoloAudioControls() {
  function speakItalianText(text) {
    const cleanText =
      String(text || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanText) {
      return;
    }

    if (
      typeof window.speakItalian === "function"
    ) {
      window.speakItalian(cleanText);
      return;
    }

    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );

    utterance.lang = "it-IT";
    utterance.rate = 0.78;

    const voices =
      window.speechSynthesis.getVoices();

    const italianVoice =
      voices.find(
        voice =>
          String(voice.lang || "")
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

  window.PrimoVoloAudio = {
    speakItalian: speakItalianText
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
