// AskFromText -> IntroText | ImageOptions -> ImageOptionBox -> NumberBox

import { createContext, useContext, useState, useEffect } from "react";
import { IntroText, NumberBox } from "./common/components";
import { getRandomOptions, playAndCatchError } from "./common/functions";
import { audioMixer, FunctionContext } from "./QuestionPage";


const textAnimContext = createContext();


export function AskFromText(props) {
    // Component of QuestionPage - Handled by './functions' -> generate_pages

    const [textAnimation, setTextAnimation] = useState("");
    const {allPaths, allWords, imgPath, word} = props;

    // Children: ImageOptions, './shared' -> IntroText.
    return (
        <div className={"ask-from-text-box"}>
            <IntroText imgPath={imgPath} word={word} type="ask-from" textAnimation={textAnimation} />
            <textAnimContext.Provider value={setTextAnimation}>
                {/* Context consumed by ImageOptionBox. */}
                
                <ImageOptions allPaths={allPaths} allWords={allWords}
                    imgPath={imgPath} word={word} id={"image-option"} />

            </textAnimContext.Provider>
        </div>
    )
}


function ImageOptions(props) {
    // Component of AskFromText.

    const [options] = useState(getRandomOptions(ImageOptionBox, props));
  
    // Children: ImageOptionBox.
    return (
        <div className="image-options">
            {options}
        </div>
    )
}


function ImageOptionBox(props) {
    // Component of ImageOptions - Handled by './functions' -> getRandomOptions.

    const [animation, setAnimation] = useState("");
    const [numStyle, setNumStyle] = useState("");
    const [timeouts, handleTimeouts] = useState({});
  
    const incorrectHandler = useContext(FunctionContext)['incorrect'];
    const clickHandler = useContext(FunctionContext)['click'];
    const correctFound = useContext(FunctionContext)['correctFound'];
    const setCorrectFound = useContext(FunctionContext)['setCorrectFound'];
    const animateText = useContext(textAnimContext);
  
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
    }, [timeouts]);
  
  
    function handleClick() {
        let errorMessage = 'Sound interrupted by user.';
        if (props.isCorrect === true) {
            if (animation === "") {
            setCorrectFound(true);
            audioMixer.src = "media\\correct.mp3";
            playAndCatchError(audioMixer, errorMessage);
            setAnimation("correct-answer");
            setNumStyle("correct-image-number");
            handleTimeouts({
                'sound': setTimeout(() => {
                animateText('emphasize');
                audioMixer.src = `media\\${props.word}.mp3`;
                playAndCatchError(audioMixer, errorMessage);
                }, 1000),
                'click': setTimeout(() =>
                clickHandler(), 2000)})
            }
        } else {
            if (animation === "") {
                audioMixer.src = "media\\incorrect.mp3";
                playAndCatchError(audioMixer, errorMessage);
                setAnimation("incorrect-answer");
                setNumStyle("incorrect-image-number");
                if (!correctFound) {
                    incorrectHandler(AskFromText);
                }
            }
        }
    }
  
    // Children: './shared/' -> NumberBox.
    return (
        <div className={`image-option-box ${animation}`} onClick={handleClick} >
            <img id={props.id} className="image-option" src={`media\\${props.imgPath}`} alt={props.word} />
            <NumberBox type="image" number={props.number} style={numStyle} />
        </div>
    )
}