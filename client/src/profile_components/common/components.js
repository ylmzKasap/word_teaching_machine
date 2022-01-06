export const OverlayNavbar = (props) => {
    // Component of CreateDeck, CreateFolder.

    const handleExit = (event) => {
        event.preventDefault();
        props.setDisplay(false);
    }
    
    return (
        <div className="overlay-nav">{props.description}
            <button className="exit-button" onClick={handleExit}>
            X
            </button>
        </div>
    )
}

export const InputField = (props) => {
    const { description, error, value, handler, placeholder } = props;

    return (
        <label className="input-label">
            <div className="input-info">
            {description} <span className="input-error">{error.description}</span>
            </div>
            <input className={`text-input ${error.errorClass}`} value={value}
            onChange={handler} placeholder={placeholder} required></input>
        </label>
    )
}

export const SubmitForm = (props) => {
    const { description, formError } = props;

    return (
        <div className="submit-form">
            <button className="submit-form-button" type="submit">{description}</button>
            <label className={`error-field ${formError.errorClass}`} style={formError.display}>
                <span className="fas fa-exclamation-circle"></span>
                <span className="error-description">{formError.description}</span>
            </label>
        </div>
    )
}