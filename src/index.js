import React, { useState, createContext} from 'react';
import ReactDOM from 'react-dom';
import App from './App.js'
import * as utils from './functions.js';
import './App.css'
import 'bootstrap/dist/css/bootstrap.css';


function NavBar(props) {
    return (
      <div className="navbar sticky-top navbar-dark bg-dark">
        <i className="fas fa-arrow-left arrow" onClick={props.goBack}></i>
        <i className="fas fa-arrow-right arrow" onClick={props.goForward}></i>
        {/** <a className="navbar-brand" href="#">navigasyon çubuğu</a> */}
      </div>
    )
}


export const FunctionContext = createContext();

function MainApp() {
  const [pages, setPages] = useState(utils.generate_pages(words));
  const [page, setPage] = useState(0);
  const [childAnimation, setChildAnimtion] = useState('load-page');
  const [correctFound, setCorrectFound] = useState(false);  

  function goBack() {
    if (page > 0) {
      setPage(cPage => cPage - 1);
      setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
    }
  }

  function goForward() {
    if (page < pages.length) {
      setPage(cPage => cPage + 1);
      setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
    }
  }

  function handleClick() {
    setChildAnimtion(cAnim => (cAnim === 'load-page') ? 'load-page-2' : 'load-page');
    setPage(cPage => cPage + 1);
  }

  function handleIncorrect(Component) {
    if (!correctFound) {
      let restOfArray = pages.slice(page + 1);
      let currentPage = pages[page];
      for (let i = 0; i < restOfArray.length; i++) {
        if (restOfArray[i].props.word === currentPage.props.word) {
          return null
        }
      }
      let repeatPage = <Component 
        allWords={words} word={currentPage.props.word} key={pages.length + 1} />
      let copyPages = [...pages];
      copyPages.splice(copyPages.indexOf(currentPage) + utils.randint(2, 4), 0, repeatPage);
      setPages(copyPages);
    }   
  }

  return (
    <div className="question-page">
      <NavBar goBack={goBack} goForward={goForward} />
      <FunctionContext.Provider value={
        {'click': handleClick, 'incorrect': handleIncorrect,
        'correctFound': correctFound, 'setCorrectFound': setCorrectFound}}>
        <App animation={childAnimation} page={pages[page]} />
      </FunctionContext.Provider>
    </div>
  )
}


var words = [
  'natural', 'coffee table', 'curtain', 'carpet', "sock",
  'skirt', 'pillow', 'blanket', 'ladle', 'strainer', 'roof', 'elevator', 'stair'
]

ReactDOM.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
  document.getElementById('main-app')
);