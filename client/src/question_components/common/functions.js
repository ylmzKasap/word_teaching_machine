import { IntroduceWord } from '../IntroduceWord';
import { AskFromText } from '../AskFromText';
import { AskFromPicture } from '../AskFromPicture';


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


export function getRandomOptions(Component, props) {
	// Creates random options with ImageOptionBox and TextOptionBox.
	// Called by ImageOptions and TextOptions.

	let allOptionsCopy = [...props.allPaths];
	let correctOption = props.imgPath;
	let options = [];
	let optionCount = allOptionsCopy.length;
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
	options = options.map((iPath, index) => {
		let pathStem = iPath.split('.')[0];
		return <Component
			isCorrect={iPath === correctOption} imgPath={iPath} word={pathStem} number={index + 1}
			key={pathStem + `-option-${index}`} animateImg={props.animateImg} />
	})

	return [...options];
} 


export function generate_pages(paths) {
	// Used by QuestionPage.

	function disperse_questions(array) {
		let copyArray = [...array];
		for (let i = 0; i < array.length; i++) {
			let randomRange = Math.random();
			randomRange = (randomRange < .05) ? 1 : (randomRange < .20) ? 3 : 2;
			copyArray.splice(
				copyArray.indexOf(array[i]) + randomRange, 0, 
				(i % 2 === 0)
				? {
					'component': AskFromText,
					type:'AskFromText',
					path: paths[i],
					order: i + 1}
				: {
					'component': AskFromPicture,
					type:'AskFromPicture',
					path: paths[i],
					order: i + 1}
				);
		}
		return copyArray
	}
	let pages = [];
	for (let i = 0; i < paths.length; i++) {
		pages.push({
			'component': IntroduceWord,
			type:'IntroduceWord',
			path: paths[i],
			order: i + 1
		});
	}
	pages = disperse_questions(pages);
	return [...pages];
}

export function process_page_object(obj, allPaths) {
	const keyType = (obj.type === 'IntroduceWord') ? '-intro-' : '-question-';
	const wordStem = obj.path.split('.')[0];

	let allWords = allPaths.map(p => p.split('.')[0]);
	return <obj.component 
		allPaths={allPaths} allWords={allWords} 
		imgPath={obj.path} word={wordStem} key={wordStem + keyType + String(obj.order)} />
}