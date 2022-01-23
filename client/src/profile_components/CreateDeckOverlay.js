import { useState, useContext } from "react";
import axios from "axios";

import { ProfileContext } from "./ProfilePage";
import * as handlers from './common/handlers';
import * as components from './common/components';


export function CreateDeckOverlay(props) {
    // Component of ProfileNavbar.

    return (
        <div className="input-overlay" style={props.display}>
            <CreateDeck setDisplay={props.setDisplay} />
        </div>
  )
}

export function CreateDeck(props) {
    // Component of CreateDeckOverlay.

    const [deckName, setDeckName] = useState("");
    const [words, setWords] = useState("");
    const [nameError, setNameError] = useState({errorClass: "", description: ""});
    const [wordError, setWordError] = useState({errorClass: "", description: ""});
    const [formError, setFormError] = useState({display: {"display": "none"}, errorClass: "", description: ""});
    
    const { username, directory, setReRender } = useContext(ProfileContext);
  
    const handleNameChange = (event) => {
        const [itemName, itemNameError, generalError] = handlers.handleItemName(event);
        setDeckName(itemName);
        setNameError(itemNameError);
        setFormError(generalError);
    };
  
    const handleWordChange = (event) => {
        const wordNameFilter = /[.,\\/<>:"|?*]/;
        if (wordNameFilter.test(event.target.value)) {
            setWordError({
                errorClass: "forbidden-input",
                description: `Forbidden character ' ${event.target.value.match(wordNameFilter)} '`});
        } else {
            setWordError({errorClass: "", description: ""})
        };
        setWords(event.target.value);
        setFormError({display: {"display": "none"}, errorClass: "", description: ""});
    }
  
    const handleSubmit = (event) => {
       event.preventDefault();

        let allWords = 
            words.split("\n")
            .filter(word => word !== '')
            .filter(word => !word.match(/^[\s]+$/))
            .join(',');

        if (nameError.errorClass !== "" || wordError.errorClass !== "") {
            setFormError({errorClass: "invalid-form", description: "Fix the problem(s) above."});
        }
        
        else if (allWords.length === 0) {
            setFormError({errorClass: "invalid-form", description: "Enter at least one word."});
        }

        else if (words === "") {
            setFormError({errorClass: "invalid-form", description: "Enter a deck name."});
        }
    
        else {
            axios.post(`/u/${username}/create_deck`, {
                deckName: deckName,
                cards: allWords,
                parent_id: directory}
            ).then(() => {
                setDeckName(""); setWords("");
                setFormError({display: {"display": "none"}, errorClass: "", description: ""});
                setReRender(x => !x);
                props.setDisplay(false);
                }).catch(err =>
                    setFormError({errorClass: "invalid-form", description: err.response.data}));
        }
    } 
  
    // Children: OverlayNavbar.
    return (
        <form className="create-item-info" onSubmit={handleSubmit}>
            <components.OverlayNavbar setDisplay={props.setDisplay} description="Create a new deck" />
            {/* Deck name */}
            <components.InputField 
                description="Deck Name:" error={nameError} value={deckName}
                handler={handleNameChange} placeholder="Enter a deck name" />
            {/* Words */}
            <label className="input-label">
                <div className="input-info">
                Words: <span className="input-error">{wordError.description}</span>
                </div>
                <textarea className={`word-input ${wordError.errorClass}`} value={words}
                onChange={handleWordChange} placeholder="Enter a word for each line" required/>
            </label>
            {/* Submit & Error */}
            <components.SubmitForm description="Create Deck" formError={formError} />
        </form>
    )
}