import { is_mobile } from "../../../../question_components/common/functions";

export const UploadedImage: React.FC<UploadedImagePropTypes> = (props) => {
  const mobileDevice = is_mobile();
  const { imageUrl } = props;

  const handleClick = () => {
    const inputElement = document.querySelector("#image-upload") as HTMLInputElement;
    inputElement.click();
  };

  return (
    <div id="uploaded-image-container" onClick={handleClick}>
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
        alt={imageUrl} />}
      <span id="file-selected"></span>
    </div>
    );
};

interface UploadedImagePropTypes {
  imageUrl: string;
}

export default UploadedImage;