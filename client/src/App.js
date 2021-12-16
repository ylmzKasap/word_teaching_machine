import React, { useState, useEffect, useContext, createContext } from 'react';
import * as utils from './functions.js';
import { renderMain, ProfilePage } from './index.js';

var audioMixer = new Audio();


function NavBar(props) {
  return (
    <div className="navbar sticky-top navbar-dark bg-dark">
      <i className="fas fa-arrow-left arrow" onClick={props.goBack}></i>
      <i className="fas fa-home" onClick={() => renderMain(ProfilePage)}></i>
      <i className="fas fa-arrow-right arrow" onClick={props.goForward}></i>
    </div>
  )
}

function ProgressBar(props) {
  return (
    <div id="progress-bar" style={{width: `${props.width}%`}} >
    </div>
  )
}


function IntroText(props) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [isMobile] = useState(utils.is_mobile);

  const useMountEffect = () => 
    useEffect(() => {
      setTimeout(() => playSound(), 200);
      setIsAnimated(true);
    }, []);

  useMountEffect();

  function toggleAnimation() {
    setIsAnimated(animated => !animated);
  }

  function playSound() {
    audioMixer.src = `${props.word}.mp3`;
    audioMixer.load();
    utils.playAndCatchError(audioMixer, "Playback prevented by browser.")
  }

  const pageMessage = isMobile ? 'Tap' : 'Click';
  const pageIcon = isMobile ? "fas fa-fingerprint" : "fa fa-mouse-pointer";

  return (
    <label className={`text-intro-box ${props.textAnimation}`} >
      <p className={`${props.type}-text ${(isAnimated) ? 'emphasize' : ''}`} 
         onClick={() => {toggleAnimation(); playSound();}} onAnimationEnd={toggleAnimation}>
           {props.word}</p>
      {props.type === "intro" &&
        <div className="continue">
          <i className={`continue-icon ${pageIcon}`}></i> {pageMessage} anywhere</div>
    }
    </label>
  ) 
}



function IntroImage(props) {
  let imgLink = `${props.word}.png`;
  let imgAnim = (props.imageAnimation === undefined) ? "" : props.imageAnimation;
  return (
    <div className={`intro-img-box ${imgAnim}`}>
      <img className="intro-img" src={imgLink} alt={props.word} />
    </div>
    )
}


export function IntroduceWord(props) {
  const [layout] = useState(Math.random());
  const pageItems = [
    <IntroText word={props.word} key={props.word + '-text'} type="intro" textAnimation="" />,
    <IntroImage word={props.word} key={props.word + '-image'}/> 
  ];

  const clickHandler = useContext(FunctionContext)['click'];

  function handleClick(elem) {
    if (!/^intro-text/.test(elem.target.className)) {
      clickHandler();
      }
  }
  return (
    <div className="intro-word container-fluid" onClick={(elem) => handleClick(elem)} >
      {(layout >= .50 && window.innerWidth > 1024) ? [...pageItems] : [...pageItems.reverse()]}
    </div>
  )
}



function TextOptionBox(props) {
  const [animation, setAnimation] = useState("");
  const [numStyle, setNumStyle] = useState("");
  const [timeouts, handleTimeouts] = useState({});

  const incorrectHandler = useContext(FunctionContext)['incorrect'];
  const clickHandler = useContext(FunctionContext)['click'];
  const correctFound = useContext(FunctionContext)['correctFound'];
  const setCorrectFound = useContext(FunctionContext)['setCorrectFound'];

  const useMountEffect = () => 
    useEffect(() => {
      setCorrectFound(false);
    }, []);

  useMountEffect();

  useEffect(() => {
    return () => {
      for (let key in timeouts) {
        clearTimeout(timeouts[key]);
      }
    }
  }, [timeouts])

  function handleClick() {
    let errorMessage = 'Sound interrupted by user.';
    if (props.isCorrect === true) {
      if (animation === "") {
        setCorrectFound(true);
        audioMixer.src = "correct.mp3";
        utils.playAndCatchError(audioMixer, errorMessage);
        setAnimation("correct-answer");
        setNumStyle("correct-number");
        handleTimeouts({
          'sound': setTimeout(() => {
            props.animateImg();
            audioMixer.src = `${props.word}.mp3`;
            utils.playAndCatchError(audioMixer, errorMessage);
            }, 1000),
          'click': setTimeout(() =>
            clickHandler(), 2000)}
        )
      }
    } 
    else {
      if (animation === "") {
          audioMixer.src = "incorrect.mp3";
          utils.playAndCatchError(audioMixer, errorMessage);
          setAnimation("incorrect-answer");
          setNumStyle("incorrect-number");
        if (!correctFound) {
          incorrectHandler(AskFromPicture);
        }
      }
    }
  }
  return (
    <label className={`text-option ${animation}`} key={props.number} onClick={handleClick}>
        <NumberBox type="text" number={props.number} style={numStyle} />
        <div className="option-text">
          {props.word}
        </div>
    </label>
  )
}



function TextOptions(props) {
  const [options] = useState(utils.getRandomOptions(TextOptionBox, props));

  return (
    <div className="text-options">
        {options}
    </div>
  )
}



