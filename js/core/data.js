"use strict";

const hobbies = [
  {
    italian: "aggiustare o costruire cose",
    english: "fix or build things",
    image: "images/hobby-e-tempo-libero/01-aggiustare-o-costruire-cose.png"
  },
  {
    italian: "andare al parco",
    english: "go to the park",
    image: "images/hobby-e-tempo-libero/02-andare-al-parco.png"
  },
  {
    italian: "ascoltare la musica",
    english: "listen to music",
    image: "images/hobby-e-tempo-libero/03-ascoltare-la-musica.png"
  },
  {
    italian: "ballare",
    english: "dance",
    image: "images/hobby-e-tempo-libero/04-ballare.png"
  },
  {
    italian: "cantare",
    english: "sing",
    image: "images/hobby-e-tempo-libero/05-cantare.png"
  },
  {
    italian: "fare arte",
    english: "make art",
    image: "images/hobby-e-tempo-libero/06-fare-arte.png"
  },
  {
    italian: "fare sport",
    english: "play sports",
    image: "images/hobby-e-tempo-libero/07-fare-sport.png"
  },
  {
    italian: "leggere",
    english: "read",
    image: "images/hobby-e-tempo-libero/08-leggere.png"
  },
  {
    italian: "fare spese",
    english: "go shopping",
    image: "images/hobby-e-tempo-libero/09-fare-spese.png"
  },
  {
    italian: "giocare ai videogiochi",
    english: "play video games",
    image: "images/hobby-e-tempo-libero/10-giocare-ai-videogiochi.png"
  },
  {
    italian: "giocare ai giochi da tavolo",
    english: "play board games",
    image: "images/hobby-e-tempo-libero/11-giocare-ai-giochi-da-tavolo.png"
  },
  {
    italian: "passare del tempo con la famiglia",
    english: "spend time with family",
    image: "images/hobby-e-tempo-libero/12-passare-del-tempo-con-la-famiglia.png"
  },
  {
    italian: "scrivere",
    english: "write",
    image: "images/hobby-e-tempo-libero/13-scrivere.png"
  },
  {
    italian: "suonare uno strumento",
    english: "play an instrument",
    image: "images/hobby-e-tempo-libero/14-suonare-uno-strumento.png"
  },
  {
    italian: "usare la tecnologia",
    english: "use technology",
    image: "images/hobby-e-tempo-libero/15-usare-la-tecnologia.png"
  },
  {
    italian: "uscire con i miei amici",
    english: "hang out with my friends",
    image: "images/hobby-e-tempo-libero/16-uscire-con-i-miei-amici.png"
  }
];

