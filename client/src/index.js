import './styling/App.css'
import 'bootstrap/dist/css/bootstrap.css';

import { StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProfilePage } from './profile_components/ProfilePage';
import { NotFound } from './profile_components/common/components';
import { QuestionPage } from './question_components/QuestionPage';


const App = () => {
    return (
        <Routes>
            <Route path='user/:username' element={<ProfilePage dir={1}/>}>
                <Route path='deck/:deckId' element={<QuestionPage />}/>
            </Route>
            <Route path='*' element={<NotFound category='page' />} />
        </Routes>
    )
}

const rootElement = document.getElementById("main-app");
render(
    <StrictMode>
        <Router>
            <App />
        </Router>    
    </StrictMode>,
    rootElement
)