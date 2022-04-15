import { useEffect, useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./ProfilePage";
import { CreateDeckOverlay } from "../CreateDeckOverlay";
import { CreateFolderOverlay } from "../CreateFolderOverlay";
import { CreateCategoryOverlay } from "../CreateCategoryOverlay";

export const ProfileNavBar = (props) => {
  // Component of ProfilePage.

  const [folderDisplay, setFolderDisplay] = useState(false);
  const [categoryDisplay, setCategoryDisplay] = useState(false);
  const [backDisplay, setBackDisplay] = useState(false);

  const {
    username,
    directory,
    contentLoaded,
    directoryInfo,
    fetchError,
    rootDirectory,
    deckDisplay,
    setDeckDisplay,
  } = useContext(ProfileContext);

  useEffect(() => {
    if (
      ![rootDirectory, "home", ""].includes(directory) &&
      !fetchError &&
      contentLoaded
    ) {
      setBackDisplay(true);
    } else {
      setBackDisplay(false);
    }
  }, [directory, fetchError, contentLoaded]);

  const handleBackClick = () => {
    axios
      .get(`/goback/${username}/${directory}`)
      .then((response) =>
        props.navigate(
          `/user/${username}${
            response.data === rootDirectory ? "" : `/${response.data.parent_id}`
          }`
        )
      );
  };

  const addItem = (event) => {
    const itemType = event.target.attributes.type.value;
    if (itemType === "deck") {
      setDeckDisplay((view) => !view);
    } else if (itemType === "folder") {
      setFolderDisplay((view) => !view);
    } else if (itemType === "category") {
      setCategoryDisplay((view) => !view);
    }
  };

  // Children: CreateDeckOverlay, CreateFolderOverlay
  return (
    <div className="profile-navbar">
      {backDisplay && (
        <i className="fas fa-arrow-left arrow" onClick={handleBackClick}></i>
      )}

      {
        // Deck creation for thematic folders.
        contentLoaded && directoryInfo.item_type === "thematic_folder" && (
          <i
            className="fas fa-plus-circle category-circle"
            type="category"
            onClick={addItem}
          ></i>
        )
      }

      {
        // Folder creation for non-thematic folders.
        contentLoaded && directoryInfo.item_type !== "thematic_folder" && (
          <i className="fas fa-folder-plus" type="folder" onClick={addItem}></i>
        )
      }

      {
        // Deck creation for non-thematic folders.
        contentLoaded && directoryInfo.item_type !== "thematic_folder" && (
          <i className="fas fa-plus-circle" type="deck" onClick={addItem}></i>
        )
      }

      {categoryDisplay && (
        <CreateCategoryOverlay setDisplay={setCategoryDisplay} />
      )}
      {deckDisplay && <CreateDeckOverlay setDisplay={setDeckDisplay} />}
      {folderDisplay && <CreateFolderOverlay setDisplay={setFolderDisplay} />}
    </div>
  );
};
