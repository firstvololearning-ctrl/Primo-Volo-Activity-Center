"use strict";

const IMAGE_BASE = "images/animals/";

const animals = [
  { id: "cane", italian: "il cane", english: "the dog", image: "animals-01.png" },
  { id: "gatto", italian: "il gatto", english: "the cat", image: "animals-02.png" },
  { id: "mucca", italian: "la mucca", english: "the cow", image: "animals-03.png" },
  { id: "uccello", italian: "l’uccello", english: "the bird", image: "animals-04.png" },
  { id: "gallina", italian: "la gallina", english: "the chicken", image: "animals-05.png" },
  { id: "maiale", italian: "il maiale", english: "the pig", image: "animals-06.png" },
  { id: "cavallo", italian: "il cavallo", english: "the horse", image: "animals-07.png" },
  { id: "capra", italian: "la capra", english: "the goat", image: "animals-08.png" },
  { id: "lupo", italian: "il lupo", english: "the wolf", image: "animals-09.png" },
  { id: "volpe", italian: "la volpe", english: "the fox", image: "animals-10.png" },
  { id: "serpente", italian: "il serpente", english: "the snake", image: "animals-11.png" },
  { id: "coniglio", italian: "il coniglio", english: "the rabbit", image: "animals-12.png" },
  { id: "pecora", italian: "la pecora", english: "the sheep", image: "animals-13.png" },
  { id: "anatra", italian: "l’anatra", english: "the duck", image: "animals-14.png" },
  { id: "tacchino", italian: "il tacchino", english: "the turkey", image: "animals-15.png" },
  { id: "asino", italian: "l’asino", english: "the donkey", image: "animals-16.png" },
  { id: "cervo", italian: "il cervo", english: "the deer", image: "animals-17.png" },
  { id: "riccio", italian: "il riccio", english: "the hedgehog", image: "animals-18.png" },
  { id: "rana", italian: "la rana", english: "the frog", image: "animals-19.png" },
  { id: "pesce", italian: "il pesce", english: "the fish", image: "animals-20.png" }
];

const animalTray = document.querySelector("#animalTray");
const targetGrid = document.querySelector("#targetGrid");
const languageCard = document.querySelector("#languageCard");
const completedWords = document.querySelector("#completedWords");
const newRoundButton = document.querySelector("#newRoundButton");

let currentAnimals = [];
let activeAnimal = null;
let dragGhost = null;
let pointerId = null;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getAnimal(id) {
  return animals.find(animal => animal.id === id);
}

function makeRound() {
  currentAnimals = shuffle(animals).slice(0, 4);

  animalTray.innerHTML = "";
  targetGrid.innerHTML = "";
  completedWords.innerHTML = "";

  languageCard.innerHTML = `
    <strong>Trova un animale.</strong>
    <span>Find an animal.</span>
  `;

  shuffle(currentAnimals).forEach(animal => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "animal-card";
    card.dataset.id = animal.id;

    card.innerHTML = `
      <img src="${IMAGE_BASE}${animal.image}" alt="">
      <strong>${animal.italian}</strong>
    `;

    animalTray.appendChild(card);
  });

  shuffle(currentAnimals).forEach(animal => {
    const target = document.createElement("div");

    target.className = "animal-target";
    target.dataset.id = animal.id;

    target.innerHTML = `
      <img
        class="silhouette-image"
        src="${IMAGE_BASE}${animal.image}"
        alt=""
      >
    `;

    targetGrid.appendChild(target);
  });

  attachEvents();
}

function makeGhost(card, x, y) {
  dragGhost = document.createElement("div");
  dragGhost.className = "drag-ghost";

  dragGhost.innerHTML = `
    <img src="${card.querySelector("img").src}" alt="">
  `;

  document.body.appendChild(dragGhost);
  moveGhost(x, y);
}

function moveGhost(x, y) {
  if (!dragGhost) return;

  dragGhost.style.left = `${x}px`;
  dragGhost.style.top = `${y}px`;
}

function removeGhost() {
  dragGhost?.remove();
  dragGhost = null;
}

function clearHighlights() {
  document.querySelectorAll(".animal-target").forEach(target => {
    target.classList.remove("drag-over");
  });
}

function targetAt(x, y) {
  return document
    .elementFromPoint(x, y)
    ?.closest(".animal-target");
}

function attachEvents() {
  document.querySelectorAll(".animal-card").forEach(card => {

    card.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.preventDefault();

      activeAnimal = getAnimal(card.dataset.id);
      pointerId = event.pointerId;

      card.classList.add("dragging");

      makeGhost(card, event.clientX, event.clientY);
    });

    card.draggable = true;

    card.addEventListener("dragstart", event => {
      activeAnimal = getAnimal(card.dataset.id);

      event.dataTransfer.setData(
        "text/plain",
        activeAnimal.id
      );

      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      clearHighlights();
    });

  });

  document.querySelectorAll(".animal-target").forEach(target => {

    target.addEventListener("dragover", event => {
      event.preventDefault();
      target.classList.add("drag-over");
    });

    target.addEventListener("dragleave", () => {
      target.classList.remove("drag-over");
    });

    target.addEventListener("drop", event => {
      event.preventDefault();

      target.classList.remove("drag-over");

      const animal = getAnimal(
        event.dataTransfer.getData("text/plain")
      );

      if (animal) checkMatch(animal, target);
    });

  });
}

document.addEventListener(
  "pointermove",
  event => {
    if (!activeAnimal || event.pointerId !== pointerId) return;

    event.preventDefault();

    moveGhost(event.clientX, event.clientY);
    clearHighlights();

    targetAt(event.clientX, event.clientY)
      ?.classList.add("drag-over");
  },
  { passive: false }
);

document.addEventListener("pointerup", event => {
  if (!activeAnimal || event.pointerId !== pointerId) return;

  const target = targetAt(event.clientX, event.clientY);

  if (target) {
    checkMatch(activeAnimal, target);
  }

  document
    .querySelector(".animal-card.dragging")
    ?.classList.remove("dragging");

  clearHighlights();
  removeGhost();

  activeAnimal = null;
  pointerId = null;
});

function checkMatch(animal, target) {
  if (target.classList.contains("correct")) return;

  if (target.dataset.id !== animal.id) {
    target.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(0)" }
      ],
      { duration: 260 }
    );

    return;
  }

  target.classList.add("correct");

  target.innerHTML = `
    <img
      class="matched-image"
      src="${IMAGE_BASE}${animal.image}"
      alt="${animal.italian}"
    >
    <div class="target-label">
      ${animal.italian}
    </div>
  `;

  document
    .querySelector(`.animal-card[data-id="${animal.id}"]`)
    ?.classList.add("complete");

  languageCard.innerHTML = `
    <strong>È ${animal.italian}.</strong>
    <span>It is ${animal.english}.</span>
  `;

  const chip = document.createElement("div");
  chip.className = "word-chip";
  chip.textContent = animal.italian;
  completedWords.appendChild(chip);
}

newRoundButton.addEventListener("click", makeRound);

makeRound();