const supplies = [
  {
    italian: "il foglio",
    english: "sheet of paper",
    image: "images/classroom/supplies/supplies-01.png"
  },
  {
    italian: "le forbici",
    english: "scissors",
    image: "images/classroom/supplies/supplies-02.png"
  },
  {
    italian: "la colla",
    english: "glue",
    image: "images/classroom/supplies/supplies-03.png"
  },
  {
    italian: "la matita",
    english: "pencil",
    image: "images/classroom/supplies/supplies-04.png"
  },
  {
    italian: "la penna",
    english: "pen",
    image: "images/classroom/supplies/supplies-05.png"
  },
  {
    italian: "la matita colorata",
    english: "colored pencil",
    image: "images/classroom/supplies/supplies-06.png"
  },
  {
    italian: "il gesso",
    english: "chalk",
    image: "images/classroom/supplies/supplies-07.png"
  },
  {
    italian: "il pennarello",
    english: "marker",
    image: "images/classroom/supplies/supplies-08.png"
  },
  {
    italian: "il righello",
    english: "ruler",
    image: "images/classroom/supplies/supplies-09.png"
  },
  {
    italian: "la spillatrice",
    english: "stapler",
    image: "images/classroom/supplies/supplies-10.png"
  },
  {
    italian: "il nastro adesivo",
    english: "tape",
    image: "images/classroom/supplies/supplies-11.png"
  },
  {
    italian: "la gomma",
    english: "eraser",
    image: "images/classroom/supplies/supplies-12.png"
  },
  {
    italian: "lo zaino",
    english: "backpack",
    image: "images/classroom/supplies/supplies-13.png"
  },
  {
    italian: "il quaderno",
    english: "notebook",
    image: "images/classroom/supplies/supplies-14.png"
  }
];
const classroomExpressions = [

  {
    italian: "Posso andare in bagno?",
    english: "May I go to the bathroom?",
    image: "images/classroom/expressions/expressions-01.png"
  },

  {
    italian: "Quando è la merenda?",
    english: "When is snack time?",
    image: "images/classroom/expressions/expressions-02.png"
  },

  {
    italian: "Posso andare a prendere dell'acqua?",
    english: "May I get some water?",
    image: "images/classroom/expressions/expressions-03.png"
  },

  {
    italian: "Siediti!",
    english: "Sit down!",
    image: "images/classroom/expressions/expressions-04.png"
  },

  {
    italian: "Sedetevi!",
    english: "Sit down! (plural)",
    image: "images/classroom/expressions/expressions-05.png"
  },

  {
    italian: "Alzati!",
    english: "Stand up!",
    image: "images/classroom/expressions/expressions-06.png"
  },

  {
    italian: "Alzatevi!",
    english: "Stand up! (plural)",
    image: "images/classroom/expressions/expressions-07.png"
  },

  {
    italian: "Che cosa vedi?",
    english: "What do you see?",
    image: "images/classroom/expressions/expressions-08.png"
  },

  {
    italian: "Non so.",
    english: "I don't know.",
    image: "images/classroom/expressions/expressions-09.png"
  },

  {
    italian: "Non capisco.",
    english: "I don't understand.",
    image: "images/classroom/expressions/expressions-10.png"
  }

];
const food = [
  {
    italian: "la mela",
    english: "apple",
    image: "images/food/food-01.png",
    type: "food"
  },
  {
    italian: "l'arancia",
    english: "orange",
    image: "images/food/food-02.png",
    type: "food"
  },
  {
    italian: "la banana",
    english: "banana",
    image: "images/food/food-03.png",
    type: "food"
  },
  {
    italian: "il pane",
    english: "bread",
    image: "images/food/food-04.png",
    type: "food"
  },
  {
    italian: "il formaggio",
    english: "cheese",
    image: "images/food/food-05.png",
    type: "food"
  },
  {
    italian: "l'uovo",
    english: "egg",
    image: "images/food/food-06.png",
    type: "food"
  },
  {
    italian: "l'uva",
    english: "grapes",
    image: "images/food/food-07.png",
    type: "food"
  },
  {
    italian: "il succo d'arancia",
    english: "orange juice",
    image: "images/food/food-08.png",
    type: "drink"
  },
  {
    italian: "il latte",
    english: "milk",
    image: "images/food/food-09.png",
    type: "drink"
  },
  {
    italian: "l'acqua",
    english: "water",
    image: "images/food/food-10.png",
    type: "drink"
  },
  {
    italian: "il pollo",
    english: "chicken",
    image: "images/food/food-11.png",
    type: "food"
  },
  {
    italian: "il pesce",
    english: "fish",
    image: "images/food/food-12.png",
    type: "food"
  },
  {
    italian: "l'insalata",
    english: "salad",
    image: "images/food/food-13.png",
    type: "food"
  },
  {
    italian: "il pomodoro",
    english: "tomato",
    image: "images/food/food-14.png",
    type: "food"
  },
  {
    italian: "la fragola",
    english: "strawberry",
    image: "images/food/food-15.png",
    type: "food"
  },
  {
    italian: "la carota",
    english: "carrot",
    image: "images/food/food-16.png",
    type: "food"
  },
  {
    italian: "la patata",
    english: "potato",
    image: "images/food/food-17.png",
    type: "food"
  },
  {
    italian: "la zuppa",
    english: "soup",
    image: "images/food/food-18.png",
    type: "food"
  },
  {
    italian: "il biscotto",
    english: "cookie",
    image: "images/food/food-19.png",
    type: "food"
  },
  {
    italian: "il riso",
    english: "rice",
    image: "images/food/food-20.png",
    type: "food"
  }
];
const places = [
  {
    italian: "la scuola",
    english: "school",
    image: "images/places/places-01.png"
  },
  {
    italian: "il parco",
    english: "park",
    image: "images/places/places-02.png"
  },
  {
    italian: "l’ospedale",
    english: "hospital",
    image: "images/places/places-03.png"
  },
  {
    italian: "il supermercato",
    english: "supermarket",
    image: "images/places/places-04.png"
  },
  {
    italian: "il ristorante",
    english: "restaurant",
    image: "images/places/places-05.png"
  },
  {
    italian: "la biblioteca",
    english: "library",
    image: "images/places/places-06.png"
  },
  {
    italian: "la caserma dei pompieri",
    english: "fire station",
    image: "images/places/places-07.png"
  },
  {
    italian: "la farmacia",
    english: "pharmacy",
    image: "images/places/places-08.png"
  }
];
const prepositions = [
  {
    italian: "in",
    english: "in",
    sentenceTail: "nella scatola",
    image: "images/prepositions/in.png"
  },
  {
    italian: "su",
    english: "on",
    sentenceTail: "sulla scatola",
    image: "images/prepositions/on.png"
  },
  {
    italian: "sotto",
    english: "under",
    sentenceTail: "sotto la scatola",
    image: "images/prepositions/under.png"
  },
  {
    italian: "sopra",
    english: "above",
    sentenceTail: "sopra la scatola",
    image: "images/prepositions/over.png"
  },
  {
    italian: "davanti a",
    english: "in front of",
    sentenceTail: "davanti alla scatola",
    image: "images/prepositions/in-front.png"
  },
  {
    italian: "dietro",
    english: "behind",
    sentenceTail: "dietro la scatola",
    image: "images/prepositions/behind.png"
  },
  {
    italian: "accanto a",
    english: "next to",
    sentenceTail: "accanto alla scatola",
    image: "images/prepositions/next-to.png"
  },
  {
    italian: "vicino a",
    english: "near",
    sentenceTail: "vicino alla scatola",
    image: "images/prepositions/near.png"
  },
  {
    italian: "lontano da",
    english: "far from",
    sentenceTail: "lontano dalla scatola",
    image: "images/prepositions/far.png"
  }
];
const animals = [
  {
    italian: "il cane",
    english: "dog",
    image: "images/animals/animals-01.png"
  },
  {
    italian: "il gatto",
    english: "cat",
    image: "images/animals/animals-02.png"
  },
  {
    italian: "la mucca",
    english: "cow",
    image: "images/animals/animals-03.png"
  },
  {
    italian: "l'uccello",
    english: "bird",
    image: "images/animals/animals-04.png"
  },
  {
    italian: "la gallina",
    english: "chicken",
    image: "images/animals/animals-05.png"
  },
  {
    italian: "il maiale",
    english: "pig",
    image: "images/animals/animals-06.png"
  },
  {
    italian: "il cavallo",
    english: "horse",
    image: "images/animals/animals-07.png"
  },
  {
    italian: "la capra",
    english: "goat",
    image: "images/animals/animals-08.png"
  },
  {
    italian: "il lupo",
    english: "wolf",
    image: "images/animals/animals-09.png"
  },
  {
    italian: "la volpe",
    english: "fox",
    image: "images/animals/animals-10.png"
  },
  {
    italian: "il serpente",
    english: "snake",
    image: "images/animals/animals-11.png"
  },
  {
    italian: "il coniglio",
    english: "rabbit",
    image: "images/animals/animals-12.png"
  },
  {
    italian: "la pecora",
    english: "sheep",
    image: "images/animals/animals-13.png"
  },
  {
    italian: "l'anatra",
    english: "duck",
    image: "images/animals/animals-14.png"
  },
  {
    italian: "il tacchino",
    english: "turkey",
    image: "images/animals/animals-15.png"
  },
  {
    italian: "l'asino",
    english: "donkey",
    image: "images/animals/animals-16.png"
  },
  {
    italian: "il cervo",
    english: "deer",
    image: "images/animals/animals-17.png"
  },
  {
    italian: "il riccio",
    english: "hedgehog",
    image: "images/animals/animals-18.png"
  },
  {
    italian: "la rana",
    english: "frog",
    image: "images/animals/animals-19.png"
  },
  {
    italian: "il pesce",
    english: "fish",
    image: "images/animals/animals-20.png"
  }
];
const adjectives = [
  {
    italian: "buono",
    masculine: "buono",
    feminine: "buona",
    masculinePlural: "buoni",
    femininePlural: "buone",
    english: "good",
    image: "images/adjectives/adjectives-01.png"
  },
  {
    italian: "cattivo",
    masculine: "cattivo",
    feminine: "cattiva",
    masculinePlural: "cattivi",
    femininePlural: "cattive",
    english: "bad",
    image: "images/adjectives/adjectives-02.png"
  },
  {
    italian: "piccolo",
    masculine: "piccolo",
    feminine: "piccola",
    masculinePlural: "piccoli",
    femininePlural: "piccole",
    english: "small",
    image: "images/adjectives/adjectives-03.png"
  },
  {
    italian: "grande",
    masculine: "grande",
    feminine: "grande",
    masculinePlural: "grandi",
    femininePlural: "grandi",
    english: "big",
    image: "images/adjectives/adjectives-04.png"
  },
  {
    italian: "caldo",
    masculine: "caldo",
    feminine: "calda",
    masculinePlural: "caldi",
    femininePlural: "calde",
    english: "hot",
    image: "images/adjectives/adjectives-06.png"
  },
  {
    italian: "freddo",
    masculine: "freddo",
    feminine: "fredda",
    masculinePlural: "freddi",
    femininePlural: "fredde",
    english: "cold",
    image: "images/adjectives/adjectives-05.png"
  },
  {
    italian: "lento",
    masculine: "lento",
    feminine: "lenta",
    masculinePlural: "lenti",
    femininePlural: "lente",
    english: "slow",
    image: "images/adjectives/adjectives-07.png"
  },
  {
    italian: "veloce",
    masculine: "veloce",
    feminine: "veloce",
    masculinePlural: "veloci",
    femininePlural: "veloci",
    english: "fast",
    image: "images/adjectives/adjectives-08.png"
  },
  {
    italian: "lungo",
    masculine: "lungo",
    feminine: "lunga",
    masculinePlural: "lunghi",
    femininePlural: "lunghe",
    english: "long",
    image: "images/adjectives/lungo.png"
  },
  {
    italian: "corto",
    masculine: "corto",
    feminine: "corta",
    masculinePlural: "corti",
    femininePlural: "corte",
    english: "short (length)",
    image: "images/adjectives/corto.png"
  },
  {
    italian: "alto",
    masculine: "alto",
    feminine: "alta",
    masculinePlural: "alti",
    femininePlural: "alte",
    english: "tall",
    image: "images/adjectives/alto.png"
  },
  {
    italian: "basso",
    masculine: "basso",
    feminine: "bassa",
    masculinePlural: "bassi",
    femininePlural: "basse",
    english: "short (height)",
    image: "images/adjectives/basso.png"
  },
  {
    italian: "pesante",
    masculine: "pesante",
    feminine: "pesante",
    masculinePlural: "pesanti",
    femininePlural: "pesanti",
    english: "heavy",
    image: "images/adjectives/pesante.png"
  },
  {
    italian: "leggero",
    masculine: "leggero",
    feminine: "leggera",
    masculinePlural: "leggeri",
    femininePlural: "leggere",
    english: "light (weight)",
    image: "images/adjectives/leggero.png"
  },
  {
    italian: "nuovo",
    masculine: "nuovo",
    feminine: "nuova",
    masculinePlural: "nuovi",
    femininePlural: "nuove",
    english: "new",
    image: "images/adjectives/nuovo.png"
  },
  {
    italian: "vecchio",
    masculine: "vecchio",
    feminine: "vecchia",
    masculinePlural: "vecchi",
    femininePlural: "vecchie",
    english: "old",
    image: "images/adjectives/vecchio.png"
  }
];
const seasons = [
  {
    italian: "inverno",
    english: "winter",
    image: "images/seasons/seasons-01.png"
  },
  {
    italian: "primavera",
    english: "spring",
    image: "images/seasons/seasons-02.png"
  },
  {
    italian: "estate",
    english: "summer",
    image: "images/seasons/seasons-03.png"
  },
  {
    italian: "autunno",
    english: "autumn",
    image: "images/seasons/seasons-04.png"
  }
];

