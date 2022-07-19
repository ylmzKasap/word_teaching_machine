import { ChangeEvent } from "react";

export const InputFile: React.FC<InputFileTypes> = (props) => {
  return (
    <label className="custom-image-upload">
      From my device
      <input
        id="image-upload"
        accept="image/png, image/jpg, image/jpeg"
        type="file"
      onChange={props.handleChange}/>
    </label>
    );
};

interface InputFileTypes {
  handleChange: (event: ChangeEvent) => void;
};

export default InputFile;
