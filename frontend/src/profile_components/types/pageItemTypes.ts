import { wordTypes } from "./profilePageTypes";

export interface PageItemPropTypes {
  key: string;
  id: string;
  name: string;
  type: string;
  order: number;
  words: wordTypes[];
  color?: string;
  target_language?: string;
  source_language?: string;
  completed?: boolean;
  user: string;
  children?: boolean | React.ReactNode[];
}

export interface SelfStyleTypes {
  opacity?: string,
  transition?: string,
  order: number,
}

export interface FillerTypes {
  fillerClass: string;
  setFillerClass: React.Dispatch<React.SetStateAction<string>>;
  siblingType: string;
  order: number;
  type: string;
}

export interface PageItemContextTypes {
  parentProps: PageItemPropTypes;
  itemStyle: {
    backgroundColor: string;
    boxShadow: string;
  };
  folderStyle: string;
  handleDoubleClick: () => void;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleMouseUp: (event: React.MouseEvent) => void;
  handleHover: (event: React.MouseEvent) => void;
}