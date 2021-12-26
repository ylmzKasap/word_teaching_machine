import './styling/App.css'
import 'bootstrap/dist/css/bootstrap.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { ProfilePage } from './profile_components/ProfilePage';

export const userName = "hayri";

export function renderMain(Component, propObject) {
    if (propObject === undefined) {
        propObject = {};
    }

    ReactDOM.render(
        <React.StrictMode>
            <Component {...propObject} />
        </React.StrictMode>,
        document.getElementById("main-app")
    );
}

renderMain(ProfilePage, {dir: 1});