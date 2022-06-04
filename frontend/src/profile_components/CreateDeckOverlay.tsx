import React, { useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./profile_page/ProfilePage";
import * as handlers from "./common/handlers";
import * as components from "./common/components";
import * as defaults from "./types/overlayDefaults";
import { CreateItemOverlayTypes } from "./types/overlayTypes";
import { ProfileContextTypes } from "./types/profilePageTypes";

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
  const [nameError, setNameError] = useState(defaults.nameErrorDefault);
  const [wordError, setWordError] = useState(defaults.nameErrorDefault);
  const [formError, setFormError] = useState(defaults.formErrorDefault);

  const { username, directory, setReRender, categoryId } =
    useContext(ProfileContext) as ProfileContextTypes;

  const categorySpec = categoryId ? categoryId : "";

  const handleNameChange = (event: React.ChangeEvent) => {
    const [itemName, itemNameError, generalError] =
      handlers.handleItemName(event);
    setDeckName(itemName);
    setNameError(itemNameError);
    setFormError(generalError);
  };

  const handleWordChange = (event:React.ChangeEvent) => {
    const element = event.target as HTMLInputElement;

    const wordNameFilter = /[.,\\/<>:"|?*]/;
    if (wordNameFilter.test(element.value)) {
      setWordError({
        errorClass: "forbidden-input",
        description: `Forbidden character ' ${element.value.match(
          wordNameFilter
        )} '`,
      });
    } else {
      setWordError(defaults.nameErrorDefault);
    }
    setWords(element.value);
    setFormError(defaults.formErrorDefault);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    let allWords = words
      .split("\n")
      .filter((word) => word !== "")
      .filter((word) => !word.match(/^[\s]+$/));

    if (nameError.errorClass !== "" || wordError.errorClass !== "") {
      setFormError({
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: "Fix the problem(s) above.",
      });
    } else if (allWords.length === 0) {
      setFormError(prev => ({
        ...prev,
        errorClass: "invalid-form",
        description: "Enter at least one word.",
      }));
    } else if (words === "") {
      setFormError({
        display: {display: "flex"},
        errorClass: "invalid-form",
        description: "Enter a deck name.",
      });
    } else {
      axios
        .post(`/create_deck/${username}`, {
          deckName: deckName,
          content: { words: allWords },
          parent_id: directory,
          category_id: categorySpec ? categorySpec : null,
        })
        .then(() => {
          setDeckName("");
          setWords("");
          setFormError({
            display: { display: "none" },
            errorClass: "",
            description: "",
          });
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

  // Children: OverlayNavbar.
  return (
    <form className="create-item-info" onSubmit={handleSubmit}>
      <components.OverlayNavbar
        setDisplay={setDisplay}
        description="Create a new deck"
      />
      {/* Deck name */}
      <components.InputField
        description="Deck Name:"
        error={nameError}
        value={deckName}
        handler={handleNameChange}
        placeholder="Enter a deck name"
      />
      {/* Words */}
      <label className="input-label">
        <div className="input-info">
          Words: <span className="input-error">{wordError.description}</span>
        </div>
        <textarea
          className={`word-input ${wordError.errorClass}`}
          value={words}
          onChange={handleWordChange}
          placeholder="Enter a word for each line"
          required
        />
      </label>
      {/* Submit & Error */}
      <components.SubmitForm description="Create Deck" formError={formError} />
    </form>
  );
};
