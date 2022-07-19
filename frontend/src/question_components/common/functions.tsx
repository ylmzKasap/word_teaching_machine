import { IntroduceWord } from "../IntroduceWord";
import { AskFromText } from "../AskFromText";
import { AskFromPicture } from "../AskFromPicture";
import * as types from "../types/QuestionPageTypes";

export function shuffle(array: any[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function is_mobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function randint(fromN: number, toN: number) {
  return Math.floor(Math.random() * (toN - fromN + 1)) + fromN;
}

export function playAndCatchError(mixer: HTMLAudioElement, message: string) {
  mixer.load();
  let playPromise = mixer.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.log(err);
      console.log(message);
    });
  }
}

export function getRandomOptions(
  Component: React.FC<types.OptionTypes>,
  props: types.TextOptionsPropsTypes
) {
  // Creates random options with ImageOptionBox and TextOptionBox.
  // Called by ImageOptions and TextOptions.

  const allWords = shuffle(props.wordInfo.words);
  const correctOption = props.word;
  let options = [];

  // Maximum four options.
  let optionCount = allWords.length > 4 ? 4 : allWords.length;

  // Push the correct answer.
  options.push(correctOption);

  let index = 0;
  while (options.length !== optionCount) {
    if (index > optionCount + 1) {
      break;
    }
    if (allWords[index].image_path === correctOption.image_path) {
      index++;
      continue;
    }
    options.push(allWords[index]);
    index++;
  }

  options = shuffle(options);
  options = options.map((word, index) => {
    return (
      <Component
        isCorrect={word.image_path === correctOption.image_path}
        word={word}
        wordInfo={props.wordInfo}
        number={index + 1}
        key={word[props.wordInfo.target_language] + `-option-${index}`}
        animate={props.animate}
      />
    );
  });

  return [...options];
}

export function generate_pages(wordInfo: types.WordInfoTypes) {
  // Used by QuestionPage.

  function disperse_questions(array: types.PageTypes) {
    let copyArray = [...array];
    for (let i = 0; i < array.length; i++) {
      let randomRange = Math.random();
      randomRange = randomRange < 0.05 ? 1 : randomRange < 0.2 ? 3 : 2;
      copyArray.splice(
        copyArray.indexOf(array[i]) + randomRange,
        0,
        i % 2 === 0
          ? {
              component: AskFromText,
              type: "AskFromText",
              word: wordInfo.words[i],
              order: i + 1,
            }
          : {
              component: AskFromPicture,
              type: "AskFromPicture",
              word: wordInfo.words[i],
              order: i + 1,
            }
      );
    }
    return copyArray;
  }
  let pages = [];
  for (let i = 0; i < wordInfo.words.length; i++) {
    pages.push({
      component: IntroduceWord,
      type: "IntroduceWord",
      word: wordInfo.words[i],
      order: i + 1,
    });
  }
  pages = disperse_questions(pages);
  return [...pages];
}

export const process_page_object = (
  obj: types.PageContent,
  wordInfo: types.WordInfoTypes
) => {
  const keyType = obj.type === "IntroduceWord" ? "-intro-" : "-question-";

  return (
    <>
      {obj.component && (
        <obj.component
          wordInfo={wordInfo}
          word={obj.word}
          key={obj.word + keyType + String(obj.order)}
        />
      )}
    </>
  );
};
