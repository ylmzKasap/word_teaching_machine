import React, { useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import * as handlers from "./common/handlers";
import * as components from "./common/components";
import * as defaults from "./types/overlayDefaults";
import { ProfileContextTypes } from "./types/profilePageTypes";
import { CreateItemOverlayTypes } from "./types/overlayTypes";


export const CreateFolderOverlay: React.FC<CreateItemOverlayTypes> = ({setDisplay}) => {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay">
      <CreateFolder setDisplay={setDisplay} />
    </div>
  );
};

export const CreateFolder: React.FC<CreateItemOverlayTypes> = ({setDisplay}) => {
  // Component of CreateFolderOverlay.

  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState("regular_folder");
  const [nameError, setNameError] = useState(defaults.nameErrorDefault);
  const [formError, setFormError] = useState(defaults.formErrorDefault);

  const { username, directory, setReRender } = useContext(ProfileContext) as ProfileContextTypes;

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError, generalError] =
      handlers.handleItemName(event);
    setFolderName(itemName);
    setNameError(itemNameError);
    setFormError(generalError);
  };

  const handleRadioChange = (event: React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    setFolderType(element.value);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    if (event.type === "keydown") {
      const keyboardEvent = event as React.KeyboardEvent;
      if (keyboardEvent.key !== "Enter") {
        return;
      }
    }

    event.preventDefault();

    if (folderName === "") {
      setFormError({
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: "Enter a folder name.",
      });
    } else if (nameError.errorClass !== "") {
      setFormError({
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: "Fix the problem above.",
      });
    } else {
      axios
        .post(`/create_folder/${username}`, {
          folder_name: folderName,
          folder_type: folderType,
          parent_id: directory,
        })
        .then(() => {
          setFolderName("");
          setFormError(defaults.formErrorDefault);
          setReRender();
          setDisplay(false);
        })
        .catch((err) =>
          setFormError({
            display: {display: "flex"},
            errorClass: "invalid-form",
            description: err.response.data.errDesc,
          })
        );
    }
  };

  return (
    <form
      className="create-item-info"
      onSubmit={handleSubmit}
      onKeyDown={handleSubmit}
    >
      <components.OverlayNavbar
        setDisplay={setDisplay}
        description="Create a new folder"
      />
      {/* Folder name */}
      <components.InputField
        description="Folder Name:"
        error={nameError}
        value={folderName}
        handler={handleNameChange}
        placeholder="Enter a folder name"
      />
      <components.Radio
        description="Folder Type:"
        buttons={["Regular folder", "Thematic folder"]}
        checked="regular_folder"
        selected={folderType}
        handler={handleRadioChange}
      />
      {/* Submit & Error */}
      <components.SubmitForm
        description="Create Folder"
        formError={formError}
      />
    </form>
  );
};
