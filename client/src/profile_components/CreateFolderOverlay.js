import { useState, useContext } from "react";
import axios from "axios";

import { userName } from "..";
import { ProfileContext } from "./ProfilePage";
import * as handlers from './common/handlers';
import * as components from './common/components';


export function CreateFolderOverlay(props) {
    // Component of ProfileNavbar.

    return (
        <div className="input-overlay" style={props.display}>
            <CreateFolder setDisplay={props.setDisplay} />
        </div>
  )
}

export function CreateFolder(props) {
  // Component of CreateFolderOverlay.

    const [folderName, setfolderName] = useState("");
    const [nameError, setNameError] = useState({errorClass: "", description: ""});
    const [formError, setFormError] = useState({display: {"display": "none"}, errorClass: "", description: ""});

    const { directory, setReRender } = useContext(ProfileContext);

    const handleNameChange = (event) => {
        const [itemName, itemNameError, generalError] = handlers.handleItemName(event);
        setfolderName(itemName);
        setNameError(itemNameError);
        setFormError(generalError);
    };

    const handleSubmit = (event) => {
        if (event.type === 'keydown') {
            if (event.code !== 'Enter') {
                return
            }
        }

        event.preventDefault();

        if (folderName === "") {
            setFormError({errorClass: "invalid-form", description: "Enter a folder name."});
        }
        
        else if (nameError.errorClass !== "") {
            setFormError({errorClass: "invalid-form", description: "Fix the problem above."});
        }
    
        else {
            axios.post(`http://localhost:3001/u/${userName}/create_folder`, {
                folderName: folderName,
                parent_id: directory}
            ).then(() => {
                setfolderName("");
                setFormError({display: {"display": "none"}, errorClass: "", description: ""});
                setReRender(x => !x);
                props.setDisplay(false);
                }).catch(err =>
                    setFormError({errorClass: "invalid-form", description: err.response.data}));
        }
    } 

    return (
        <form className="create-item-info" onSubmit={handleSubmit} onKeyDown={handleSubmit}>
            <components.OverlayNavbar setDisplay={props.setDisplay} description="Create a new folder" />
            {/* Folder name */}
            <components.InputField 
                description="Folder Name:" error={nameError} value={folderName}
                handler={handleNameChange} placeholder="Enter a folder name" />
            {/* Submit & Error */}
            <components.SubmitForm description="Create Folder" formError={formError} />
        </form>
    )
}