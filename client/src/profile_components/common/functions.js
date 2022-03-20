import { PageItem } from "../PageItems";
import axios from "axios";

export function generate_directory(info, items, userName) {
  // Used by ProfilePage.
  // Creates folders and decks with database items.
  const thematicOn = info.item_type === "thematic_folder";

  const categories = [];
  const otherItems = [];

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

  let directory = [];
  iterable.forEach((pgItem) => {
    const { item_id, item_name, item_type, item_order, words, color } = pgItem;
    directory.push(
      <PageItem
        key={item_id}
        id={`item-${item_id}`}
        name={item_name}
        type={item_type.replaceAll("_", "-")}
        order={parseInt(item_order)}
        words={words ? words.split(",") : ""}
        color={color ? color : ""}
        user={userName}
      >
        {thematicOn &&
          otherItems
            .filter((item) => item.category_id === item_id)
            .map((item) => (
              <PageItem
                key={item.item_id}
                id={`item-${item.item_id}`}
                name={item.item_name}
                type={item.item_type.replaceAll("_", "-")}
                order={parseInt(item.item_order)}
                words={item.words ? item.words.split(",") : ""}
                color={item.color ? item.color : ""}
                user={userName}
              />
            ))}
      </PageItem>
    );
  });

  return [...directory];
}

export function hasKeys(anyObject) {
  return Object.keys(anyObject).length > 0;
}

const setScroll = (setter, elem, cursor, move, timing) => {
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

export function scroll_div(
  evnt,
  win,
  doc,
  container,
  scrolling,
  setScrolling,
  constraints = []
) {
  // Used by: ../ProfilePage -> HandleMouseAction event handler.

  if (![...constraints].includes(evnt.target.className.split(" ")[0])) {
    const scrolledElement = doc.querySelector(container);

    // Scroll bottom
    if (win.innerHeight - 80 < evnt.clientY) {
      let interval = win.innerHeight - evnt.clientY;
      if (!scrolling.exists) {
        setScroll(setScrolling, scrolledElement, evnt.clientY, 10, interval);
      } else {
        if (Math.abs(evnt.clientY - scrolling.clientY) > 8) {
          clearInterval(scrolling.interval);
          setScroll(setScrolling, scrolledElement, evnt.clientY, 10, interval);
        }
      }
      // Scroll top
    } else if (evnt.clientY < 80) {
      let interval = evnt.clientY;
      if (!scrolling.exists) {
        setScroll(setScrolling, scrolledElement, evnt.clientY, -10, interval);
      } else {
        if (Math.abs(evnt.clientY - scrolling.clientY) > 8) {
          clearInterval(scrolling.interval);
          setScroll(setScrolling, scrolledElement, evnt.clientY, -10, interval);
        }
      }
      // Cancel scroll due to mouse position.
    } else {
      if (scrolling.exists) {
        clearInterval(scrolling.interval);
        setScrolling({ exists: false });
      }
    }
    // Cancel scroll due to targeting forbidden element.
  } else {
    if (scrolling.exists) {
      clearInterval(scrolling.interval);
      setScrolling({ exists: false });
    }
  }
}

export function delete_item(
  itemObj,
  directory,
  username,
  setRender,
  setRequestError
) {
  // Used by './components/ItemContextMenu' and '../ProfilePage/BottomDragBar'.
  const message = ["folder", "category"].includes(itemObj.type)
    ? `Delete '${itemObj.name}' and all of its content?`
    : `Delete '${itemObj.name}?'`;

  if (window.confirm(message)) {
    axios
      .delete(`/u/${username}/delete_item`, {
        data: {
          item_id: extract_int(itemObj.id),
          parent_id: directory,
        },
      })
      .then(() => {
        setRender();
      })
      .catch((err) =>
        setRequestError({ exists: true, description: err.response.data })
      );
  }
}

export function extract_int(str) {
  return str ? str.match(/\d+$/)[0] : "";
}

export function find_closest_element(evnt, selectors) {
  // Accepts an array of selectors and returns the first closest element.

  for (let selector of selectors) {
    const closestItem = evnt.target.closest(selector);
    if (closestItem) {
      return closestItem;
    }
  }

  return null;
}
