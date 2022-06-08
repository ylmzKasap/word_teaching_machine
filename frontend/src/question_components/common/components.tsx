import { useState, useEffect } from "react";
import { playAndCatchError, is_mobile } from "./functions";
import { audioMixer } from "../QuestionPage";
import * as types from "../types/QuestionPageTypes";
import { introTextTimeoutDefaults } from "../types/QuestionPageDefaults";

export const IntroImage: React.FC<types.IntroImageTypes> = (props) => {
  // Shared by IntroduceWord and AskFromPicture.

  let imgAnim = props.animation === undefined ? "" : props.animation;
  return (
    <div className={`intro-img-box ${imgAnim}`}>
      <img
        className="intro-img"
        src={`media//${props.imgPath}`}
        alt={props.word}
      />
    </div>
  );
};

export const IntroText: React.FC<types.IntroTextTypes> = (props) => {
  // Shared by IntroduceWord and AskFromText.

  const [isAnimated, setIsAnimated] = useState(false);
  const [isMobile] = useState(is_mobile);
  const [timeouts, handleTimeouts] = useState(introTextTimeoutDefaults);

  const useMountEffect = () =>
    useEffect(() => {
      handleTimeouts({
        "intro-sound": window.setTimeout(() => playSound(), 200),
      });
      setIsAnimated(true);
    }, []);

  useMountEffect();

  useEffect(() => {
    return () => {
      for (let key in timeouts) {
        window.clearTimeout(timeouts[key as keyof typeof introTextTimeoutDefaults]);
      }
    };
  }, [timeouts]);

  function toggleAnimation() {
    setIsAnimated((animated) => !animated);
  }

  function playSound() {
    audioMixer.src = `media\\${props.word}.mp3`;
    audioMixer.load();
    playAndCatchError(audioMixer, "Playback prevented by browser.");
  }

  const pageMessage = isMobile ? "Tap" : "Click";
  const pageIcon = isMobile ? "fas fa-fingerprint" : "fa fa-mouse-pointer";

  return (
    <label className={`text-intro-box ${props.animation}`}>
      <p
        className={`${props.type}-text ${isAnimated ? "emphasize" : ""}`}
        onClick={() => {
          toggleAnimation();
          playSound();
        }}
        onAnimationEnd={toggleAnimation}
      >
        {props.word}
      </p>
      {props.type === "intro" && (
        <div className="continue">
          <i className={`continue-icon ${pageIcon}`}></i> {pageMessage} anywhere
        </div>
      )}
    </label>
  );
};

export const NumberBox: React.FC<types.NumberBoxPropTypes> = (props) => {
  // Shared by AskFromPicture and AskFromText.
  return (
    <label className={`${props.type}-number-box ${props.style}`}>
      {props.number}
    </label>
  );
};
