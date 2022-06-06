import { ContextMenuInfoTypes, CloneTimeoutTypes } from "../types/profilePageTypes";
import { contextMenuInfoDefault, draggedElementDefault } from "../types/profilePageDefaults";
import { PageItemPropTypes } from "../types/pageItemTypes";
import React from "react";
import { formErrorDefault, nameErrorDefault } from "../types/overlayDefaults";

export function handleItemName(event: React.ChangeEvent) {
  // Used by CreateDeckOverlay and CreateFolderOverlay.

  const itemNameFilter = /[.,\\<>"]/;
  const element = event.target as HTMLInputElement;

  const itemName = element.value;
  let itemNameError = nameErrorDefault;
  const generalError = formErrorDefault;

  if (itemNameFilter.test(itemName)) {
    itemNameError = {
      errorClass: "forbidden-input",
      description: `Forbidden character ' ${itemName.match(itemNameFilter)} '`,
    };
  } else if (itemName.length > 40) {
    itemNameError = {
      errorClass: "forbidden-input",
      description: `Input too long: ${itemName.length} characters > 40`,
    };
  } else if (itemName.replace(/[\s]/g, "") === "" && itemName !== "") {
    itemNameError = {
      errorClass: "forbidden-input",
      description: "Input cannot only contain spaces",
    };
  }

  return [itemName, itemNameError, generalError] as const;
}

export function handleDownOnDragged(
  props: PageItemPropTypes,
  cloneTimeout: CloneTimeoutTypes) {
  // Used by PageItem component.

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

export function create_context_menu(
  event: React.MouseEvent, closestItem: HTMLElement | null): ContextMenuInfoTypes {
    const element = event.target as HTMLInputElement;

  // Completely unrelated div.
  if (!closestItem) {
    return {
      closest: element,
      openedElem: { id: null, type: "void", name: null },
      ops: ["no actions"],
    };
  }

  let contextMenuInfo: ContextMenuInfoTypes = contextMenuInfoDefault;
  contextMenuInfo.closest = closestItem;

  // Containers
  if (
    ["card-container", "category-container"].includes(closestItem.className)
  ) {
    contextMenuInfo.openedElem = { id: null, type: "container", name: null };
    contextMenuInfo.ops = ["paste"];
  } else {
    // Page item like file, folder, thematic-folder, category.
    const categoryHeader = closestItem.querySelector(".category-header") as HTMLElement;
    contextMenuInfo.openedElem = {
      id: closestItem.id,
      type: closestItem.className,
      name:
        closestItem.className === "category"
          ? categoryHeader.innerText
          : closestItem.innerText,
    };

    if (closestItem.className === "category") {
      contextMenuInfo.ops = ["cut", "paste", "delete"];
    } else if (closestItem.className === "file") {
      contextMenuInfo.ops = ["copy", "cut", "delete"];
    } else {
      contextMenuInfo.ops = ["cut", "delete"];
    }
  }
  return contextMenuInfo;
}
