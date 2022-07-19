import { ChangeEvent, useState } from "react";
import InputFile from "./input_file";
import UploadedImage from "./uploaded_image";

export const ImageUploader = () => {
  const [imageUrl, setImageUrl] = useState("");

  const handleChange = (event: ChangeEvent) => {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files[0]) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(URL.createObjectURL(element.files[0]));
    }
  };

  return (
    <div id="image-to-add">
      <InputFile handleChange={handleChange} />
      <UploadedImage imageUrl={imageUrl} />
    </div>
  );
};

export default ImageUploader;