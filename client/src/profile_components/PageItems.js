import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';

import { ProfileContext } from "./ProfilePage";
import * as handlers from "./common/handlers";
import { Filler } from "./common/components";
import { useNavigate, useParams } from "react-router-dom";
import { useWindowSize } from "./common/hooks";


export const PageItem = (props) => {
    // Component of ProfilePage.
    // Deployed by './common/functions' -> generate_decks.

    const navigate = useNavigate();
    const params = useParams();
    const [columnNumber] = useWindowSize();

    const [selfStyle, setSelfStyle] = useState({"order": props.order});
    const [itemStyle, setItemStyle] = useState({});
    const [folderStyle, setFolderStyle] = useState("");
    const [fillerClass, setFillerClass] = useState("");
    const [lastFillerClass, setLastFillerClass] = useState("");

    const { username, draggedElement, setDraggedElement, directory, setReRender,
        isDragging, cloneTimeout, resetDrag, items, setRequestError, rootDirectory } = useContext(ProfileContext);
    
    const trueDirectory = params.dirId ? "" : `${directory}/`;

    // Set the opacity of dragged element while dragging.
    useEffect(() => {
        if (isDragging && draggedElement.id === props.id) {
            setSelfStyle({"opacity": 0.5, "transition": "opacity .3s", "order": props.order});
            setFolderStyle('dragged-folder');
        } else {
            setSelfStyle({"order": props.order});
            setFolderStyle("");
        }
    }, [isDragging, draggedElement, props.name, props.order, props.id]);


    // Change directory after double clicking on a folder.
    const handleDoubleClick = () => {
        if (props.type === 'folder') {
            navigate(`/user/${username}/${props.id}`);
        }
    }

    // Set the properties of the 'to be dragged' element on mouse click.
    const handleMouseDown = (event) => {
        // Only left click
        if (event.nativeEvent.which !== 1 || isDragging) {return};
        
        let targetElem = event.target;
        if (targetElem.className !== props.type) {
            targetElem = event.target.closest(`.${props.type}`);
        }
        const draggedElement = handlers.handleDownOnDragged(targetElem, props, cloneTimeout);
        setDraggedElement(draggedElement);
    }

    const handleMouseUp = (event) => {
        // Only left click
        if (event.nativeEvent.which !== 1) {return};

        let targetElem = event.target.className;
        if (!(['file', 'folder'].includes(handleMouseUp))) {
            targetElem = event.target.closest(`.${props.type}`)
        }

        if (targetElem.className === "file" && !isDragging) {
            navigate(`${trueDirectory}deck/${targetElem.id}`, 
            {state: {allPaths: props.content, directory: directory, rootDirectory: rootDirectory}});
        } 

        if (targetElem.className === 'file' || (draggedElement.id === targetElem.id)) {
            const scrollAmount = document.querySelector('.card-container').scrollTop;
            resetDrag(true, scrollAmount);
            return
        }

        setItemStyle({});
        setFolderStyle("");
        
        if (isDragging) {
            axios.put(`/updatedir/${username}`, {
                'item_id': draggedElement.id,
                'item_name': draggedElement.name,
                'target_id': targetElem.id,
                'parent_name': targetElem.innerText,
                'parent_id': directory,
                'direction': 'subfolder'
            })
            .then(() => setReRender())
            .catch((err) => setRequestError({'exists': true, 'description':err.response.data}));
        }
        resetDrag();    
    }

    const handleHover = (event) => {
        if (!isDragging || cloneTimeout.exists) { return };

        const targeted = event.target.closest('div');
        if (targeted.id === draggedElement.id) { return };
        if (targeted.className !== 'folder') { return };

        if (event.type === 'mouseover') {
            setItemStyle({"boxShadow": "rgb(211, 210, 210) 0px 0px 5px 3px"});
            setFolderStyle("drag-hover-folder");
        } else if (event.type === 'mouseout') {
            setItemStyle({});
            setFolderStyle("");
        }
    }

    const createThumbnail = () => {
        let thumbnail = [];
        for (let i = 0; i < props.content.length; i++) {
            let wordPath = props.content[i];
            let wordStem = wordPath.split('.')[0];
            if (thumbnail.length >= 4) {
                break
            } else {
                thumbnail.push(
                    <img className={`deck-thumbnail${props.content.length < 4 ? ' n-1' : ''}`}
                    src={`media\\${wordPath}`} key={`${wordStem}-${i}`}
                    alt={`${wordStem}-${i}`} draggable='false'/>)
            }
            if (props.content.length < 4) { break };
        }
        return thumbnail;
    }

    return (
        <div className="item-with-filler" style={selfStyle} draggable="false">
            <Filler 
                fillerClass={fillerClass}
                setFillerClass={setFillerClass}
                order={props.order} type="regular" />
            <div 
                id={props.id}
                className={props.type}
                type="item"
                style={itemStyle}
                tabIndex={props.order}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseOver={handleHover}
                onMouseOut={handleHover}
                > {props.type === 'folder' &&
                    <i className={`fas fa-folder fa-9x ${folderStyle}`}></i>
                }
                {props.type === 'file' && 
                    <span className='thumbnail-container'>
                        <span className="image-overlay" />
                        {createThumbnail()}
                    </span>}
                <p className={`${props.type}-description`}>{props.name}</p>
            </div>
            {(items.length === props.order || props.order % columnNumber === 0) &&
                <Filler 
                fillerClass={lastFillerClass}
                setFillerClass={setLastFillerClass}
                siblingType={props.type}
                order={props.order} type="last"/>}
        </div>
    )
}