import React, { useContext } from "react";
import axios from "axios";

import { ProfileContext } from "../profile_page/ProfilePage";
import { OverlayNavbar } from "../common/components";
import * as handlers from "../common/handlers";
import * as form_components from "../common/form_components";
import { ProfileContextTypes } from "../types/profilePageTypes";

export const CreateCategoryOverlay: React.FC = () => {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay">
      <CreateCategory />
    </div>
  );
};

// TODO: Fix memory leak when submit button is pressed multiple times.
export const CreateCategory: React.FC = () => {
  // Component of CreateCategoryOverlay.

  const { username, directory, setReRender,
    categoryOverlay, setCategoryOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError] = handlers.handleItemName(event);
    setCategoryOverlay({type: "categoryName", value: itemName});
    setCategoryOverlay({type: "errors", innerType: "name", value: itemNameError});
  };

  const handleLanguageChange = (event: React.SyntheticEvent) => {
    const element = event.target as HTMLInputElement;
    const field = element.name;
    const language = element.value;
    setCategoryOverlay({type: "language", innerType: field, value: language});
  };

  const handlePurpose = (selectedPurpose: string) => {
    setCategoryOverlay({type: "purpose", value: selectedPurpose});
  };

  const handleTranslationDecision = () => {
    setCategoryOverlay({type: "includeTranslation", value: ""});
  };

  const handleColorChange = (event: React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    setCategoryOverlay({type: "color", value: element.value});
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!categoryOverlay.language.targetLanguage) {
      setCategoryOverlay({type: "errors", innerType: "form", value: "Pick a target language"});
    } else if ((categoryOverlay.purpose === "learn" && !categoryOverlay.language.sourceLanguage)
      || (categoryOverlay.includeTranslation && !categoryOverlay.language.sourceLanguage)) {
      setCategoryOverlay({type: "errors", innerType: "form", value: "Pick a source language"});
    } else if (categoryOverlay.categoryName === "") {
      setCategoryOverlay({type: "errors", innerType: "form", value: "Enter a category name"});
    } else if (categoryOverlay.errors.nameError.errorClass) {
      setCategoryOverlay({type: "errors", innerType: "form", value: "Fix the problem above"});
    } else {
      axios
        .post(`/create_category/${username}`, {
          category_name: categoryOverlay.categoryName,
          parent_id: directory,
          color: categoryOverlay.color,
          target_language: categoryOverlay.language.targetLanguage.toLowerCase(),
          source_language: categoryOverlay.language.sourceLanguage
            ? categoryOverlay.language.sourceLanguage.toLowerCase() : null,
          purpose: categoryOverlay.purpose
        })
        .then(() => {
          setCategoryOverlay({type: "clear", value: ""});
          setReRender();
        })
        .catch((err) =>
          setCategoryOverlay(
            {type: "errors", innerType: "form", value: err.response.data.errDesc}));
    }
  };

  return (
    <form className="create-item-info" onSubmit={handleSubmit}>
      <OverlayNavbar
        setOverlay={setCategoryOverlay}
        description="Create a new category"
      />
      <div className="form-content">
        {/* Category name */}
      <form_components.InputField
        description="Category name:"
        error={categoryOverlay.errors.nameError}
        value={categoryOverlay.categoryName}
        handler={handleNameChange}
        placeholder="Enter a category name"
      />
      {/* Purpose */}
      <form_components.DoubleChoice 
        description="I want to..."
        choice_one="learn"
        choice_two="teach"
        chosen={categoryOverlay.purpose}
        handler={handlePurpose} />
      {categoryOverlay.purpose && 
      <form_components.DropDown
        description=""
        handler={handleLanguageChange}
        topic="target_language"
        choices={form_components.allLanguages.filter(
          i => i !== categoryOverlay.language.sourceLanguage)}
        chosen={categoryOverlay.language.targetLanguage}
        placeholder={`Choose a language to ${categoryOverlay.purpose}`}
      />}
      {/* Source language for learning */}
      {categoryOverlay.purpose === "learn" &&
      <form_components.DropDown
        description="My language is"
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(
          i => i !== categoryOverlay.language.targetLanguage)}
        chosen={categoryOverlay.language.sourceLanguage}
        placeholder="Choose the language that you will enter the words"
      />}
      {categoryOverlay.purpose === "teach" && 
      <form_components.Checkbox 
        description="Show translations on pictures"
        handler={handleTranslationDecision}
        value={categoryOverlay.includeTranslation} />
      }
      {categoryOverlay.includeTranslation &&
      <form_components.DropDown
        description=""
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(
          i => i !== categoryOverlay.language.targetLanguage)}
        chosen={categoryOverlay.language.sourceLanguage}
        placeholder="Choose a language to display the translations"
      />}
      <label className="color-info">
        <input type="color" value={categoryOverlay.color} onChange={handleColorChange} />
        <span className="input-info">Pick a background color</span>
      </label>
      {/* Submit & Error */}
      <form_components.SubmitForm
        description="Create Category"
        formError={categoryOverlay.errors.formError}
      />
      </div>
    </form>
  );
};
