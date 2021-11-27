import { AskFromPicture, IntroduceWord } from './App.js'

export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

export function is_mobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function randint(fromN, toN) {
  return Math.floor(Math.random() * (toN - fromN + 1)) + fromN;
}

export function playAndCatchError(mixer, message) {
  mixer.load();
  let playPromise = mixer.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
        console.log(message);
      });
  }
}

export function getRandomOptions(allOptions, correctOption, Component, props) {
  let allOptionsCopy = [...allOptions];
  let options = [];
  let optionCount = allOptions.length;
  // Maximum four options.
  if (optionCount > 4) {
    optionCount = 4;}
  // Push the correct answer.
  options.push(correctOption);
  allOptionsCopy.splice(allOptionsCopy.indexOf(correctOption), 1);
  // Push the incorrect answers.
  for (let i = 0; i < optionCount - 1; i++) {
      let randomIndex = Math.floor(Math.random() * allOptionsCopy.length);
      options.push(allOptionsCopy[randomIndex]);
      allOptionsCopy.splice(randomIndex, 1)};
  // Shuffle and set the option indexes.
  shuffle(options);
  options = options.map((vocab, index) => {
    return <Component 
      isCorrect={vocab === correctOption} word={vocab} number={index + 1}
      key={vocab} animateImg={props.animateImg} />
    }
  )
  return [...options];
} 

export function generate_pages(words) {
  function disperse_questions(array) {
    let copyArray = [...array];
    for (let i = 0; i < array.length; i++) {
      let randomRange = Math.random();
      randomRange = (randomRange < .05) ? 1 : (randomRange < .20) ? 3 : 2;
      copyArray.splice(
        copyArray.indexOf(array[i]) + randomRange, 0, 
        <AskFromPicture allWords={words} word={words[i]} key={words[i] + '-question'} />
      );
    }
    return copyArray;
  }
  let pages = [];
  for (let i = 0; i < words.length; i++) {
    pages.push(<IntroduceWord word={words[i]} key={words[i] + '-intro'} />);}
  pages = disperse_questions(pages);
  return [...pages];
}