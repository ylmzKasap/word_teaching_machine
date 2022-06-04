/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useReducer, createContext } from "react";
import { useParams, Outlet } from "react-router-dom";
import axios from "axios";

import {
  generate_directory,
  scroll_div,
  find_closest_element,
} from "../common/functions";

import { SideBar, ErrorInfo, DragClone } from "./OtherComponents";
import { CardContainer } from "./CardContainer";
import { ProfileNavBar } from "./ProfileNavbar";
import { create_context_menu } from "../common/handlers";
import { ItemContextMenu, NotFound } from "../common/components";
import { useWindowSize } from "../common/hooks";
import * as types from "../types/profilePageTypes";
import * as defaults from "../types/profilePageDefaults";

export const ProfileContext = createContext<types.ProfileContextTypes | undefined>(undefined);

export const ProfilePage: React.FC<types.ProfilePageTypes> = (props) => {
  // Rendered by main.
  const params = useParams();

  const username = params.username;
  const dirId = params.dirId;

  const [userPicture, setUserPicture] = useState("");
  const [rootDirectory, setRootDirectory] = useState(0);
  const [directory, setDirectory] = useState(() => dirId ? parseInt(dirId) : parseInt(props.dir));
  const [directoryInfo, setDirectoryInfo] = useState<types.DirectoryInfoTypes>(
    defaults.directoryInfoDefault);

  const [items, setItems] = useState<React.ReactElement[]>([]);
  const [reRender, setReRender] = useReducer((x) => x + 1, 0);
  const [clipboard, setClipboard] = useState<types.ClipboardTypes>(
    defaults.clipboardDefault);

  // Content fetching related states.
  const [pictureLoaded, setPictureLoaded] = useState(false);
  const [directoryLoaded, setDirectoryLoaded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [requestError, setRequestError] = useState<types.RequestErrorTypes>(
    defaults.requestErrorDefault);

  // Context menu related states.
  const [contextMenu, setContextMenu] = useState(false);
  const [contextOpenedElem, setContextOpenedElem] = useState<types.ContextOpenedElemTypes>(
    defaults.contextOpenedElemDefault
  );
  const [contextOptions, setContextOptions] = useState(['']);
  const [contextMenuStyle, setContextMenuStyle] = useState(defaults.contextMenuStyleDefault);
  const [contextMenuScroll, setContextMenuScroll] = useState<types.ContextMenuScrollTypes>(
    defaults.contextMenuScrollDefault);

  // Dragging related states.
  const [cloneElement, setCloneElement] = useState<React.ReactElement | null>(null);
  const [cloneStyle, setCloneStyle] = useState<types.CloneStyleTypes>(defaults.cloneStyleDefault);
  const [cloneTimeout, setCloneTimeout] = useState(defaults.cloneTimeoutDefault);
  const [draggedElement, setDraggedElement] = useState<types.DraggedElementTypes>(
    defaults.draggedElementDefault);
  const [dragCount, setDragCount] = useState(0);
  const [isDragging, setDrag] = useState(false);
  const [categoryDrag, setCategoryDrag] = useState(false);
  const [scrolling, setScrolling] = useState<types.ScrollingTypes>(defaults.scrollingDefault);

  const [deckDisplay, setDeckDisplay] = useState(false);
  const [categoryId, setCategoryId] = useState(0);
  const [columnNumber] = useWindowSize(directoryInfo, contentLoaded);

  let currentContainer: string;
  if (directoryInfo) {
    currentContainer = directoryInfo.item_type === "thematic_folder"
      ? ".category-container"
      : ".card-container";
  }

  // Load user picture.
  useEffect(() => {
    axios
      .get(`/u/${username}`)
      .then((response) => {
        setRootDirectory(response.data.root_id);
        setDirectory(dirId ? parseInt(dirId) : rootDirectory);
        const image = new Image();
        image.src = `media/profile/${response.data.user_picture}`;
        image.onload = () => {
          setUserPicture(image.src);
          setPictureLoaded(true);
        };
      })
      .catch(() => setFetchError(true));
  }, [userPicture]);

  // Render directory.
  useEffect(() => {
    axios
      .get(`/u/${username}/${dirId ? dirId : props.dir}`)
      .then((response) => {
        const [dirItems, dirInfo] = response.data;
        setItems(generate_directory(dirInfo, dirItems, username));
        setDirectoryInfo(dirInfo);
        if (rootDirectory) {
          setDirectory(dirId ? parseInt(dirId) : rootDirectory);
        }
      })
      .then(() => setDirectoryLoaded(true))
      .catch(() => {
        setDirectoryLoaded(false);
        setContentLoaded(false);
        setFetchError(true);
      });
    return () => {
      setRequestError({ exists: false, description: "" });
      clearTimeout(cloneTimeout["timeouts"]);
      setFetchError(false);
      resetDrag();
    };
  }, [dirId, reRender, rootDirectory]);

  // Check whether content is loaded.
  useEffect(() => {
    if (pictureLoaded && directoryLoaded) {
      setContentLoaded(true);
    }
  }, [pictureLoaded, directoryLoaded, dirId]);

  // Update clone position.
  useEffect(() => {
    if (draggedElement.name !== null && isDragging) {
      setCloneElement(
        <DragClone item={draggedElement.name} cloneStyle={cloneStyle} />
      );
    }
  }, [cloneStyle, draggedElement, isDragging]);

  // Cancel scrolling when item is no longer dragged.
  useEffect(() => {
    if (scrolling.exists) {
      clearInterval(scrolling.interval);
      setScrolling(defaults.scrollingDefault);
    }
  }, [isDragging]);

  // Reset request error when something is copied to the clipboard.
  useEffect(() => {
    setRequestError({ exists: false, description: "" });
  }, [clipboard]);

  // Reset categoryId when deck form is closed.
  useEffect(() => {
    if (deckDisplay === false) {
      setCategoryId(0);
    }
  }, [deckDisplay]);

  // Reset all context menu related state.
  const resetContext = () => {
    setContextMenu(false);
    setContextOptions(['']);
    setContextOpenedElem(defaults.contextOpenedElemDefault);
    setContextMenuScroll(defaults.contextMenuScrollDefault);
    setContextMenuStyle(defaults.contextMenuStyleDefault);
  };
  
  // Reset all drag related state.
  function resetDrag(timeout = false): void {
    if (timeout && draggedElement.name !== null) {
      const { top, left, width, height } = document
        ?.getElementById(draggedElement.id)
        ?.getBoundingClientRect() as DOMRect;
      setDragCount(0);
      setCloneStyle({
        width: `${width}px`,
        height: `${height}px`,
        opacity: "0.3",
        borderRadius: draggedElement.type === "category" ? "0%" : "10%",
        backgroundColor: "white",
        left: `${left}px`,
        top: `${top}px`,
        transition: ".3s",
      });
      setCloneTimeout({
        exists: true,
        timeouts: window.setTimeout(() => resetDrag(), 300),
      });
    } else {
      setDragCount(0);
      setCloneElement(null);
      setCloneStyle(defaults.cloneStyleDefault);
      setDraggedElement(defaults.draggedElementDefault);
      setDrag(false);
      setCloneTimeout(defaults.cloneTimeoutDefault);
    }
  }

  // Set 'isDragging' value to true when mouse moves.
  const handleMouseAction = (event: React.MouseEvent): void => {
    if (draggedElement.name !== null && !cloneTimeout.exists) {
      if (dragCount > 6) {
        setCloneStyle({
          width: "180px",
          backgroundColor: "rgb(233, 171, 55)",
          left: `${event.clientX + 5}px`,
          top: `${event.clientY + 5}px`,
          boxShadow: "0px 3px 6px black",
          transition: "width .3s, background-color .3s",
        });
        if (!isDragging) {
          setDrag(true);
          if (draggedElement.type === "category") {
            setCategoryDrag(true);
          }
          setCloneElement(
            <DragClone item={draggedElement.name} cloneStyle={cloneStyle} />
          );
        }
        scroll_div(
          event,
          window,
          document,
          currentContainer,
          scrolling,
          setScrolling,
          ["drag-button", "sidebar-container", "user-info", "user-image"]
        );
      } else {
        setDragCount((count) => count + 1);
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent): void => {
    const element = event.target as HTMLInputElement;
    setCategoryDrag(false);
    const specialClass = element.className.split(" ")[0];
    if (
      draggedElement.name !== null && isDragging &&
      !["file", "folder", "filler", "drag-button"].includes(specialClass)
    ) {
      resetDrag(true);
    }
  };

  const handleMouseDown = (event: React.MouseEvent): void => {
    const element = event.target as HTMLInputElement;
    if (element.tagName !== "MENU") {
      resetContext();
    }
  };

  const handleContextMenu = (event: React.MouseEvent): void => {
    event.preventDefault();
    if (isDragging) {
      return;
    }
    resetContext();

    const container = document.querySelector(currentContainer) as HTMLElement;
    const closestItem = find_closest_element(event, [
      ".file",
      ".folder",
      ".thematic-folder",
      ".category",
      ".card-container",
      ".category-container",
    ]);
    const contextMenuInfo = create_context_menu(event, closestItem);
    setContextOptions(contextMenuInfo.ops);

    let top = event.clientY;
    let left = event.clientX;
    if (contextMenuInfo.closest) {
      // Height of each menu should be 60px.
      if (window.innerHeight - top < contextMenuInfo.ops.length * 60) {
        top -= contextMenuInfo.ops.length * 60;
      }
      // Width of the context menu should be 200px.
      if (window.innerWidth - left < 200) {
        left -= 200;
      }
      setContextMenu(true);
      setContextOpenedElem(contextMenuInfo.openedElem);
      setContextMenuScroll({ scroll: container.scrollTop, top: top });
      setContextMenuStyle({ top: top, left: left });
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>): void => {
    const element = event.target as HTMLInputElement;
    if (contextMenu) {
      const scrollTop = element.scrollTop;
      let scrollDiff = Math.abs(scrollTop - contextMenuScroll.scroll);
      scrollDiff =
        scrollTop >= contextMenuScroll.scroll ? -scrollDiff : scrollDiff;
      setContextMenuStyle((sc) => ({
        top: contextMenuScroll.top + scrollDiff,
        left: sc.left,
      }));
    }
  };

  // Children: ProfileNavBar, SideBar | (Indirect) Folder, Deck
  return (
    <ProfileContext.Provider
      value={{
        username: username,
        rootDirectory: rootDirectory,
        directory: directory,
        directoryInfo: directoryInfo,
        items: items,
        setReRender: setReRender,
        clipboard: clipboard,
        setClipboard: setClipboard,
        contentLoaded: contentLoaded,
        fetchError: fetchError,
        requestError: requestError,
        setRequestError: setRequestError,
        contextOpenedElem: contextOpenedElem,
        contextOptions: contextOptions,
        contextMenuStyle: contextMenuStyle,
        cloneTimeout: cloneTimeout,
        draggedElement: draggedElement,
        setDraggedElement: setDraggedElement,
        isDragging: isDragging,
        categoryDrag: categoryDrag,
        deckDisplay: deckDisplay,
        setDeckDisplay: setDeckDisplay,
        categoryId: categoryId,
        setCategoryId: setCategoryId,
        columnNumber: columnNumber,
        handleContextMenu: handleContextMenu,
        handleScroll: handleScroll,
        resetDrag: resetDrag,
        resetContext: resetContext
      }}
    >
      <div className="profile-page">
        <div
          className="profile-container"
          onMouseMove={handleMouseAction}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
        >
          <ProfileNavBar />
          {contentLoaded && (
            <div className="profile-content">
              <SideBar user={username} userPicture={userPicture} />
              {contextMenu && <ItemContextMenu />}
              <Outlet />
              {!params.dirId && <CardContainer />}
            </div>
          )}
          {cloneElement}
          {requestError.exists && <ErrorInfo />}
          {fetchError && <NotFound />}
        </div>
      </div>
    </ProfileContext.Provider>
  );
};
