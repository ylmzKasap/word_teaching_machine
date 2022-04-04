import { useContext } from "react";
import { ProfileContext } from "./ProfilePage";

export const SideBar = (props) => {
  // Component of ProfilePage.

  return (
    <div className="sidebar-container">
      <div className="user-info">
        <div className="image-container">
          <img
            className="user-image"
            src={props.userPicture}
            alt={`${props.user}`}
          />
        </div>
        <div className="username">{props.user}</div>
      </div>
    </div>
  );
};

export const ErrorInfo = () => {
  const { requestError, setRequestError } = useContext(ProfileContext);

  const handleExit = () => {
    setRequestError({ exists: false, description: "" });
  };

  return (
    <label className="profile-error-box">
      <div className="profile-error-text">
        <h5>{requestError.description}</h5>
      </div>
      <div className="error-exit-button" onClick={handleExit}>
        X
      </div>
    </label>
  );
};

export const DragClone = (props) => {
  // Component of ProfilePage.

  return (
    <div
      className="drag-item-clone"
      style={props.cloneStyle}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="drag-description">{props.item}</div>
    </div>
  );
};
