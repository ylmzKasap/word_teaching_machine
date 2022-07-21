import { useContext } from "react";
import LoadingIcon from "../../../../../assets/animations/loading_icon";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../../types/profilePageTypes";
import { ImageRowTypes } from "../edit_image_overlay";
import ImageNotFound from "./image-not-found";

const MainImage: React.FC<MainImagePropTypes> = (props) => {
  // Rendered by "../image_info" -> ImageInfo

  const { setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleAddImage = () => {
    setEditImageOverlay({ type: "view-image", value: "show" });
  };

  return (
    <div
      id={`image-box-${props.order}`}
      className={props.word.image_path ? "" : "not-found"}
    >
    {props.requestExists && <LoadingIcon elementClass="image-request"/> }
    {props.word.image_path ? (<img 
      src={props.word.image_path as string}
      alt={props.word.image_path as string} />
    ) : <ImageNotFound handleAddImage={handleAddImage} />}
    </div>
  );
};

interface MainImagePropTypes {
  word: ImageRowTypes;
  order: number;
  requestExists: boolean;
}

export default MainImage;