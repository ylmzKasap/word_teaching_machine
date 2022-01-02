import { useState, useEffect, createContext, useContext } from "react";
import axios from 'axios';

import { userName } from "..";
import { generate_decks } from "./common/functions";
import { CreateDeckOverlay } from "./CreateDeckOverlay";
import { CreateFolderOverlay } from "./CreateFolderOverlay";


export const ProfileContext = createContext();


export const ProfilePage = (props) => {
    // Rendered by main.

    const [userPicture, setUserPicture] = useState("");
    const [directory, setDirectory] = useState(props.dir);
    const [items, setItems] = useState([]);
    const [reRender, setReRender] = useState(false);
  
    useEffect(() => {
        axios.get(`/u/${userName}`).then(
            response =>  {
                setUserPicture(response.data.user_picture);
            }
        )
    }, [userPicture]);
  
    useEffect(() => {
        axios.get(`/u/${userName}/${directory}`)
        .then(response =>  {
            setItems(response.data);
            }
        )
    }, [directory, reRender]);
  
    // Children: ProfileNavBar, SideBar | (Indirect) Folder, Deck
    return (
        <ProfileContext.Provider value={
            {"render": setReRender, "directory": directory, "setDirectory": setDirectory}
            }>
            <div className="profile-page">
                <ProfileNavBar user={userName} />
                <div className="profile-content">
                    <SideBar user={userName} userPicture={userPicture} />
                    <div className="card-container">
                        {generate_decks(items, userName)}
                    </div>
                </div>
            </div>
        </ProfileContext.Provider>
    )
}


function ProfileNavBar() {
    // Component of ProfilePage.

    const [deckDisplay, setDeckDisplay] = useState({"display": "none"});
    const [folderDisplay, setFolderDisplay] = useState({"display": "none"});
    const [backDisplay, setBackDisplay] = useState({"display": "none"});
  
    const directory = useContext(ProfileContext)['directory'];
    const setDirectory = useContext(ProfileContext)['setDirectory'];
  
    useEffect(() => {
        if (directory > 1) {
            setBackDisplay({"display": "block"});
        } else {
            setBackDisplay({"display": "none"});
        }
    }, [directory])
  
    const handleBackClick = () => {
        axios.get(`/updir/${userName}/${directory}`)
            .then(response => setDirectory(response.data));
    }
  
    const addCard = () => {
        setDeckDisplay(view => view["display"] === "none" ? {"display": "flex"} : {"display": "none"});
    }

    const addFolder = () => {
        setFolderDisplay(view => view["display"] === "none" ? {"display": "flex"} : {"display": "none"});
    }
    
    // Children: CreateDeckOverlay
    return (
        <div className="profile-navbar sticky-top navbar-dark bg-dark">
            <i className="fas fa-arrow-left arrow" style={backDisplay} onClick={handleBackClick}></i>
            <i className="fas fa-folder-plus" onClick={addFolder}></i>
            <i className="fas fa-plus-circle" onClick={addCard}></i>
            <CreateDeckOverlay display={deckDisplay} setDisplay={addCard} />
            <CreateFolderOverlay display={folderDisplay} setDisplay={addFolder} />
        </div>
    )
}


const SideBar = (props) => {
    // Component of ProfilePage.
    
    return (
        <figure className="user-info">
            <img className="user-image" src={`media\\profile\\${props.userPicture}`} alt={`${props.user}`} />
            <figcaption className="username">{props.user}</figcaption>
        </figure>
    )
}