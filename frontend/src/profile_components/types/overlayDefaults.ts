import { DeckOverlayTypes } from "./overlayTypes";
import { categoryInfoDefault } from "./profilePageDefaults";

export const nameErrorDefault = {
  errorClass: undefined,
  description: undefined,
};

export const formErrorDefault = {
  display: { display: "none" },
  errorClass: undefined,
  description: undefined,
};

export const deckErrorDefault = {
  nameError: nameErrorDefault,
  wordError: nameErrorDefault,
  formError: formErrorDefault,
};

export const folderErrorDefault = {
  nameError: nameErrorDefault,
  formError: formErrorDefault,
};

export const categoryErrorDefault = {
  nameError: nameErrorDefault,
  formError: formErrorDefault,
};

export const languageDefault = {
  targetLanguage: "english", //change!
  sourceLanguage: "turkish",
};

export const deckOverlayDefaults = {
  deckName: "",
  words: "",
  purpose: "teach", // change!
  includeTranslation: true, // change!
  errors: deckErrorDefault,
  language: languageDefault,
  categoryInfo: categoryInfoDefault,
  display: false,
};

export const folderOverlayDefaults = {
  folderName: "",
  folderType: "regular_folder",
  errors: folderErrorDefault,
  display: false,
};

export const categoryOverlayDefaults = {
  categoryName: "",
  purpose: "",
  includeTranslation: false,
  color: "#fff7f0",
  language: languageDefault,
  errors: categoryErrorDefault,
  display: false,
};

export const get_row_default = (deckOverlay: DeckOverlayTypes) => ({
  artist_content_id: null,
  image_path: null,
  [deckOverlay.language.targetLanguage!]: null,
  [deckOverlay.language.sourceLanguage!]: null,
  selected: true,
  sourceEditable: deckOverlay.purpose === "teach",
  targetEditable: deckOverlay.purpose === "learn"
}); 

export const teachResponse = [
  [
    {
      artist_content_id: "1",
      image_path: "media/square.png",
      english: "square",
      turkish: "meydan",
      selected: true,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "1",
      image_path: "media/square_2.png",
      english: "square",
      turkish: null,
      selected: false,
      sourceEditable: true,
      targetEditable: false,
    },
  ],
  [
    {
      artist_content_id: "5",
      image_path: "media/elevator.png",
      english: "elevator",
      turkish: "asansör",
      selected: true,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_2.PNG",
      english: "elevator",
      turkish: "yükseltici",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_3.PNG",
      english: "elevator",
      turkish: null,
      selected: false,
      sourceEditable: true,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_4.PNG",
      english: "elevator",
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_5.PNG",
      english: "elevator",
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_6.jpeg",
      english: "elevator",
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
  ],
  [
    {
      artist_content_id: "10",
      image_path: null,
      english: "roof",
      turkish: null,
      selected: true,
      sourceEditable: true,
      targetEditable: false,
    },
  ],
  [
    {
      artist_content_id: "4",
      image_path: "media/coffee_table.jpg",
      english: "coffee table",
      turkish: "sehpa",
      selected: true,
      sourceEditable: false,
      targetEditable: false,
    },
  ],
];

export const learnResponse = [
  [
    {
      artist_content_id: "1",
      image_path: "media/square.png",
      english: "square",
      turkish: "meydan",
      selected: true,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "1",
      image_path: "media/square_2.png",
      english: null,
      turkish: "meydan",
      selected: false,
      sourceEditable: false,
      targetEditable: true,
    },
  ],
  [
    {
      artist_content_id: "5",
      image_path: "media/elevator.png",
      english: "elevator",
      turkish: "asansör",
      selected: true,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_2.PNG",
      english: "elevator",
      turkish: "yükseltici",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_3.PNG",
      english: null,
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: true,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_4.PNG",
      english: "elevator",
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_5.PNG",
      english: "elevator",
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
    {
      artist_content_id: "5",
      image_path: "media/elevator_6.jpeg",
      english: "elevator",
      turkish: "asansör",
      selected: false,
      sourceEditable: false,
      targetEditable: false,
    },
  ],
  [
    {
      artist_content_id: "10",
      image_path: null,
      english: null,
      turkish: "çatı",
      selected: true,
      sourceEditable: false,
      targetEditable: true,
    },
  ],
  [
    {
      artist_content_id: "4",
      image_path: "media/coffee_table.jpg",
      english: "coffee table",
      turkish: "sehpa",
      selected: true,
      sourceEditable: false,
      targetEditable: false,
    },
  ],
];