import {
  CategoryInfoTypes,
  ImageRowTypes,
} from "./profilePageTypes";

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

export interface AddImageTypes {
  display: boolean;
}

export interface EditImagesTypes {
  display: boolean;
  editedId: string;
  imageOverlay: AddImageTypes;
  imageInfo: ImageRowTypes[][];
}
