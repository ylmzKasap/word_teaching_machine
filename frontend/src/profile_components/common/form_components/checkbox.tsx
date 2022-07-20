const Checkbox: React.FC<CheckboxTypes> = (props) => {
  const { description, value, handler } = props;

  return (
    <label className="input-label checkbox">
      <div className="checkbox-info">
        {description}
        <input type="checkbox" onChange={handler} checked={value} />
      </div>
    </label>
  );
};

interface CheckboxTypes {
  description: string;
  value: boolean;
  handler: () => void;
}

export default Checkbox;