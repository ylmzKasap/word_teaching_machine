import { useState, useContext } from "react";
import { IntroImage, IntroText } from "./common/components";
import { FunctionContext } from "./QuestionPage";


export function IntroduceWord(props) {
    // Component of QuestionPage - Handled by './functions' -> generate_pages

    const [layout] = useState(Math.random());
    const {imgPath, word} = props;

    const pageItems = [
        <IntroText imgPath={imgPath} word={word} key={word + '-text'} type="intro" textAnimation="" />,
        <IntroImage imgPath={imgPath} word={word} key={word + '-image'}/> 
    ];
  
    const clickHandler = useContext(FunctionContext)['click'];
  
    function handleClick(elem) {
        if (!/^intro-text/.test(elem.target.className)) {
            clickHandler();
        }
    }

    // Children: IntroText, IntroImage.
    return (
        <div className="intro-word container-fluid" onClick={(elem) => handleClick(elem)} >
            {(layout >= .50 && window.innerWidth > 1024) ? [...pageItems] : [...pageItems.reverse()]}
        </div>
    )
}