import { EditImagesTypes } from "../../types/overlayTypes";
import { ImageRowTypes } from "../../types/profilePageTypes";

export const handleEditImageOverlay = (
  state: EditImagesTypes,
  action: {
    type: string;
    value: string | number | boolean | ImageRowTypes | ImageRowTypes[];
    index?: number;
    key?: string;
  }
): EditImagesTypes => {
  switch (action.type) {
    case "view":
      return {
        ...state,
        display: action.value === "show"
      };

    case "view-image":
      return {
        ...state,
        imageOverlay: {
          ...state.imageOverlay,
          display: action.value === "show"
        }
      };

    case "changePicture":
      if (action.index === undefined) return state;
      let updatedArray = state.imageInfo;
      updatedArray[action.index] = updatedArray[action.index].map((item) => {
        if (item.image_path === action.value) {
          return {
            ...item,
            selected: true,
          };
        } else {
          return {
            ...item,
            selected: false,
          };
        }
      });

      return {
        ...state,
        imageInfo: updatedArray,
      };

    case "changeValue":
      console.log('yes');
      // Replace a specific key value with a new one in a particular index.
      let changedArray = state.imageInfo.reduce(
        (previousValue, currentValue, i) => {
          if (i !== action.index) return [...previousValue, currentValue];
          const imgObj = currentValue.map((item) => {
            if (item.selected === true) {
              return {
                ...item,
                [action.key!]: action.value,
              };
            }
            return item;
          });
          return [...previousValue, imgObj] as ImageRowTypes[][];
        },
        [] as ImageRowTypes[][]
      );
      return {
        ...state,
        imageInfo: changedArray
      };

    case "changeImages":
      // Replace an array of image objects with a new one.
      let imageArray = state.imageInfo;
      imageArray[action.index as number] = action.value as ImageRowTypes[];

      return {
        ...state,
        imageInfo: imageArray
      };

    case "changeEdited":
      return {
        ...state,
        editedId: action.value as string,
      };

    case "addRow":
        const value = action.value as ImageRowTypes;
        return {
          ...state,
          imageInfo: [...state.imageInfo, [value]]
        };
    
    case "deleteRow":
      const index = action.value as number;
      return {
        ...state,
        imageInfo: [
          ...state.imageInfo.slice(0, index),
          ...state.imageInfo.slice(index + 1)]
      };

    default:
      console.log(`Unknown action type: ${action.type}`);
      return state;
  }
};