"use strict";

const clothingCards = Array.from(
  document.querySelectorAll(".clothing-card")
);

const dropZones = Array.from(
  document.querySelectorAll(".drop-zone")
);

const figure = document.querySelector("#figure");
const resetButton = document.querySelector("#resetButton");
const sentenceOutput = document.querySelector("#sentenceOutput");
const wornItems = document.querySelector("#wornItems");

function sayItalian(text) {
  if (
    typeof window.primoVoloSpeakItalian ===
    "function"
  ) {
    window.primoVoloSpeakItalian(text);
  }
}

const dressInstructionAudio =
  document.querySelector(
    "#dressInstructionAudio"
  );

const dressQuestionAudio =
  document.querySelector(
    "#dressQuestionAudio"
  );

let activeItem = null;
let dragGhost = null;
let pointerId = null;

const wornBySlot = {
  top: null,
  bottom: null,
  shoes: null,
  hat: null,
  accessory: null
};

function getCardData(card) {
  return {
    item: card.dataset.item,
    slot: card.dataset.slot,
    label: card.dataset.label,
    image: card.querySelector(".clothing-image").getAttribute("src")
  };
}

function clearZoneHighlights() {
  dropZones.forEach((zone) => {
    zone.classList.remove("drag-over");
  });
}

function makeGhost(card, x, y) {
  const ghost = card.cloneNode(true);

  ghost.classList.remove("clothing-card");
  ghost.classList.add("drag-ghost");

  document.body.appendChild(ghost);

  moveGhost(x, y);

  return ghost;
}

function moveGhost(x, y) {
  if (!dragGhost) {
    return;
  }

  dragGhost.style.left = `${x}px`;
  dragGhost.style.top = `${y}px`;
}

function removeGhost() {
  dragGhost?.remove();
  dragGhost = null;
}

function getZoneAtPoint(x, y) {
  const element = document.elementFromPoint(x, y);

  return element?.closest(".drop-zone") || null;
}

function startPointerDrag(event, card) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  event.preventDefault();

  activeItem = getCardData(card);
  pointerId = event.pointerId;

  card.setPointerCapture?.(pointerId);

  card.classList.add("dragging");

  dragGhost = makeGhost(
    card,
    event.clientX,
    event.clientY
  );
}

function movePointerDrag(event) {
  if (!activeItem || event.pointerId !== pointerId) {
    return;
  }

  event.preventDefault();

  moveGhost(
    event.clientX,
    event.clientY
  );

  clearZoneHighlights();

  const zone = getZoneAtPoint(
    event.clientX,
    event.clientY
  );

  if (
    zone &&
    zone.dataset.slot === activeItem.slot
  ) {
    zone.classList.add("drag-over");
  }
}

function endPointerDrag(event) {
  if (!activeItem || event.pointerId !== pointerId) {
    return;
  }

  event.preventDefault();

  const zone = getZoneAtPoint(
    event.clientX,
    event.clientY
  );

  if (
    zone &&
    zone.dataset.slot === activeItem.slot
  ) {
    dressFigure(activeItem);
  }

  const draggingCard =
    document.querySelector(".clothing-card.dragging");

  draggingCard?.classList.remove("dragging");

  clearZoneHighlights();
  removeGhost();

  activeItem = null;
  pointerId = null;
}

function dressFigure(item) {
  removePieceFromSlot(item.slot);

  const wrapper = document.createElement("div");

  wrapper.className = "worn-piece";
  wrapper.dataset.slot = item.slot;
  wrapper.dataset.item = item.item;
  wrapper.dataset.label = item.label;

  wrapper.innerHTML = `<img src="${item.image}" alt="${item.label}">`;

  figure.appendChild(wrapper);

  wornBySlot[item.slot] = {
    item: item.item,
    label: item.label,
    element: wrapper
  };

  updateLanguagePanel();

  sayItalian(
    buildItalianSentence(
      getWornLabels()
    ).replace(
      " e ",
      " e anche "
    )
  );
}

function removePieceFromSlot(slot) {
  const current = wornBySlot[slot];

  if (!current) {
    return;
  }

  current.element.remove();
  wornBySlot[slot] = null;
}

function getWornLabels() {
  return Object.values(wornBySlot)
    .filter(Boolean)
    .map((entry) => entry.label);
}

function buildItalianSentence(labels) {
  if (labels.length === 0) {
    return "Il personaggio...";
  }

  if (labels.length === 1) {
    return `Il personaggio indossa ${labels[0]}.`;
  }

  if (labels.length === 2) {
    return `Il personaggio indossa ${labels[0]} e ${labels[1]}.`;
  }

  const allButLast = labels.slice(0, -1);
  const last = labels[labels.length - 1];

  return `Il personaggio indossa ${allButLast.join(", ")} e ${last}.`;
}

