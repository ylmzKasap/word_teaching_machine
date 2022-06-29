import React from "react";
import { CategoryOverlayTypes, DeckOverlayTypes, FolderOverlayTypes } from "./overlayTypes";

type Timer = ReturnType<typeof setTimeout>;

export type userResponse = [serverItemTypes[], dirInfoTypes];

export interface ClipboardTypes {
  action: string | undefined;
  id: string | undefined;
  type: string | undefined;
  directory: string | undefined;
}

export interface DirectoryInfoTypes {
  item_id: string | undefined;
  owner: string | undefined;
  item_type: string | undefined;
  parent_id: string | null | undefined;
  item_order: string | undefined;
  category_id: string | null | undefined;
}

export interface DraggedElementTypes {
  id: string | undefined;
  name: string | undefined;
  type: string | undefined;
}

export interface RequestErrorTypes {
  exists: boolean;
  description: string | undefined;
}

export interface ScrollingTypes {
  exists: boolean;
  element: React.ReactElement | Element | undefined;
  clientY: number | undefined;
  interval: number | Timer;
}

export interface ContextMenuScrollTypes {
  top: number;
  scroll: number;
}

export interface ContextOpenedElemTypes {
  id: string | undefined;
  type: string | undefined;
  name: string | undefined;
}

export interface ContextMenuInfoTypes {
  closest: HTMLElement | null;
  openedElem: ContextOpenedElemTypes;
  ops: string[];
}

export interface ContextRestrictTypes {
  [paste: string]: {
    [key: string]: string;
  }
}

export interface CloneStyleTypes {
  width: string | undefined,
  height?: string | undefined,
  opacity?: string | undefined,
  borderRadius?: string | undefined,
  backgroundColor: string | undefined,
  left: string | undefined,
  top: string | undefined,
  boxShadow?: string | undefined,
  transition: string | undefined
}

export interface CloneTimeoutTypes {
  exists: boolean,
  timeouts: number,
}

export interface dirInfoTypes {
  category_id: string | null | undefined;
  item_id: string;
  item_name: string;
  item_order: string;
  item_type: string;
  owner: string;
  parent_id: string | null | undefined;
}

export interface wordTypes {
  artist_id: string | undefined;
  deck_id: string | undefined;
  image_path: string | undefined;
  english?: string;
  turkish?: string;
  german?: string;
  french?: string;
  spanish?: string;
  greek?: string;
  english_sound_path?: string;
  turkish_sound_path?: string;
  german_sound_path?: string;
  french_sound_path?: string;
  spanish_sound_path?: string;
  greek_sound_path?: string;
  word_order: number | undefined;
  [key: string]: string | undefined | number;
}

export interface serverItemTypes {
  category_id: string | null;
  completed?: boolean;
  deck_key?: string;
  category_key?: string;
  item_id: string;  
  item_name: string;
  item_order: string;
  item_type: string;
  owner: string;
  parent_id: string;
  category_source_language?: string;
  category_target_language?: string;
  purpose?: string;
  show_translation: boolean;
  color?: string;
  source_language?: string;
  target_language?: string;
  words?: wordTypes[];
}

export interface CategoryInfoTypes {
  id: string | undefined,
  name: string | undefined,
  targetLanguage: string | undefined,
  sourceLanguage: string | undefined,
  purpose: string | undefined
}

export type SetOverlayType = React.Dispatch<{
  type: string;
  value: string;
  innerType?: string;
}>

export type SetDeckOverlayType = React.Dispatch<{
  type: string;
  value: string;
  innerType?: string;
  categoryInfo?: CategoryInfoTypes;
}>

export interface ProfileContextTypes {
  username: string | undefined;
  rootDirectory: string;
  directory: string;
  directoryInfo: DirectoryInfoTypes;
  items: React.ReactElement[];
  setReRender: React.DispatchWithoutAction;
  clipboard: ClipboardTypes;
  setClipboard: React.Dispatch<React.SetStateAction<ClipboardTypes>>;
  contentLoaded: boolean;
  fetchError: boolean;
  requestError: {exists: boolean; description: string | undefined};
  setRequestError: React.Dispatch<React.SetStateAction<RequestErrorTypes>>;
  contextOpenedElem: ContextOpenedElemTypes;
  contextOptions: string[];
  contextMenuStyle: {top: number; left: number;};
  cloneTimeout: {exists: boolean; timeouts: number};
  draggedElement: DraggedElementTypes;
  setDraggedElement: React.Dispatch<React.SetStateAction<DraggedElementTypes>>;
  isDragging: boolean;
  categoryDrag: boolean;
  columnNumber: number;
  handleContextMenu: (event: React.MouseEvent) => void;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void;
  resetDrag: (timeout?: boolean) => void;
  resetContext: () => void;
  deckOverlay: DeckOverlayTypes;
  setDeckOverlay: SetDeckOverlayType;
  folderOverlay: FolderOverlayTypes;
  setFolderOverlay: SetOverlayType;
  categoryOverlay: CategoryOverlayTypes;
  setCategoryOverlay: SetOverlayType;
}