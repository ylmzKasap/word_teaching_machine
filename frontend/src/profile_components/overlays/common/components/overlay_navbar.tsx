import { SetDeckOverlayType, SetOverlayType } from "../../../types/profilePageTypes";

const OverlayNavbar: React.FC<OverlayNavbarTypes> = ({
  setOverlay,
  specialClass,
  description,
  extra,
}) => {
  // Component of CreateDeckOverlay, CreateFolderOverlay, CreateCategoryOverlay,
  // AddImageOverlay and EditImageOverlay

  const handleExit = (event: React.MouseEvent) => {
    event.preventDefault();
    if (specialClass === "add-image-navbar") {
      setOverlay({ type: "view-image", value: "hide" });
    } else {
      setOverlay({ type: "view", value: "hide" });
    }
  };

  const classInfo = specialClass ? specialClass : "";
  return (
    <div className={`overlay-nav ${classInfo}`}>
      <div className="overlay-description">
        {description}{" "}
        {extra ? <span className="extra-info">({extra})</span> : ""}
      </div>
      <button className="exit-button" onClick={handleExit}>
        <p className="exit-sign">X</p>
      </button>
    </div>
  );
};

interface OverlayNavbarTypes {
  setOverlay: SetDeckOverlayType | SetOverlayType;
  description: string;
  specialClass?: string;
  extra?: string;
}

export default OverlayNavbar;