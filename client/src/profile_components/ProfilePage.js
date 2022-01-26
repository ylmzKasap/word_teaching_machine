import { useState, useEffect, useReducer, createContext, useContext } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';

import { generate_directory, hasKeys, scroll_div, delete_item } from "./common/functions";
import { ItemContextMenu, NotFound } from "./common/components";
import { CreateDeckOverlay } from "./CreateDeckOverlay";
import { CreateFolderOverlay } from "./CreateFolderOverlay";


export const ProfileContext = createContext();


export const ProfilePage = (props) => {
    // Rendered by main.
    const params = useParams();
    const navigate = useNavigate();

    const username = params.username;
    const dirId = params.dirId;

    const [userPicture, setUserPicture] = useState("");
    const [directory, setDirectory] = useState(() => {
        return dirId ? dirId : props.dir
    });
    const [items, setItems] = useState([]);
    const [reRender, setReRender] = useReducer(x => x + 1, 0);
    const [clipboard, setClipboard] = useState("");

    // Content fetching related states.
    const [pictureLoaded, setPictureLoaded] = useState(false);
    const [directoryLoaded, setDirectoryLoaded] = useState(false);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [requestError, setRequestError] = useState({'exists': false, 'description': ""});

    // Context menu related states.
    const [contextMenu, setContextMenu] = useState(false);
    const [contextOpenedElem, setContextOpenedElem] = useState({});
    const [contextOptions, setContextOptions] = useState([]);
    const [contextMenuStyle, setContextMenuStyle] = useState({});
    const [contextMenuScroll, setContextMenuScroll] = useState({});

    // Dragging related states.
    const [cloneElement, setCloneElement] = useState("");
    const [cloneStyle, setCloneStyle] = useState({});
    const [cloneTimeout, setCloneTimeout] = useState({'exists': false, 'timeouts': ""});
    const [draggedElement, setDraggedElement] = useState({});
    const [dragCount, setDragCount] = useState(0);
    const [isDragging, setDrag] = useState(false);
    const [scrolling, setScrolling] = useState({'exists': false, 'direction': null});
    const [scrollStart, setScrollStart] = useState(0);
    
    // Load user picture.
    useEffect(() => {
        axios.get(`/u/${username}`)
            .then(response =>  {
                const image = new Image();
                image.src = `media/profile/${response.data.user_picture}`;
                image.onload = () => {
                    setUserPicture(image.src);
                    setPictureLoaded(true);
            }})
            .catch(() =>
                setFetchError(true))
    }, [userPicture]);

    // Render directory.
    useEffect(() => {
        axios.get(`/u/${username}/${dirId ? dirId : props.dir}`)
            .then(response =>  {
                setItems(generate_directory(response.data, username));
                setDirectory(dirId ? parseInt(dirId) : props.dir);
            })
            .then(() => setDirectoryLoaded(true)
            )
            .catch(() => {
                setDirectoryLoaded(false);
                setContentLoaded(false);
                setFetchError(true);
                }      
            );
        return (() => {
            setRequestError({'exists': false, 'description': ""});
            clearTimeout(cloneTimeout['timeouts']);
            resetDrag();
        });
    }, [dirId, reRender])

    // Check whether content is loaded.
    useEffect(() => {
        if (pictureLoaded && directoryLoaded) {
            setContentLoaded(true);
        }
    }, [pictureLoaded, directoryLoaded, dirId])

    // Update clone position.
    useEffect(() => {
        if (hasKeys(draggedElement) && hasKeys(cloneStyle) && isDragging) {
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

    // Reset all context menu related state.
    const resetContext = () => {
        setContextMenu(false);
        setContextOptions([]);
        setContextOpenedElem({});
        setContextMenuScroll({});
        setContextMenuStyle({});
    }

    // Reset all drag related state.
    function resetDrag(timeout=false, scroll=0) {
        if (timeout && hasKeys(draggedElement)) {
            const { top, left, width } = draggedElement.clonedStyle;
            setDragCount(0);
            setCloneStyle({
                "width": `${width}px`,
                "height": "200px",
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
            if (dragCount > 6) {
                setCloneStyle({
                    "width": "180px",
                    "backgroundColor": "rgb(233, 171, 55)",
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
        !['file', 'folder', 'filler', 'drag-button'].includes(specialClass)) {
            const scrollAmount = document.querySelector('.card-container').scrollTop;
            resetDrag(true, scrollAmount);
        }
    }

    const handleMouseDown = (event) => {
        if(event.target.tagName !== 'MENU') {
            resetContext();
        }        
    }

    const handleContextMenu = (event) => {
        event.preventDefault();
        if (isDragging) {return};
        resetContext();

        const container = document.querySelector('.card-container');
        const closestDiv = event.target.closest('div');
        const contextMenu = (
            ['card-container', 'filler', 'item-with-filler', 'filler last-filler', 'nothing-to-see']
            .includes(event.target.className)
            ?
            {"closest": event.target, "openedElem": {'type': container}, "ops": ['paste']}
            :
            {
            "closest": closestDiv, 
            "openedElem": {
                'id': closestDiv.id,
                'type': closestDiv.className,
                'name': closestDiv.innerText},
            "ops": (closestDiv.className === 'file') ? ['copy', 'cut', 'delete'] : ['cut', 'delete']}
            )
        
        setContextOptions(contextMenu.ops);
        let top = event.clientY;
        let left = event.clientX;
        if (contextMenu.closest) {
            // Height of each menu should be 60px.
            if (window.innerHeight - top < contextMenu.ops.length * 60) {
                top -= contextMenu.ops.length * 60}
            // Width of the context menu should be 200px.
            if (window.innerWidth - left < 200) {
                left -= 200;
            }
            setContextMenu(true);
            setContextOpenedElem(contextMenu.openedElem);
            setContextMenuScroll({"scroll": container.scrollTop, "top": top});
            setContextMenuStyle({"top": top, "left": left});
        }
    }

    const handleScroll = (event) => {
        if (contextMenu) {
            const scrollTop = event.target.scrollTop;
            let scrollDiff = Math.abs(scrollTop - contextMenuScroll.scroll);
            scrollDiff = scrollTop >= contextMenuScroll.scroll ? -scrollDiff : scrollDiff;
            setContextMenuStyle(sc => ({"top": contextMenuScroll.top + scrollDiff, "left": sc.left}))      
            }       
    }

    // Children: ProfileNavBar, SideBar | (Indirect) Folder, Deck
    return (
        <ProfileContext.Provider value={
            {"username": username,
            "setReRender": setReRender,
            "directory": directory,
            "draggedElement": draggedElement,
            "setDraggedElement": setDraggedElement,
            "isDragging": isDragging,
            "cloneTimeout": cloneTimeout,
            "resetDrag": resetDrag,
            "items": items,
            "handleContextMenu": handleContextMenu,
            "contextOpenedElem": contextOpenedElem,
            "clipboard": clipboard,
            "contentLoaded": contentLoaded,
            "contextOptions": contextOptions,
            "contextMenuStyle": contextMenuStyle,
            "setClipboard": setClipboard,
            "resetContext": resetContext,
            "handleScroll": handleScroll,
            "fetchError": fetchError,
            "requestError": requestError,
            "setRequestError": setRequestError}
            }>
            <div className="profile-page">
                <div className="profile-container"
                    onMouseMove={handleMouseAction} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}>
                    <ProfileNavBar user={username} navigate={navigate} />
                    {contentLoaded &&
                        <div className="profile-content">
                            <SideBar user={username} userPicture={userPicture} />
                            {contextMenu && <ItemContextMenu />}
                            <Outlet />
                            {!params.dirId && <CardContainer />}
                        </div>}
                    {cloneElement}
                    {requestError.exists && <ErrorInfo />}
                    {fetchError && <NotFound />}
                </div>
            </div>
        </ProfileContext.Provider>
    )
}



const ProfileNavBar = (props) => {
    // Component of ProfilePage.
 
    const [deckDisplay, setDeckDisplay] = useState(false);
    const [folderDisplay, setFolderDisplay] = useState(false);
    const [backDisplay, setBackDisplay] = useState(false);
  
    const { username, directory, contentLoaded, fetchError } = useContext(ProfileContext);
  
    useEffect(() => {
        if (directory > 1 && !fetchError) {
            setBackDisplay(true);
        } else {
            setBackDisplay(false);
        }
    }, [directory, fetchError])
  
    const handleBackClick = () => {
        axios.get(`/updir/${username}/${directory}`)
            .then(response => props.navigate(
                `/user/${username}${response.data === 1 ? "" : `/${response.data}`}`));
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
            {contentLoaded && <i className="fas fa-folder-plus" type="folder" onClick={addItem}></i>}
            {contentLoaded && <i className="fas fa-plus-circle" type="deck" onClick={addItem}></i>}
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
                <div className="image-container">                  
                    <img className="user-image" src={props.userPicture} alt={`${props.user}`} />
                </div>
                <figcaption className="username">{props.user}</figcaption>
            </figure>
        </div>
    )
}


export const CardContainer = () => {
    const { handleContextMenu, handleScroll, items, isDragging } = useContext(ProfileContext);

    return (
        <div className="card-container" 
            onContextMenu={handleContextMenu} onScroll={handleScroll}>
                {items}
                {items.length === 0 && <h2 className="nothing-to-see">Folder is empty.</h2>}
                {isDragging && <BottomDragBar />}
        </div>
    )
}


const BottomDragBar = () => {
    // Component of ProfilePage.
    const { 
        username, isDragging, directory, draggedElement,
        setReRender, resetDrag, cloneTimeout, setRequestError } = useContext(ProfileContext);

    const destroyItem = () => {
        // Delete dragged the item.
        resetDrag();
        if (!cloneTimeout.exists) {
            delete_item(draggedElement, directory, username, setReRender, setRequestError)
            } else {
                resetDrag();
            }
        }

    const sendBack = () => {
        // Move dragged item to parent folder.
        axios.put(`/updatedir/${username}`, {
            'item_id': draggedElement.id,
            'item_name': draggedElement.name,
            'parent_id': directory,
            'direction': 'parent'
        })
        .then(() => setReRender())
        .catch(err => setRequestError({'exists': true, 'description':err.response.data}));
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


const ErrorInfo = () => {
    const { requestError, setRequestError } = useContext(ProfileContext);

    const handleExit = () => {
        setRequestError({'exists': false, 'description': ""});
    }

    return (
        <label className="profile-error-box">
            <div className="profile-error-text"><h5>{requestError.description}</h5></div>
            <div className="error-exit-button" onClick={handleExit}>X</div>
        </label>
    )
}

const DragClone = (props) => {
    // Component of ProfilePage.

    return (
        <div className='drag-item-clone' style={props.cloneStyle}
        onContextMenu={e => e.preventDefault()}>
            <div className="drag-description">
                {props.item}
            </div>
        </div>
    )
}