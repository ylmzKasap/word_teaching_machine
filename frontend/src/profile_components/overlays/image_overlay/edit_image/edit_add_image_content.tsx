import { useContext, useRef } from "react";
import { get_row_default } from "../../../types/overlayDefaults";
import { ProfileContext } from "../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../types/profilePageTypes";
import ImageInfo from "./image_info";
import AddImageOverlay from "../add_image/add_image";
import { ImageRowTypes } from "./edit_image_overlay";

const EditAddImageContent: React.FC<EditAddImageContentTypes> = (props) => {
  // Rendered by "./edit_image_overlay" -> EditImageOverlay
  // Renders a list of "./image_info" -> ImageInfo components.
  
  const { editImageOverlay, setEditImageOverlay, deckOverlay } = useContext(
    ProfileContext) as ProfileContextTypes;
  const addMoreRef = useRef<null | HTMLDivElement>(null);

  const addImageRow = () => {
    const rowDefault = get_row_default(deckOverlay);
    setEditImageOverlay({type: "addRow", value: rowDefault});
    setTimeout(() => {
      addMoreRef.current!.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start"
      });
    }, 100);
  };

  return (
    <div id="edit-image-content">
      <div id="edit-image-wrapper">
        {props.imageInfo.map((arr, i) => (
          <ImageInfo imageArray={arr} order={i} key={`image-content-${i}`} />
        ))}
        <div id="edit-image-row" ref={addMoreRef} onClick={addImageRow}>
          Add more
        </div>
      </div>
      {editImageOverlay.imageOverlay.display && <AddImageOverlay />}
    </div>
  );
};

interface EditAddImageContentTypes {
  imageInfo: ImageRowTypes[][];
}

export default EditAddImageContent;