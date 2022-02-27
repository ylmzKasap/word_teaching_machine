import { useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./ProfilePage";
import * as handlers from './common/handlers';
import * as components from './common/components';


export function CreateCategoryOverlay(props) {
    // Component of ProfileNavbar.

    return (
        <div className="input-overlay" style={props.display}>
            <CreateCategory setDisplay={props.setDisplay} />
        </div>
  )
}

export function CreateCategory(props) {
  // Component of CreateCategoryOverlay.

    const [categoryName, setCategoryName] = useState("");
    const [color, setColor] = useState("#fff7f0");
    const [nameError, setNameError] = useState({errorClass: "", description: ""});
    const [formError, setFormError] = useState({display: {"display": "none"}, errorClass: "", description: ""});

    const { username, directory, setReRender } = useContext(ProfileContext);

    const handleNameChange = (event) => {
        const [itemName, itemNameError, generalError] = handlers.handleItemName(event);
        setCategoryName(itemName);
        setNameError(itemNameError);
        setFormError(generalError);
    };

    const handleColor = (event) => {
        setColor(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        if (categoryName === "") {
            setFormError({errorClass: "invalid-form", description: "Enter a category name."});
        }
        
        else if (nameError.errorClass !== "") {
            setFormError({errorClass: "invalid-form", description: "Fix the problem above."});
        }
    
        else {
            axios.post(`/u/${username}/create_category`, {
                category_name: categoryName,
                parent_id: directory,
                content: {"color": color}}
            ).then(() => {
                setCategoryName("");
                setFormError({display: {"display": "none"}, errorClass: "", description: ""});
                setReRender(x => !x);
                props.setDisplay(false);
                }).catch(err =>
                    setFormError({errorClass: "invalid-form", description: err.response.data}));
        }
    } 

    return (
        <form className="create-item-info" onSubmit={handleSubmit}>
            <components.OverlayNavbar setDisplay={props.setDisplay} description="Create a new category" />
            {/* Category name */}
            <components.InputField 
                description="Category name:" error={nameError} value={categoryName}
                handler={handleNameChange} placeholder="Enter a category name" />
            <div className="color-info">
                <input type="color" value={color} onChange={handleColor} />
                <span className="input-info">Pick a background color</span>
            </div>
            {/* Submit & Error */}
            <components.SubmitForm description="Create Category" formError={formError} />
        </form>
    )
}