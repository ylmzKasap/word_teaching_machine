import React from "react";

export interface CreateItemOverlayTypes {
  setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface OverlayNavbarTypes {
  setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  description: string;
}

export interface InputFieldTypes {
  description: string;
  error: {
    errorClass: string;
    description: string;
  }
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

export interface submitButtonTypes {
  description: string;
  formError: {
    display: {
        display: string;
    };
    errorClass: string;
    description: string;
  }
}