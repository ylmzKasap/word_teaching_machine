import React, { useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import * as handlers from "./common/handlers";
import * as components from "./common/components";
import * as defaults from "./types/overlayDefaults";
import { ProfileContextTypes } from "./types/profilePageTypes";
import { CreateItemOverlayTypes } from "./types/overlayTypes";

export const CreateCategoryOverlay: React.FC<CreateItemOverlayTypes> = ({setDisplay}) => {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay">
      <CreateCategory setDisplay={setDisplay} />
    </div>
  );
};

// TODO: Fix memory leak when submit button is pressed multiple times.
export const CreateCategory: React.FC<CreateItemOverlayTypes> = ({setDisplay}) => {
  // Component of CreateCategoryOverlay.

  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState("#fff7f0");
  const [nameError, setNameError] = useState(defaults.nameErrorDefault);
  const [formError, setFormError] = useState(defaults.formErrorDefault);

  const { username, directory, setReRender } = useContext(ProfileContext) as ProfileContextTypes;

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError, generalError] =
      handlers.handleItemName(event);
    setCategoryName(itemName);
    setNameError(itemNameError);
    setFormError(generalError);
  };

  const handleColorChange = (event: React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    setColor(element.value);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (categoryName === "") {
      setFormError({
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: "Enter a category name.",
      });
    } else if (nameError.errorClass !== "") {
      setFormError({
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: "Fix the problem above.",
      });
    } else {
      axios
        .post(`/create_category/${username}`, {
          category_name: categoryName,
          parent_id: directory,
          content: { color: color },
        })
        .then(() => {
          setCategoryName("");
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
    <form className="create-item-info" onSubmit={handleSubmit}>
      <components.OverlayNavbar
        setDisplay={setDisplay}
        description="Create a new category"
      />
      {/* Category name */}
      <components.InputField
        description="Category name:"
        error={nameError}
        value={categoryName}
        handler={handleNameChange}
        placeholder="Enter a category name"
      />
      <div className="color-info">
        <input type="color" value={color} onChange={handleColorChange} />
        <span className="input-info">Pick a background color</span>
      </div>
      {/* Submit & Error */}
      <components.SubmitForm
        description="Create Category"
        formError={formError}
      />
    </form>
  );
};
