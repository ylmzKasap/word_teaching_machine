import { NameErrorTypes } from "../../types/overlayTypes";

const InputField: React.FC<InputFieldTypes> = (props) => {
  // Component of Create_x_Overlay(s).
  const { description, error, value, handler, placeholder } = props;

  return (
    <label className="input-label">
      <div className="input-info">
        {description} <span className="input-error">{error.description}</span>
      </div>
      <input
        className={`text-input ${error.errorClass}`}
        value={value}
        onChange={handler}
        placeholder={placeholder}
        required
      ></input>
    </label>
  );
};

export interface InputFieldTypes {
  description: string;
  error: NameErrorTypes;
  value: string;
  handler: (event: React.ChangeEvent) => void;
  placeholder: string;
}

export default InputField;