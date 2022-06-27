import React from "react";

export interface CreateItemOverlayTypes {
  setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface OverlayNavbarTypes {
  setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  description: string;
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
  handler: (selectedPurpose: string) => void
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
};

export interface FormErrorTypes {
  display: { display: string };
  errorClass: string | undefined;
  description: string | undefined;
};

export interface LanguageTypes {
  targetLanguage: string | undefined;
  sourceLanguage: string | undefined;
};