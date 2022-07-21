import React from "react";
import { is_mobile } from "../../../../question_components/common/functions";

export const UploadedImage: React.FC<UploadedImagePropTypes> = (props) => {
  const mobileDevice = is_mobile();
  const { imageUrl, imageName } = props;

  const handleClick = () => {
    const inputElement = document.querySelector("#image-upload") as HTMLInputElement;
    inputElement.click();
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const element = event.dataTransfer;
    if (element.files && element.files[0]) {
      URL.revokeObjectURL(imageUrl);
      props.setImageUrl(URL.createObjectURL(element.files[0]));
      props.setImageName(element.files[0].name.split(".")[0]); 
    }
  };

  return (
    <div
      id="uploaded-image-container"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}>
      {!imageUrl && <div className="action-to-add-image">
        <i className="arrow-down" />
        <p className="description">
          {mobileDevice ? "Tap" : "Click"}
          {(!mobileDevice ? " or drag" : "") + " to upload"}
        </p>
      </div>}
      {imageUrl && <img 
        id="uploaded-image"
        src={imageUrl}
        alt={imageName} />}
      <span id="file-selected"></span>
    </div>
    );
};

interface UploadedImagePropTypes {
  imageUrl: string;
  setImageUrl: React.Dispatch<React.SetStateAction<string>>;
  imageName: string;
  setImageName: React.Dispatch<React.SetStateAction<string>>;
}

export default UploadedImage;