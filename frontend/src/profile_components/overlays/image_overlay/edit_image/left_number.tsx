import { useContext } from "react";
import { ProfileContext } from "../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../types/profilePageTypes";
import Trash from "../../../../assets/font_awesome/Trash";

const LeftNumber: React.FC<{ order: number }> = (props) => {
  // Rendered by "./image_info" -> ImageInfo
  const { setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleTrash = () => {
    setEditImageOverlay({type: "deleteRow", value: props.order});
  };

  return (
    <div id="left-number-box">
      <div id="left-number">{props.order + 1}</div>
      <Trash elementClass="left-number" clickHandler={handleTrash} />
    </div>
  );
};

export default LeftNumber;
