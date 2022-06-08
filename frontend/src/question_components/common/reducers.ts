import { optionStyleDefaults } from "../types/QuestionPageDefaults";

export const handleStyles = (
  state: {animation: string; numStyle: string;},
  action: {type: string; answer: string}) => {
    
    if (action.answer === "incorrect") {
      return {
        animation: "incorrect-answer",
        numStyle: "incorrect-image-number"
      };
    } else if (action.answer === "correct" && action.type === "text") {
      return {
        animation: "correct-answer",
        numStyle: "correct-number"
      };
    } else if (action.answer === "correct" && action.type === "image") {
      return {
        animation: "correct-answer",
        numStyle: "correct-image-number"
      };
    } else {
      return optionStyleDefaults;
    }
  };