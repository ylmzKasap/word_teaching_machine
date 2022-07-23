import { ChangeEvent, useContext } from "react";
import { ProfileContext } from "../../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../../types/profilePageTypes";
import validate_image_upload from "../functions/validate_image";
import InputFile from "./input_file";
import UploadedImage from "./uploaded_image";

export const ImageUploader = () => {
  const {
    editImageOverlay,
    setEditImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleChange = (event: ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files[0]) {
      const file = element.files[0];
      validate_image_upload(file, setEditImageOverlay);
    }
  };

  return (
    <div id="image-to-add">
      <InputFile handleChange={handleChange} />
      <UploadedImage />
      {editImageOverlay.imageOverlay.imageError && 
        <div id="image-upload-error">{editImageOverlay.imageOverlay.imageError}</div>}
    </div>
  );
};

export default ImageUploader;