import { useState, createContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { generate_pages, process_page_object, randint } from "./common/functions";
import { NotFound } from "../profile_components/common/components";

export const FunctionContext = createContext();
export var audioMixer = new Audio();

export function QuestionPage() {
    // Rendered by '../index.js' -> 'Deck' component.

    const {state} = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    
    const [directory] = useState(state ? state.directory : params.dirId);
    const [rootDirectory, setRootDirectory] = useState("");
    const [words, setWords] = useState(null);
    const [pages, setPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(0);
    const [progress, setProgress] = useState(0);
    const [childAnimation, setChildAnimtion] = useState('load-page');
    const [correctFound, setCorrectFound] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    // Get the content from state or fetch it.
    useEffect(() => {
        if (state) {
            setWords(state.allPaths);
            setRootDirectory(state.rootDirectory);
        } else { 
            var { username } = params;
            let deck_id = params.deckId;
            axios.get(`/u/${username}/${directory}/item/${deck_id}`)
                .then(response => setWords(response.data.words.split(',')))
                .catch(() => setFetchError(true));
            axios.get(`/u/${username}`)
                .then(response => setRootDirectory(response.data.root_id))
                .catch(() => setFetchError(true))
            }}, []); 
    
    // Generate pages from words.
    useEffect(() => {
        if (words !== null && pages === null) {
            setPages(generate_pages(words));
        }        
    }, [words]);

    function goBack() {
        if (pageNumber > 0) {
            setPageNumber(pageN => pageN - 1);
            setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
            setProgress(parseInt(((pageNumber - 1) * 110) / pages.length) + 5);
        }
    }

    function goForward() {
        const dirToGo = (parseInt(directory) === rootDirectory || fetchError) ? "" : `/${directory}`;
        if (pageNumber < pages.length) {
            setPageNumber(pageN => pageN + 1);
            setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
            setProgress(parseInt(((pageNumber + 1) * 110) / pages.length) + 5);
        } 
        if (pageNumber === pages.length - 1) {
            navigate(`/user/${params.username}${dirToGo}`);
        }
    }

    function handleClick() {
        const dirToGo = (parseInt(directory) === rootDirectory || fetchError) ? "" : `/${directory}`;
        if (pageNumber < pages.length) {
            setPageNumber(pageN => pageN + 1);
            setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
            setProgress(parseInt((pageNumber * 110) / pages.length) + 5);
        } 
        if (pageNumber === pages.length - 1) {
            navigate(`/user/${params.username}${dirToGo}`);
        }
    }

    function handleIncorrect() {
        if (!correctFound) {
            let restOfArray = pages.slice(pageNumber + 1);
            let currentPage = pages[pageNumber];

            for (let i = 0; i < restOfArray.length; i++) {
                if (restOfArray[i].path === currentPage.path) {
                    return null
                }
            }

            let repeatPage = {
                'component': currentPage.component,
                type: currentPage.type,
                path: currentPage.path,
                order: pages.length + 1
            };
            let copyPages = [...pages];
            
            copyPages.splice(pageNumber + randint(2, 4), 0, repeatPage);
            setPages(copyPages);
            setProgress(parseInt(((pageNumber - 1) * 110) / pages.length));
        }   
    }

    // Children: NavBar, ProgressBar, QuestionBody.
    return (
        <div className="question-page">
            <NavBar goBack={goBack} goForward={goForward} directory={directory} root={rootDirectory}
                pageNumber={pageNumber} user={params.username} navigate={navigate} fetchError={fetchError} />
            <ProgressBar width={progress} />
            {/* Context consumed by AskFromPicture, AskFromText, IntroduceWord */}
            <FunctionContext.Provider value={
                {'clickHandler': handleClick,
                'handleIncorrect': handleIncorrect,
                'correctFound': correctFound,
                'setCorrectFound': setCorrectFound}}>
                    {(pages !== null && pageNumber < pages.length) && 
                        <QuestionBody
                            animation={childAnimation}
                            page={process_page_object(pages[pageNumber], words)} />}
            </FunctionContext.Provider>
            {fetchError && <NotFound />}
        </div>
    )
}


function NavBar(props) {
    // Component of QuestionPage.
    const directory = (parseInt(props.directory) === props.root || props.fetchError) ? "" : `/${props.directory}`;

    return (
        <div className="navbar sticky-top navbar-dark bg-dark">
            {(!props.fetchError && props.pageNumber > 0) && <i className="fas fa-arrow-left arrow" onClick={props.goBack}></i>}
            <i className="fas fa-home" onClick={() => props.navigate(`/user/${props.user}${directory}`)}></i>
            {!props.fetchError && <i className="fas fa-arrow-right arrow" onClick={props.goForward}></i>}
        </div>
    )
}
  

function ProgressBar(props) {
    // Component of QuestionPage.

    return (
        <div id="progress-bar" style={{width: `${props.width}%`}} >
        </div>
    )
}


function QuestionBody(props) {
    // Component of QuestionPage.

    // Children: (Indirect) IntroduceWord, AskFromPicture, AskFromText.
    return (
    <div className={`main-page ${props.animation}`}>
      {props.page}
    </div>
    )
}

export default QuestionPage;