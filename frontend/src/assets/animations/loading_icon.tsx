const LoadingIcon: React.FC<{elementClass: string}> = ({elementClass}) => {
  return (
    <div className={elementClass}>
      <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
    </div>
    );
};

export default LoadingIcon;