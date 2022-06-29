import React, { useEffect, useState, useContext } from "react";

import { ProfileContext } from "./ProfilePage";
import { CreateDeckOverlay } from "../CreateDeckOverlay";
import { CreateFolderOverlay } from "../CreateFolderOverlay";
import { CreateCategoryOverlay } from "../CreateCategoryOverlay";
import { useNavigate } from "react-router-dom";
import { ProfileContextTypes } from "../types/profilePageTypes";


declare module 'react' {
  // Extend React's HTMLAttributes to accept custom attributes.
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    type?: string;
  }
}

export const ProfileNavBar: React.FC = () => {
  // Component of ProfilePage.

  const [backDisplay, setBackDisplay] = useState(false);
  const navigate = useNavigate();

  const {
    username,
    directory,
    contentLoaded,
    directoryInfo,
    fetchError,
    rootDirectory,
    deckOverlay,
    setDeckOverlay,
    folderOverlay,
    setFolderOverlay,
    categoryOverlay,
    setCategoryOverlay
  } = useContext(ProfileContext) as ProfileContextTypes;

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
  }, [directory, fetchError, contentLoaded, rootDirectory]);

  const handleBackClick = () => {
    const prevDirectory = (
      directoryInfo.parent_id === rootDirectory ? "" : `/${directoryInfo.parent_id}`);
    navigate(`/user/${username}${prevDirectory}`);
  };

  const addItem = (event: React.MouseEvent): void => {
    const element = event.target as HTMLInputElement;
    const itemType = element.getAttribute('type');
    if (itemType === "deck") {
      setDeckOverlay({type: "view", value: "show"});
    } else if (itemType === "folder") {
      setFolderOverlay({type: "view", value: "show"});
    } else if (itemType === "category") {
      setCategoryOverlay({type: "view", value: "show"});
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
        onClick={() => navigate(`/user/${username}`)}></i>
      }

      {categoryOverlay.display && (
        <CreateCategoryOverlay />
      )}
      {deckOverlay.display && <CreateDeckOverlay />}
      {folderOverlay.display && <CreateFolderOverlay />}
    </div>
  );
};
