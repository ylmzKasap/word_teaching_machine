import { useState, useContext } from "react";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ImageRowTypes, ProfileContextTypes } from "../../../../types/profilePageTypes";
import { LoadingIcon } from "../../../../common/animations";
import Translation from "./translation";

const ImageTranslation: React.FC<ImageTranslationTypes> = ({ word, order }) => {
  // Rendered by "./image_info" -> ImageInfo
  // Renders two "Translation" componenets
  // One as the target and one as the source language.

  const { deckOverlay } = useContext(ProfileContext) as ProfileContextTypes;
  const [requestExists, setRequestExists] = useState(false);

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
}

export default ImageTranslation;