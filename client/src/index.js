import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import './styling/App.css'
import 'bootstrap/dist/css/bootstrap.css';
import QuestionPage from './App.js';
import * as utils from './functions';
import axios from 'axios';

const userName = "hm";
const RenderContext = createContext();

export function renderMain(Component, propObject) {
  if (propObject === undefined) {
    propObject = {};
  }
  ReactDOM.render(
    <React.StrictMode>
      <Component {...propObject} />
    </React.StrictMode>,
    document.getElementById("main-app")
  );
}


function Overlay(props) {
    return (
    <div className="deck-input-overlay" style={props.display}>
      <CreateDeck setDisplay={props.setDisplay} />
    </div>
  )
}


function OverlayNavbar(props) {

  const handleExit = (event) => {
    event.preventDefault();
    props.setDisplay({"display": "none"});
  }

  return (
    <div className="overlay-nav">Add a new Deck
      <button className="exit-button" onClick={handleExit}>X</button>
    </div>
  )
}

function CreateDeck(props) {
  const [deckName, setDeckName] = useState("");
  const [words, setWords] = useState("");
  const [nameError, setNameError] = useState({errorClass: "", description: ""});
  const [wordError, setWordError] = useState({errorClass: "", description: ""});
  const [error, setError] = useState({display: {"display": "none"}, errorClass: "", description: ""});

  const handleNameChange = (event) => {
    const deckNameFilter = /[.,\\'"]/;
    if (deckNameFilter.test(event.target.value)) {
      setNameError({
        errorClass: "forbidden-input",
        description: `Forbidden character ' ${event.target.value.match(deckNameFilter)} '`})
    } else if (event.target.value.length > 40) {
      setNameError({
        errorClass: "forbidden-input",
        description: `Input too long: ${event.target.value.length} characters > 40`})
    } else {setNameError({errorClass: "", description: ""})};
    setDeckName(event.target.value);
    setError({display: {"display": "none"}, errorClass: "", description: ""});
  };

  const handleWordChange = (event) => {
    const wordNameFilter = /[.,\\/<>:"|?*]/;
    if (wordNameFilter.test(event.target.value)) {
      setWordError({
        errorClass: "forbidden-input",
        description: `Forbidden character ' ${event.target.value.match(wordNameFilter)} '`});
    } else {setWordError({errorClass: "", description: ""})};
    setWords(event.target.value);
    setError({display: {"display": "none"}, errorClass: "", description: ""});
  }

  const renderContext = useContext(RenderContext)['render'];

  const handleSubmit = (event) => {
    event.preventDefault();
    let allWords = words.split("\n")
        .filter(word => word !== '')
        .filter(word => !word.match(/^[\s]+$/))
        .join(',');

    if (nameError.errorClass !== "" || wordError.errorClass !== "") {
      setError({errorClass: "invalid-form", description: "Fix the problem(s) above."})
    }
    
    else if (allWords.length === 0) {
      setError({errorClass: "invalid-form", description: "Enter at least one word."});
    }
    
    else if (deckName.replace(/[\s]/g, '').length === 0) {
      setError({errorClass: "invalid-form", description: "You cannot only use spaces."});
    }

    else {
      axios.post(`http://localhost:3001/u/${userName}/user_decks`, {
      deckName: deckName,
      cards: allWords}
      ).then(() => {
      props.setDisplay();
      renderContext(x => !x);
      setDeckName(""); setWords("");
      setError({display: {"display": "none"}, errorClass: "", description: ""});
    }).catch(err =>
      setError({errorClass: "invalid-form", description: err.response.data}));
    }
  } 

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


function ProfileNavBar(props) {
  const [display, setDisplay] = useState({"display": "none"});

  const addCard = () => {
    setDisplay(view => view["display"] === "none" ? {"display": "flex"} : {"display": "none"});
  }

  return (
    <div className="profile-navbar sticky-top navbar-dark bg-dark">
      <i className="fas fa-plus-circle" onClick={addCard}></i>
      <Overlay display={display} setDisplay={addCard} />
    </div>
  )
}

const Deck = (props) => {
  const render = (elem) => {
    if (elem.target.className === "deck") {
      renderMain(QuestionPage, {words: props.words});
    }
  }

  const renderContext = useContext(RenderContext)['render'];

  const selfDestruct = () => {
    if (window.confirm("Delete the deck?")) {
      axios.delete(`http://localhost:3001/u/${userName}/user_decks`, 
        {data: {"deck": props.deckName}})
          .then(renderContext(x => !x))
          .catch(err => console.log(err));
    }
  }

  const createThumbnail = () => {
    let thumbnail = [];
    props.words.forEach(item => {
      if (thumbnail.length >= 4) {
        return
      }
      thumbnail.push(
        <img className="deck-thumbnail" src={`${item}.png`} key={item} alt={item} />
      )
    });
    return thumbnail;
  }

  return (
    <div className="deck" onClick={render}>
      {props.deckName}
      <div className="deck-footer">
        <i className="fas fa-trash-alt" onClick={selfDestruct}></i>
      </div>
    </div>
  )
}



const SideBar = (props) => {
  return (
    <figure className="user-info">
      <img className="user-image" src={props.userPicture} alt={`${props.user}`} />
      <figcaption className="username">{props.user}</figcaption>
    </figure>
  )
}



export const ProfilePage = () => {
  const [user, setUser] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [userDecks, setUserDecks] = useState([]);
  const [reRender, setReRender] = useState(false);

  useEffect(() => {
    axios.get(`/u/${userName}`).then(
      response =>  {
        setUser(response.data.username);
        setUserPicture(response.data.user_pic);
        setUserDecks(response.data.user_decks);
      }
    )
  }, [reRender]);

  return (
    <RenderContext.Provider value={{"render": setReRender}}>
      <div className="profile-page">
        <ProfileNavBar user={userName} />
        <div className="profile-content">
          <SideBar user={user} userPicture={userPicture} />
          <div className="card-container">
            {utils.generate_decks(userDecks, Deck, userName)}
            </div>
        </div>
      </div>
    </RenderContext.Provider>
    )
}

renderMain(ProfilePage, {});
