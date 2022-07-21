import { PageItemPropTypes } from "../../page_items/page_item";
import { draggedElementDefault } from "../../types/profilePageDefaults";
import { CloneTimeoutTypes } from "../../types/profilePageTypes";

export default function handleDownOnDragged(
  props: PageItemPropTypes,
  cloneTimeout: CloneTimeoutTypes
) {
  // Used by PageItem component.
  // Returns a dragged element object if conditions are met.
  
  if (!cloneTimeout.exists) {
    const draggedElement = {
      id: props.id,
      name: props.name,
      type: props.type,
    };
    return draggedElement;
  } else {
    return draggedElementDefault;
  }
}