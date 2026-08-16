"use strict";

/*
  Primo Volo d'Italiano
  Shared noun + modifier agreement helpers

  Used for combinations such as:

  la maglietta + rosso + nuovo
  → la maglietta rossa e nuova

  gli stivali + nero + nuovo
  → gli stivali neri e nuovi
*/

(function initializeLanguageAgreement() {

  function getAgreementKey(noun) {
    if (!noun) {
      return "masculine";
    }

    const gender =
      noun.gender === "feminine"
        ? "feminine"
        : "masculine";

    const number =
      noun.number === "plural"
        ? "plural"
        : "singular";

    if (number === "plural") {
      return gender === "feminine"
        ? "femininePlural"
        : "masculinePlural";
    }

    return gender;
  }


  function getModifierForm(modifier, noun) {
    if (!modifier) {
      return "";
    }

    const agreementKey =
      getAgreementKey(noun);

    return (
      modifier[agreementKey] ||
      modifier.italian ||
      ""
    );
  }


  function buildModifiedNounPhrase(
    noun,
    {
      color = null,
      adjective = null
    } = {}
  ) {
    if (!noun?.italian) {
      return "";
    }

    const parts = [noun.italian];

    const colorForm =
      getModifierForm(color, noun);

    const adjectiveForm =
      getModifierForm(adjective, noun);

    if (colorForm) {
      parts.push(colorForm);
    }

    let phrase = parts.join(" ");

    if (adjectiveForm) {
      phrase += colorForm
        ? ` e ${adjectiveForm}`
        : ` ${adjectiveForm}`;
    }

    return phrase;
  }


  window.PrimoVoloAgreement = Object.freeze({
    getAgreementKey,
    getModifierForm,
    buildModifiedNounPhrase
  });

})();
