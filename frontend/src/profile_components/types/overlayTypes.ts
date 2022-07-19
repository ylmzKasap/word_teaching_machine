import React from "react";
import {
  CategoryInfoTypes,
  ImageRowTypes,
  SetDeckOverlayType,
  SetOverlayType,
} from "./profilePageTypes";

export interface OverlayNavbarTypes {
  setOverlay: SetDeckOverlayType | SetOverlayType;
  description: string;
  specialClass?: string;
  extra?: string;
}

export interface InputFieldTypes {
  description: string;
  error: NameErrorTypes;
  value: string;
  handler: (event: React.ChangeEvent) => void;
  placeholder: string;
}

export interface RadioTypes {
  description: string;
  buttons: string[];
  checked: string;
  selected: string;
  handler: (event: React.ChangeEvent) => void;
}

export interface CheckboxTypes {
  description: string;
  value: boolean;
  handler: () => void;
}

export interface DoubleChoiceTypes {
  description: string;
  choice_one: string;
  choice_two: string;
  chosen: string;
  handler: (selectedPurpose: string) => void;
}

export interface submitButtonTypes {
  description: string;
  formError: FormErrorTypes;
}

export interface SelectDropdownTypes {
  description: string;
  handler: (event: React.SyntheticEvent) => void;
  topic: string;
  choices: string[];
  chosen: string | undefined;
  placeholder: string;
}

export interface NameErrorTypes {
  errorClass: string | undefined;
  description: string | undefined;
}

export interface FormErrorTypes {
  display: { display: string };
  errorClass: string | undefined;
  description: string | undefined;
}

export interface LanguageTypes {
  targetLanguage: string | undefined;
  sourceLanguage: string | undefined;
  [key: string]: string | undefined;
}

export interface DeckOverlayTypes {
  deckName: string;
  words: string;
  purpose: string;
  includeTranslation: boolean;
  errors: {
    nameError: NameErrorTypes;
    wordError: NameErrorTypes;
    formError: FormErrorTypes;
  };
  language: LanguageTypes;
  categoryInfo: CategoryInfoTypes;
  display: boolean;
}

export interface FolderOverlayTypes {
  folderName: string;
  folderType: string;
  errors: {
    nameError: NameErrorTypes;
    formError: FormErrorTypes;
  };
  display: boolean;
}

export interface CategoryOverlayTypes {
  categoryName: string;
  purpose: string;
  includeTranslation: boolean;
  color: string;
  language: LanguageTypes;
  errors: {
    nameError: NameErrorTypes;
    formError: FormErrorTypes;
  };
  display: boolean;
}

export interface ImageInfoTypes {
  artist_content_id: string | null;
  image_path: string | null;
  selected: boolean;
  english?: string | null;
  turkish?: string | null;
  german?: string | null;
  spanish?: string | null;
  french?: string | null;
  greek?: string | null;
  [key: string]: string | null | undefined | boolean;
}

export interface AddImageTypes {
  display: boolean;
}

export interface EditImagesTypes {
  display: boolean;
  editedId: string;
  imageOverlay: AddImageTypes;
  imageInfo: ImageRowTypes[][];
}