const clothing = [
  {
    italian: "il pigiama",
    gender: "masculine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "nuovo", "vecchio"],
    english: "pajamas",
    image: "images/clothing/clothes-01.png"
  },
  {
    italian: "la maglietta",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "T-shirt",
    image: "images/clothing/clothes-02.png"
  },
  {
    italian: "la camicia",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "shirt",
    image: "images/clothing/clothes-03.png"
  },
  {
    italian: "la felpa",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "nuovo", "vecchio"],
    english: "hoodie",
    image: "images/clothing/clothes-04.png"
  },
  {
    italian: "il maglione",
    gender: "masculine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "nuovo", "vecchio"],
    english: "sweater",
    image: "images/clothing/clothes-05.png"
  },
  {
    italian: "il cappotto",
    gender: "masculine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "coat",
    image: "images/clothing/clothes-06.png"
  },
  {
    italian: "la giacca",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "jacket",
    image: "images/clothing/clothes-07.png"
  },
  {
    italian: "i pantaloncini",
    gender: "masculine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "nuovo", "vecchio"],
    english: "shorts",
    image: "images/clothing/clothes-08.png"
  },
  {
    italian: "la gonna",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "skirt",
    image: "images/clothing/clothes-09.png"
  },
  {
    italian: "i calzini",
    gender: "masculine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "lungo", "corto", "nuovo", "vecchio"],
    english: "socks",
    image: "images/clothing/clothes-10.png"
  },
  {
    italian: "la sciarpa",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "scarf",
    image: "images/clothing/clothes-11.png"
  },
  {
    italian: "i guanti",
    gender: "masculine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "nuovo", "vecchio"],
    english: "gloves",
    image: "images/clothing/clothes-12.png"
  },
  {
    italian: "il cappello",
    gender: "masculine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "nuovo", "vecchio"],
    english: "hat",
    image: "images/clothing/clothes-13.png"
  },
  {
    italian: "gli occhiali",
    gender: "masculine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "nuovo", "vecchio"],
    english: "glasses",
    image: "images/clothing/clothes-14.png"
  },
  {
    italian: "le scarpe",
    gender: "feminine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "nuovo", "vecchio"],
    english: "shoes",
    image: "images/clothing/clothes-15.png"
  },
  {
    italian: "gli stivali",
    gender: "masculine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "nuovo", "vecchio"],
    english: "boots",
    image: "images/clothing/clothes-16.png"
  },
  {
    italian: "il costume da bagno",
    gender: "masculine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "nuovo", "vecchio"],
    english: "swimsuit",
    image: "images/clothing/clothes-17.png"
  },
  {
    italian: "la cintura",
    gender: "feminine",
    number: "singular",
    compatibleAdjectives: ["lungo", "corto", "nuovo", "vecchio"],
    english: "belt",
    image: "images/clothing/clothes-18.png"
  },
  {
    italian: "il vestito",
    gender: "masculine",
    number: "singular",
    compatibleAdjectives: ["grande", "piccolo", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "dress",
    image: "images/clothing/clothes-19.png"
  },
  {
    italian: "i pantaloni",
    gender: "masculine",
    number: "plural",
    compatibleAdjectives: ["grande", "piccolo", "pesante", "leggero", "lungo", "corto", "nuovo", "vecchio"],
    english: "pants",
    image: "images/clothing/clothes-20.png"
  }
];
const body = [
  {
    italian: "il braccio",
    english: "arm",
    image: "images/body/body-01.png"
  },
  {
    italian: "la gamba",
    english: "leg",
    image: "images/body/body-02.png"
  },
  {
    italian: "la mano",
    english: "hand",
    image: "images/body/body-03.png"
  },
  {
    italian: "il piede",
    english: "foot",
    image: "images/body/body-04.png"
  },
  {
    italian: "il ginocchio",
    english: "knee",
    image: "images/body/body-05.png"
  },
  {
    italian: "l'occhio",
    english: "eye",
    image: "images/body/body-06.png"
  },
  {
    italian: "l'orecchio",
    english: "ear",
    image: "images/body/body-07.png"
  },
  {
    italian: "il naso",
    english: "nose",
    image: "images/body/body-08.png"
  },
  {
    italian: "il gomito",
    english: "elbow",
    image: "images/body/body-09.png"
  },
  {
    italian: "la bocca",
    english: "mouth",
    image: "images/body/body-10.png"
  },
  {
    italian: "il collo",
    english: "neck",
    image: "images/body/body-11.png"
  },
  {
    italian: "la spalla",
    english: "shoulder",
    image: "images/body/body-12.png"
  },
  {
    italian: "la testa",
    english: "head",
    image: "images/body/body-13.png"
  },
  {
    italian: "la lingua",
    english: "tongue",
    image: "images/body/body-14.png"
  },
  {
    italian: "le labbra",
    english: "lips",
    image: "images/body/body-15.png"
  },
  {
    italian: "la pancia",
    english: "belly",
    image: "images/body/body-16.png"
  },
  {
    italian: "la schiena",
    english: "back",
    image: "images/body/body-17.png"
  }
];
const home = [
  {
    italian: "la casa",
    english: "house",
    image: "images/house/house-01.png"
  },
  {
    italian: "la porta",
    english: "door",
    image: "images/house/house-02.png"
  },
  {
    italian: "la finestra",
    english: "window",
    image: "images/house/house-03.png"
  },
  {
    italian: "il letto",
    english: "bed",
    image: "images/house/house-04.png"
  },
  {
    italian: "il divano",
    english: "sofa",
    image: "images/house/house-05.png"
  },
  {
    italian: "la sedia",
    english: "chair",
    image: "images/house/house-06.png"
  },
  {
    italian: "il tavolo",
    english: "table",
    image: "images/house/house-07.png"
  },
  {
    italian: "il comò",
    english: "dresser",
    image: "images/house/house-08.png"
  },
  {
    italian: "la libreria",
    english: "bookcase",
    image: "images/house/house-09.png"
  },
  {
    italian: "l'armadietto",
    english: "cabinet",
    image: "images/house/house-10.png"
  },
  {
    italian: "il tappeto",
    english: "rug",
    image: "images/house/house-11.png"
  },
  {
    italian: "lo specchio",
    english: "mirror",
    image: "images/house/house-12.png"
  },
  {
    italian: "la lampada",
    english: "lamp",
    image: "images/house/house-13.png"
  },
  {
    italian: "la televisione",
    english: "television",
    image: "images/house/house-14.png"
  },
  {
    italian: "il frigorifero",
    english: "refrigerator",
    image: "images/house/house-15.png"
  },
{
  italian: "i fornelli e il forno",
  english: "stove and oven",
  image: "images/house/house-16.png"
},
  {
    italian: "la lavatrice",
    english: "washing machine",
    image: "images/house/house-17.png"
  },
  {
    italian: "il lavandino",
    english: "sink",
    image: "images/house/house-18.png"
  },
  {
    italian: "la vasca da bagno",
    english: "bathtub",
    image: "images/house/house-19.png"
  },
  {
    italian: "la doccia",
    english: "shower",
    image: "images/house/house-20.png"
  },
  {
    italian: "il gabinetto",
    english: "toilet",
    image: "images/house/house-21.png"
  }
];
const family = [
  {
    italian: "la nonna",
    english: "grandmother",
    image: "images/family/family-01.png"
  },
  {
    italian: "il nonno",
    english: "grandfather",
    image: "images/family/family-02.png"
  },
  {
    italian: "la mamma",
    english: "mother",
    image: "images/family/family-03.png"
  },
  {
    italian: "il papà",
    english: "father",
    image: "images/family/family-04.png"
  },
  {
    italian: "il fratello",
    english: "brother",
    image: "images/family/family-05.png"
  },
  {
    italian: "la sorella",
    english: "sister",
    image: "images/family/family-06.png"
  }
];
const time = [
  {
    italian: "È l'una.",
    english: "It is one o’clock.",
    image: "images/time/time-01.png"
  },
  {
    italian: "È l'una e un quarto.",
    english: "It is quarter past one.",
    image: "images/time/time-02.png"
  },
  {
    italian: "È l'una e mezza.",
    english: "It is half past one.",
    image: "images/time/time-03.png"
  },
  {
    italian: "Sono le due meno un quarto.",
    english: "It is quarter to two.",
    image: "images/time/time-04.png"
  },
  {
    italian: "Sono le undici.",
    english: "It is eleven o’clock.",
    image: "images/time/time-05.png"
  },
  {
    italian: "Sono le undici e un quarto.",
    english: "It is quarter past eleven.",
    image: "images/time/time-06.png"
  },
  {
    italian: "Sono le undici e mezza.",
    english: "It is half past eleven.",
    image: "images/time/time-07.png"
  },
  {
    italian: "Sono le dodici meno un quarto.",
    english: "It is quarter to twelve.",
    image: "images/time/time-08.png"
  },
  {
    italian: "Sono le due e un quarto.",
    english: "It is quarter past two.",
    image: "images/time/time-09.png"
  },
  {
    italian: "Sono le nove e mezza.",
    english: "It is half past nine.",
    image: "images/time/time-10.png"
  },
  {
    italian: "Sono le dieci.",
    english: "It is ten o’clock.",
    image: "images/time/time-11.png"
  },
  {
    italian: "Sono le otto e un quarto.",
    english: "It is quarter past eight.",
    image: "images/time/time-12.png"
  },
  {
    italian: "Sono le otto meno un quarto.",
    english: "It is quarter to eight.",
    image: "images/time/time-13.png"
  },
  {
    italian: "Sono le sei.",
    english: "It is six o’clock.",
    image: "images/time/time-14.png"
  },
  {
    italian: "Sono le cinque e mezza.",
    english: "It is half past five.",
    image: "images/time/time-15.png"
  },
  {
    italian: "Sono le cinque meno un quarto.",
    english: "It is quarter to five.",
    image: "images/time/time-16.png"
  },
  {
    italian: "Sono le tre.",
    english: "It is three o’clock.",
    image: "images/time/time-17.png"
  },
  {
    italian: "Sono le dodici e un quarto.",
    english: "It is quarter past twelve.",
    image: "images/time/time-18.png"
  },
  {
    italian: "È l'una meno un quarto.",
    english: "It is quarter to one.",
    image: "images/time/time-19.png"
  },
  {
    italian: "Sono le tre e mezza.",
    english: "It is half past three.",
    image: "images/time/time-20.png"
  }
];
const routines = [
  {
    italian: "Mi sveglio.",
    english: "I wake up.",
    image: "images/routines/svegliarsi.png"
  },
  {
    italian: "Mi alzo.",
    english: "I get up.",
    image: "images/routines/alzarsi.png"
  },
  {
    italian: "Faccio colazione.",
    english: "I have breakfast.",
    image: "images/routines/eating-breakfast.png"
  },
  {
    italian: "Vado a scuola.",
    english: "I go to school.",
    image: "images/routines/going-to-school.png"
  },
  {
    italian: "Torno a casa.",
    english: "I go home.",
    image: "images/routines/return-home.png"
  },
  {
    italian: "Faccio i compiti.",
    english: "I do my homework.",
    image: "images/routines/homework.png"
  },
  {
    italian: "Gioco.",
    english: "I play.",
    image: "images/routines/play.png"
  },
  {
    italian: "Leggo.",
    english: "I read.",
    image: "images/routines/read.png"
  },
  {
    italian: "Vado a dormire.",
    english: "I go to bed.",
    image: "images/routines/going-to-sleep.png"
  },
  {
    italian: "Dormo.",
    english: "I sleep.",
    image: "images/routines/sleeping.png"
  }
];

