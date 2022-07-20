import { useContext } from "react";
import OverlayNavbar from "../../common/components/overlay_navbar";
import { ProfileContext } from "../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../types/profilePageTypes";
import { ImageUploader } from "./image_uploader";

export const AddImageOverlay = () => {
  const { setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  return (
    <div className="input-overlay">
      <form id="add-image-overlay" className="create-item-info">
        <OverlayNavbar
          setOverlay={setEditImageOverlay}
          specialClass="add-image-navbar"
          description="Upload a new Image"
        />
      <ImageUploader />
      </form>
    </div>
    );
};

export default AddImageOverlay;



