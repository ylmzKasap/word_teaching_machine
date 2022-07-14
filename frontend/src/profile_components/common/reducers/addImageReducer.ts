import { ImageInfoTypes, ImageOverlayTypes } from "../../types/overlayTypes";


export const handleImageOverlay = (
  state: ImageOverlayTypes,
  action: {type: string; value: string; index?: number; key?: string;}
  ): ImageOverlayTypes  => {
    switch (action.type) {
      case 'view':
      return {
        ...state,
        display: action.value === 'show' ? true : false
      };

      case 'changePicture':
        if (action.index === undefined) return state;
        let updatedArray = state.imageInfo;
        updatedArray[action.index] = updatedArray[action.index].map(item => {
          if (item.image_path === action.value) {
            return {
              ...item,
              selected: true
            };
          } else {
            return {
              ...item,
              selected: false
            };
          }});

        return {
           ...state,
           imageInfo: updatedArray
        };

      case "changeValue":
        let changedArray = state.imageInfo.reduce(
          (previousValue, currentValue, i) => {
          if (i !== action.index) return [...previousValue, currentValue];
          const imgObj = currentValue.map(item => {
            if (item.selected === true) {
              return {
                ...item,
                [action.key!]: action.value
              };
            }
            return item;
          });
        return [...previousValue, imgObj];
        }, [] as ImageInfoTypes[][]);
        return {
          ...state,
          imageInfo: changedArray
        };
      
      case "changeEdited":
        return {
          ...state,
          editedId: action.value
        };

      default:
      console.log(`Unknown action type: ${action.type}`);
      return state; 
    }
  };