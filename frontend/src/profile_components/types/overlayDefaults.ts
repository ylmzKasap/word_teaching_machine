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
  formError: formErrorDefault
};

export const folderErrorDefault = {
  nameError: nameErrorDefault,
  formError: formErrorDefault
};

export const categoryErrorDefault = {
  nameError: nameErrorDefault,
  formError: formErrorDefault
};

export const languageDefault = {
  targetLanguage: 'english', //change!
  sourceLanguage: 'turkish'
};

export const deckOverlayDefaults = {
  deckName: "",
  words: "",
  purpose: "",
  includeTranslation: true, // change!
  errors: deckErrorDefault,
  language: languageDefault,
  categoryInfo: categoryInfoDefault,
  display: false
};

export const folderOverlayDefaults = {
  folderName: "",
  folderType: "regular_folder",
  errors: folderErrorDefault,
  display: false
};

export const categoryOverlayDefaults = {
  categoryName: "",
  purpose: "",
  includeTranslation: false,
  color: "#fff7f0",
  language: languageDefault,
  errors: categoryErrorDefault,
  display: false
};

export const imageOverlayDefaults = {
  display: true,
  editedId: "",
  imageInfo: [
    [
      {
        artist_content_id: '1',
        image_path: 'media/square.png',
        english: 'square',
        turkish: 'meydan',
        selected: true,
        sourceEditable: false
      },
      {
        artist_content_id: '1',
        image_path: 'media/square_2.png',
        english: 'square',
        turkish: 'karesini almak',
        selected: false,
        sourceEditable: false
      }
    ],
    [
      {
        artist_content_id: '5',
        image_path: 'media/elevator.png',
        english: null,
        turkish: 'asansör',
        selected: true,
        sourceEditable: false
      },
      {
        artist_content_id: '5',
        image_path: 'media/elevator_2.PNG',
        english: 'elevator',
        turkish: 'asansör',
        selected: false,
        sourceEditable: false
      },
      {
        artist_content_id: '5',
        image_path: 'media/elevator_3.PNG',
        english: 'elevator',
        turkish: 'asansör',
        selected: false,
        sourceEditable: false
      },
      {
        artist_content_id: '5',
        image_path: 'media/elevator_4.PNG',
        english: 'elevator',
        turkish: 'asansör',
        selected: false,
        sourceEditable: false
      },
      {
        artist_content_id: '5',
        image_path: 'media/elevator_5.PNG',
        english: 'elevator',
        turkish: 'asansör',
        selected: false,
        sourceEditable: false
      },
      {
        artist_content_id: '5',
        image_path: 'media/elevator_6.jpeg',
        english: 'elevator',
        turkish: 'asansör',
        selected: false,
        sourceEditable: false
      }
    ],
    [
      {
        artist_content_id: '10',
        image_path: null,
        english: 'roof',
        turkish: null,
        selected: true,
        sourceEditable: true
      }
    ],
    [
      {
        artist_content_id: '4',
        image_path: 'media/coffee_table.jpg',
        english: 'coffee table',
        turkish: 'sehpa',
        selected: true,
        sourceEditable: false
      }
    ]
  ]
};