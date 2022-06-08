import React from "react";

export interface LocationTypes {
  allPaths: string[];
  directory: number;
  rootDirectory: number;
}

export type ParamTypes = {
  deckId: string;
  dirId: string;
  username: string;
}

export interface PageContent {
  component: React.FC<QuestionComponentPropTypes> | null;
  type: string;
  path: string;
  order: number;
}
export type PageTypes = PageContent[];

export interface QuestionBodyTypes {
  animation: string;
  page: JSX.Element;
}

export interface QuestionComponentPropTypes {
  allPaths: string[];
  allWords: string[];
  imgPath: string;
  word: string;
}

export interface TextOptionsPropsTypes extends QuestionComponentPropTypes {
  animate: () => void;
  key: string;
}

export interface OptionTypes {
  isCorrect: boolean;
  imgPath: string;
  word: string;
  number: number;
  key: string;
  animate: () => void;
}

export interface NavBarTypes {
  goBack: () => void;
  goForward: () => void;
  directory: number;
  root: number;
  pageNumber: number;
  user: string | undefined;
  fetchError: boolean;
}

export interface QuestionContextTypes {
  handleParentClick: () => void;
  handleIncorrect: () => void;
  correctFound: boolean;
  setCorrectFound: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface TimeoutTypes {
  sound: number;
  click: number;
}

export interface TextAnimationContextTypes {
  setTextAnimation: React.Dispatch<React.SetStateAction<string>>;
}

export interface IntroImageTypes {
  imgPath: string;
  word: string;
  key: string;
  animation?: string;
}

export interface IntroTextTypes {
  imgPath: string;
  word: string;
  type: string;
  animation: string;
}

export interface NumberBoxPropTypes {
  type: string;
  number: number;
  style: string;
}