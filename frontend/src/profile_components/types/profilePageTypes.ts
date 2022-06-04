export interface ClipboardTypes {
  action: "copy" | "cut" | null;
  id: string | null;
  type: 'root_folder' | 'thematic_folder' | 'folder' | 'file' | 'category' | null;
  directory: string | null;
}

export interface DirectoryInfoTypes {
  item_id: string | null;
  owner: string | null;
  item_type: 'root_folder' | 'thematic_folder' | 'folder' | null;
  parent_id: string | null;
  item_order: string | null;
  category_id: string | null;
}

export interface DraggedElementTypes {
  id: string;
  name: string | null;
  type: string | null;
}

export interface RequestErrorTypes {
  exists: boolean;
  description: string | null;
}

export interface ScrollingTypes {
  exists: boolean,
  element: React.ReactElement | null,
  clientY: number | null,
  interval: number
}

export interface ContextMenuScrollTypes {
  top: number;
  scroll: number;
}

export interface ContextOpenedElemTypes {
  id: string | null;
  type: string | null;
  name: string | null;
}

export interface ContextMenuInfoTypes {
  closest: HTMLElement | null;
  openedElem: ContextOpenedElemTypes;
  ops: string[];
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

export interface ProfilePageTypes {
  dir: string;
}

export interface ProfileContextTypes {
  username: string | undefined;
  rootDirectory: number;
  directory: number;
  directoryInfo: DirectoryInfoTypes;
  items: React.ReactElement[];
  setReRender: React.DispatchWithoutAction;
  clipboard: ClipboardTypes;
  setClipboard: React.Dispatch<React.SetStateAction<ClipboardTypes>>;
  contentLoaded: boolean;
  fetchError: boolean;
  requestError: {exists: boolean; description: string | null};
  setRequestError: React.Dispatch<React.SetStateAction<RequestErrorTypes>>;
  contextOpenedElem: ContextOpenedElemTypes;
  contextOptions: string[];
  contextMenuStyle: {top: number; left: number;};
  cloneTimeout: {exists: boolean; timeouts: number};
  draggedElement: DraggedElementTypes;
  setDraggedElement: React.Dispatch<React.SetStateAction<DraggedElementTypes>>;
  isDragging: boolean;
  categoryDrag: boolean;
  deckDisplay: boolean;
  setDeckDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  categoryId: number;
  setCategoryId: React.Dispatch<React.SetStateAction<number>>;
  columnNumber: number;
  handleContextMenu: (event: React.MouseEvent) => void;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void;
  resetDrag: (timeout?: boolean) => void;
  resetContext: () => void;
}