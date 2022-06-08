import "./styling/App.css";

import { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProfilePage } from "./profile_components/profile_page/ProfilePage";
import { CardContainer } from "./profile_components/profile_page/CardContainer";
import { NotFound } from "./profile_components/common/components";
import { QuestionPage } from "./question_components/QuestionPage";

const App = () => {
  return (
    <Routes>
      <Route path="user/:username" element={<ProfilePage dir="home" />}>
        <Route path=":dirId" element={<CardContainer />} />
      </Route>
      <Route
        path="user/:username/:dirId/deck/:deckId"
        element={<QuestionPage />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const rootElement = document.getElementById("main-app");
render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
  rootElement
);
