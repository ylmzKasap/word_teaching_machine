import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import { extract_int } from "./common/functions";
import * as handlers from "./common/handlers";
import { Filler } from "./common/components";

import { PageItemPropTypes, PageItemContextTypes } from "./types/pageItemTypes";
import { ProfileContextTypes } from "./types/profilePageTypes";
import * as defaults from "./types/pageItemDefaults";

export const ItemContext = createContext<PageItemContextTypes | undefined>(undefined);

export const PageItem: React.FC<PageItemPropTypes> = (props) => {
  // Component of ProfilePage.
  // Deployed by './common/functions' -> generate_decks.

  const navigate = useNavigate();
  const params = useParams();

  const [selfStyle, setSelfStyle] = useState({...defaults.selfStyleDefault, order: props.order });
  const [itemStyle, setItemStyle] = useState({ backgroundColor: props.color, boxShadow: "" });
  const [folderStyle, setFolderStyle] = useState("");
  const [fillerClass, setFillerClass] = useState("");
  const [lastFillerClass, setLastFillerClass] = useState("");

  const {
    username,
    draggedElement,
    setDraggedElement,
    directory,
    setReRender,
    directoryInfo,
    columnNumber,
    isDragging,
    categoryDrag,
    cloneTimeout,
    resetDrag,
    items,
    setRequestError,
    rootDirectory,
  } = useContext(ProfileContext) as ProfileContextTypes;

  const trueDirectory = params.dirId ? "" : `${directory}/`;

  // Get children count for each category.
  let childCount;
  if (props.type === "category") {
    const elemChildren = props.children as React.ReactNode[];
    childCount = elemChildren.length;
  } else {
    childCount = 0;
    const extraChildren = 1; // Unrelated children in a category like the top bar.
    if (directoryInfo.item_type === "thematic_folder") {
      let elem = document.querySelector(`#${props.id}`);
      if (elem) {
        const closestElem = elem.closest(".category") as HTMLElement | null;
        const elemChildren = closestElem ? closestElem.children : 0;
        childCount = elemChildren ? elemChildren.length - extraChildren : elemChildren;
      }
    }
  }

  // Set the opacity of dragged element while dragging.
  useEffect(() => {
    if (isDragging && draggedElement.id === props.id) {
      setSelfStyle(prev => ({
        ...prev,
        order: props.order,
        opacity: "0.5"
      }));
      setFolderStyle("dragged-folder");
    } else {
      setSelfStyle(prev => ({...prev, order: props.order, opacity: "1"}));
      setFolderStyle("");
    }
  }, [isDragging, draggedElement, props.name, props.order, props.id]);

  // Change directory after double clicking on a folder.
  const handleDoubleClick = () => {
    if (["folder", "thematic-folder"].includes(props.type)) {
      navigate(`/user/${username}/${extract_int(props.id)}`);
    }
  };

  // Set the properties of the 'to be dragged' element on mouse click.
  const handleMouseDown = (event: React.MouseEvent) => {
    // Only left click
    if (event.button !== 0 || isDragging) {
      return;
    }
    var targetElem = event.target as HTMLElement;

    // Only drag categories through their navigation bar.
    if (
      props.type === "category" ||
      targetElem.className === "category-description"
    ) {
      if (
        !["category-header", "category-description"].includes(
          targetElem.className
        )
      ) {
        return;
      }
    }

    if (targetElem.className !== props.type) {
      targetElem = targetElem.closest(`.${props.type}`)!;
    }
    const draggedElement = handlers.handleDownOnDragged(props, cloneTimeout);
    setDraggedElement(draggedElement);
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    // Only left click
    if (event.button !== 0) {
      return;
    }

    let targetElem = event.target as HTMLElement;
    if (!["file", "folder", "category"].includes(targetElem.className)) {
      const closestElem = targetElem.closest(`.${props.type}`) as HTMLElement;
      if (closestElem) {
        targetElem = closestElem;
      }
    }

    if (targetElem.className === "file" && !isDragging) {
      navigate(`${trueDirectory}deck/${extract_int(targetElem.id)}`, {
        state: {
          allPaths: props.words,
          directory: directory,
          rootDirectory: rootDirectory,
        },
      });
    }

    if (
      (["file", "category", "thematic-folder"].includes(targetElem.className) ||
      draggedElement.id === targetElem.id) && isDragging
    ) {
      resetDrag(true);
      return;
    }

    setItemStyle(prev => ({...prev, backgroundColor: props.color }));
    setFolderStyle("");

    if (isDragging) {
      axios
        .put(`/updatedir/${username}`, {
          item_id: parseInt(extract_int(draggedElement.id)),
          target_id: parseInt(extract_int(targetElem.id))
        })
        .then(() => setReRender())
        .catch((err) =>
          setRequestError({ exists: true, description: err.response.data.errDesc })
        );
    }
    resetDrag();
  };

  const handleHover = (event: React.MouseEvent) => {
    if (!isDragging || cloneTimeout.exists) {
      return;
    }

    const element = event.target as HTMLElement;
    const targeted = element.closest("div");
    if (!targeted) return;

    if (targeted.id === draggedElement.id) {
      return;
    }
    if (targeted.className !== "folder") {
      return;
    }
    if (event.type === "mouseover") {
      setItemStyle({
        boxShadow: "rgb(211, 210, 210) 0px 0px 5px 3px",
        backgroundColor: props.color,
      });
      setFolderStyle("drag-hover-folder");
    } else if (event.type === "mouseout") {
      setItemStyle({ boxShadow: "", backgroundColor: props.color });
      setFolderStyle("");
    }
  };

  return (
    <div
      className={
        props.type === "category" ? "category-with-filler" : "item-with-filler"
      }
      style={selfStyle}
      draggable="false"
    >
      {((props.type === "category" &&
        draggedElement.type === "category" &&
        categoryDrag &&
        !cloneTimeout.exists &&
        draggedElement.id !== props.id) ||
        props.type !== "category") && (
        <Filler
          fillerClass={fillerClass}
          setFillerClass={setFillerClass}
          siblingType={props.type}
          order={props.order}
          type="regular"
        />
      )}

      <ItemContext.Provider
        value={{
          parentProps: props,
          itemStyle: itemStyle,
          folderStyle: folderStyle,
          handleDoubleClick: handleDoubleClick,
          handleMouseDown: handleMouseDown,
          handleMouseUp: handleMouseUp,
          handleHover: handleHover,
        }}
      >
        {props.type !== "category" ? <ItemContainer /> : <CategoryContainer />}
      </ItemContext.Provider>

      {((items.length === props.order &&
        directoryInfo.item_type !== "thematic_folder") ||
        (items.length === props.order && props.type === "category") ||
        (props.order === childCount && props.type !== "category") ||
        (props.order % columnNumber === 0 && props.type !== "category")) && (
        <Filler
          fillerClass={lastFillerClass}
          setFillerClass={setLastFillerClass}
          siblingType={props.type}
          order={props.order}
          type="last"
        />
      )}
    </div>
  );
};

