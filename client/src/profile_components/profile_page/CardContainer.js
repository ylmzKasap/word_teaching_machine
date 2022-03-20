import { useContext } from "react";
import axios from "axios";
import { extract_int, delete_item } from "../common/functions";
import { ProfileContext } from "./ProfilePage";

export const CardContainer = () => {
  const { handleContextMenu, handleScroll, items, isDragging, directoryInfo } =
    useContext(ProfileContext);
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

const BottomDragBar = () => {
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
  } = useContext(ProfileContext);

  const destroyItem = () => {
    // Delete dragged the item.
    resetDrag();
    if (!cloneTimeout.exists) {
      delete_item(
        draggedElement,
        directory,
        username,
        setReRender,
        setRequestError
      );
    } else {
      resetDrag();
    }
  };

  const sendBack = () => {
    // Move dragged item to parent folder.
    axios
      .put(`/updatedir/${username}`, {
        item_id: extract_int(draggedElement.id),
        item_name: draggedElement.name,
        parent_id: directory,
        direction: "parent",
      })
      .then(() => setReRender())
      .catch((err) =>
        setRequestError({ exists: true, description: err.response.data })
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
      {isDragging && (
        <div className="drag-button trash" onMouseUp={destroyItem}>
          <i className="fas fa-trash-alt"></i>
        </div>
      )}
    </div>
  );
};
