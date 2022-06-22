import React, { useState, useContext, useReducer } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import { OverlayNavbar } from "./common/components";
import * as handlers from "./common/handlers";
import * as form_components from "./common/form_components";
import * as defaults from "./types/overlayDefaults";
import { CreateItemOverlayTypes } from "./types/overlayTypes";
import { ProfileContextTypes } from "./types/profilePageTypes";
import { handleOverlayError, handleLanguage } from "./common/reducers";

export const CreateDeckOverlay: React.FC<CreateItemOverlayTypes> = ({setDisplay}) => {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay">
      <CreateDeck setDisplay={setDisplay} />
    </div>
  );
};

export const CreateDeck: React.FC<CreateItemOverlayTypes> = ({setDisplay}) => {
  // Component of CreateDeckOverlay.

  const [deckName, setDeckName] = useState("");
  const [words, setWords] = useState("");
  const [language, setLanguage] = useReducer(handleLanguage, defaults.languageDefault);
  const [errors, setErrors] = useReducer(handleOverlayError, defaults.deckErrorDefault);

  const { username, directory, setReRender, categoryInfo } =
    useContext(ProfileContext) as ProfileContextTypes;

  const categorySpec = categoryInfo.id ? categoryInfo.id : "";

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError] = handlers.handleItemName(event);
    setDeckName(itemName);
    setErrors({type: "name", error: itemNameError});
    setErrors({type: "form", error: ""});
  };

  const handleWordChange = (event:React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;

    const wordNameFilter = /[.,\\/<>:"|?*]/;
    if (wordNameFilter.test(element.value)) {
      setErrors({type: "word",
      error: `Forbidden character ' ${element.value.match(wordNameFilter)} '`});
    } else {
      setErrors({type: "word", error: ""});
    }
    setWords(element.value);
    setErrors({type: "form", error: ""});
  };

  const handleLanguageChange = (event: React.SyntheticEvent) => {
    const element = event.target as HTMLInputElement;
    const field = element.name;
    const language = element.value;
    setLanguage({type: field, value: language});
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    let allWords = words
      .split("\n")
      .filter((word) => word !== "")
      .filter((word) => !word.match(/^[\s]+$/));

    if ((!language.targetLanguage || !language.sourceLanguage) && !categorySpec) {
      setErrors({type: "form", error:"Pick a language"});
    } else if (errors.nameError.errorClass || errors.wordError!.errorClass) {
      setErrors({type: "form", error:"Fix the problem(s) above."});
    } else if (allWords.length === 0) {
      setErrors({type: "form", error:"Enter at least one word."});
    } else if (words === "") {
      setErrors({type: "form", error:"Enter a deck name."});
    } else {
      axios
        .post(`/create_deck/${username}`, {
          deckName: deckName,
          wordArray: allWords,
          parent_id: directory,
          category_id: categorySpec ? categorySpec : null,
          target_language: 
            categorySpec ? categoryInfo.targetLanguage : language.targetLanguage!.toLowerCase(),
          source_language: 
            categorySpec ? categoryInfo.sourceLanguage : language.sourceLanguage!.toLowerCase()
        })
        .then(() => {
          setDeckName("");
          setWords("");
          setErrors({type: "form", error: ""});
          setReRender();
          setDisplay(false);
        })
        .catch((err) =>
        setErrors({type: "form", error: err.response.data.errDesc}));
    }
  };

  // Children: OverlayNavbar.
  return (
    <form className="create-item-info" onSubmit={handleSubmit}>
      <OverlayNavbar
        setDisplay={setDisplay}
        description="Create a new deck"
        extra={categoryInfo.targetLanguage}
      />
      <div className="form-content">
      {/* Deck name */}
      <form_components.InputField
        description="Deck Name:"
        error={errors.nameError}
        value={deckName}
        handler={handleNameChange}
        placeholder="Enter a deck name"
      />
      {!categorySpec && <form_components.DropDown
        description="I want to learn/teach"
        handler={handleLanguageChange}
        topic="target_language"
        choices={form_components.allLanguages.filter(i => i !== language.sourceLanguage)}
        chosen={language.targetLanguage}
      />
      }
      {!categorySpec && <form_components.DropDown
        description="Show translations in"
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(i => i !== language.targetLanguage)}
        chosen={language.sourceLanguage}
      />}
      {/* Words */}
      <label className="input-label">
        <div className="input-info">
          Words: <span className="input-error">{errors.wordError!.description}</span>
        </div>
        <textarea
          className={`word-input ${errors.wordError!.errorClass}`}
          value={words}
          onChange={handleWordChange}
          placeholder="Enter a word for each line"
          required
        />
      </label>
      {/* Submit & Error */}
      <form_components.SubmitForm description="Create Deck" formError={errors.formError} />
      </div> 
    </form>
  );
};