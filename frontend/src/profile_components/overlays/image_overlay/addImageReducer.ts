import { EditImagesTypes } from "./edit_image/edit_image_overlay";
import { ImageRowTypes } from "./edit_image/edit_image_overlay";

export const handleEditImageOverlay = (
  state: EditImagesTypes,
  action: ImageOverlayReducerTypes
): EditImagesTypes => {
  switch (action.type) {
    case "view":
      // Show or hide image editing overlay.
      return {
        ...state,
        display: action.value === "show"
      };

    case "view-image":
      // Show or hide image uploading overlay.
      return {
        ...state,
        imageOverlay: {
          ...state.imageOverlay,
          display: action.value === "show"
        }
      };

    case "changePicture":
      // Change the main picture when some other picture is clicked.
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
      // Change the currently editable input element.
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

export interface ImageOverlayReducerTypes {
  type: string;
  value: string | number | boolean | ImageRowTypes[] | ImageRowTypes;
  key?: string;
  index?: number;
}