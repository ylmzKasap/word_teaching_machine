import { useContext } from "react";
import OverlayNavbar from "../../common/components/overlay_navbar";
import { ProfileContext } from "../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../types/profilePageTypes";
import { ImageUploader } from "./image_uploader";
import validate_image_upload from "../functions/validate_image";

export const AddImageOverlay = () => {
  const { setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const element = event.dataTransfer;
    if (element.files && element.files[0]) {
      const file = element.files[0];
      validate_image_upload(file, setEditImageOverlay);
    }
  };

  return (
    <div 
      className="input-overlay"
      onDrop={handleDrop}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}>
      <form id="add-image-overlay" className="create-item-info">
        <OverlayNavbar
          setOverlay={setEditImageOverlay}
          specialClass="add-image-navbar"
          description="Upload a new image"
        />
      <ImageUploader />
      </form>
    </div>
    );
};

export interface AddImageTypes {
  display: boolean;
  imageUrl: string;
  imageName: string;
  imagePath: string;
  imageError: string;
  imageLoading: boolean;
}

export const addImageDefaults = {
  display: true, // change
  imageUrl: "",
  imageName: "",
  imagePath: "",
  imageError: "",
  imageLoading: false
};

export default AddImageOverlay;



