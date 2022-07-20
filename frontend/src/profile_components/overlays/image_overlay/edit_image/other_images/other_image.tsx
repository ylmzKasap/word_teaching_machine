import { useContext } from "react";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ImageRowTypes, ProfileContextTypes } from "../../../../types/profilePageTypes";

const OtherImage: React.FC<OtherImageTypes> = ({ imgObj, order }) => {
  // Rendered by "./other-image-container"  -> OtherImageContainer

  const { setEditImageOverlay, deckOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleClick = () => {
    // Set the image object as the main one.
    setEditImageOverlay({
      type: "changePicture",
      value: imgObj.image_path as string,
      index: order,
    });
  };

  return (
    <img
      onClick={handleClick}
      src={imgObj.image_path as string}
      alt={imgObj[deckOverlay.language.targetLanguage!] as string}
    />
  );
};

interface OtherImageTypes {
  imgObj: ImageRowTypes;
  order: number;
}

export default OtherImage;