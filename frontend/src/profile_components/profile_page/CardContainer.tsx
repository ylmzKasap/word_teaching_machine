import { useContext } from "react";
import axios from "axios";
import delete_item from "../common/functions/delete_item";
import { extract_int } from "../common/utils";
import { ProfileContext } from "./ProfilePage";
import { ProfileContextTypes } from "../types/profilePageTypes";
import Trash from "../../assets/font_awesome/Trash";

export const CardContainer: React.FC = () => {
  const { handleContextMenu, handleScroll, items, isDragging, directoryInfo } =
    useContext(ProfileContext) as ProfileContextTypes;

  const containerClass =
    directoryInfo.item_type === "thematic_folder"
      ? "category-container"
      : "card-container";

  return (
    <div
      className={containerClass}
      onContextMenu={handleContextMenu}
      onScroll={handleScroll}
    >
      {items}
      {items.length === 0 && (
        <h2 className="nothing-to-see">Folder is empty.</h2>
      )}
      {isDragging && <BottomDragBar />}
    </div>
  );
};

const BottomDragBar: React.FC = () => {
  // Component of ProfilePage.
  const {
    username,
    isDragging,
    directory,
    draggedElement,
    rootDirectory,
    setReRender,
    resetDrag,
    cloneTimeout,
    setRequestError,
  } = useContext(ProfileContext) as ProfileContextTypes;

  const destroyItem = () => {
    // Delete dragged the item.
    resetDrag();
    if (!cloneTimeout.exists) {
      delete_item(draggedElement, username, setReRender, setRequestError);
    } else {
      resetDrag();
    }
  };

  const sendBack = () => {
    // Move dragged item to parent folder.
    if (!draggedElement.id) {
      return;
    }

    axios
      .put(`/updatedir/${username}`, {
        item_id: extract_int(draggedElement.id),
        target_id: null,
      })
      .then(() => setReRender())
      .catch((err) =>
        setRequestError({
          exists: true,
          description: err.response.data.errDesc,
        })
      );
    resetDrag();
  };

  return (
    <div className="bottom-drag-bar">
      {isDragging &&
        ![rootDirectory, "home", ""].includes(directory) &&
        draggedElement.type !== "category" && (
          <div className="drag-button send-back" onMouseUp={sendBack}>
            <i className="fas fa-long-arrow-alt-left"></i>
          </div>
        )}
      {isDragging &&
        <Trash 
          elementClass="drag-button"
          mouseHandler={destroyItem} />
      }
    </div>
  );
};
