import { useState, useContext } from "react";
import axios from "axios";

import { userName } from "..";
import { ProfileContext } from "./ProfilePage";

export function CreateDeckOverlay(props) {
    // Component of ProfileNavbar.

    return (
        <div className="deck-input-overlay" style={props.display}>
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
    const [error, setError] = useState({display: {"display": "none"}, errorClass: "", description: ""});
  
    const directory = useContext(ProfileContext)['directory'];
  
    const handleNameChange = (event) => {
        const deckNameFilter = /[.,\\'"]/;
        if (deckNameFilter.test(event.target.value)) {
            setNameError({
                errorClass: "forbidden-input",
                description: `Forbidden character ' ${event.target.value.match(deckNameFilter)} '`});
        } else if (event.target.value.length > 40) {
            setNameError({
                errorClass: "forbidden-input",
                description: `Input too long: ${event.target.value.length} characters > 40`});
        } else {
            setNameError({
                errorClass: "", description: ""});
        };
        setDeckName(event.target.value);
        setError({display: {"display": "none"}, errorClass: "", description: ""});
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
        setError({display: {"display": "none"}, errorClass: "", description: ""});
    }
  
    const renderContext = useContext(ProfileContext)['render'];
  
    const handleSubmit = (event) => {
        event.preventDefault();
        let allWords = 
            words.split("\n")
            .filter(word => word !== '')
            .filter(word => !word.match(/^[\s]+$/))
            .join(',');
    
        if (nameError.errorClass !== "" || wordError.errorClass !== "") {
            setError({errorClass: "invalid-form", description: "Fix the problem(s) above."});
        }
        
        else if (allWords.length === 0) {
            setError({errorClass: "invalid-form", description: "Enter at least one word."});
        }
        
        else if (deckName.replace(/[\s]/g, '').length === 0) {
            setError({errorClass: "invalid-form", description: "You cannot only use spaces."});
        }
    
        else {
            axios.post(`http://localhost:3001/u/${userName}/create_deck`, {
                deckName: deckName,
                cards: allWords,
                parent_id: directory}
            ).then(() => {
                props.setDisplay();
                renderContext(x => !x);
                setDeckName(""); setWords("");
                setError({display: {"display": "none"}, errorClass: "", description: ""});
                }).catch(err =>
                    setError({errorClass: "invalid-form", description: err.response.data}));
        }
    } 
  
    // Children: OverlayNavbar.
    return (
        <form className="create-deck-info" onSubmit={handleSubmit}>
            <OverlayNavbar setDisplay={props.setDisplay} />
            {/* Deck name */}
            <label className="input-label">
                <div className="input-info">
                Deck Name: <span className="input-error">{nameError.description}</span>
                </div>
                <input className={`text-input ${nameError.errorClass}`} value={deckName}
                onChange={handleNameChange} placeholder="Enter a deck name" required></input>
            </label>
            {/* Words */}
            <label className="input-label">
                <div className="input-info">
                Words: <span className="input-error">{wordError.description}</span>
                </div>
                <textarea className={`word-input ${wordError.errorClass}`} value={words}
                onChange={handleWordChange} placeholder="Enter a word for each line" required/>
            </label>
            {/* Submit & Error */}
            <div className="submit-deck">
                <button className="submit-deck-button" type="submit">Create deck</button>
                <label className={`error-field ${error.errorClass}`} style={error.display}>
                <span className="fas fa-exclamation-circle"></span>
                <span className="error-description">{error.description}</span>
                </label>
            </div>
        </form>
    )
}



function OverlayNavbar(props) {
    // Component of CreateDeck.

    const handleExit = (event) => {
        event.preventDefault();
        props.setDisplay({"display": "none"});
    }
    
    return (
        <div className="overlay-nav">Add a new Deck
            <button className="exit-button" onClick={handleExit}>
            X
            </button>
        </div>
    )
}