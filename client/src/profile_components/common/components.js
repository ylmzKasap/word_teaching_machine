import { useContext } from "react";
import axios from "axios";
import { ProfileContext } from "../ProfilePage";
import { userName } from "../..";

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


export const Filler = (props) => {
    const { isDragging, cloneTimeout, draggedElement,
            directory, resetDrag, setReRender } = useContext(ProfileContext);

    // Style the filler on hovering.
    const handleFillerHover = (event) => {
        if (props.type === 'regular') {
            var nextElement = event.target.nextElementSibling;
        } else {
            var nextElement = event.target.previousSibling
        } 

        if (isDragging && !cloneTimeout.exists) {
            if (nextElement.id !== draggedElement.id) {
                if (event.type === 'mouseover') {
                    props.setFillerClass('filler-hovered');
                } else {
                    props.setFillerClass('');
                }
            } 
        }
    }

    const handleFillerUp = (event) => {
        if (!isDragging) {return};

        if (props.type === 'regular') {
            let nextElement = event.target.nextElementSibling;
            if (nextElement.id === draggedElement.id) {
                resetDrag(true);
                return
            }
            var insertOrder = event.target.closest('.item-with-filler').style.order;
        } else if (props.type === 'last') {
            var insertOrder = props.order
        }

        props.setFillerClass('');
        resetDrag();

        axios.put(`/updateorder/${userName}`, {
            'item_id': draggedElement.id,
            'parent_id': directory,
            'new_order': insertOrder,
            'direction': props.type === 'last' ? 'after' : 'before'
        })
        .then(() => setReRender())
        .catch(err => console.log(err.response.data));
    }

    return (
        <div 
            className={`filler ${props.fillerClass} ${props.type === 'last' ? 'last-filler' : ""}`}
            style={{"order": props.order}}
            onMouseOver={handleFillerHover}
            onMouseLeave={handleFillerHover}
            onMouseUp={handleFillerUp} />
    )
}