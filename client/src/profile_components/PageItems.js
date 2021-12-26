import React, { useState, useContext } from "react";
import axios from 'axios';

import { userName, renderMain } from "..";
import { ProfileContext } from "./ProfilePage";
import { QuestionPage } from "../question_components/QuestionPage";


export const Folder = (props) => {
    // Component of ProfilePage.
    // Deployed by './common/functions' -> generate_decks.

    const renderContext = useContext(ProfileContext)['render'];
    const currentDirectory = useContext(ProfileContext)['directory'];
    const setDirectory = useContext(ProfileContext)['setDirectory'];
  
    const handleDoubleClick = () => {
        axios.get(`/subdir/${userName}/${props.folderName}/${currentDirectory}`)
            .then(response => {
                setDirectory(response.data);
        });
    }
  
    const selfDestruct = () => {
        if (window.confirm("Delete the folder?")) {
            axios.delete(`http://localhost:3001/u/${userName}/user_decks`, 
            {data: {"item": props.folderName}})
                .then(renderContext(x => !x))
                .catch(err => console.log(err));
        }
    }

    return (
        <div className="folder" onDoubleClick={handleDoubleClick}>
            <img className="folder-img" src="media\\profile\\yellowFolder.svg" alt="folder-icon" />
            <p>{props.folderName}</p>
            <div className="deck-footer">
                <i className="fas fa-trash-alt" onClick={selfDestruct}></i>
            </div>
        </div>
    )
}


export const Deck = (props) => {
    // Component of ProfilePage.
    // Deployed by './common/functions' -> generate_decks.

    const [style, setStyle] = useState({});
  
    const dir = useContext(ProfileContext)['directory'];
  
    const render = (elem) => {
        if (elem.target.className === "deck") {
            renderMain(QuestionPage, {allPaths: props.allPaths, directory: dir});
        }
    }
  
    const renderContext = useContext(ProfileContext)['render'];
  
    const selfDestruct = () => {
        if (window.confirm("Delete the deck?")) {
            axios.delete(`http://localhost:3001/u/${userName}/delete_deck`, {data: {
                deckName: props.deckName,
                parent_id: dir}}
            )
            .then(renderContext(x => !x))
            .catch(err => console.log(err));
        }
    }
  
    const handleDrag = (event) => {
        if (event.type === 'dragstart') {
            setStyle({"opacity": "1", "backgroundColor": "#888", "color": "white"});
            setTimeout(() => setStyle({"opacity": "0.4", "backgroundColor": "#EEE"}), 1)
        } else if (event.type === 'dragend') {
            setStyle({"opacity": "1"});
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
        <div className="deck" onClick={render} style={style} draggable="true"
            onDragStart={handleDrag} onDragEnd={handleDrag}>{props.deckName}
            <div className="deck-footer">
                <i className="fas fa-trash-alt" onClick={selfDestruct}></i>
            </div>
        </div>
    )
}