const Trash: React.FC<TrashTypes> = (
  {elementClass, size, clickHandler, mouseHandler}) => {
  return (
    <div 
      id="trash-container"
      className={`${elementClass} trash`}
      onClick={clickHandler}
      onMouseUp={mouseHandler}
       >
      <div
        id="trash-icon"
        className={`fas fa-trash-alt${size ? ` fa-${size}x` : ""}`} />
    </div>
  );
};

interface TrashTypes {
  elementClass: string;
  size?: string;
  clickHandler?: () => void;
  mouseHandler?: () => void;
}

export default Trash;