const ItemContainer = () => {
  const {
    parentProps,
    itemStyle,
    folderStyle,
    handleDoubleClick,
    handleMouseDown,
    handleMouseUp,
    handleHover,
  } = useContext(ItemContext) as PageItemContextTypes;

  const createThumbnail = () => {
    let thumbnail = [];
    for (let i = 0; i < parentProps.words.length; i++) {
      let wordPath = parentProps.words[i];
      let wordStem = wordPath.split(".")[0];
      if (thumbnail.length >= 4) {
        break;
      } else {
        thumbnail.push(
          <img
            className={`deck-thumbnail${
              parentProps.words.length < 4 ? " n-1" : ""
            }`}
            src={`media\\${wordPath}`}
            key={`${wordStem}-${i}`}
            alt={`${wordStem}-${i}`}
            draggable="false"
          />
        );
      }
      if (parentProps.words.length < 4) {
        break;
      }
    }
    return thumbnail;
  };

  return (
    <div
      id={parentProps.id}
      className={parentProps.type}
      type="item"
      style={itemStyle}
      tabIndex={parentProps.order}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseOver={handleHover}
      onMouseOut={handleHover}
    >
      {" "}
      {["folder", "thematic-folder"].includes(parentProps.type) && (
        <i className={`fas fa-folder fa-9x ${folderStyle}`}></i>
      )}
      {parentProps.type === "file" && (
        <picture className="thumbnail-container">
          <span className="image-overlay" />
          {createThumbnail()}
        </picture>
      )}
      <p className={`${parentProps.type}-description`}>{parentProps.name}</p>
    </div>
  );
};

const CategoryContainer = () => {
  const { setDeckDisplay, isDragging, setCategoryId } =
    useContext(ProfileContext) as ProfileContextTypes;

  const {
    parentProps,
    itemStyle,
    handleMouseDown,
    handleMouseUp,
    handleHover,
  } = useContext(ItemContext) as PageItemContextTypes;

  const addItem = (event: React.MouseEvent) => {
    if (isDragging) {
      return;
    }
    const element = event.target as HTMLElement;
    const closestElement = element.closest(".category");
    if (!closestElement) return;
    const categoryId = closestElement.id;

    setCategoryId(parseInt(extract_int(categoryId)));
    setDeckDisplay((x) => !x);
  };

  return (
    <div
      id={parentProps.id}
      className={parentProps.type}
      style={itemStyle}
      tabIndex={parentProps.order}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseOver={handleHover}
      onMouseOut={handleHover}
    >
      <div className="category-header">
        <p className={`${parentProps.type}-description`}>{parentProps.name}</p>
        <i className="fas fa-plus-circle category-circle" onClick={addItem}></i>
      </div>
      {parentProps.children}
    </div>
  );
};