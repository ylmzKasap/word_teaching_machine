const ImageNotFound: React.FC<ImageNotFoundPropTypes> = (props) => {
  // Rendered by "./main_image" -> MainImage
  
  return (
    <div className="image-not-found" onClick={props.handleAddImage}>
      <div className="image-icon">
        <i className="fa-solid fa-images fa-5x" />
      </div>
      <div className="description">add an image</div>
    </div>
  );
};

interface ImageNotFoundPropTypes {
  handleAddImage: () => void;
}

export default ImageNotFound;