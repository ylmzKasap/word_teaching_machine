import { snakify } from "../utils";

const Radio: React.FC<RadioTypes> = (props) => {
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

export interface RadioTypes {
  description: string;
  buttons: string[];
  checked: string;
  selected: string;
  handler: (event: React.ChangeEvent) => void;
}

export default Radio;