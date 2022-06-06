import { PageItem } from "../PageItems";
import axios from "axios";
import * as profileTypes from "../types/profilePageTypes";
import { scrollingDefault } from "../types/profilePageDefaults";

export function generate_directory(
  info: profileTypes.dirInfoTypes,
  items: profileTypes.serverItemTypes[],
  username: string) {
  // Used by ProfilePage.
  // Creates folders and decks with database items.
  const thematicOn = info.item_type === "thematic_folder";

  const categories: profileTypes.serverItemTypes[] = [];
  const otherItems: profileTypes.serverItemTypes[] = [];

  // Separate categories from other stuff.
  if (thematicOn) {
    items.forEach((item) => {
      if (item.item_type === "category") {
        categories.push(item);
      } else {
        otherItems.push(item);
      }
    });
  }

  const iterable = thematicOn ? categories : items;

  let directory: React.ReactElement[] = [];
  iterable.forEach((pgItem) => {
    const { item_id, item_name, item_type, item_order, words, color } = pgItem;
    directory.push(
      <PageItem
        key={item_id}
        id={`item-${item_id}`}
        name={item_name}
        type={item_type.replace(/_/g, "-")}
        order={parseInt(item_order)}
        words={words ? words.split(",") : ""}
        color={color ? color : ""}
        user={username}
      >
        {thematicOn &&
          otherItems
            .filter((item) => item.category_id === item_id)
            .map((item) => (
              <PageItem
                key={item.item_id}
                id={`item-${item.item_id}`}
                name={item.item_name}
                type={item.item_type.replace(/_/g, "-")}
                order={parseInt(item.item_order)}
                words={item.words ? item.words.split(",") : ""}
                color={item.color ? item.color : ""}
                user={username}
              />
            ))}
      </PageItem>
    );
  });
  return [...directory];
}

const setScroll = (
  setter: React.Dispatch<React.SetStateAction<profileTypes.ScrollingTypes>>,
  elem: Element,
  cursor: number,
  move: number,
  timing: number
  ) => {
    // Helper function for scroll_div
  if (timing < 7) {
    timing = 7;
  } else if (timing > 30) {
    timing = 30;
  }
  setter({
    exists: true,
    element: elem,
    clientY: cursor,
    interval: setInterval(() => {
      elem.scrollBy({
        top: move,
      });
    }, timing),
  });
};

export function scroll_div (
  event: React.MouseEvent,
  container: string,
  scrolling: profileTypes.ScrollingTypes,
  setScrolling: React.Dispatch<React.SetStateAction<profileTypes.ScrollingTypes>>,
  constraints: string[] = []
) {
  // Used by: ../ProfilePage -> HandleMouseAction event handler.

  const element = event.target as HTMLElement;
  if (![...constraints].includes(element.className.split(" ")[0])) {
    const scrolledElement = document.querySelector(container);

    // Type guard
    if (!scrolling.clientY || !scrolledElement) return;

    // Scroll bottom
    if (window.innerHeight - 80 < event.clientY) {
      let interval = window.innerHeight - event.clientY;
      if (!scrolling.exists) {
        setScroll(setScrolling, scrolledElement, event.clientY, 10, interval);
      } else {
        if (Math.abs(event.clientY - scrolling.clientY) > 8) {
          clearInterval(scrolling.interval);
          setScroll(setScrolling, scrolledElement, event.clientY, 10, interval);
        }
      }
      // Scroll top
    } else if (event.clientY < 80) {
      let interval = event.clientY;
      if (!scrolling.exists) {
        setScroll(setScrolling, scrolledElement, event.clientY, -10, interval);
      } else {
        if (Math.abs(event.clientY - scrolling.clientY) > 8) {
          clearInterval(scrolling.interval);
          setScroll(setScrolling, scrolledElement, event.clientY, -10, interval);
        }
      }
      // Cancel scroll due to mouse position.
    } else {
      if (scrolling.exists) {
        clearInterval(scrolling.interval);
        setScrolling(scrollingDefault);
      }
    }
    // Cancel scroll due to targeting forbidden element.
  } else {
    if (scrolling.exists) {
      clearInterval(scrolling.interval);
      setScrolling(scrollingDefault);
    }
  }
}

export function delete_item(
  itemObj: profileTypes.ContextOpenedElemTypes | profileTypes.DraggedElementTypes,
  username: string | undefined,
  setRender: React.DispatchWithoutAction,
  setRequestError: React.Dispatch<React.SetStateAction<profileTypes.RequestErrorTypes>>
) {
  // Type Guard
  if (!itemObj.type || !itemObj.id || !username) throw Error;

  // Used by './components/ItemContextMenu' and '../profile_page/CardContainer/BottomDragBar'.
  const message = ["folder", "category"].includes(itemObj.type)
    ? `Delete '${itemObj.name}' and all of its content?`
    : `Delete '${itemObj.name}?'`;

  if (window.confirm(message)) {
    axios
      .delete(`/delete_item/${username}`, {
        data: {
          item_id: parseInt(extract_int(itemObj.id))
        },
      })
      .then(() => {
        setRender();
      })
      .catch((err) =>
        setRequestError({ exists: true, description: err.response.data.errDesc })
      );
  }
}

export function extract_int(str: string) {
  const intMatch = str.match(/\d+$/);
  return intMatch ? intMatch[0] : "";
}

export function find_closest_element(
  event: React.MouseEvent, selectors: string[]): HTMLElement | null {
  // Accepts an array of selectors and returns the first closest element.
  const element = event.target as HTMLInputElement;

  for (let selector of selectors) {
    const closestItem = element.closest(selector) as HTMLElement | null;
    if (closestItem) {
      return closestItem;
    }
  }

  return null;
}


export function snakify(str: string) {
  return str.split(' ').join('_').toLowerCase();
}