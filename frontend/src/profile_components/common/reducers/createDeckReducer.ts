import { deckOverlayDefaults, formErrorDefault,
  nameErrorDefault } from "../../types/overlayDefaults";
import { DeckOverlayTypes } from "../../types/overlayTypes";
import { CategoryInfoTypes } from "../../types/profilePageTypes";

export const handleDeckOverlay = (
  state: DeckOverlayTypes,
  action: {type: string; value: string; innerType?: string; categoryInfo?: CategoryInfoTypes}
  ): DeckOverlayTypes  => {
    switch (action.type) {
      case 'deckName':
      return {
        ...state,
        deckName: action.value
      };
      
      case 'words':
      return {
        ...state,
        words: action.value,
        errors: {
          ...state.errors,
          formError: formErrorDefault
        }
      };
      
      case 'purpose':
      return {
        ...state,
        includeTranslation: false,
        purpose: action.value,
        language: {
          ...state.language,
          sourceLanguage: undefined
        }
      };
      
      case 'includeTranslation':
      return {
        ...state,
        includeTranslation: !state.includeTranslation,
        language: {
          ...state.language,
          sourceLanguage: state.categoryInfo.sourceLanguage
          ? state.categoryInfo.sourceLanguage : (
            state.purpose === "learn" ? state.language.sourceLanguage : undefined
          )
        },
        errors: {
          ...state.errors,
          formError: formErrorDefault
        }
      };
      
      case 'errors':
      switch (action.innerType) {
        case 'name':
        return {
          ...state,
          errors: {
            ...state.errors,
            formError: formErrorDefault,
            nameError: action.value ? {
              errorClass: "forbidden-input",
              description: action.value
            } : nameErrorDefault
          }
        };
        case 'word':
        return {
          ...state,
          errors: {
            ...state.errors,
            formError: formErrorDefault,
            wordError: action.value ? {
              errorClass: "forbidden-input",
              description: action.value
            } : nameErrorDefault
          }
        };
        case 'form':
        return {
          ...state,
          errors: {
            ...state.errors,
            formError: action.value ? {
              display: {display: "flex"},
              errorClass: "invalid-form",
              description: action.value,
            } : formErrorDefault
          }
        };
        default:
        console.log(`Unknown error type: ${action.innerType}`);
        return state;
      }
      
      case 'language':
      switch (action.innerType) {
        case 'target_language':
        return {
          ...state,
          language: {
            ...state.language,
            targetLanguage: action.value
          }
        };
        case 'source_language':
        return {
          ...state,
          language: {
            ...state.language,
            sourceLanguage: action.value
          }
        };
        default:
        console.log(`Unknown language type: ${action.innerType}`);
        return state;
      }

      case 'category':
        if (!action.categoryInfo) {
          console.log("categoryInfo is not defined");
          return state;
        }
        return {
          ...state,
          language: {
            sourceLanguage: action.categoryInfo.sourceLanguage,
            targetLanguage: action.categoryInfo.targetLanguage,
          },
          includeTranslation: false,
          purpose: action.categoryInfo.purpose ? action.categoryInfo.purpose : "",
          categoryInfo: action.categoryInfo,
          display: true
        };
      
      case 'view':
        return {
          ...state,
          display: action.value === 'show' ? true : false
        };

      case 'clear':
        return deckOverlayDefaults;

      default:
        console.log(`Unknown action type: ${action.type}`);
        return state; 
    }
  };