const days = [
  {
    italian: "lunedì",
    english: "Monday",
    image: "images/days/lunedi.png",
    sentenceForms: {
      e: "lunedì",
      piace: "il lunedì"
    }
  },
  {
    italian: "martedì",
    english: "Tuesday",
    image: "images/days/martedi.png",
    sentenceForms: {
      e: "martedì",
      piace: "il martedì"
    }
  },
  {
    italian: "mercoledì",
    english: "Wednesday",
    image: "images/days/mercoledi.png",
    sentenceForms: {
      e: "mercoledì",
      piace: "il mercoledì"
    }
  },
  {
    italian: "giovedì",
    english: "Thursday",
    image: "images/days/giovedi.png",
    sentenceForms: {
      e: "giovedì",
      piace: "il giovedì"
    }
  },
  {
    italian: "venerdì",
    english: "Friday",
    image: "images/days/venerdi.png",
    sentenceForms: {
      e: "venerdì",
      piace: "il venerdì"
    }
  },
  {
    italian: "sabato",
    english: "Saturday",
    image: "images/days/sabato.png",
    sentenceForms: {
      e: "sabato",
      piace: "il sabato"
    }
  },
  {
    italian: "domenica",
    english: "Sunday",
    image: "images/days/domenica.png",
    sentenceForms: {
      e: "domenica",
      piace: "la domenica"
    }
  }
];
/* ========================================
   MONTHS OF THE YEAR
   ======================================== */

