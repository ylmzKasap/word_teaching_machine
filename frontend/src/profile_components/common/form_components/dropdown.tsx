const DropDown: React.FC<SelectDropdownTypes> = ({
  description,
  handler,
  topic,
  choices,
  chosen,
  placeholder,
}) => {
  return (
    <div className="input-label">
      <label id="dropdown-label" htmlFor="dropdown">
        {description}
      </label>
      <select
        id="dropdown"
        name={topic}
        className="overlay-dropdown"
        value={chosen ? chosen : "choose"}
        onChange={handler}
        required
      >
        <option disabled value="choose">
          {placeholder}
        </option>
        {choices.map((v, i) => (
          <option key={`${v}_${i}`} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
};

interface SelectDropdownTypes {
  description: string;
  handler: (event: React.SyntheticEvent) => void;
  topic: string;
  choices: string[];
  chosen: string | undefined;
  placeholder: string;
}

export default DropDown;