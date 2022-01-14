import { useState, useEffect, useReducer, createContext, useContext } from "react";
import axios from 'axios';

import { userName } from "..";
import { generate_directory, hasKeys, scroll_div } from "./common/functions";
import { CreateDeckOverlay } from "./CreateDeckOverlay";
import { CreateFolderOverlay } from "./CreateFolderOverlay";


export const ProfileContext = createContext();


export const ProfilePage = (props) => {
    // Rendered by main.

    const [userPicture, setUserPicture] = useState("no_pic.png");
    const [directory, setDirectory] = useState(props.dir);
    const [items, setItems] = useState([]);
    const [reRender, setReRender] = useReducer(x => x + 1, 0);

    // Scrolling related states.
    const [scrolling, setScrolling] = useState({'exists': false, 'direction': null});
    const [scrollStart, setScrollStart] = useState(0);

    // Dragging related states.
    const [cloneElement, setCloneElement] = useState("");
    const [cloneStyle, setCloneStyle] = useState({});
    const [cloneTimeout, setCloneTimeout] = useState({'exists': false, 'timeouts': ""});
    const [draggedElement, setDraggedElement] = useState({});
    const [dragCount, setDragCount] = useState(0);
    const [isDragging, setDrag] = useState(false);
    
    // Load user picture.
    useEffect(() => {
        axios.get(`/u/${userName}`).then(
            response =>  {
                setUserPicture(response.data.user_picture);
            }
        )
    }, [userPicture]);
  

    // Render directory.
    useEffect(() => {
        axios.get(`/u/${userName}/${directory}`)
        .then(response =>  {
            setItems(generate_directory(response.data, userName));
            }
        )
        return (() => {
            clearTimeout(cloneTimeout['timeouts']);
            resetDrag();
        });
    }, [directory, reRender]);


    // Update clone position.
    useEffect(() => {
        if (hasKeys(draggedElement) && Object.keys(cloneStyle).length && isDragging) {
            setCloneElement(<DragClone item={draggedElement.name} cloneStyle={cloneStyle} />)
        }
    }, [cloneStyle, draggedElement, isDragging])

    // Cancel scrolling when item is no longer dragged.
    useEffect(() => {
        if (scrolling.exists) {
            clearInterval(scrolling.interval);
            setScrolling({'exists': false}); 
        }
    }, [isDragging])


    // Reset all drag related state.
    const resetDrag = (timeout=false, scroll=0) => {
        if (timeout && hasKeys(draggedElement)) {
            const { top, left, width } = draggedElement.clonedStyle;
            setDragCount(0);
            setCloneStyle({
                "width": `${width}px`,
                "height": "250px",
                "opacity": "0.3",
                "borderRadius": "10%",
                "backgroundColor": "white",
                "left": `${left}px`,
                "top": `${top + (scrollStart - scroll)}px`,
                "transition": ".3s"
            });
            setCloneTimeout({
                'exists': true,
                'timeouts': setTimeout(() => resetDrag(), 300)
            });
        } else {
            setDragCount(0);
            setCloneElement("");
            setCloneStyle({});
            setDraggedElement({});
            setDrag(false);
            setCloneTimeout({'exists': false, 'timeouts': ""});
            setScrollStart(0);
        }  
    }

    // Set 'isDragging' value to true when mouse moves.
    const handleMouseAction = (event) => {
        if (hasKeys(draggedElement) && !cloneTimeout.exists) {
            if (dragCount > 12) {
                setCloneStyle({
                    "width": "150px",
                    "backgroundColor": "rgb(142, 47, 230)",
                    "left": `${event.clientX + 5}px`,
                    "top": `${event.clientY + 5}px`,
                    "boxShadow": "0px 3px 6px black",
                    "transition": "width .3s, background-color .3s"
                });
                if (!isDragging) {
                    setDrag(true);
                    setScrollStart(document.querySelector('.card-container').scrollTop);
                    setCloneElement(<DragClone item={draggedElement.name} cloneStyle={cloneStyle} />)
                };
                scroll_div(event, window, document, scrolling, setScrolling,
                    ['drag-button', 'sidebar-container', 'user-info', 'user-image']);
            } else {
                setDragCount(count => count + 1);
            }
        }
    }

    const handleMouseUp = (event) => {
        const specialClass = event.target.className.split(' ')[0];
        if (hasKeys(draggedElement) 
        && 
        !['file', 'folder', 'folder-img', 'filler', 'drag-button'].includes(specialClass)) {
            const scrollAmount = document.querySelector('.card-container').scrollTop;
            resetDrag(true, scrollAmount);
        }
    }
  
    // Children: ProfileNavBar, SideBar | (Indirect) Folder, Deck
    return (
        <ProfileContext.Provider value={
            {"setReRender": setReRender,
            "directory": directory,
            "setDirectory": setDirectory,
            "draggedElement": draggedElement,
            "setDraggedElement": setDraggedElement,
            "isDragging": isDragging,
            "cloneTimeout": cloneTimeout,
            "resetDrag": resetDrag,
            "items": items}
            }>
            <div className="profile-page"
                onMouseMove={handleMouseAction} onMouseUp={handleMouseUp}>
                <ProfileNavBar user={userName} />
                <div className="profile-content">
                    <SideBar user={userName} userPicture={userPicture} />
                    <div className="card-container">
                        {items}
                        <BottomDragBar />
                    </div>
                </div>
                {cloneElement}
            </div>
        </ProfileContext.Provider>
    )
}



