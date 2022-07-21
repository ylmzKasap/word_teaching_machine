import { useContext } from "react";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import {  ProfileContextTypes } from "../../../../types/profilePageTypes";
import { ImageRowTypes } from "../edit_image_overlay";
import EditedElement from "./editedElement";

const Translation: React.FC<TranslationTypes> = ({
  word,
  order,
  type,
  setRequestExists,
  elementClass=undefined
}) => {
  // Rendered by "./image_translation" -> ImageTranslation
  // Renders translation divs and "EditedElement" if it exists.

  const { editImageOverlay, setEditImageOverlay, deckOverlay } =
    useContext(ProfileContext) as ProfileContextTypes;

  // Id depends on the type of the translation box.
  const componentId =
    type === "sourceLanguage"
      ? `image-source-language-${order}`
      : `image-target-language-${order}`;

  // Class is either 'image-info-edited', 'editable', 'not-found' or null.
  let componentClass;
    if (editImageOverlay.editedId === componentId) {
      componentClass = "image-info-edited";
    } else if (type === "sourceLanguage"
      && deckOverlay.purpose === "learn"
      && elementClass !== "not-found") {
        componentClass = "editable";
      } else if (type === "targetLanguage"
        && deckOverlay.purpose === "teach"
        && elementClass !== "not-found") {
          componentClass = "editable";
      }
      else {
        componentClass = elementClass;
      }

  const handleClick = () => {
    // Discard edited element when non-editable source is clicked.
    if ((type === "targetLanguage" && !word.targetEditable && deckOverlay.purpose !== "teach")
      || (type === "sourceLanguage" && !word.sourceEditable && deckOverlay.purpose !== "learn")) {
      setEditImageOverlay({ type: "changeEdited", value: "" });
      return;
    }
    setEditImageOverlay({ type: "changeEdited", value: componentId });
  };

  return (
    <div id={componentId} className={componentClass} onClick={handleClick}>
      {editImageOverlay.editedId === componentId ? (
        <EditedElement
          elementId={componentId}
          order={order}
          type={type}
          language={deckOverlay.language[type] as string}
          setRequestExists={setRequestExists}
        />
      ) : componentClass === "not-found" ? (
        "add translation"
      ) : (
        word[deckOverlay.language[type]!]
      )}
      {componentClass === "not-found" &&
      editImageOverlay.editedId !== componentId ? (
        <div id={`language-info-${order}`}>({deckOverlay.language[type]})</div>
      ) : (
        ""
      )}
    </div>
  );
};

interface TranslationTypes {
  word: ImageRowTypes;
  order: number;
  type: string;
  setRequestExists: React.Dispatch<React.SetStateAction<boolean>>;
  elementClass: string | undefined;
}

export default Translation;