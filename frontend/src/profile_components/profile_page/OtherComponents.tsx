import { useContext } from "react";
import { ProfileContext } from "./ProfilePage";
import { ProfileContextTypes, CloneStyleTypes } from "../types/profilePageTypes";

export const SideBar: React.FC<SideBarTypes> = ({user, userPicture}) => {
  // Component of ProfilePage.

  return (
    <div className="sidebar-container">
      <div className="user-info">
        <div className="image-container">
          <img
            className="user-image"
            src={userPicture}
            alt={user}
          />
        </div>
        <div className="username">{user}</div>
      </div>
    </div>
  );
};

export const ErrorInfo: React.FC = () => {
  const { requestError, setRequestError } = useContext(ProfileContext) as ProfileContextTypes;

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

export const DragClone: React.FC<DragCloneTypes> = (props) => {
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

interface SideBarTypes {
  user: string | undefined;
  userPicture: string;
}

interface DragCloneTypes {
  item: string;
  cloneStyle: CloneStyleTypes;
}