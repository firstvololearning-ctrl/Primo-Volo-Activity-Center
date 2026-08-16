"use strict";

/*
  Primo Volo shared Italian audio helper.

  Use:
    primoVoloSpeakItalian("Che cosa indossa?");
    PrimoVoloAudio.stop();
*/

(() => {
  function getItalianVoice() {
    if (!("speechSynthesis" in window)) {
      return null;
    }

    const voices =
      window.speechSynthesis.getVoices();

    return (
      voices.find(
        voice =>
          String(voice.lang)
            .toLowerCase() === "it-it"
      ) ||
      voices.find(
        voice =>
          String(voice.lang)
            .toLowerCase()
            .startsWith("it")
      ) ||
      null
    );
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function speak(text) {
    const spokenText =
      cleanText(text);

    if (!spokenText) {
      return;
    }

    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      console.warn(
        "Italian audio is not supported in this browser."
      );
      return;
    }

    stop();

    const utterance =
      new SpeechSynthesisUtterance(
        spokenText
      );

    utterance.lang = "it-IT";

    /*
      Match the slower, learner-friendly
      speech rate already used in Primo Volo.
    */
    utterance.rate = 0.70;
    utterance.pitch = 1;

    const italianVoice =
      getItalianVoice();

    if (italianVoice) {
      utterance.voice =
        italianVoice;
    }

    window.speechSynthesis.speak(
      utterance
    );
  }

  window.PrimoVoloAudio = {
    speak,
    stop,
    getItalianVoice
  };

  window.primoVoloSpeakItalian =
    speak;
})();
