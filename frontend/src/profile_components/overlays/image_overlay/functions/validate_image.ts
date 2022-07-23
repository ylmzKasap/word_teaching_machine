import { ImageOverlayReducerTypes } from "../addImageReducer";

export default function validate_image_upload (
  file: File,
  setEditImageOverlay: React.Dispatch<ImageOverlayReducerTypes>) {
  if (!file) {
    setEditImageOverlay({type: "changeUploadedImage", value: {
      imageError: "Please upload a valid image file"}});
    return;
  }

  if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
    setEditImageOverlay({type: "changeUploadedImage", value: {
      imageError: "Only jpg, jpeg, png and webp files are supported"}});
    return;
  }

  setEditImageOverlay({type: "changeUploadedImage", value: {
    imageLoading: "true"}});
  
  var image = new Image();

  image.onload = (e: any) => {
    const eventPath = e.composedPath()[0] as HTMLImageElement;
    if (!eventPath.width || !eventPath.height) {
      setEditImageOverlay({type: "changeUploadedImage", value: {
        imageError: "Please upload a valid image file"}});
        return;
    }
    setEditImageOverlay({type: "changeUploadedImage", value: {
      imageLoading: "false"}});
  };
  image.onerror = () => {
    setEditImageOverlay({type: "changeUploadedImage", value: {
      imageError: "Please upload a valid image file"}});
  };
  image.src = URL.createObjectURL(file);
  setEditImageOverlay({type: "changeUploadedImage", value: {
    imageUrl: image.src,
    imagePath: file.name
  }});
};

export interface changeUploadedImageTypes {
  imageUrl?: string;
  imagePath?: string;
  imageError?: string;
  imageLoading?: string;
}