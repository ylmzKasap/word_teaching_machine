import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';

import { userName, renderMain } from "..";
import { ProfileContext } from "./ProfilePage";
import { QuestionPage } from "../question_components/QuestionPage";
import * as handlers from "./common/handlers";
import { Filler } from "./common/components";


export const PageItem = (props) => {
    // Component of ProfilePage.
    // Deployed by './common/functions' -> generate_decks.

    const [selfStyle, setSelfStyle] = useState({"order": props.order});
    const [fillerClass, setFillerClass] = useState("");
    const [lastFillerClass, setLastFillerClass] = useState("");
    const { draggedElement, setDraggedElement, directory, setDirectory, setReRender,
        isDragging, cloneTimeout, resetDrag, items } = useContext(ProfileContext);
    

    // Set the opacity of dragged element while dragging.
    useEffect(() => {
        if (isDragging && props.name === draggedElement.name && props.type === draggedElement.type) {
            setSelfStyle({"opacity": 0.6, "transition": "opacity .3s", "order": props.order});
        } else {
            setSelfStyle({"order": props.order});
        }
    }, [isDragging, draggedElement, props.name, props.order]);

  
    // Change directory after double clicking on a folder.
    const handleDoubleClick = (event) => {
        if (props.type === 'folder') {
            setDirectory(props.id);
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

        if (event.target.className === "file" && !isDragging) {
            renderMain(QuestionPage, {allPaths: props.content, directory: directory});
        }

        let targetElem = event.target.className;
        if (!(['file', 'folder'].includes(handleMouseUp))) {
            targetElem = event.target.closest(`.${props.type}`)
        }

        if (
            targetElem.className === 'file'
                ||
            (draggedElement.name === targetElem.innerText
                &&
            draggedElement.type === targetElem.attributes.class.value)
            ) {
                const scrollAmount = document.querySelector('.card-container').scrollTop;
                resetDrag(true, scrollAmount);
                return
        }
        
        if (isDragging) {
            axios.put(`/updatedir/${userName}`, {
                'item_id': draggedElement.id,
                'item_name': draggedElement.name,
                'target_id': targetElem.id,
                'parent_name': targetElem.innerText,
                'parent_id': directory,
                'direction': 'subfolder'
            })
            .then(() => setReRender())
            .catch(err => console.log(err.response.data));
        }
        resetDrag();    
    }

    const createThumbnail = () => {
        let thumbnail = [];
        props.content.forEach((imgPath, index) => {
            let wordStem = imgPath.split(".")[0];
            if (thumbnail.length >= 4) {
                return
            }
            thumbnail.push(
                <img className="deck-thumbnail"
                src={`media\\${imgPath}`} key={`${wordStem}-${index}`} alt={`${wordStem}-${index}`} />
            )
        });
        return thumbnail;
    }

    return (
        <div className="item-with-filler" style={selfStyle}>
            <Filler 
                fillerClass={fillerClass}
                setFillerClass={setFillerClass}
                order={{}} type="regular" />
            <div 
                id={props.id}
                className={props.type}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                > {props.type === 'folder' &&
                     <img className="folder-img" src="media\\profile\\yellowFolder.svg" alt="folder-icon" draggable="false" />
                }
                <p>{props.name}</p>
                <div className="item-footer">
                </div>
            </div>
            {items.length === parseInt(props.order) &&
                <Filler 
                fillerClass={lastFillerClass}
                setFillerClass={setLastFillerClass}
                siblingType={props.type}
                order={items.length + 1} type="last"/>}
        </div>
    )
}
