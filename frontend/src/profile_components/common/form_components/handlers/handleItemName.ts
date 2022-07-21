import { itemNameFilter } from "../../regex";

export function handleItemName(event: React.ChangeEvent) {
  // Used by CreateDeckOverlay and CreateFolderOverlay.

  const element = event.target as HTMLInputElement;

  const itemName = element.value;
  let itemNameError = "";

  if (itemNameFilter.test(itemName)) {
    itemNameError = `Forbidden character ' ${itemName.match(itemNameFilter)} '`;
  } else if (itemName.length > 40) {
    itemNameError = `Input too long: ${itemName.length} characters > 40`;
  } else if (itemName.replace(/[\s]/g, "") === "" && itemName !== "") {
    itemNameError = "Input cannot only contain spaces";
  }

  return [itemName, itemNameError] as const;
}