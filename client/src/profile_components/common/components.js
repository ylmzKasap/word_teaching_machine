import { useContext } from "react";
import axios from "axios";
import { ProfileContext } from "../ProfilePage";
import { delete_item, hasKeys, extract_int } from "./functions";

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


export const Radio = (props) => {
    const { description, handler, selected, checked } = props;

    return (
        <div className="input-label">
            <div className="input-info">
                {description}
            </div>
            <div className="radio-container">
                {props.buttons.map(itemName => 
                    <label key={itemName} className="radio-label">{itemName}
                        <input 
                            type="radio" value={itemName}
                            name="folder-type" onChange={handler}
                            checked={
                                (itemName === selected) ? true
                                : (!selected && itemName === checked) ? true
                                : false} />
                    </label>
                    )}
            </div>
        </div>
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


export const ItemContextMenu = () => {
    const { username, directory, setReRender, contextOpenedElem, clipboard, directoryInfo,
    contextOptions, contextMenuStyle, setClipboard, resetContext, setRequestError } = useContext(ProfileContext);

    const restrictions = {
        'paste': {
            [!hasKeys(clipboard)]: 'Clipboard is empty',
            [contextOpenedElem.id === clipboard.id
                || contextOpenedElem.type === clipboard.type]: 'Cannot paste category here',
            [clipboard.type === 'category' && directoryInfo.item_type !== 'thematic_folder']: 'Folder is not thematic',
            [directoryInfo.item_type === 'thematic_folder'
                && clipboard.type !== 'category' && contextOpenedElem.type !== 'category']: 'Can only paste in a category',
            [contextOpenedElem.type === 'category' && clipboard.type !== 'file']: 'Categories can only contain decks'
        }
    };

    const handleClick = (event) => {
        if (event.target.className === 'disabled-context') {
            setRequestError({'exists': true, 'description': restrictions[event.target.title]['true']});
            return;
        }
        const action = event.target.title;
        if (['cut', 'copy'].includes(action)) {
            setClipboard(
                {'action': action,
                'id': contextOpenedElem.id,
                'type': contextOpenedElem.type,
                'directory': directory});
        } 
        
        else if (action === 'delete') {
            delete_item(contextOpenedElem, directory, username, setReRender, setRequestError);
        } 
        
        else if (action === 'paste') {
            axios.put(`/paste/${username}`, {
                'item_id': extract_int(clipboard.id),
                'old_parent': clipboard.directory,
                'new_parent': directory,
                'item_type': clipboard.type,
                'category_id': contextOpenedElem.type === 'category' ? extract_int(contextOpenedElem.id) : null,
                'action': clipboard.action
            })
            .then(() => {
                if (clipboard.action === 'cut') {
                    setClipboard({});
                }
                setReRender();
            }).catch(err => 
                setRequestError({'exists': true, 'description': err.response.data}
                ));
        }
        resetContext();
    }

    return (
        <div id="item-context-menu" className="context-menu" style={contextMenuStyle}
            onContextMenu={e => e.preventDefault()}
            onClick={handleClick}>
            {contextOptions.map(menuItem => {
                const menuClass = (
                    menuItem in restrictions && Object.keys(restrictions[menuItem]).some(x => x === 'true'))
                    ?
                    "disabled-context"
                    : "context-item";
                return <menu className={menuClass} title={menuItem} key={menuItem}></menu>
            })}
        </div>
    )
}


export const Filler = (props) => {
    const { username, isDragging, cloneTimeout, draggedElement,
            directory, resetDrag, setReRender, directoryInfo } = useContext(ProfileContext);
        
    // Style the filler on hovering.
    const handleFillerHover = (event) => {
        // Disable interaction between different types of fillers.
        if ([props.siblingType, draggedElement.type].includes('category')
            && props.siblingType !== draggedElement.type) {return};

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

        // Disable interaction between different types of fillers.
        if ([props.siblingType, draggedElement.type].includes('category')
            && props.siblingType !== draggedElement.type) {return};

        const categoryContainer = event.target.closest('.category');
        const container = directoryInfo.item_type === 'thematic_folder' ? '.category-container' : '.card-container';
        const scrollAmount = document.querySelector(container).scrollTop;
        if (props.type === 'regular') {
            let nextElement = event.target.nextElementSibling;
            if (nextElement.id === draggedElement.id) {
                resetDrag(true);
                return
            }
        } else if (props.type === 'last') {
            let previousElement = event.target.previousSibling;
            if (previousElement.id === draggedElement.id) {
                resetDrag(true);
                return
            }
        }

        props.setFillerClass('');
        resetDrag();

        axios.put(`/updateorder/${username}`, {
            'item_id': extract_int(draggedElement.id),
            'parent_id': directory,
            'category_id': categoryContainer ? extract_int(categoryContainer.id) : null,
            'new_order': props.order,
            'direction': props.type === 'last' ? 'after' : 'before'
        })
        .then(() => setReRender())
        .catch(err => console.log(err.response.data));
    }

    return (
        <div
            className={
                `${props.siblingType === 'category' ? 'category' : 'item'}-filler`
                + (props.fillerClass ? ` ${props.fillerClass}` : '')
                + (props.type === 'last' ? ' last-filler' : '')}
            onMouseOver={handleFillerHover}
            onMouseLeave={handleFillerHover}
            onMouseUp={handleFillerUp} />
    )
}


export function NotFound() {
    return (
        <div className="not-found">
            <i className="fas fa-binoculars fa-9x"></i>
            <h2> Page does not exist. </h2>
        </div>
    )
}