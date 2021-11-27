import React, { useState, useEffect, useContext } from 'react';
import * as utils from './functions.js';
import { FunctionContext } from './index.js'

var audioMixer = new Audio();


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
    audioMixer.src = `./sounds/${props.word}.mp3`;
    audioMixer.load();
    utils.playAndCatchError(audioMixer, "Playback prevented by browser.")
  }

  const pageMessage = isMobile ? 'Tap' : 'Click';
  const pageIcon = isMobile ? "fas fa-fingerprint" : "fa fa-mouse-pointer";

  return (
    <label className="text-intro-box" >
      <p className={`intro-text ${(isAnimated) ? 'emphasize' : ''}`} 
         onClick={() => {toggleAnimation(); playSound();}} onAnimationEnd={toggleAnimation}>
           {props.word}</p>
      <div className="continue">
        <i className={`continue-icon ${pageIcon}`}></i> {pageMessage} anywhere</div>
    </label>
  ) 
}



function IntroImage(props) {
  var imgLink = `./images/${props.word}.png`;
  return (
    <div className={`intro-img-box ${props.imageAnimation}`}>
      <img className="intro-img" src={imgLink} alt={props.word} />
    </div>
    )
}


export function IntroduceWord(props) {
  const [layout] = useState(Math.random());
  const pageItems = [
    <IntroText word={props.word} key={props.word + '-text'}/>,
    <IntroImage word={props.word} key={props.word + '-image'} /> 
  ];

  const clickHandler = useContext(FunctionContext)['click'];

  function handleClick(elem) {
    if (!/^intro-text/.test(elem.target.className)) {
      clickHandler();
      }
  }
  return (
    <div className="intro-word container-fluid" onClick={(elem) => handleClick(elem)} >
      {(layout >= .50 && window.innerWidth > 480) ? [...pageItems] : [...pageItems.reverse()]}
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
        audioMixer.src = "./sounds/correct.mp3";
        utils.playAndCatchError(audioMixer, errorMessage);
        setAnimation("correct-answer");
        setNumStyle("correct-number");
        handleTimeouts({
          'sound': setTimeout(() => {
            props.animateImg();
            audioMixer.src = `./sounds/${props.word}.mp3`;
            utils.playAndCatchError(audioMixer, errorMessage);
            }, 1000),
          'click': setTimeout(() =>
            clickHandler(), 2000)}
        )
      }
    } 
    else {
      if (animation === "") {
          audioMixer.src = "./sounds/incorrect.mp3";
          utils.playAndCatchError(audioMixer, errorMessage);
          setAnimation("incorrect-answer");
          setNumStyle("incorrect-number");
        if (!correctFound) {
          incorrectHandler();
        }
      }
    }
  }
  return (
    <label className={`text-option ${animation}`} key={props.number} onClick={handleClick}>
        <NumberBox number={props.number} style={numStyle} />
        <div className="option-text">
          {props.word}
        </div>
    </label>
  )
}



function TextOptions(props) {
  const [options] = useState(utils.getRandomOptions(
    props.allWords, props.word, TextOptionBox, props));

  return (
    <div className="text-options">
        {options}
    </div>
  )
}



function NumberBox(props) {
  return (
    <div className={`number-box ${props.style}`}>
      {props.number}
    </div>
  )
}


export function AskFromPicture(props) {
  const [imageAnimation, setImageAnimtion] = useState("");
  const [layout] = useState(Math.random());

  const {word, allWords} = props;
  const pageItems = [
    <IntroImage word={word} imageAnimation={imageAnimation} key={word + '-image'} />,
    <TextOptions
      allWords={allWords} word={word} animateImg={animateImage} key={word + '-option'} />
  ]

  function animateImage() {
    setImageAnimtion("emphasize");
  }

  return (
    <div className="ask-from-picture container-fluid" >
      {(layout >= .25 && window.innerWidth > 480) ? [...pageItems] : [...pageItems.reverse()]}
    </div>
  )
}


function MainQuestionPage(props) {
    return (
    <div className={`main-page ${props.animation}`}>
      {props.page}
    </div>
    )
}

export default MainQuestionPage;
