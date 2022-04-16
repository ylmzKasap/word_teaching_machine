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
    const prevDirectory = (
      directoryInfo.parent_id === rootDirectory ? "" : `/${directoryInfo.parent_id}`);
    props.navigate(`/user/${username}${prevDirectory}`);
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

      {
        // Display home icon when a fetch error exists.
        (fetchError && rootDirectory) &&
        <i className="fas fa-home"
        onClick={() => props.navigate(`/user/${username}`)}></i>
      }

      {categoryDisplay && (
        <CreateCategoryOverlay setDisplay={setCategoryDisplay} />
      )}
      {deckDisplay && <CreateDeckOverlay setDisplay={setDeckDisplay} />}
      {folderDisplay && <CreateFolderOverlay setDisplay={setFolderDisplay} />}
    </div>
  );
};
