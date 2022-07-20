import { FormErrorTypes } from "../../types/overlayTypes";

const SubmitForm: React.FC<SubmitButtonTypes> = (props) => {
  const { description, formError } = props;

  return (
    <div className="submit-form">
      <button className="submit-form-button" type="submit">
        {description}
      </button>
      <label
        className={`error-field ${formError.errorClass}`}
        style={formError.display}
      >
        <span className="fas fa-exclamation-circle"></span>
        <span className="error-description">{formError.description}</span>
      </label>
    </div>
  );
};

export interface SubmitButtonTypes {
  description: string;
  formError: FormErrorTypes;
}

export default SubmitForm;
