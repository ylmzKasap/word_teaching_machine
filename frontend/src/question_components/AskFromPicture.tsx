// AskFromPicture -> TextOptions -> TextOptionBox -> NumberBox | IntroImage

import { useState, useContext, useEffect } from "react";
import { IntroImage, NumberBox } from "./common/components";
import { playAndCatchError, getRandomOptions } from "./common/functions";
import { audioMixer, FunctionContext } from "./QuestionPage";

export function AskFromPicture(props) {
  // Component of QuestionPage - Handled by './functions' -> generate_pages

  const [imageAnimation, setImageAnimtion] = useState("");
  const [layout] = useState(Math.random());

  const { allPaths, allWords, imgPath, word } = props;
  const pageItems = [
    <TextOptions
      allPaths={allPaths}
      allWords={allWords}
      imgPath={imgPath}
      word={word}
      animateImg={animateImage}
      key={word + "-option"}
    />,

    <IntroImage
      imgPath={imgPath}
      word={word}
      imageAnimation={imageAnimation}
      key={word + "-image"}
    />,
  ];

  function animateImage() {
    setImageAnimtion("emphasize");
  }

  // Children: TextOptions, IntroImage.
  return (
    <div className="ask-from-picture container-fluid">
      {layout >= 0.25 && window.innerWidth > 1024
        ? [...pageItems]
        : [...pageItems.reverse()]}
    </div>
  );
}

function TextOptions(props) {
  // Component of AskFromPicture.
  const [options] = useState(getRandomOptions(TextOptionBox, props));

  // Children: TextOptionBox.
  return <div className="text-options">{options}</div>;
}

function TextOptionBox(props) {
  // Component of TextOptions - Hanled by './functions' -> getRandomOptions.

  const [animation, setAnimation] = useState("");
  const [numStyle, setNumStyle] = useState("");
  const [timeouts, handleTimeouts] = useState({});

  const { clickHandler, handleIncorrect, correctFound, setCorrectFound } =
    useContext(FunctionContext);

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
    };
  }, [timeouts]);

  function handleClick() {
    let errorMessage = "Sound interrupted by user.";
    if (props.isCorrect === true) {
      if (animation === "") {
        setCorrectFound(true);
        audioMixer.src = "media\\correct.mp3";
        playAndCatchError(audioMixer, errorMessage);
        setAnimation("correct-answer");
        setNumStyle("correct-number");
        handleTimeouts({
          sound: setTimeout(() => {
            props.animateImg();
            audioMixer.src = `media\\${props.word}.mp3`;
            playAndCatchError(audioMixer, errorMessage);
          }, 1000),
          click: setTimeout(() => clickHandler(), 2000),
        });
      }
    } else {
      if (animation === "") {
        audioMixer.src = "media\\incorrect.mp3";
        playAndCatchError(audioMixer, errorMessage);
        setAnimation("incorrect-answer");
        setNumStyle("incorrect-number");
        if (!correctFound) {
          handleIncorrect();
        }
      }
    }
  }

  // Children: './shared' -> NumberBox.
  return (
    <label
      className={`text-option ${animation}`}
      key={props.number}
      onClick={handleClick}
    >
      <NumberBox type="text" number={props.number} style={numStyle} />
      <div className="option-text">{props.word}</div>
    </label>
  );
}
