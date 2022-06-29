import { categoryOverlayDefaults,
  formErrorDefault, nameErrorDefault } from "../../types/overlayDefaults";
  import { CategoryOverlayTypes } from "../../types/overlayTypes";
  
  export const handleCategoryOverlay = (
    state: CategoryOverlayTypes,
    action: {type: string; value: string; innerType?: string;}
    ): CategoryOverlayTypes  => {
      switch (action.type) {
        case 'categoryName':
        return {
          ...state,
          categoryName: action.value
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
            sourceLanguage: state.purpose === "learn" ? state.language.sourceLanguage : undefined
          },
          errors: {
            ...state.errors,
            formError: formErrorDefault
          }
        };

        case 'color':
        return {
          ...state,
          color: action.value
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
        
        case 'view':
        return {
          ...state,
          display: action.value === 'show' ? true : false
        };
        
        case 'clear':
        return categoryOverlayDefaults;
        
        default:
        console.log(`Unknown action type: ${action.type}`);
        return state; 
      }
    };