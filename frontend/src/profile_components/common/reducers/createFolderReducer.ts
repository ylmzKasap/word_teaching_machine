import {
  folderOverlayDefaults,
  formErrorDefault,
  nameErrorDefault,
} from "../../types/overlayDefaults";
import { FolderOverlayTypes } from "../../types/overlayTypes";

export const handleFolderOverlay = (
  state: FolderOverlayTypes,
  action: { type: string; value: string; innerType?: string }
): FolderOverlayTypes => {
  switch (action.type) {
    case "folderName":
      return {
        ...state,
        folderName: action.value,
      };

    case "folderType":
      return {
        ...state,
        folderType: action.value,
      };

    case "errors":
      switch (action.innerType) {
        case "name":
          return {
            ...state,
            errors: {
              ...state.errors,
              formError: formErrorDefault,
              nameError: action.value
                ? {
                    errorClass: "forbidden-input",
                    description: action.value,
                  }
                : nameErrorDefault,
            },
          };
        case "form":
          return {
            ...state,
            errors: {
              ...state.errors,
              formError: action.value
                ? {
                    display: { display: "flex" },
                    errorClass: "invalid-form",
                    description: action.value,
                  }
                : formErrorDefault,
            },
          };
        default:
          console.log(`Unknown error type: ${action.innerType}`);
          return state;
      }

    case "view":
      return {
        ...state,
        display: action.value === "show" ? true : false,
      };

    case "clear":
      return folderOverlayDefaults;

    default:
      console.log(`Unknown action type: ${action.type}`);
      return state;
  }
};
