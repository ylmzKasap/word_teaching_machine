
import { useContext } from "react";
import { ProfileContext } from "../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../types/profilePageTypes";
import OverlayNavbar from "../../common/components/overlay_navbar";
import EditAddImageContent from "./edit_add_image_content";

const EditImageOverlay: React.FC = () => {
  // Rendered by "../../../profile_page" -> "ProfilePage"
  // Renders "../../../common/components/OverlayNavbar" and "EditImageContent"

  const { editImageOverlay, setEditImageOverlay } = useContext(
    ProfileContext
  ) as ProfileContextTypes;

  const handleClick = (event: React.MouseEvent) => {
    // End editing process when some other element is clicked.
    const clickedElement = event.target as HTMLElement;
    const elemId = clickedElement.id;
    if (
      /^image-(target|source)-language/.test(elemId) ||
      elemId.startsWith("language-info") ||
      elemId.startsWith("image-info-input")
    ) {
      return;
    }
    setEditImageOverlay({ type: "changeEdited", value: "" });
  };

  return (
    <div id="edit-image-overlay" onClick={handleClick}>
      <OverlayNavbar
        setOverlay={setEditImageOverlay}
        specialClass={"edit-image-navbar"}
        description="Image control panel"
      />
      <EditAddImageContent imageInfo={editImageOverlay.imageInfo} />
    </div>
  );
};

export default EditImageOverlay;