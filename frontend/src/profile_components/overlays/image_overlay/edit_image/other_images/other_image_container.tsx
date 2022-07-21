import { useState, useContext } from "react";
import { ProfileContext } from "../../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../../types/profilePageTypes";
import { ImageRowTypes } from "../edit_image_overlay";
import OtherImage from "./other_image";

const OtherImageContainer: React.FC<OtherImageContainerPropTypes> = (props) => {
  // Rendered by "../image_info" -> ImageInfo
  // Renders a list of "OtherImage" components generated by "generateImages"

  const [imagesToDisplay, setImagesToDisplay] = useState(3);
  const { setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const generateImages = () => {
    // Populate other images section.
    let images = [];
    for (let i = 0; i < imagesToDisplay && i < props.images.length; i++) {
      images.push({
        element: <OtherImage imgObj={props.images[i]} order={props.order} />,
        key: `${props.images[i].image_path}-${i}`,
      });
    }
    return images;
  };

  const handleLoad = (event: React.MouseEvent<HTMLDivElement>) => {
    // Load other pictures when "load more" button is clicked.
    const element = event.target as HTMLDivElement;
    const scrollContainer = element.closest("#other-image-container");
    setImagesToDisplay((i) => i + 3);
    setTimeout(() => {
      const scrollTarget = scrollContainer?.lastChild as HTMLDivElement;
      scrollTarget.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "end",
      });
    }, 100);
  };

  const handleAddImage = () => {
    setEditImageOverlay({ type: "view-image", value: "show" });
  };

  return (
    <div id="other-images-wrapper">
      <div className="description">
        Other images
        <i className="fas fa-plus-circle image-circle" onClick={handleAddImage}></i>
      </div>
      <div id="other-image-container">
        {generateImages().map((i) => (
          <div className="other-image" key={i.key}>
            {i.element}
          </div>
        ))}
        {props.images.length === 0 && props.selected.image_path && (
          <div className="no-extra-image">no other image</div>
        )}
        {props.images.length > imagesToDisplay && (
          <div className="load-more-images" onClick={handleLoad}>
            load more
          </div>
        )}
      </div>
    </div>
  );
};

interface OtherImageContainerPropTypes {
  images: ImageRowTypes[];
  selected: ImageRowTypes;
  order: number;
}

export default OtherImageContainer;