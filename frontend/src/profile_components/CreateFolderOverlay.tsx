import React, { useState, useContext, useReducer } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import { OverlayNavbar } from "./common/components";
import * as handlers from "./common/handlers";
import * as form_components from "./common/form_components";
import * as defaults from "./types/overlayDefaults";
import { ProfileContextTypes } from "./types/profilePageTypes";
import { CreateItemOverlayTypes } from "./types/overlayTypes";
import { handleOverlayError } from "./common/reducers";


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
  const [errors, setErrors] = useReducer(handleOverlayError, defaults.folderErrorDefault);

  const { username, directory, setReRender } = useContext(ProfileContext) as ProfileContextTypes;

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError] = handlers.handleItemName(event);
    setFolderName(itemName);
    setErrors({type: "name", error: itemNameError});
    setErrors({type: "form", error: ""});
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
      setErrors({type: "form", error: "Enter a folder name."});
    } else if (errors.nameError.errorClass) {
      setErrors({type: "form", error: "Fix the problem above.",});
    } else {
      axios
        .post(`/create_folder/${username}`, {
          folder_name: folderName,
          folder_type: folderType === 'regular_folder' ? 'folder' : folderType,
          parent_id: `${directory}`,
        })
        .then(() => {
          setFolderName("");
          setErrors({type: "form", error: ""});
          setReRender();
          setDisplay(false);
        })
        .catch((err) =>
          setErrors({type: "form", error: err.response.data.errDesc})
        );
    }
  };

  return (
    <form
      className="create-item-info"
      onSubmit={handleSubmit}
      onKeyDown={handleSubmit}
    >
      <OverlayNavbar
        setDisplay={setDisplay}
        description="Create a new folder"
      />
      <div className="form-content">
        {/* Folder name */}
      <form_components.InputField
        description="Folder Name:"
        error={errors.nameError}
        value={folderName}
        handler={handleNameChange}
        placeholder="Enter a folder name"
      />
      <form_components.Radio
        description="Folder Type:"
        buttons={["Regular folder", "Thematic folder"]}
        checked="regular_folder"
        selected={folderType}
        handler={handleRadioChange}
      />
      {/* Submit & Error */}
      <form_components.SubmitForm
        description="Create Folder"
        formError={errors.formError}
      />
      </div>
    </form>
  );
};
