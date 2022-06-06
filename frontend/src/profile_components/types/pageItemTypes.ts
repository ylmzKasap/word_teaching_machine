export interface PageItemPropTypes {
  key: string;
  id: string;
  name: string;
  type: string;
  order: number;
  words: string | string[];
  color: string;
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