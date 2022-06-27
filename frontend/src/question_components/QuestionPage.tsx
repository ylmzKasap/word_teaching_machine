/* eslint-disable react-hooks/exhaustive-deps */
import { useState, createContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  generate_pages,
  process_page_object,
  randint,
} from "./common/functions";
import { NotFound } from "../profile_components/common/components";
import * as types from "./types/QuestionPageTypes";
import * as defaults from "./types/QuestionPageDefaults";

export const QuestionContext = createContext<types.QuestionContextTypes | undefined>(undefined);
export var audioMixer = new Audio();

export const QuestionPage: React.FC = () => {
  // Rendered by '../index.js' -> 'Deck' component.

  const location = useLocation();
  const state = location.state as types.LocationTypes;
  const params = useParams<types.ParamTypes>();
  const navigate = useNavigate();

  const [directory] = useState(state ? state.directory : params.dirId ? parseInt(params.dirId) : 0);
  const [rootDirectory, setRootDirectory] = useState(0);
  const [wordInfo, setWordInfo] = useState<types.WordInfoTypes>(defaults.wordInfoDefault);
  const [pages, setPages] = useState<types.PageTypes>(defaults.questionPageDefault);
  const [pageNumber, setPageNumber] = useState(0);
  const [progress, setProgress] = useState(0);
  const [childAnimation, setChildAnimtion] = useState("load-page");
  const [correctFound, setCorrectFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Get the content from state or fetch it.
  useEffect(() => {
    if (state) {
      setWordInfo({
        words: state.words,
        target_language: state.target_language,
        source_language: state.source_language,
        show_translation: state.show_translation
      });
      setRootDirectory(state.rootDirectory);
    } else {
      var { username } = params;
      let deck_id = params.deckId;
      axios
        .get(`/u/${username}/${directory}/item/${deck_id}`)
        .then((response) => setWordInfo({
          words: response.data.words,
          target_language: response.data.target_language,
          source_language: response.data.source_language,
          show_translation: response.data.show_translation
        }))
        .catch(() => setFetchError(true));
      axios
        .get(`/u/${username}`)
        .then((response) => setRootDirectory(response.data.root_id))
        .catch(() => setFetchError(true));
    }
  }, []);

  // Generate pages from words.
  useEffect(() => {
    if (wordInfo.target_language !== "" && pages[0].component === null) {
      setPages(generate_pages(wordInfo));
    }
  }, [wordInfo]);

  function goBack() {
    if (pageNumber > 0) {
      setPageNumber((pageN) => pageN - 1);
      setChildAnimtion((cAnim) =>
        cAnim === "load-page" ? "load-page-2" : "load-page"
      );
      setProgress(((pageNumber - 1) * 110) / pages.length + 5);
    }
  }

  function goForward() {
    const dirToGo =
      directory === rootDirectory || fetchError
        ? ""
        : `/${directory}`;
    if (pageNumber < pages.length) {
      setPageNumber((pageN) => pageN + 1);
      setChildAnimtion((cAnim) =>
        cAnim === "load-page" ? "load-page-2" : "load-page"
      );
      setProgress(((pageNumber + 1) * 110) / pages.length + 5);
    }
    if (pageNumber === pages.length - 1) {
      navigate(`/user/${params.username}${dirToGo}`);
    }
  }

  function handleClick() {
    const dirToGo =
      directory === rootDirectory || fetchError
        ? ""
        : `/${directory}`;
    if (pageNumber < pages.length) {
      setPageNumber((pageN) => pageN + 1);
      setChildAnimtion((cAnim) =>
        cAnim === "load-page" ? "load-page-2" : "load-page"
      );
      setProgress((pageNumber * 110) / pages.length + 5);
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
        if (restOfArray[i].word.image_path === currentPage.word.image_path) {
          return;
        }
      }

      let repeatPage = {
        component: currentPage.component,
        type: currentPage.type,
        word: currentPage.word,
        order: pages.length + 1,
      };
      let copyPages = [...pages];

      copyPages.splice(pageNumber + randint(2, 4), 0, repeatPage);
      setPages(copyPages);
      setProgress(((pageNumber - 1) * 110) / pages.length);
    }
  }

  // Children: NavBar, ProgressBar, QuestionBody.
  return (
    <div className="question-page">
      <NavBar
        goBack={goBack}
        goForward={goForward}
        directory={directory}
        root={rootDirectory}
        pageNumber={pageNumber}
        user={params.username}
        fetchError={fetchError}
      />
      <ProgressBar width={progress} />
      {/* Context consumed by AskFromPicture, AskFromText, IntroduceWord */}
      <QuestionContext.Provider
        value={{
          handleParentClick: handleClick,
          handleIncorrect: handleIncorrect,
          correctFound: correctFound,
          setCorrectFound: setCorrectFound,
        }}
      >
        {pages[0].component !== null && pageNumber < pages.length && (
          <QuestionBody
            animation={childAnimation}
            page={process_page_object(pages[pageNumber], wordInfo)}
          />
        )}
      </QuestionContext.Provider>
      {fetchError && <NotFound />}
    </div>
  );
};

const NavBar: React.FC<types.NavBarTypes> = (props) => {
  // Component of QuestionPage.
  const navigate = useNavigate();
  const directory =
    props.directory === props.root || props.fetchError
      ? ""
      : `/${props.directory}`;

  return (
    <div className="navbar">
      {!props.fetchError && props.pageNumber > 0 && (
        <i className="fas fa-arrow-left arrow" onClick={props.goBack}></i>
      )}
      <i
        className="fas fa-home"
        onClick={() => navigate(`/user/${props.user}${directory}`)}
      ></i>
      {!props.fetchError && (
        <i className="fas fa-arrow-right arrow" onClick={props.goForward}></i>
      )}
    </div>
  );
};

const ProgressBar: React.FC<{width: number}> = ({width}) => {
  // Component of QuestionPage.

  return <div id="progress-bar" style={{ width: `${width}%` }}></div>;
};

const QuestionBody: React.FC<types.QuestionBodyTypes> = ({animation, page}) => {
  // Component of QuestionPage.

  // Children: (Indirect) IntroduceWord, AskFromPicture, AskFromText.
  return <div className={`main-page ${animation}`}>{page}</div>;
};

export default QuestionPage;
