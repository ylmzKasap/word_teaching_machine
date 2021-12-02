import React from 'react';
import ReactDOM from 'react-dom';
import './App.css'
import 'bootstrap/dist/css/bootstrap.css';
import QuestionPage from './App.js';


var words = [
  'natural', 'coffee table', 'curtain', 'carpet', "sock",
  //'skirt', 'pillow', 'blanket', 'ladle', 'strainer', 'roof', 'elevator', 'stair'
]

ReactDOM.render(
  <React.StrictMode>
    <QuestionPage  words={words} />
  </React.StrictMode>,
  document.getElementById('main-app')
);