// AskFromPicture -> TextOptions -> TextOptionBox -> NumberBox | IntroImage

import { useState, useContext, useEffect, useReducer } from "react";
import { IntroImage, NumberBox } from "./common/components";
import { playAndCatchError, getRandomOptions } from "./common/functions";
import { handleStyles } from "./common/reducers";
import { audioMixer, QuestionContext } from "./QuestionPage";
import { optionStyleDefaults, timeoutDefaults } from "./types/QuestionPageDefaults";
import * as types from "./types/QuestionPageTypes";

export const AskFromPicture: React.FC<types.QuestionComponentPropTypes> = (
  {wordInfo, word}) => {
  // Component of QuestionPage - Handled by './functions' -> generate_pages

  const [imageAnimation, setImageAnimtion] = useState("");
  const [layout] = useState(Math.random());

  function animateImage() {
    setImageAnimtion("emphasize");
  }

  const pageItems = [
    <TextOptions
      wordInfo={wordInfo}
      word={word}
      animate={animateImage}
      key={word + "-option"}
    />,

    <IntroImage
      wordInfo={wordInfo}
      word={word}
      animation={imageAnimation}
      key={word + "-image"}
    />,
  ];

  // Children: TextOptions, IntroImage.
  return (
    <div className="ask-from-picture">
      {layout >= 0.25 && window.innerWidth > 1024
        ? [...pageItems]
        : [...pageItems.reverse()]}
    </div>
  );
};

const TextOptionBox: React.FC<types.OptionTypes> = (props) => {
  // Component of TextOptions - Hanled by './functions' -> getRandomOptions.

  const [optionStyle, setOptionStyle] = useReducer(
    handleStyles, optionStyleDefaults);
  const [timeouts, setTimeouts] = useState(timeoutDefaults);

  const { handleParentClick, handleIncorrect, correctFound, setCorrectFound } =
    useContext(QuestionContext  ) as types.QuestionContextTypes;

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
        setOptionStyle({type: "text", answer: "correct"});
        setTimeouts({
          sound: window.setTimeout(() => {
            props.animate();
            audioMixer.src = `media/${props.word[`${props.wordInfo.target_language}_sound_path`]}`;
            playAndCatchError(audioMixer, errorMessage);
          }, 1000),
          click: window.setTimeout(() => handleParentClick(), 2000),
        });
      }
    } else {
      if (optionStyle.animation === "") {
        audioMixer.src = "media\\incorrect.mp3";
        playAndCatchError(audioMixer, errorMessage);
        setOptionStyle({type: "text", answer: "incorrect"});
        if (!correctFound) {
          handleIncorrect();
        }
      }
    }
  }

  // Children: './shared' -> NumberBox.
  return (
    <label
      className={`text-option ${optionStyle.animation}`}
      key={props.number}
      onClick={handleClick}
    >
      <NumberBox type="text" number={props.number} style={optionStyle.numStyle} />
      <div className="option-text">{props.word[props.wordInfo.target_language]}</div>
    </label>
  );
};

const TextOptions: React.FC<types.TextOptionsPropsTypes> = (props) => {
  // Component of AskFromPicture.
  const [options] = useState(getRandomOptions(TextOptionBox, props));

  // Children: TextOptionBox.
  return <div className="text-options">{options}</div>;
};
