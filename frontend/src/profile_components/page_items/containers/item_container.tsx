import { useContext } from "react";
import { ItemContext, PageItemContextTypes } from "../page_item";

const ItemContainer = () => {
  const {
    parentProps,
    itemStyle,
    folderStyle,
    handleDoubleClick,
    handleMouseDown,
    handleMouseUp,
    handleHover,
  } = useContext(ItemContext) as PageItemContextTypes;

  const createThumbnail = () => {
    let thumbnail = [];
    for (let i = 0; i < parentProps.words.length; i++) {
      const wordObj = parentProps.words[i];
      if (!parentProps.target_language) {
        return;
      }

      const word = wordObj[parentProps.target_language];
      if (thumbnail.length >= 4) {
        break;
      } else {
        thumbnail.push(
          <img
            className={`deck-thumbnail${
              parentProps.words.length < 4 ? " n-1" : ""
            }`}
            src={`${wordObj.image_path}`}
            key={`${word}-${i}`}
            alt={`${word}-${i}`}
            draggable="false"
          />
        );
      }
      if (parentProps.words.length < 4) {
        break;
      }
    }
    return thumbnail;
  };

  return (
    <div
      id={parentProps.id}
      className={parentProps.type}
      type="item"
      style={itemStyle}
      tabIndex={parentProps.order}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseOver={handleHover}
      onMouseOut={handleHover}
    >
      {" "}
      {["folder", "thematic-folder"].includes(parentProps.type) && (
        <i className={`fas fa-folder fa-8x ${folderStyle}`}></i>
      )}
      {parentProps.type === "deck" && (
        <picture className="thumbnail-container">
          <span className="deck-image-overlay" />
          {createThumbnail()}
        </picture>
      )}
      <p className={`${parentProps.type}-description`}>{parentProps.name}</p>
    </div>
  );
};

export default ItemContainer;