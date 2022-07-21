import React, { useContext } from "react";
import axios from "axios";

import { ProfileContext } from "../profile_page/ProfilePage";
import OverlayNavbar from "./common/components/overlay_navbar";
import InputField from "../common/form_components/input_field";
import Radio from "../common/form_components/radio_button";
import SubmitForm from "../common/form_components/submit_form";
import { ProfileContextTypes } from "../types/profilePageTypes";
import { handleItemName } from "../common/form_components/handlers/handleItemName";

export const CreateFolderOverlay: React.FC = () => {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay">
      <CreateFolder />
    </div>
  );
};

export const CreateFolder: React.FC = () => {
  // Component of CreateFolderOverlay.

  const { username, directory, setReRender, folderOverlay, setFolderOverlay } =
    useContext(ProfileContext) as ProfileContextTypes;

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError] = handleItemName(event);
    setFolderOverlay({ type: "folderName", value: itemName });
    setFolderOverlay({
      type: "errors",
      innerType: "name",
      value: itemNameError,
    });
  };

  const handleRadioChange = (event: React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    setFolderOverlay({ type: "folderType", value: element.value });
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    if (event.type === "keydown") {
      const keyboardEvent = event as React.KeyboardEvent;
      if (keyboardEvent.key !== "Enter") {
        return;
      }
    }

    event.preventDefault();

    if (folderOverlay.folderName === "") {
      setFolderOverlay({
        type: "errors",
        innerType: "form",
        value: "Enter a folder name",
      });
    } else if (folderOverlay.errors.nameError.errorClass) {
      setFolderOverlay({
        type: "errors",
        innerType: "form",
        value: "Fix the problem above",
      });
    } else {
      axios
        .post(`/create_folder/${username}`, {
          folder_name: folderOverlay.folderName,
          folder_type:
            folderOverlay.folderType === "regular_folder"
              ? "folder"
              : folderOverlay.folderType,
          parent_id: `${directory}`,
        })
        .then(() => {
          setFolderOverlay({ type: "clear", value: "" });
          setReRender();
        })
        .catch((err) =>
          setFolderOverlay({
            type: "errors",
            innerType: "form",
            value: err.response.data.errDesc,
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
      <OverlayNavbar
        setOverlay={setFolderOverlay}
        description="Create a new folder"
      />
      <div className="form-content">
        {/* Folder name */}
        <InputField
          description="Folder Name:"
          error={folderOverlay.errors.nameError}
          value={folderOverlay.folderName}
          handler={handleNameChange}
          placeholder="Enter a folder name"
        />
        <Radio
          description="Folder Type:"
          buttons={["Regular folder", "Thematic folder"]}
          checked="regular_folder"
          selected={folderOverlay.folderType}
          handler={handleRadioChange}
        />
        {/* Submit & Error */}
        <SubmitForm
          description="Create Folder"
          formError={folderOverlay.errors.formError}
        />
      </div>
    </form>
  );
};
