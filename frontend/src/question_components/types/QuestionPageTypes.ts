import React from "react";
import { wordTypes } from "../../profile_components/types/profilePageTypes";

export interface LocationTypes {
  words: wordTypes[];
  target_language: string;
  source_language: string;
  directory: number;
  rootDirectory: number;
}

export interface WordInfoTypes {
  words: wordTypes[];
  target_language: string;
  source_language: string;
}

export type ParamTypes = {
  deckId: string;
  dirId: string;
  username: string;
}

export interface PageContent {
  component: React.FC<QuestionComponentPropTypes> | null;
  type: string;
  word: wordTypes;
  order: number;
}
export type PageTypes = PageContent[];

export interface QuestionBodyTypes {
  animation: string;
  page: JSX.Element;
}

export interface QuestionComponentPropTypes {
  wordInfo: WordInfoTypes;
  word: wordTypes;
}

export interface TextOptionsPropsTypes extends QuestionComponentPropTypes {
  animate: () => void;
  key: string;
}

export interface OptionTypes {
  isCorrect: boolean;
  word: wordTypes;
  wordInfo: WordInfoTypes;
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
  wordInfo: WordInfoTypes;
  word: wordTypes;
  key: string;
  animation?: string;
}

export interface IntroTextTypes {
  wordInfo: WordInfoTypes;
  word: wordTypes;
  type: string;
  animation: string;
}

export interface NumberBoxPropTypes {
  type: string;
  number: number;
  style: string;
}