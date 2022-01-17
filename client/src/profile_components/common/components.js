import { useContext } from "react";
import axios from "axios";
import { ProfileContext } from "../ProfilePage";
import { delete_item } from "./functions";
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


export const ItemContextMenu = (props) => {
    const { directory, setReRender, contextOpenedElem, clipboard } = useContext(ProfileContext);

    const handleClick = (event) => {
        const action = event.target.title;
        if (['cut', 'copy'].includes(action)) {
            props.setClipboard({'action': action, 'id': contextOpenedElem.id, 'directory': directory});
        } 
        
        else if (action === 'delete') {
            delete_item(contextOpenedElem, directory, userName, setReRender);
        } 
        
        else if (action === 'paste') {
            axios.put(`/paste/${userName}`, {
                'item_id': clipboard.id,
                'old_parent': clipboard.directory,
                'new_parent': directory,
                'action': clipboard.action
            })
            .then(() => {
                if (clipboard.action === 'cut') {
                    props.setClipboard({});
                }
                setReRender();
            }).catch(err => 
                console.log(err.response.data));
        }
        props.resetContext();
    }

    return (
        <div id="item-context-menu" className="context-menu" style={props.style}
            onContextMenu={e => e.preventDefault()}
            onClick={handleClick}>
            {props.items.map(i => <menu title={i} key={i}></menu>)}
        </div>
    )
}


export const Filler = (props) => {
    const { isDragging, cloneTimeout, draggedElement,
            directory, resetDrag, setReRender } = useContext(ProfileContext);

    // Style the filler on hovering.
    const handleFillerHover = (event) => {
        let nextElement = (props.type === 'regular') 
            ? event.target.nextElementSibling 
            : event.target.previousSibling;

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
        if (!isDragging) { return };

        if (props.type === 'regular') {
            let nextElement = event.target.nextElementSibling;
            if (nextElement.id === draggedElement.id) {
                const scrollAmount = document.querySelector('.card-container').scrollTop;
                resetDrag(true, scrollAmount);
                return
            }
        }

        let insertOrder = (props.type === 'regular')
            ? event.target.closest('.item-with-filler').style.order
            : props.order;

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
            className={
                `filler${props.fillerClass ? ' ' + props.fillerClass : ''}${props.type === 'last' ? ' last-filler' : ''}`}
            style={{"order": props.order}}
            onMouseOver={handleFillerHover}
            onMouseLeave={handleFillerHover}
            onMouseUp={handleFillerUp} />
    )
}