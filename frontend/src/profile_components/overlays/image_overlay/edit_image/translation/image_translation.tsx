import { useContext } from "react";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../../types/profilePageTypes";
import LoadingIcon from "../../../../../assets/animations/loading_icon";
import Translation from "./translation";
import { ImageRowTypes } from "../edit_image_overlay";

const ImageTranslation: React.FC<ImageTranslationTypes> = ({
  word, order, requestExists, setRequestExists }) => {
  // Rendered by "../image_info" -> ImageInfo
  // Renders two "./translation" -> Translation components
  // One as the target and one as the source language.

  const { deckOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  return (
    <div id={`image-translation-box-${order}`}>
      {requestExists && <LoadingIcon elementClass="image-request"/> }
      {(deckOverlay.purpose === "teach"
        || (deckOverlay.purpose === "learn" && word[deckOverlay.language.sourceLanguage!]))
      &&
      <Translation
        word={word}
        order={order}
        type="targetLanguage"
        setRequestExists={setRequestExists}
        elementClass={word[deckOverlay.language.targetLanguage!] ? undefined : "not-found"} />
      }
      {deckOverlay.includeTranslation &&
        (deckOverlay.purpose === "learn"
          || (deckOverlay.purpose === "teach" && word[deckOverlay.language.targetLanguage!]))
        &&
        <Translation
        word={word}
        order={order}
        type="sourceLanguage"
        setRequestExists={setRequestExists}
        elementClass={word[deckOverlay.language.sourceLanguage!] ? undefined : "not-found"} />}
    </div>
  );
};

interface ImageTranslationTypes {
  word: ImageRowTypes;
  order: number;
  requestExists: boolean;
  setRequestExists: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ImageTranslation;