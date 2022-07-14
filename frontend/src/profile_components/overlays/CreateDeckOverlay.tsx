import React, { useContext } from "react";
import axios from "axios";

import { ProfileContext } from "../profile_page/ProfilePage";
import { OverlayNavbar } from "../common/components";
import * as handlers from "../common/handlers";
import * as form_components from "../common/form_components";
import { ProfileContextTypes } from "../types/profilePageTypes";
import { to_title } from "../common/functions";

export const CreateDeckOverlay: React.FC = () => {
  // Component of ProfileNavbar.

  return (
    <div className="input-overlay">
      <CreateDeck />
    </div>
  );
};

export const CreateDeck: React.FC = () => {
  // Component of CreateDeckOverlay.

  const { username, directory, setReRender, deckOverlay, setDeckOverlay } =
    useContext(ProfileContext) as ProfileContextTypes;

  const categorySpec = deckOverlay.categoryInfo.id ? deckOverlay.categoryInfo.id : "";

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError] = handlers.handleItemName(event);
    setDeckOverlay({type: "deckName", value: itemName});
    setDeckOverlay({type: "errors", innerType: "name", value: itemNameError});
  };

  const handlePurpose = (selectedPurpose: string) => {
    setDeckOverlay({type: "purpose", value: selectedPurpose});
  };

  const handleWordChange = (event:React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    const wordNameFilter = /[.,\\/<>:"|?*]/;
    if (wordNameFilter.test(element.value)) {
      setDeckOverlay({
        type: "errors",
        innerType: "word",
        value: `Forbidden character ' ${element.value.match(wordNameFilter)} '`});
    } else {
      setDeckOverlay({type: "errors", innerType: "word", value: ""});
    }
    setDeckOverlay({type: "words", value: element.value});
  };

  const handleLanguageChange = (event: React.SyntheticEvent) => {
    const element = event.target as HTMLInputElement;
    const field = element.name;
    const language = element.value;
    setDeckOverlay({type: "language", innerType: field, value: language});
  };

  const handleTranslationDecision = () => {
    setDeckOverlay({type: "includeTranslation", value: ""});
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    let allWords = deckOverlay.words
      .split("\n")
      .filter((word) => word !== "")
      .filter((word) => !word.match(/^[\s]+$/));

    if (!deckOverlay.language.targetLanguage && !categorySpec) {
      setDeckOverlay({type: "errors", innerType: "form", value: "Pick a target language"});
    } else if (((deckOverlay.purpose === "learn"
    && !deckOverlay.language.sourceLanguage) && !categorySpec)
      || (deckOverlay.includeTranslation && !deckOverlay.language.sourceLanguage)) {
      setDeckOverlay({type: "errors", innerType: "form", value: "Pick a source language"});
    } else if (
        deckOverlay.errors.nameError.errorClass
       || deckOverlay.errors.wordError!.errorClass) {
        setDeckOverlay({type: "errors", innerType: "form", value: "Fix the problem(s) above"});
    } else if (allWords.length === 0) {
      setDeckOverlay({type: "errors", innerType: "form", value: "Enter at least one word"});
    } else if (deckOverlay.words === "") {
      setDeckOverlay({type: "errors", innerType: "form", value: "Enter a deck name"});
    } else {
      axios
        .post(`/create_deck/${username}`, {
          deckName: deckOverlay.deckName,
          wordArray: allWords,
          parent_id: directory,
          category_id: categorySpec ? categorySpec : null,
          target_language: categorySpec
            ? deckOverlay.categoryInfo.targetLanguage
            : deckOverlay.language.targetLanguage!.toLowerCase(),
          source_language: categorySpec
            ? (deckOverlay.categoryInfo.sourceLanguage
              ? deckOverlay.categoryInfo.sourceLanguage : null)
            : (deckOverlay.language.sourceLanguage
              ? deckOverlay.language.sourceLanguage.toLowerCase()
              : null),
          show_translation: deckOverlay.includeTranslation,
          purpose: deckOverlay.purpose
        })
        .then(() => {
          setDeckOverlay({type: "clear", value: ""});
          setReRender();
        })
        .catch((err) =>
        setDeckOverlay({type: "errors", innerType: "form", value: err.response.data.errDesc}));
    }
  };

  // Children: OverlayNavbar.
  return (
    <form className="create-item-info" onSubmit={handleSubmit}>
      <OverlayNavbar
        setOverlay={setDeckOverlay}
        description="Create a new deck"
      />
      <div className="form-content">
      {/* Deck name */}
      <form_components.InputField
        description="Deck Name:"
        error={deckOverlay.errors.nameError}
        value={deckOverlay.deckName}
        handler={handleNameChange}
        placeholder="Enter a deck name"
      />
      {/* Purpose */}
      {!categorySpec &&
      <form_components.DoubleChoice 
        description="I want to..."
        choice_one="learn"
        choice_two="teach"
        chosen={deckOverlay.purpose}
        handler={handlePurpose} />
      }
      {!categorySpec && deckOverlay.purpose && 
      <form_components.DropDown
        description=""
        handler={handleLanguageChange}
        topic="target_language"
        choices={form_components.allLanguages.filter(
          i => i !== deckOverlay.language.sourceLanguage)}
        chosen={deckOverlay.language.targetLanguage}
        placeholder={`Choose a language to ${deckOverlay.purpose}`}
      />}
      {/* Source language for learning */}
      {!categorySpec && deckOverlay.purpose === "learn" &&
      <form_components.DropDown
        description="My language is"
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(
          i => i !== deckOverlay.language.targetLanguage)}
        chosen={deckOverlay.language.sourceLanguage}
        placeholder="Choose the language that you will enter the words"
      />}
      {/* Words */}
      {((deckOverlay.purpose === "teach" && deckOverlay.language.targetLanguage)
        || (deckOverlay.purpose === "learn" 
          && (deckOverlay.language.sourceLanguage && deckOverlay.language.targetLanguage))
        || categorySpec) && 
      <label className="input-label">
        <div className="input-info">
          {deckOverlay.purpose === "teach"
          ? `${to_title(deckOverlay.language.targetLanguage!)} words that I will teach`
          : `${to_title(deckOverlay.language.sourceLanguage!)} words
          that I want to learn in ${to_title(deckOverlay.language.targetLanguage!)}`}:
          <span className="input-error">{deckOverlay.errors.wordError!.description}</span>
        </div>
        <textarea
          className={`word-input ${deckOverlay.errors.wordError!.errorClass}`}
          value={deckOverlay.words}
          onChange={handleWordChange}
          placeholder="Enter a word for each line"
          required
        />
      </label>
      }
      {((deckOverlay.purpose === "teach" && (
        categorySpec
        ? deckOverlay.categoryInfo.sourceLanguage
        : true))
       || (deckOverlay.purpose === "learn" && deckOverlay.language.sourceLanguage)) && 
      <form_components.Checkbox 
        description="Show translations on pictures"
        handler={handleTranslationDecision}
        value={deckOverlay.includeTranslation} />
      }
      {!categorySpec && deckOverlay.purpose === "teach" && deckOverlay.includeTranslation &&
      <form_components.DropDown
        description=""
        handler={handleLanguageChange}
        topic="source_language"
        choices={form_components.allLanguages.filter(
          i => i !== deckOverlay.language.targetLanguage)}
        chosen={deckOverlay.language.sourceLanguage}
        placeholder="Choose a language to display the translations"
      />}
      {/* Submit & Error */}
      <form_components.SubmitForm 
        description="Create Deck"
        formError={deckOverlay.errors.formError} />
      </div> 
    </form>
  );
};