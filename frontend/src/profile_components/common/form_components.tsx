import { snakify } from "./functions";
import * as types from "../types/overlayTypes";

export const allLanguages = [
  'English', 'Turkish', 'German', 'Spanish', 'French', 'Greek'
];

export const InputField: React.FC<types.InputFieldTypes> = (props) => {
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

export const Checkbox: React.FC<types.CheckboxTypes> = (props) => {
  const { description, value, handler } = props;

  return (
    <label className="input-label checkbox">
      <div className="checkbox-info">
        {description}
        <input
          type="checkbox"
          onChange={handler}
          checked={value}
        />
      </div>
    </label>
  );
};

export const Radio: React.FC<types.RadioTypes> = (props) => {
  const { description, handler, selected, checked } = props;

  return (
    <div className="input-label">
      <div className="input-info">{description}</div>
      <div className="radio-container">
        {props.buttons.map((itemName) => (
          <label key={itemName} className="radio-label">
            {itemName}
            <input
              type="radio"
              value={snakify(itemName)}
              name="folder-type"
              onChange={handler}
              checked={
                snakify(itemName) === selected
                  ? true
                  : !selected && snakify(itemName) === checked
                  ? true
                  : false
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export const DropDown: React.FC<types.SelectDropdownTypes> = (
  {description, handler, topic, choices, chosen, placeholder}) => {

  return (
    <div className="input-label">
        <label id="dropdown-label" htmlFor="dropdown">{description}</label>
        <select
          id="dropdown"
          name={topic}
          className="overlay-dropdown"
          value={chosen ? chosen : "choose"}
          onChange={handler}
          required
        >
          <option disabled value="choose">{placeholder}</option>
            {choices.map((v, i) => <option key={`${v}_${i}`} value={v}>{v}</option>)}
        </select>
    </div>
  );
};

export const DoubleChoice: React.FC<types.DoubleChoiceTypes> = (props) => {
  const { description, choice_one, choice_two, chosen, handler } = props;

  let choice_one_selected = "";
  let choice_two_selected = "";
  if (chosen) {
    choice_one_selected = chosen === choice_one ? "selected" : "not-selected";
    choice_two_selected = chosen === choice_two ? "selected" : "not-selected";
  }

  return (
    <label className="input-label">
      <div className="input-info">{description}</div>
      <div className="double-choice-container">
        <span
          id="choice-one"
          className={`double-choice ${choice_one_selected}`}
          onClick={() => handler(choice_one)}>{choice_one}</span>
        <span 
          id="choice-two"
          className={`double-choice ${choice_two_selected}`}
          onClick={() => handler(choice_two)}>{choice_two}</span>
      </div>
    </label>
  );
};

export const SubmitForm: React.FC<types.submitButtonTypes> = (props) => {
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