const months = [
  {
    italian: "gennaio",
    english: "January",
    image: "images/months/january.png"
  },
  {
    italian: "febbraio",
    english: "February",
    image: "images/months/february.png"
  },
  {
    italian: "marzo",
    english: "March",
    image: "images/months/march.png"
  },
  {
    italian: "aprile",
    english: "April",
    image: "images/months/april.png"
  },
  {
    italian: "maggio",
    english: "May",
    image: "images/months/may.png"
  },
  {
    italian: "giugno",
    english: "June",
    image: "images/months/june.png"
  },
  {
    italian: "luglio",
    english: "July",
    image: "images/months/july.png"
  },
  {
    italian: "agosto",
    english: "August",
    image: "images/months/august.png"
  },
  {
    italian: "settembre",
    english: "September",
    image: "images/months/september.png"
  },
  {
    italian: "ottobre",
    english: "October",
    image: "images/months/october.png"
  },
  {
    italian: "novembre",
    english: "November",
    image: "images/months/november.png"
  },
  {
    italian: "dicembre",
    english: "December",
    image: "images/months/december.png"
  }
];
const weather = [
  {
    italian: "Fa caldo",
    english: "It's hot",
    image: "images/weather/weather-01.png"
  },
  {
    italian: "Fa freddo",
    english: "It's cold",
    image: "images/weather/weather-02.png"
  },
  {
    italian: "C'è il sole",
    english: "It's sunny",
    image: "images/weather/weather-03.png"
  },
  {
    italian: "È nuvoloso",
    english: "It's cloudy",
    image: "images/weather/weather-04.png"
  },
  {
    italian: "Piove",
    english: "It's raining",
    image: "images/weather/weather-05.png"
  },
  {
    italian: "Nevica",
    english: "It's snowing",
    image: "images/weather/weather-06.png"
  },
  {
    italian: "C'è vento",
    english: "It's windy",
    image: "images/weather/weather-07.png"
  },
  {
    italian: "C'è un temporale",
    english: "It's stormy",
    image: "images/weather/weather-08.png"
  }
];
const colors = [
  {
    italian: "rosso",
    masculine: "rosso",
    feminine: "rossa",
    masculinePlural: "rossi",
    femininePlural: "rosse",
    english: "red",
    image: "images/colors/colors-01.png"
  },
  {
    italian: "arancione",
    masculine: "arancione",
    feminine: "arancione",
    masculinePlural: "arancioni",
    femininePlural: "arancioni",
    english: "orange",
    image: "images/colors/colors-02.png"
  },
  {
    italian: "giallo",
    masculine: "giallo",
    feminine: "gialla",
    masculinePlural: "gialli",
    femininePlural: "gialle",
    english: "yellow",
    image: "images/colors/colors-03.png"
  },
  {
    italian: "verde",
    masculine: "verde",
    feminine: "verde",
    masculinePlural: "verdi",
    femininePlural: "verdi",
    english: "green",
    image: "images/colors/colors-04.png"
  },
  {
    italian: "blu",
    masculine: "blu",
    feminine: "blu",
    masculinePlural: "blu",
    femininePlural: "blu",
    english: "blue",
    image: "images/colors/colors-05.png"
  },
  {
    italian: "viola",
    masculine: "viola",
    feminine: "viola",
    masculinePlural: "viola",
    femininePlural: "viola",
    english: "purple",
    image: "images/colors/colors-06.png"
  },
  {
    italian: "rosa",
    masculine: "rosa",
    feminine: "rosa",
    masculinePlural: "rosa",
    femininePlural: "rosa",
    english: "pink",
    image: "images/colors/colors-07.png"
  },
  {
    italian: "nero",
    masculine: "nero",
    feminine: "nera",
    masculinePlural: "neri",
    femininePlural: "nere",
    english: "black",
    image: "images/colors/colors-08.png"
  },
  {
    italian: "bianco",
    masculine: "bianco",
    feminine: "bianca",
    masculinePlural: "bianchi",
    femininePlural: "bianche",
    english: "white",
    image: "images/colors/colors-09.png"
  },
  {
    italian: "marrone",
    masculine: "marrone",
    feminine: "marrone",
    masculinePlural: "marroni",
    femininePlural: "marroni",
    english: "brown",
    image: "images/colors/colors-10.png"
  },
  {
    italian: "grigio",
    masculine: "grigio",
    feminine: "grigia",
    masculinePlural: "grigi",
    femininePlural: "grigie",
    english: "gray",
    image: "images/colors/colors-11.png"
  }
];
const numbers = [
  {
    italian: "uno",
    english: "one",
    image: "images/numbers/numbers-01.png"
  },
  {
    italian: "due",
    english: "two",
    image: "images/numbers/numbers-02.png"
  },
  {
    italian: "tre",
    english: "three",
    image: "images/numbers/numbers-03.png"
  },
  {
    italian: "quattro",
    english: "four",
    image: "images/numbers/numbers-04.png"
  },
  {
    italian: "cinque",
    english: "five",
    image: "images/numbers/numbers-05.png"
  },
  {
    italian: "sei",
    english: "six",
    image: "images/numbers/numbers-06.png"
  },
  {
    italian: "sette",
    english: "seven",
    image: "images/numbers/numbers-07.png"
  },
  {
    italian: "otto",
    english: "eight",
    image: "images/numbers/numbers-08.png"
  },
  {
    italian: "nove",
    english: "nine",
    image: "images/numbers/numbers-09.png"
  },
  {
    italian: "dieci",
    english: "ten",
    image: "images/numbers/numbers-10.png"
  },
  {
    italian: "undici",
    english: "eleven",
    image: "images/numbers/numbers-11.png"
  },
  {
    italian: "dodici",
    english: "twelve",
    image: "images/numbers/numbers-12.png"
  },
  {
    italian: "tredici",
    english: "thirteen",
    image: "images/numbers/numbers-13.png"
  },
  {
    italian: "quattordici",
    english: "fourteen",
    image: "images/numbers/numbers-14.png"
  },
  {
    italian: "quindici",
    english: "fifteen",
    image: "images/numbers/numbers-15.png"
  },
  {
    italian: "sedici",
    english: "sixteen",
    image: "images/numbers/numbers-16.png"
  },
  {
    italian: "diciassette",
    english: "seventeen",
    image: "images/numbers/numbers-17.png"
  },
  {
    italian: "diciotto",
    english: "eighteen",
    image: "images/numbers/numbers-18.png"
  },
  {
    italian: "diciannove",
    english: "nineteen",
    image: "images/numbers/numbers-19.png"
  },
  {
    italian: "venti",
    english: "twenty",
    image: "images/numbers/numbers-20.png"
  }
];
const feelings = [
  {
    italian: "felice",
    masculine: "felice",
    feminine: "felice",
    english: "happy",
    image: "images/feelings/feelings-01.png"
  },
  {
    italian: "arrabbiato",
    masculine: "arrabbiato",
    feminine: "arrabbiata",
    english: "angry",
    image: "images/feelings/feelings-02.png"
  },
  {
    italian: "malato",
    masculine: "malato",
    feminine: "malata",
    english: "sick",
    image: "images/feelings/feelings-03.png"
  },
  {
    italian: "spaventato",
    masculine: "spaventato",
    feminine: "spaventata",
    english: "scared",
    image: "images/feelings/feelings-04.png"
  },
  {
    italian: "triste",
    masculine: "triste",
    feminine: "triste",
    english: "sad",
    image: "images/feelings/feelings-05.png"
  },
  {
    italian: "confuso",
    masculine: "confuso",
    feminine: "confusa",
    english: "confused",
    image: "images/feelings/feelings-06.png"
  },
  {
    italian: "sorpreso",
    masculine: "sorpreso",
    feminine: "sorpresa",
    english: "surprised",
    image: "images/feelings/feelings-07.png"
  }
];
/* ========================================
   GREETINGS AND INTRODUCTIONS
   ======================================== */

const introductions = [
  {
    italian: "Ciao!",
    english: "Hello!",
    image:
      "images/introductions/introductions-01.png"
  },

  {
    italian: "Mi chiamo Volo.",
    english: "My name is Volo.",
    image:
      "images/introductions/introductions-02.png"
  },

  {
    italian: "Sono di Roma.",
    english: "I am from Rome.",
    image:
      "images/introductions/introductions-03.png"
  },

  {
    italian: "Ho ___ anni.",
    english: "I am ___ years old.",
    image:
      "images/introductions/introductions-04.png",
    dynamic: "age"
  },

  {
    italian: "Sto bene, grazie.",
    english: "I am well, thank you.",
    image:
      "images/introductions/introductions-05.png"
  }
];