function buildSpokenItalianSentence(labels) {
  if (labels.length === 0) {
    return "Il personaggio.";
  }

  if (labels.length === 1) {
    return `Il personaggio indossa ${labels[0]}.`;
  }

  if (labels.length === 2) {
    return `Il personaggio indossa ${labels[0]} e anche ${labels[1]}.`;
  }

  const allButLast =
    labels.slice(0, -1);

  const last =
    labels[labels.length - 1];

  return `Il personaggio indossa ${allButLast.join(", ")} e anche ${last}.`;
}


function buildEnglishSentence(labels) {
  if (labels.length === 0) {
    return "The figure...";
  }

  const englishMap = {
    "la maglietta": "a T-shirt",
    "il maglione": "a sweater",
    "la giacca": "a jacket",
    "i pantaloni": "pants",
    "i pantaloncini": "shorts",
    "la gonna": "a skirt",
    "le scarpe": "shoes",
    "il cappello": "a hat",
    "la sciarpa": "a scarf"
  };

  const englishLabels = labels.map(
    (label) => englishMap[label] || label
  );

  if (englishLabels.length === 1) {
    return `The figure is wearing ${englishLabels[0]}.`;
  }

  if (englishLabels.length === 2) {
    return `The figure is wearing ${englishLabels[0]} and ${englishLabels[1]}.`;
  }

  const allButLast = englishLabels.slice(0, -1);
  const last = englishLabels[englishLabels.length - 1];

  return `The figure is wearing ${allButLast.join(", ")}, and ${last}.`;
}

function updateLanguagePanel() {
  const labels = getWornLabels();

  sentenceOutput.innerHTML = `
    <strong>${buildItalianSentence(labels)}</strong>
    <span>${buildEnglishSentence(labels)}</span>
  `;

  wornItems.innerHTML = "";

  labels.forEach((label) => {
    const chip = document.createElement("div");

    chip.className = "worn-chip";
    chip.textContent = label;

    wornItems.appendChild(chip);
  });
}

function resetActivity() {
  document
    .querySelectorAll(".worn-piece")
    .forEach((piece) => piece.remove());

  Object.keys(wornBySlot).forEach((slot) => {
    wornBySlot[slot] = null;
  });

  clearZoneHighlights();
  removeGhost();

  activeItem = null;
  pointerId = null;

  updateLanguagePanel();
}

/* ========================================
   Pointer / touch dragging
   ======================================== */

clothingCards.forEach((card) => {
  card.addEventListener(
    "pointerdown",
    (event) => {
      sayItalian(
        card.dataset.label
      );

      startPointerDrag(
        event,
        card
      );
    }
  );
});

document.addEventListener(
  "pointermove",
  movePointerDrag,
  { passive: false }
);

document.addEventListener(
  "pointerup",
  endPointerDrag,
  { passive: false }
);

document.addEventListener(
  "pointercancel",
  endPointerDrag,
  { passive: false }
);

/* ========================================
   Desktop HTML drag fallback
   ======================================== */

clothingCards.forEach((card) => {
  card.draggable = true;

  card.addEventListener(
    "dragstart",
    (event) => {
      const item = getCardData(card);

      event.dataTransfer.effectAllowed = "move";

      event.dataTransfer.setData(
        "application/json",
        JSON.stringify(item)
      );

      card.classList.add("dragging");
    }
  );

  card.addEventListener(
    "dragend",
    () => {
      card.classList.remove("dragging");
      clearZoneHighlights();
    }
  );
});

dropZones.forEach((zone) => {
  zone.addEventListener(
    "dragover",
    (event) => {
      event.preventDefault();

      let item;

      try {
        item = JSON.parse(
          event.dataTransfer.getData("application/json") || "{}"
        );
      } catch {
        return;
      }

      if (item.slot === zone.dataset.slot) {
        zone.classList.add("drag-over");
      }
    }
  );

  zone.addEventListener(
    "dragleave",
    () => {
      zone.classList.remove("drag-over");
    }
  );

  zone.addEventListener(
    "drop",
    (event) => {
      event.preventDefault();

      zone.classList.remove("drag-over");

      let item;

      try {
        item = JSON.parse(
          event.dataTransfer.getData("application/json")
        );
      } catch {
        return;
      }

      if (item.slot !== zone.dataset.slot) {
        return;
      }

      dressFigure(item);
    }
  );
});

dressInstructionAudio?.addEventListener(
  "click",
  () => {
    sayItalian(
      "Trascina i vestiti sul personaggio."
    );
  }
);

dressQuestionAudio?.addEventListener(
  "click",
  () => {
    sayItalian(
      "Che cosa indossa?"
    );
  }
);

resetButton.addEventListener(
  "click",
  resetActivity
);

updateLanguagePanel();
