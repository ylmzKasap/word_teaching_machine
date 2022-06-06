import React, { useContext } from "react";
import axios from "axios";
import { ProfileContext } from "../profile_page/ProfilePage";
import { delete_item, extract_int, snakify } from "./functions";

import * as types from "../types/overlayTypes";
import * as defaults from "../types/profilePageDefaults";
import { ProfileContextTypes, ContextRestrictTypes } from "../types/profilePageTypes";
import { FillerTypes } from "../types/pageItemTypes";


export const OverlayNavbar: React.FC<types.OverlayNavbarTypes> = ({setDisplay, description}) => {
  // Component of CreateDeck, CreateFolder.

  const handleExit = (event: React.MouseEvent) => {
    event.preventDefault();
    setDisplay(false);
  };

  return (
    <div className="overlay-nav">
      {description}
      <button className="exit-button" onClick={handleExit}>
        X
      </button>
    </div>
  );
};

export const InputField: React.FC<types.InputFieldTypes> = (props) => {
  // Component of Create_x_Overlay(s).
  const { description, error, value, handler, placeholder } = props;

  return (
    <label className="input-label">
      <div className="input-info">
        {description} <span className="input-error">{error.description}</span>
      </div>
      <input
        className={`text-input ${error.errorClass}`}
        value={value}
        onChange={handler}
        placeholder={placeholder}
        required
      ></input>
    </label>
  );
};

export const Radio: React.FC<types.RadioTypes> = (props) => {
  const { description, handler, selected, checked } = props;

  return (
    <div className="input-label">
      <div className="input-info">{description}</div>
      <div className="radio-container">
        {props.buttons.map((itemName) => (
          <label key={itemName} className="radio-label">
            {itemName}
            <input
              type="radio"
              value={snakify(itemName)}
              name="folder-type"
              onChange={handler}
              checked={
                snakify(itemName) === selected
                  ? true
                  : !selected && snakify(itemName) === checked
                  ? true
                  : false
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export const SubmitForm: React.FC<types.submitButtonTypes> = (props) => {
  const { description, formError } = props;

  return (
    <div className="submit-form">
      <button className="submit-form-button" type="submit">
        {description}
      </button>
      <label
        className={`error-field ${formError.errorClass}`}
        style={formError.display}
      >
        <span className="fas fa-exclamation-circle"></span>
        <span className="error-description">{formError.description}</span>
      </label>
    </div>
  );
};

export const ItemContextMenu: React.FC = () => {
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
      [`${clipboard.id === null}`]: "Clipboard is empty",

      // Pasting category into category.
      [`${(contextOpenedElem.id === clipboard.id ||
        contextOpenedElem.type === clipboard.type) &&
      clipboard.id !== null}`]: "Cannot paste category here",

      // Pasting category into a regular folder.
      [`${clipboard.type === "category" &&
      directoryInfo.item_type !== "thematic_folder"}`]: 
      "Cannot paste category here",

      // Pasting an item outside of a category in a thematic folder.
      [`${directoryInfo.item_type === "thematic_folder" &&
      clipboard.type !== "category" &&
      contextOpenedElem.type !== "category"}`]:
       "Can only paste in a category",

      [`${contextOpenedElem.type === "category" && clipboard.type !== "file"}`]:
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
      delete_item(
        contextOpenedElem,
        username,
        setReRender,
        setRequestError
      );
    } else if (action === "paste") {
      // Type guard
      if (!clipboard.id) throw Error;

      axios
        .put(`/paste/${username}`, {
          item_id: parseInt(extract_int(clipboard.id)),
          new_parent: directory,
          category_id:
            contextOpenedElem.type === "category"
              ? parseInt(extract_int(contextOpenedElem.id!))
              : null,
          action: clipboard.action,
        })
        .then(() => {
          if (clipboard.action === "cut") {
            setClipboard(defaults.clipboardDefault);
          }
          setReRender();
        })
        .catch((err) =>
          setRequestError({ exists: true, description: err.response.data.errDesc })
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

export const Filler: React.FC<FillerTypes> = (props) => {
  // Rendered by "../PageItems"
  const {
    username,
    isDragging,
    cloneTimeout,
    draggedElement,
    resetDrag,
    setReRender,
    setRequestError
  } = useContext(ProfileContext) as ProfileContextTypes;

  // Style the filler on hovering.
  const handleFillerHover = (event: React.MouseEvent) => {
    // Disable interaction between different types of fillers.
    const element = event.target as HTMLElement;
    if (
      [props.siblingType, draggedElement.type].includes("category") &&
      props.siblingType !== draggedElement.type
    ) {
      return;
    }

    let nextElement =
      (props.type === "regular"
        ? element.nextElementSibling
        : element.previousSibling) as Element | null;
    if (!nextElement) return;

    if (isDragging && !cloneTimeout.exists) {
      if (nextElement.id !== draggedElement.id) {
        if (event.type === "mouseover") {
          props.setFillerClass("filler-hovered");
        } else {
          props.setFillerClass("");
        }
      }
    }
  };

  const handleFillerUp = (event: React.MouseEvent) => {
    if (!isDragging) {
      return;
    }
    const element = event.target as HTMLElement;

    // Disable interaction between different types of fillers.
    if (
      [props.siblingType, draggedElement.type].includes("category") &&
      props.siblingType !== draggedElement.type
    ) {
      return;
    }

    const categoryContainer = element.closest(".category");
    if (props.type === "regular") {
      let nextElement = element.nextElementSibling as Element | null;
      if (!nextElement) return;

      if (nextElement.id === draggedElement.id) {
        resetDrag(true);
        return;
      }
    } else if (props.type === "last") {
      let previousElement = element.previousSibling as Element | null;
      if (!previousElement) return;

      if (previousElement.id === draggedElement.id) {
        resetDrag(true);
        return;
      }
    }

    props.setFillerClass("");
    resetDrag();

    axios
      .put(`/updateorder/${username}`, {
        item_id: parseInt(extract_int(draggedElement.id)),
        category_id: categoryContainer
          ? parseInt(extract_int(categoryContainer.id))
          : null,
        new_order: props.order,
        direction: props.type === "last" ? "after" : "before",
      })
      .then(() => setReRender())
      .catch((err) => setRequestError({
        exists: true, description: err.response.data.errDesc
      }));
  };

  return (
    <div
      className={
        `${props.siblingType === "category" ? "category" : "item"}-filler` +
        (props.fillerClass ? ` ${props.fillerClass}` : "") +
        (props.type === "last" ? " last-filler" : "")
      }
      onMouseOver={handleFillerHover}
      onMouseLeave={handleFillerHover}
      onMouseUp={handleFillerUp}
    />
  );
};

export function NotFound() {
  return (
    <div className="not-found">
      <i className="fas fa-binoculars fa-9x"></i>
      <h2> Page does not exist. </h2>
    </div>
  );
}
