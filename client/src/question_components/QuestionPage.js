import { useState, createContext } from "react";
import { generate_pages, randint } from "./common/functions";
import { renderMain } from "..";
import { ProfilePage } from "../profile_components/ProfilePage";


export const FunctionContext = createContext();
export var audioMixer = new Audio();

export function QuestionPage(props) {
    // Rendered by '../index.js' -> 'Deck' component.

    const [pages, setPages] = useState(generate_pages(props.allPaths));
    const [page, setPage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [childAnimation, setChildAnimtion] = useState('load-page');
    const [correctFound, setCorrectFound] = useState(false);  

    function goBack() {
        if (page > 0) {
            setPage(cPage => cPage - 1);
            setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
            setProgress(parseInt(((page - 1) * 110) / pages.length) + 5);
        }
    }

    function goForward() {
        if (page < pages.length) {
            setPage(cPage => cPage + 1);
            setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
            setProgress(parseInt(((page + 1) * 110) / pages.length) + 5);
            if (page === pages.length - 1) {
                renderMain(ProfilePage, {dir: props.directory});
            }
        }
    }

    function handleClick() {
        setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
        setPage(cPage => cPage + 1);
        setProgress(parseInt((page * 110) / pages.length) + 5);
        if (page === pages.length - 1) {
            renderMain(ProfilePage, {dir: props.directory});
        }
    }

    function handleIncorrect(Component) {
        if (!correctFound) {
            let restOfArray = pages.slice(page + 1);
            let currentPage = pages[page];

            for (let i = 0; i < restOfArray.length; i++) {
                if (restOfArray[i].props.imgPath === currentPage.props.imgPath) {
                    return null
                }
            }

            let wordStem = currentPage.props.imgPath.split('.')[0];
            let repeatPage = <Component 
                allPaths={props.allPaths} imgPath={currentPage.props.imgPath}
                allWords={currentPage.props.allWords} word={currentPage.props.word}
                key={`${wordStem}-${pages.length + 1}`} />
            let copyPages = [...pages];
            copyPages.splice(copyPages.indexOf(currentPage) + randint(2, 4), 0, repeatPage);
            setPages(copyPages);
            setProgress(parseInt(((page - 1) * 110) / pages.length));
        }   
    }

    // Children: NavBar, ProgressBar, QuestionBody.
    return (
        <div className="question-page">
            <NavBar goBack={goBack} goForward={goForward} directory={props.directory} />
            <ProgressBar width={progress} />
            {/* Context consumed by AskFromPicture, AskFromText, IntroduceWord */}
            <FunctionContext.Provider value={
                {'click': handleClick, 'incorrect': handleIncorrect,
                'correctFound': correctFound, 'setCorrectFound': setCorrectFound}}>
                    <QuestionBody animation={childAnimation} page={pages[page]} />
            </FunctionContext.Provider>
        </div>
    )
}


function NavBar(props) {
    // Component of QuestionPage.
    
    return (
        <div className="navbar sticky-top navbar-dark bg-dark">
            <i className="fas fa-arrow-left arrow" onClick={props.goBack}></i>
            <i className="fas fa-home" onClick={() => renderMain(ProfilePage, {dir: props.directory})}></i>
            <i className="fas fa-arrow-right arrow" onClick={props.goForward}></i>
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