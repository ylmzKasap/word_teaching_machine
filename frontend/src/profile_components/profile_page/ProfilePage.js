import { useState, useEffect, useReducer, createContext } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  generate_directory,
  hasKeys,
  scroll_div,
  find_closest_element,
} from "../common/functions";

import { SideBar, ErrorInfo, DragClone } from "./OtherComponents";
import { CardContainer } from "./CardContainer";
import { ProfileNavBar } from "./ProfileNavbar";
import { create_context_menu } from "../common/handlers";
import { ItemContextMenu, NotFound } from "../common/components";
import { useWindowSize } from "../common/hooks";

export const ProfileContext = createContext();

export const ProfilePage = (props) => {
  // Rendered by main.
  const params = useParams();
  const navigate = useNavigate();

  const username = params.username;
  const dirId = params.dirId;

  const [userPicture, setUserPicture] = useState("");
  const [rootDirectory, setRootDirectory] = useState("");
  const [directory, setDirectory] = useState(() => (dirId ? dirId : props.dir));
  const [directoryInfo, setDirectoryInfo] = useState("");

  const [items, setItems] = useState([]);
  const [reRender, setReRender] = useReducer((x) => x + 1, 0);
  const [clipboard, setClipboard] = useState("");

  // Content fetching related states.
  const [pictureLoaded, setPictureLoaded] = useState(false);
  const [directoryLoaded, setDirectoryLoaded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [requestError, setRequestError] = useState({
    exists: false,
    description: "",
  });

  // Context menu related states.
  const [contextMenu, setContextMenu] = useState(false);
  const [contextOpenedElem, setContextOpenedElem] = useState({});
  const [contextOptions, setContextOptions] = useState([]);
  const [contextMenuStyle, setContextMenuStyle] = useState({});
  const [contextMenuScroll, setContextMenuScroll] = useState({});

  // Dragging related states.
  const [cloneElement, setCloneElement] = useState("");
  const [cloneStyle, setCloneStyle] = useState({});
  const [cloneTimeout, setCloneTimeout] = useState({
    exists: false,
    timeouts: "",
  });
  const [draggedElement, setDraggedElement] = useState({});
  const [dragCount, setDragCount] = useState(0);
  const [isDragging, setDrag] = useState(false);
  const [categoryDrag, setCategoryDrag] = useState(false);
  const [scrolling, setScrolling] = useState({
    exists: false,
    direction: null,
  });

  const [deckDisplay, setDeckDisplay] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [columnNumber] = useWindowSize(directoryInfo, contentLoaded);

  const currentConteiner =
    directoryInfo.item_type === "thematic_folder"
      ? ".category-container"
      : ".card-container";

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
    if (hasKeys(draggedElement) && hasKeys(cloneStyle) && isDragging) {
      setCloneElement(
        <DragClone item={draggedElement.name} cloneStyle={cloneStyle} />
      );
    }
  }, [cloneStyle, draggedElement, isDragging]);

  // Cancel scrolling when item is no longer dragged.
  useEffect(() => {
    if (scrolling.exists) {
      clearInterval(scrolling.interval);
      setScrolling({ exists: false });
    }
  }, [isDragging]);

  // Reset request error when something is copied to the clipboard.
  useEffect(() => {
    setRequestError({ exists: false, description: "" });
  }, [clipboard]);

  // Reset categoryId when deck form is closed.
  useEffect(() => {
    if (deckDisplay === false) {
      setCategoryId("");
    }
  }, [deckDisplay]);

  // Reset all context menu related state.
  const resetContext = () => {
    setContextMenu(false);
    setContextOptions([]);
    setContextOpenedElem({});
    setContextMenuScroll({});
    setContextMenuStyle({});
  };

  // Reset all drag related state.
  function resetDrag(timeout = false) {
    if (timeout && hasKeys(draggedElement)) {
      const { top, left, width, height } = document
        .getElementById(draggedElement.id)
        .getBoundingClientRect();
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
        timeouts: setTimeout(() => resetDrag(), 300),
      });
    } else {
      setDragCount(0);
      setCloneElement("");
      setCloneStyle({});
      setDraggedElement({});
      setDrag(false);
      setCloneTimeout({ exists: false, timeouts: "" });
    }
  }

  // Set 'isDragging' value to true when mouse moves.
  const handleMouseAction = (event) => {
    if (hasKeys(draggedElement) && !cloneTimeout.exists) {
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
          currentConteiner,
          scrolling,
          setScrolling,
          ["drag-button", "sidebar-container", "user-info", "user-image"]
        );
      } else {
        setDragCount((count) => count + 1);
      }
    }
  };

  const handleMouseUp = (event) => {
    setCategoryDrag(false);
    const specialClass = event.target.className.split(" ")[0];
    if (
      hasKeys(draggedElement) &&
      !["file", "folder", "filler", "drag-button"].includes(specialClass)
    ) {
      resetDrag(true);
    }
  };

  const handleMouseDown = (event) => {
    if (event.target.tagName !== "MENU") {
      resetContext();
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (isDragging) {
      return;
    }
    resetContext();

    const container = document.querySelector(currentConteiner);
    const closestItem = find_closest_element(event, [
      ".file",
      ".folder",
      ".thematic-folder",
      ".category",
      ".card-container",
      ".category-container",
    ]);
    const contextMenu = create_context_menu(event, closestItem);
    setContextOptions(contextMenu.ops);

    let top = event.clientY;
    let left = event.clientX;
    if (contextMenu.closest) {
      // Height of each menu should be 60px.
      if (window.innerHeight - top < contextMenu.ops.length * 60) {
        top -= contextMenu.ops.length * 60;
      }
      // Width of the context menu should be 200px.
      if (window.innerWidth - left < 200) {
        left -= 200;
      }
      setContextMenu(true);
      setContextOpenedElem(contextMenu.openedElem);
      setContextMenuScroll({ scroll: container.scrollTop, top: top });
      setContextMenuStyle({ top: top, left: left });
    }
  };

  const handleScroll = (event) => {
    if (contextMenu) {
      const scrollTop = event.target.scrollTop;
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
        setReRender: setReRender,
        directory: directory,
        rootDirectory: rootDirectory,
        draggedElement: draggedElement,
        setDraggedElement: setDraggedElement,
        isDragging: isDragging,
        categoryDrag: categoryDrag,
        cloneTimeout: cloneTimeout,
        resetDrag: resetDrag,
        items: items,
        handleContextMenu: handleContextMenu,
        contextOpenedElem: contextOpenedElem,
        clipboard: clipboard,
        contentLoaded: contentLoaded,
        contextOptions: contextOptions,
        contextMenuStyle: contextMenuStyle,
        setClipboard: setClipboard,
        resetContext: resetContext,
        handleScroll: handleScroll,
        fetchError: fetchError,
        requestError: requestError,
        setRequestError: setRequestError,
        deckDisplay: deckDisplay,
        setDeckDisplay: setDeckDisplay,
        categoryId: categoryId,
        setCategoryId: setCategoryId,
        directoryInfo: directoryInfo,
        columnNumber: columnNumber,
      }}
    >
      <div className="profile-page">
        <div
          className="profile-container"
          onMouseMove={handleMouseAction}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
        >
          <ProfileNavBar user={username} navigate={navigate} />
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