const ProfileNavBar = () => {
    // Component of ProfilePage.

    const [deckDisplay, setDeckDisplay] = useState(false);
    const [folderDisplay, setFolderDisplay] = useState(false);
    const [backDisplay, setBackDisplay] = useState(false);
  
    const { directory, setDirectory } = useContext(ProfileContext);
  
    useEffect(() => {
        if (directory > 1) {
            setBackDisplay(true);
        } else {
            setBackDisplay(false);
        }
    }, [directory])
  
    const handleBackClick = () => {
        axios.get(`/updir/${userName}/${directory}`)
            .then(response => setDirectory(response.data));
    }
  
    const addItem = (event) => {
        const itemType = event.target.attributes.type.value;
        if (itemType === 'deck') {
            setDeckDisplay(view => !view);
        } else if (itemType === 'folder'){
            setFolderDisplay(view => !view);
        }
    }
    
    // Children: CreateDeckOverlay, CreateFolderOverlay
    return (
        <div className="profile-navbar sticky-top navbar-dark bg-dark">
            {backDisplay && <i className="fas fa-arrow-left arrow" onClick={handleBackClick}></i>}
            <i className="fas fa-folder-plus" type="folder" onClick={addItem}></i>
            <i className="fas fa-plus-circle" type="deck" onClick={addItem}></i>
            {deckDisplay && <CreateDeckOverlay setDisplay={setDeckDisplay} />}
            {folderDisplay && <CreateFolderOverlay setDisplay={setFolderDisplay} />}

        </div>
    )
}


const SideBar = (props) => {
    // Component of ProfilePage.
    
    return (
        <div className="sidebar-container">
            <figure className="user-info">
                <img className="user-image" src={`media/profile/${props.userPicture}`} alt={`${props.user}`} />
                <figcaption className="username">{props.user}</figcaption>
            </figure>
        </div>
    )
}


const BottomDragBar = () => {
    // Component of ProfilePage.
    const { 
        isDragging, directory, draggedElement,
        setReRender, resetDrag, cloneTimeout } = useContext(ProfileContext);

    const destroyItem = () => {
        // Delete dragged the item.
        resetDrag();
        if (!cloneTimeout.exists) {
            const message = (
                draggedElement.type === 'folder' ? `Delete ${draggedElement.name} and all of its content?`
                : draggedElement.type === 'file' ? `Delete ${draggedElement.name}?`
                : 'Delete this item?')
            if (window.confirm(message)) {
                axios.delete(`http://localhost:3001/u/${userName}/delete_item`, {data: {
                    name: draggedElement.name,
                    parent_id: directory,
                    item_type: draggedElement.type}}
                )
                .then(() => {
                    setReRender();
                })
                .catch(err => console.log(err));
            } else {
                resetDrag();
            }
        }
    }

    const sendBack = () => {
        // Move dragged item to parent folder.
        axios.put(`/updatedir/${userName}`, {
            'item_id': draggedElement.id,
            'item_name': draggedElement.name,
            'parent_id': directory,
            'direction': 'parent'
        }).then(() => {
            setReRender();
        }).catch(err => console.log(err.response.data));
        resetDrag();
    }

    return (
        <div className="bottom-drag-bar">
            {isDragging && directory !== 1 &&
                <div className="drag-button send-back" onMouseUp={sendBack}>
                    <i className="fas fa-long-arrow-alt-left"></i>
                </div>
            }
            {isDragging &&
                <div className="drag-button trash"  onMouseUp={destroyItem}>
                    <i className="fas fa-trash-alt"></i>
                </div> 
            }
        </div>
    )
}

const DragClone = (props) => {
    // Component of ProfilePage.

    return (
        <div className='drag-item-clone' style={props.cloneStyle}>
            {props.item}
        </div>
    )
}