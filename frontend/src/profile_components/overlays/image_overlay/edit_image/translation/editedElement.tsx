import { useState, useContext, ChangeEvent } from "react";
import axios from "axios";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../../types/profilePageTypes";
import { specialCharacterRegex } from "../../../../common/regex";
import { get_row_default } from "../../../../types/overlayDefaults";

const EditedElement: React.FC<EditedElementPropTypes> = ({
  elementId,
  order,
  language,
  type,
  setRequestExists
}) => {
  // Rendered by "./translation" -> Translation
  // Renders an input element which edits the text before.

  const { deckOverlay, editImageOverlay, setEditImageOverlay, setRequestError } =
    useContext(ProfileContext) as ProfileContextTypes;

  // Get the input saved by the reducer.
  const savedInput = editImageOverlay.imageInfo[order].filter(
    (x) => x.selected === true)[0][language] as string;

  const [inputValue, setInputValue] = useState(savedInput ? savedInput : "");

  const handleForbidden = (inputValue: string) => {
    // Warn the user when a forbidden value is entered.
    const forbiddenCharacter = inputValue.match(specialCharacterRegex);
    if (forbiddenCharacter) {
      setRequestError({
        exists: true,
        description: `Input cannot contain '${forbiddenCharacter}'`,
      });
      return true;
    }
    setRequestError({ exists: false, description: "" });
    return false;
  };

  const handleChange = (event: ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    setInputValue(element.value);
    handleForbidden(element.value);
  };

  const focusOut = () => {
    // Save the input and make an http request to get input info if necessary.

    const { targetLanguage, sourceLanguage } = deckOverlay.language;
    const trimmedInput = inputValue.trim();

    // Reject forbidden values.
    const forbiddenInput = handleForbidden(trimmedInput);
    if (forbiddenInput) {
      setInputValue(savedInput);
      setRequestError({ exists: false, description: "" });
      return;
    }

    // Save input by the reducer.
    setEditImageOverlay({
      type: "changeValue",
      value: trimmedInput,
      key: language,
      index: order,
    });

    // Reset the images when the input is blank.
    if (!trimmedInput && (
      (type === "targetLanguage" && deckOverlay.purpose === "teach")
      || (type === "sourceLanguage" && deckOverlay.purpose === "learn")
    )) {
      setEditImageOverlay({
        type: "changeImages",
        value: [get_row_default(deckOverlay)],
        index: order,
      });
      return;
    }

    // Get the image objects form the server
    if (
      trimmedInput !== savedInput &&
      ((type === "targetLanguage" && deckOverlay.purpose === "teach")
      || (type === "sourceLanguage" && deckOverlay.purpose === "learn"))
    ) {
      setRequestExists(true);
      axios
        .get(
          `/image/${encodeURIComponent(trimmedInput)}
          /${deckOverlay.purpose === "learn" ? sourceLanguage : targetLanguage}
          /${targetLanguage}
          /${sourceLanguage}`.replace(/[\s\n]/g, '')
        )
        .then((res) => {
          setEditImageOverlay({
            type: "changeImages",
            value: res.data[0],
            index: order,
          });
          setRequestExists(false);
        }
        )
        .catch((err) => {
          setRequestError({
            exists: true,
            description: err.response.data.errDesc,
          });
          setEditImageOverlay({
            type: "changeValue",
            value: savedInput,
            key: language,
            index: order,
          });
          setRequestExists(false);
        });
    }
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      focusOut();
      setEditImageOverlay({ type: "changeEdited", value: "" });
    } else if (event.key === "Escape") {
      setInputValue(savedInput);
      setEditImageOverlay({ type: "changeEdited", value: "" });
      setRequestError({ exists: false, description: "" });
    } else if (event.key === "Tab") {
      event.preventDefault();
      focusOut();
      if (order + 1 < editImageOverlay.imageInfo.length) {
        const idPrefix = elementId.match(/[a-z-]+/);
        setEditImageOverlay({ type: "changeEdited", value: `${idPrefix}${order + 1}` });
      } else {
        setEditImageOverlay({ type: "changeEdited", value: "" });
      }
    }
  };

  return (
    <input
      id={`image-info-input-${order}`}
      type="text"
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKey}
      onFocus={(event) => event.target.select()}
      onBlur={focusOut}
      autoFocus
    />
  );
};

interface EditedElementPropTypes {
  elementId: string;
  order: number;
  type: string;
  language: string;
  setRequestExists: React.Dispatch<React.SetStateAction<boolean>>;
}

export default EditedElement;