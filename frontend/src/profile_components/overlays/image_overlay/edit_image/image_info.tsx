import { useContext } from "react";
import { ImageRowTypes, ProfileContextTypes } from "../../../types/profilePageTypes";
import LeftNumber from "./left_number";
import ImageTranslation from "./translation/image_translation";
import MainImage from "./main_image/main_image";
import OtherImageContainer from "./other_images/other_image_container";
import { ProfileContext } from "../../../profile_page/ProfilePage";

const ImageInfo: React.FC<ImageInfoTypes> = (props) => {
  // Rendered by "./edit_image_content" -> EditImageContent
  // Renders following componenets:
  // "./left_number" -> LeftNumber
  // "./translation/image_translation" -> ImageTranslation
  // "./main_image/main_image" -> MainImage
  // "./other_images/other_image_container" -> OtherImageContainer

  const { deckOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const getSelectedImage = (imageArray: ImageRowTypes[]) => {
    // Takes an array of image objects
    // Returns the selected image and not selected images.

    let selectedImage;
    let otherImages = [];
    for (const imageObj of imageArray) {
      if (imageObj["selected"] === true) {
        selectedImage = imageObj;
        continue;
      }
      otherImages.push(imageObj);
    }
    return [selectedImage, otherImages] as const;
  };

  const [selectedImage, otherImages] = getSelectedImage(props.imageArray);

  if (!selectedImage) {
    throw Error("No image selected");
  }

  return (
    <div id={`edit-image-box-${props.order}`}>
      <LeftNumber order={props.order} />
      <ImageTranslation word={selectedImage} order={props.order} />
      {/* Render image upload section when a translation is entered */}
      {((deckOverlay.purpose === "teach" && selectedImage[deckOverlay.language.targetLanguage!])
      || (deckOverlay.purpose === "learn" && selectedImage[deckOverlay.language.sourceLanguage!]))
      && <MainImage word={selectedImage} order={props.order} />}
      <div id="other-images">
        {(otherImages.length > 0 || selectedImage.image_path) && (
          <OtherImageContainer
            images={otherImages}
            selected={selectedImage}
            order={props.order}
          />
        )}
      </div>
    </div>
  );
};

interface ImageInfoTypes {
  imageArray: ImageRowTypes[];
  order: number;
  key: string;
}

export default ImageInfo;