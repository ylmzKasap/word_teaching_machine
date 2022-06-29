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
  targetLanguage: undefined,
  sourceLanguage: undefined
};

export const deckOverlayDefaults = {
  deckName: "",
  words: "",
  purpose: "",
  includeTranslation: false,
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