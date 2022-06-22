import { formErrorDefault, nameErrorDefault } from "../types/overlayDefaults";
import { FormErrorTypes, NameErrorTypes } from "../types/overlayTypes";

export const handleLanguage = (
  state: {targetLanguage: string | undefined; sourceLanguage: string | undefined;},
  action: {type: string; value: string}) => {
    
  if (action.type === "target_language") {
    return {
      ...state,
      targetLanguage: action.value
    };
  } else if (action.type === "source_language") {
    return {
      ...state,
      sourceLanguage: action.value
    };
  } else {
    return state;
  }
};
  
export const handleOverlayError = (
  state: {nameError: NameErrorTypes; wordError?: NameErrorTypes; formError: FormErrorTypes },
  action: {type: string; error: string;}) => {
    
  if (action.type === "name") {
    return {
      ...state,
      nameError: action.error ? {
        errorClass: "forbidden-input",
        description: action.error
      } : nameErrorDefault
    };
  } else if (action.type === "word") {
    return {
      ...state,
      wordError: action.error ? {
        errorClass: "forbidden-input",
        description: action.error
      } : nameErrorDefault
    };
  } else if (action.type === "form") {
    return {
      ...state,
      formError: action.error ? {
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: action.error,
      } : formErrorDefault
    };
  }
  else {
    return state;
  }
};