function NumberBox(props) {
  return (
    <label className={`${props.type}-number-box ${props.style}`}>
      {props.number}
    </label>
  )
}


export function AskFromPicture(props) {
  const [imageAnimation, setImageAnimtion] = useState("");
  const [layout] = useState(Math.random());

  const {word, allWords} = props;
  const pageItems = [
    <TextOptions
      allWords={allWords} word={word} animateImg={animateImage} key={word + '-option'} />,
    <IntroImage word={word} imageAnimation={imageAnimation} key={word + '-image'} />    
  ]

  function animateImage() {
    setImageAnimtion("emphasize");
  }

  return (
    <div className="ask-from-picture container-fluid" >
      {(layout >= .25 && window.innerWidth > 1024) ? [...pageItems] : [...pageItems.reverse()]}
    </div>
  )
}



function ImageOptionBox(props) {
  const [animation, setAnimation] = useState("");
  const [numStyle, setNumStyle] = useState("");
  const [timeouts, handleTimeouts] = useState({});

  const incorrectHandler = useContext(FunctionContext)['incorrect'];
  const clickHandler = useContext(FunctionContext)['click'];
  const correctFound = useContext(FunctionContext)['correctFound'];
  const setCorrectFound = useContext(FunctionContext)['setCorrectFound'];
  const animateText = useContext(textAnimContext);

  const useMountEffect = () => 
    useEffect(() => {
      setCorrectFound(false);
    }, []);

  useMountEffect();

  useEffect(() => {
    return () => {
      for (let key in timeouts) {
        clearTimeout(timeouts[key]);
      }
    }
  }, [timeouts])


  function handleClick() {
    let errorMessage = 'Sound interrupted by user.';
    if (props.isCorrect === true) {
      if (animation === "") {
        setCorrectFound(true);
        audioMixer.src = "correct.mp3";
        utils.playAndCatchError(audioMixer, errorMessage);
        setAnimation("correct-answer");
        setNumStyle("correct-image-number");
        handleTimeouts({
          'sound': setTimeout(() => {
            animateText('emphasize');
            audioMixer.src = `${props.word}.mp3`;
            utils.playAndCatchError(audioMixer, errorMessage);
            }, 1000),
          'click': setTimeout(() =>
            clickHandler(), 2000)}
        )
      }
    } 
    else {
      if (animation === "") {
          audioMixer.src = "incorrect.mp3";
          utils.playAndCatchError(audioMixer, errorMessage);
          setAnimation("incorrect-answer");
          setNumStyle("incorrect-image-number");
        if (!correctFound) {
          incorrectHandler(AskFromText);
        }
      }
    }
  }

  const imgLink = `${props.word}.png`;
  return (
    <div className={`image-option-box ${animation}`} onClick={handleClick} >
      <img id={props.id} className="image-option" src={imgLink} alt={props.word} />
      <NumberBox type="image" number={props.number} style={numStyle} />
    </div>
    )
}

function ImageOptions(props) {
  const [options] = useState(utils.getRandomOptions(ImageOptionBox, props));

  return (
    <div className="image-options">
        {options}
    </div>
  )
}


const textAnimContext = createContext();

export function AskFromText(props) {
  const [textAnimation, setTextAnimation] = useState("");

  const {allWords, word} = props;
  return (
    <div className={"ask-from-text-box"}>
      <IntroText word={props.word} type="ask-from" textAnimation={textAnimation} />
      <textAnimContext.Provider value={setTextAnimation}>
        <ImageOptions allWords={allWords} word={word} id={"image-option"} />
      </textAnimContext.Provider>
    </div>
  )
}


function QuestionBody(props) {
    return (
    <div className={`main-page ${props.animation}`}>
      {props.page}
    </div>
    )
}


const FunctionContext = createContext();

function QuestionPage(props) {
  const [pages, setPages] = useState(utils.generate_pages(props.words));
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
        renderMain(ProfilePage);
      }
    }
  }

  function handleClick() {
    setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
    setPage(cPage => cPage + 1);
    setProgress(parseInt((page * 110) / pages.length) + 5);
    if (page === pages.length - 1) {
      renderMain(ProfilePage);
    }
  }

  function handleIncorrect(Component) {
    if (!correctFound) {
      let restOfArray = pages.slice(page + 1);
      let currentPage = pages[page];
      for (let i = 0; i < restOfArray.length; i++) {
        if (restOfArray[i].props.word === currentPage.props.word) {
          return null
        }
      }
      let repeatPage = <Component 
        allWords={props.words} word={currentPage.props.word} key={pages.length + 1} />
      let copyPages = [...pages];
      copyPages.splice(copyPages.indexOf(currentPage) + utils.randint(2, 4), 0, repeatPage);
      setPages(copyPages);
      setProgress(parseInt(((page - 1) * 110) / pages.length));
    }   
  }

  return (
    <div className="question-page">
      <NavBar goBack={goBack} goForward={goForward} />
      <ProgressBar width={progress} />
      <FunctionContext.Provider value={
        {'click': handleClick, 'incorrect': handleIncorrect,
        'correctFound': correctFound, 'setCorrectFound': setCorrectFound}}>
        <QuestionBody animation={childAnimation} page={pages[page]} />
      </FunctionContext.Provider>
    </div>
  )
}

export default QuestionPage;
