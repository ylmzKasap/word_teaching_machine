import React, { useState, useContext } from "react";
import { IntroImage, IntroText } from "./common/components";
import { QuestionContext } from "./QuestionPage";

import {
  QuestionComponentPropTypes,
  QuestionContextTypes,
} from "./types/QuestionPageTypes";

export const IntroduceWord: React.FC<QuestionComponentPropTypes> = (props) => {
  // Component of QuestionPage - Handled by './functions' -> generate_pages

  const [layout] = useState(Math.random());
  const { wordInfo, word } = props;

  const pageItems = [
    <IntroText
      wordInfo={wordInfo}
      word={word}
      key={word + "-text"}
      type="intro"
      animation=""
    />,
    <IntroImage wordInfo={wordInfo} word={word} key={word + "-image"} />,
  ];

  const { handleParentClick } = useContext(
    QuestionContext
  ) as QuestionContextTypes;

  function handle_click(event: React.MouseEvent) {
    const element = event.target as HTMLInputElement;
    if (!/^intro-text/.test(element.className)) {
      handleParentClick();
    }
  }

  // Children: IntroText, IntroImage.
  return (
    <div
      className="intro-word container-fluid"
      onClick={(elem) => handle_click(elem)}
    >
      {layout >= 0.5 && window.innerWidth > 1024
        ? [...pageItems]
        : [...pageItems.reverse()]}
    </div>
  );
};
