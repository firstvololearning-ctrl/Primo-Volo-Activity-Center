"use strict";

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
    image: "images/food/food-01.png"
  },
  {
    italian: "l'arancia",
    english: "orange",
   image: "images/food/food-02.png"
  },
  {
    italian: "la banana",
    english: "banana",
    image: "images/food/food-03.png"
  },
  {
    italian: "il pane",
    english: "bread",
    image: "images/food/food-04.png"
  },
  {
    italian: "il formaggio",
    english: "cheese",
    image: "images/food/food-05.png"
  },
  {
    italian: "l'uovo",
    english: "egg",
    image: "images/food/food-06.png"
  },
  {
    italian: "l'uva",
    english: "grapes",
    image: "images/food/food-07.png"
  },
  {
    italian: "il succo d'arancia",
    english: "orange juice",
    image: "images/food/food-08.png"
  },
  {
    italian: "il latte",
    english: "milk",
    image: "images/food/food-09.png"
  },
  {
    italian: "l'acqua",
    english: "water",
    image: "images/food/food-10.png"
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
const clothing = [
  {
    italian: "il pigiama",
    english: "pajamas",
    image: "images/clothing/clothes-01.png"
  },
  {
    italian: "la maglietta",
    english: "T-shirt",
    image: "images/clothing/clothes-02.png"
  },
  {
    italian: "la camicia",
    english: "shirt",
    image: "images/clothing/clothes-03.png"
  },
  {
    italian: "la felpa",
    english: "hoodie",
    image: "images/clothing/clothes-04.png"
  },
  {
    italian: "il maglione",
    english: "sweater",
    image: "images/clothing/clothes-05.png"
  },
  {
    italian: "il cappotto",
    english: "coat",
    image: "images/clothing/clothes-06.png"
  },
  {
    italian: "la giacca",
    english: "jacket",
    image: "images/clothing/clothes-07.png"
  },
  {
    italian: "i pantaloncini",
    english: "shorts",
    image: "images/clothing/clothes-08.png"
  },
  {
    italian: "la gonna",
    english: "skirt",
    image: "images/clothing/clothes-09.png"
  },
  {
    italian: "i calzini",
    english: "socks",
    image: "images/clothing/clothes-10.png"
  },
  {
    italian: "la sciarpa",
    english: "scarf",
    image: "images/clothing/clothes-11.png"
  },
  {
    italian: "i guanti",
    english: "gloves",
    image: "images/clothing/clothes-12.png"
  },
  {
    italian: "il cappello",
    english: "hat",
    image: "images/clothing/clothes-13.png"
  },
  {
    italian: "gli occhiali",
    english: "glasses",
    image: "images/clothing/clothes-14.png"
  },
  {
    italian: "le scarpe",
    english: "shoes",
    image: "images/clothing/clothes-15.png"
  },
  {
    italian: "gli stivali",
    english: "boots",
    image: "images/clothing/clothes-16.png"
  },
  {
    italian: "il costume da bagno",
    english: "swimsuit",
    image: "images/clothing/clothes-17.png"
  },
  {
    italian: "la cintura",
    english: "belt",
    image: "images/clothing/clothes-18.png"
  },
  {
    italian: "il vestito",
    english: "dress",
    image: "images/clothing/clothes-19.png"
  },
  {
    italian: "i pantaloni",
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
    italian: "la cucina",
    english: "stove",
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
    english: "red",
    image: "images/colors/colors-01.png"
  },
  {
    italian: "arancione",
    english: "orange",
    image: "images/colors/colors-02.png"
  },
  {
    italian: "giallo",
    english: "yellow",
    image: "images/colors/colors-03.png"
  },
  {
    italian: "verde",
    english: "green",
    image: "images/colors/colors-04.png"
  },
  {
    italian: "blu",
    english: "blue",
    image: "images/colors/colors-05.png"
  },
  {
    italian: "viola",
    english: "purple",
    image: "images/colors/colors-06.png"
  },
  {
    italian: "rosa",
    english: "pink",
    image: "images/colors/colors-07.png"
  },
  {
    italian: "nero",
    english: "black",
    image: "images/colors/colors-08.png"
  },
  {
    italian: "bianco",
    english: "white",
    image: "images/colors/colors-09.png"
  },
  {
    italian: "marrone",
    english: "brown",
    image: "images/colors/colors-10.png"
  },
  {
    italian: "grigio",
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