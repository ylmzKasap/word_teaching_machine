import { useContext } from "react";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ImageRowTypes, ProfileContextTypes } from "../../../../types/profilePageTypes";

const MainImage: React.FC<MainImagePropTypes> = (props) => {
  // Rendered by "./image_info" -> ImageInfo

  const { setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleAddImage = () => {
    setEditImageOverlay({ type: "view-image", value: "show" });
  };

  return (
    <div
      id={`image-box-${props.order}`}
      className={props.word.image_path ? "" : "not-found"}
    >
      {props.word.image_path ? (
        <img src={props.word.image_path as string} alt={props.word.image_path as string} />
      ) : (
        <div className="image-not-found" onClick={handleAddImage}>
          <div className="image-icon">
            <i className="fa-solid fa-images fa-5x" />
          </div>
          <div className="description">add an image</div>
        </div>
      )}
    </div>
  );
};

interface MainImagePropTypes {
  word: ImageRowTypes;
  order: number;
}

export default MainImage;