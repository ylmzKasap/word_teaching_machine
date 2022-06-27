import React, { useState, useContext, useReducer } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import { OverlayNavbar } from "./common/components";
import * as handlers from "./common/handlers";
import * as defaults from "./types/overlayDefaults";
import * as form_components from "./common/form_components";
import { ProfileContextTypes } from "./types/profilePageTypes";
import { CreateItemOverlayTypes } from "./types/overlayTypes";
import { handleLanguage, handleOverlayError } from "./common/reducers";

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
  const [purpose, setPurpose] = useState("");
  const [includeTranslation, setIncludeTranslation] = useState(false);
  const [color, setColor] = useState("#fff7f0");
  const [language, setLanguage] = useReducer(handleLanguage, defaults.languageDefault);
  const [errors, setErrors] = useReducer(handleOverlayError, defaults.categoryErrorDefault);

  const { username, directory, setReRender } = useContext(ProfileContext) as ProfileContextTypes;

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError] = handlers.handleItemName(event);
    setCategoryName(itemName);
    setErrors({type: "name", error: itemNameError});
    setErrors({type: "form", error: ""});
  };

  const handleLanguageChange = (event: React.SyntheticEvent) => {
    const element = event.target as HTMLInputElement;
    const field = element.name;
    const language = element.value;
    setLanguage({type: field, value: language});
  };

  const handlePurpose = (selectedPurpose: string) => {
    setPurpose(selectedPurpose);
    setLanguage({type: "source_language", value: undefined});
  };

  const handleTranslationDecision = () => {
    setIncludeTranslation(x => !x);
  };

  const handleColorChange = (event: React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    setColor(element.value);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!language.targetLanguage) {
      setErrors({type: "form", error:"Pick a target language"});
    } else if (purpose === "learn" && !language.sourceLanguage) {
      setErrors({type: "form", error:"Pick a source language"});
    } else if (categoryName === "") {
      setErrors({type: "form", error: "Enter a category name."});
    } else if (errors.nameError.errorClass) {
      setErrors({type: "form", error: "Fix the problem above."});
    } else {
      axios
        .post(`/create_category/${username}`, {
          category_name: categoryName,
          parent_id: directory,
          color: color,
          target_language: language.targetLanguage.toLowerCase(),
          source_language: language.sourceLanguage ? language.sourceLanguage.toLowerCase() : null,
          purpose: purpose
        })
        .then(() => {
          setCategoryName("");
          setErrors({type: "form", error: ""});
          setReRender();
          setDisplay(false);
        })
        .catch((err) =>
        setErrors({type: "form", error: err.response.data.errDesc}));
    }
  };

  return (
    <form className="create-item-info" onSubmit={handleSubmit}>
      <OverlayNavbar
        setDisplay={setDisplay}
        description="Create a new category"
      />
      <div className="form-content">
        {/* Category name */}
      <form_components.InputField
        description="Category name:"
        error={errors.nameError}
        value={categoryName}
        handler={handleNameChange}
        placeholder="Enter a category name"
      />
      {/* Purpose */}
      <form_components.DoubleChoice 
        description="I want to..."
        choice_one="learn"
        choice_two="teach"
        chosen={purpose}
        handler={handlePurpose} />
      {purpose && 
      <form_components.DropDown
        description=""
        handler={handleLanguageChange}
        topic="target_language"
        choices={form_components.allLanguages.filter(i => i !== language.sourceLanguage)}
        chosen={language.targetLanguage}
        placeholder={`Choose a language to ${purpose}`}
      />}
      {/* Source language for learning */}
      {purpose === "learn" &&
      <form_components.DropDown
        description="My language is"
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(i => i !== language.targetLanguage)}
        chosen={language.sourceLanguage}
        placeholder="Choose the language that you will enter the words"
      />}
      {purpose === "teach" && 
      <form_components.Checkbox 
        description="Show translations on pictures"
        handler={handleTranslationDecision}
        value={includeTranslation} />
      }
      {includeTranslation &&
      <form_components.DropDown
        description=""
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(i => i !== language.targetLanguage)}
        chosen={language.sourceLanguage}
        placeholder="Choose a language to display the translations"
      />}
      <label className="color-info">
        <input type="color" value={color} onChange={handleColorChange} />
        <span className="input-info">Pick a background color</span>
      </label>
      {/* Submit & Error */}
      <form_components.SubmitForm
        description="Create Category"
        formError={errors.formError}
      />
      </div>
    </form>
  );
};
