// AskFromText -> IntroText | ImageOptions -> ImageOptionBox -> NumberBox

import React, { useContext, useState, useReducer, useEffect } from "react";
import { IntroText, NumberBox } from "./common/components";
import { getRandomOptions, playAndCatchError } from "./common/functions";
import { handleStyles } from "./common/reducers";
import { audioMixer, QuestionContext } from "./QuestionPage";
import * as defaults from "./types/QuestionPageDefaults";
import * as types from "./types/QuestionPageTypes";

export const AskFromText: React.FC<types.QuestionComponentPropTypes> = (
  {allPaths, allWords, imgPath, word}) => {
  // Component of QuestionPage - Handled by './functions' -> generate_pages

  const [textAnimation, setTextAnimation] = useState("");
  
  function animateText() {
    setTextAnimation("emphasize");
  }

  // Children: ImageOptions, './shared' -> IntroText.
  return (
    <div className={"ask-from-text-box"}>
      <IntroText
        imgPath={imgPath}
        word={word}
        type="ask-from"
        animation={textAnimation}
      />
        <ImageOptions
          allPaths={allPaths}
          allWords={allWords}
          imgPath={imgPath}
          word={word}
          animate={animateText}
          key={word + '-option'}
        />
    </div>
  );
};

const ImageOptionBox: React.FC<types.OptionTypes> = (props) => {
  // Component of ImageOptions - Handled by './functions' -> getRandomOptions.

  const [optionStyle, setOptionStyle] = useReducer(
    handleStyles, defaults.optionStyleDefaults);
  const [timeouts, handleTimeouts] = useState(defaults.timeoutDefaults);

  const { handleParentClick, handleIncorrect, correctFound, setCorrectFound } =
    useContext(QuestionContext) as types.QuestionContextTypes;

  const useMountEffect = () =>
    useEffect(() => {
      setCorrectFound(false);
    }, []);

  useMountEffect();

  useEffect(() => {
    return () => {
      for (let key in timeouts) {
        window.clearTimeout(timeouts[key as keyof types.TimeoutTypes]);
      }
    };
  }, [timeouts]);

  function handleClick() {
    let errorMessage = "Sound interrupted by user.";
    if (props.isCorrect === true) {
      if (optionStyle.animation === "") {
        setCorrectFound(true);
        audioMixer.src = "media\\correct.mp3";
        playAndCatchError(audioMixer, errorMessage);
        setOptionStyle({type: "image", answer: "correct"});
        handleTimeouts({
          sound: window.setTimeout(() => {
            props.animate();
            audioMixer.src = `media\\${props.word}.mp3`;
            playAndCatchError(audioMixer, errorMessage);
          }, 1000),
          click: window.setTimeout(() => handleParentClick(), 2000),
        });
      }
    } else {
      if (optionStyle.animation === "") {
        audioMixer.src = "media\\incorrect.mp3";
        playAndCatchError(audioMixer, errorMessage);
        setOptionStyle({type: "image", answer: "incorrect"});
        if (!correctFound) {
          handleIncorrect();
        }
      }
    }
  }

  // Children: './shared/' -> NumberBox.
  return (
    <div className={`image-option-box ${optionStyle.animation}`} onClick={handleClick}>
      <img
        className="image-option"
        src={`media\\${props.imgPath}`}
        alt={props.word}
      />
      <NumberBox type="image" number={props.number} style={optionStyle.numStyle} />
    </div>
  );
};

const ImageOptions: React.FC<types.TextOptionsPropsTypes> = (props) => {
  // Component of AskFromText.

  const [options] = useState(getRandomOptions(ImageOptionBox, props));

  // Children: ImageOptionBox.
  return <div className="image-options">{options}</div>;
};
