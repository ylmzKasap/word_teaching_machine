import { useContext } from "react";
import axios from "axios";
import { ProfileContext } from "../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../types/profilePageTypes";
import delete_item from "../functions/delete_item";
import { extract_int } from "../utils";

const ItemContextMenu: React.FC = () => {
  const {
    username,
    directory,
    setReRender,
    contextOpenedElem,
    clipboard,
    directoryInfo,
    contextOptions,
    contextMenuStyle,
    setClipboard,
    resetContext,
    setRequestError,
  } = useContext(ProfileContext) as ProfileContextTypes;

  const restrictions: ContextRestrictTypes = {
    paste: {
      [`${!clipboard.id}`]: "Clipboard is empty",

      // Pasting category into category.
      [`${
        (contextOpenedElem.id === clipboard.id ||
          contextOpenedElem.type === clipboard.type) &&
        clipboard.id
      }`]: "Cannot paste category here",

      // Pasting category into a regular folder.
      [`${
        clipboard.type === "category" &&
        directoryInfo.item_type !== "thematic_folder"
      }`]: "Cannot paste category here",

      // Pasting an item outside of a category in a thematic folder.
      [`${
        directoryInfo.item_type === "thematic_folder" &&
        clipboard.type !== "category" &&
        contextOpenedElem.type !== "category"
      }`]: "Can only paste in a category",

      [`${contextOpenedElem.type === "category" && clipboard.type !== "deck"}`]:
        "Categories can only contain decks",
    },
  };

  const handleClick = (event: React.MouseEvent) => {
    const element = event.target as HTMLElement;

    if (element.className === "disabled-context") {
      setRequestError({
        exists: true,
        description: restrictions[element.title]["true"],
      });
      return;
    }
    const action = element.title;
    if (["cut", "copy"].includes(action)) {
      setClipboard({
        action: action,
        id: contextOpenedElem.id,
        type: contextOpenedElem.type,
        directory: directory,
      });
    } else if (action === "delete") {
      delete_item(contextOpenedElem, username, setReRender, setRequestError);
    } else if (action === "paste") {
      // Type guard
      if (!clipboard.id) throw Error;

      axios
        .put(`/paste/${username}`, {
          item_id: extract_int(clipboard.id),
          new_parent: directory,
          category_id:
            contextOpenedElem.type === "category"
              ? extract_int(contextOpenedElem.id!)
              : null,
          action: clipboard.action,
        })
        .then(() => {
          if (clipboard.action === "cut") {
            setClipboard(clipboardDefault);
          }
          setReRender();
        })
        .catch((err) =>
          setRequestError({
            exists: true,
            description: err.response.data.errDesc,
          })
        );
    }
    resetContext();
  };

  return (
    <div
      id="item-context-menu"
      className="context-menu"
      style={contextMenuStyle}
      onContextMenu={(e) => e.preventDefault()}
      onClick={handleClick}
    >
      {contextOptions.map((menuItem) => {
        const menuClass =
          menuItem in restrictions &&
          Object.keys(restrictions[menuItem]).some((x) => x === "true")
            ? "disabled-context"
            : "context-item";
        return (
          <menu className={menuClass} title={menuItem} key={menuItem}></menu>
        );
      })}
    </div>
  );
};

interface ContextRestrictTypes {
  [paste: string]: {
    [key: string]: string;
  };
}

export const clipboardDefault = {
  action: undefined,
  id: undefined,
  type: undefined,
  directory: undefined,
};

export default ItemContextMenu;