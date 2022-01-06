import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';

import { userName, renderMain } from "..";
import { ProfileContext } from "./ProfilePage";
import { QuestionPage } from "../question_components/QuestionPage";
import * as handlers from "./common/handlers";


export const PageItem = (props) => {
    // Component of ProfilePage.
    // Deployed by './common/functions' -> generate_decks.

    const [selfStyle, setSelfStyle] = useState({"order": props.order});
    const [fillerClass, setFillerClass] = useState("");
    const { draggedElement, setDraggedElement, directory, setDirectory, setReRender,
        isDragging, cloneTimeout, resetDrag } = useContext(ProfileContext);
    

    // Set the opacity of dragged element while dragging.
    useEffect(() => {
        if (isDragging && props.name === draggedElement.name) {
            setSelfStyle({"opacity": 0.6, "transition": "opacity .3s", "order": props.order});
        } else {
            setSelfStyle({"order": props.order});
        }
    }, [isDragging, draggedElement, props.name]);

  
    // Change directory after double clicking on a folder.
    const handleDoubleClick = () => {
        if (props.type === 'folder') {
            axios.get(`/subdir/${userName}/${props.name}/${directory}`)
            .then(response => 
                setDirectory(response.data)
            );
        }
    }

    // Set the properties of the 'to be dragged' element on mouse click.
    const handleMouseDown = (event) => {
        // Only left click
        if (event.nativeEvent.which !== 1) {return};

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
            renderMain(QuestionPage, {allPaths: props.allPaths, directory: directory});
        }

        let targetElem = event.target.className;
        if (!(['file', 'folder'].includes(handleMouseUp))) {
            targetElem = event.target.closest(`.${props.type}`)
        }

        if (
            targetElem.className === 'file'
            ||
            draggedElement.name === targetElem.innerText
            ) {
                resetDrag(true);
                return
        }
        
        if (isDragging) {
            axios.put(`/updatedir/${userName}`, {
                'parent_id': directory,
                'item_name': draggedElement.name,
                'item_type': draggedElement.type,
                'parent_name': targetElem.innerText,
            }).then(() => {
                setReRender(r => !r);
            }).catch(err => console.log(err.response.data));
        }
        resetDrag();    
    }

    // Style the filler on hovering.
    const handleFillerHover = (event) => {
        const siblingName = event.target.nextElementSibling.innerText;
        if (siblingName !== draggedElement.name) {
            if (isDragging && !cloneTimeout.exists) {
                if (event.type === 'mouseover') {
                    setFillerClass('filler-hovered');
                } else {
                    setFillerClass('');
                }   
            }
        }
    }

    const createThumbnail = () => {
        let thumbnail = [];
        props.allPaths.forEach((imgPath, index) => {
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
            <div className={`filler ${fillerClass}`} onMouseOver={handleFillerHover} onMouseLeave={handleFillerHover} />
            <div 
                className={props.type}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                >{props.type === 'folder' &&
                    <img className="folder-img" src="media\\profile\\yellowFolder.svg" alt="folder-icon" draggable="false" />
                }
                <p>{props.name}</p>
                <div className="item-footer">
                </div>
            </div>
        </div>
    )
}
