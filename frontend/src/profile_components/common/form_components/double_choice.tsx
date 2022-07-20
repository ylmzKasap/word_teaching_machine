const DoubleChoice: React.FC<DoubleChoiceTypes> = (props) => {
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
          onClick={() => handler(choice_one)}
        >
          {choice_one}
        </span>
        <span
          id="choice-two"
          className={`double-choice ${choice_two_selected}`}
          onClick={() => handler(choice_two)}
        >
          {choice_two}
        </span>
      </div>
    </label>
  );
};

export interface DoubleChoiceTypes {
  description: string;
  choice_one: string;
  choice_two: string;
  chosen: string;
  handler: (selectedPurpose: string) => void;
}

export default DoubleChoice;