import { useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import * as handlers from "./common/handlers";
import * as components from "./common/components";

export function CreateFolderOverlay(props) {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay" style={props.display}>
      <CreateFolder setDisplay={props.setDisplay} />
    </div>
  );
}

export function CreateFolder(props) {
  // Component of CreateFolderOverlay.

  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState("");
  const [nameError, setNameError] = useState({
    errorClass: "",
    description: "",
  });
  const [formError, setFormError] = useState({
    display: { display: "none" },
    errorClass: "",
    description: "",
  });

  const { username, directory, setReRender } = useContext(ProfileContext);

  const handleNameChange = (event) => {
    const [itemName, itemNameError, generalError] =
      handlers.handleItemName(event);
    setFolderName(itemName);
    setNameError(itemNameError);
    setFormError(generalError);
  };

  const handleRadioChange = (event) => {
    setFolderType(event.target.value);
  };

  const handleSubmit = (event) => {
    if (event.type === "keydown") {
      if (event.code !== "Enter") {
        return;
      }
    }

    event.preventDefault();

    if (folderName === "") {
      setFormError({
        errorClass: "invalid-form",
        description: "Enter a folder name.",
      });
    } else if (nameError.errorClass !== "") {
      setFormError({
        errorClass: "invalid-form",
        description: "Fix the problem above.",
      });
    } else {
      axios
        .post(`/u/${username}/create_folder`, {
          folder_name: folderName,
          folder_type: folderType,
          parent_id: directory,
        })
        .then(() => {
          setFolderName("");
          setFormError({
            display: { display: "none" },
            errorClass: "",
            description: "",
          });
          setReRender((x) => !x);
          props.setDisplay(false);
        })
        .catch((err) =>
          setFormError({
            errorClass: "invalid-form",
            description: err.response.data,
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
        setDisplay={props.setDisplay}
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
        checked={"Regular folder"}
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
}
