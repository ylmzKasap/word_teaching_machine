function scroll_div(
  event: React.MouseEvent,
  container: string,
  scrolling: ScrollingTypes,
  setScrolling: React.Dispatch<
    React.SetStateAction<ScrollingTypes>
  >,
  constraints: string[] = []
) {
  // Used by: ../ProfilePage -> HandleMouseAction event handler.

  const element = event.target as HTMLElement;
  if (![...constraints].includes(element.className.split(" ")[0])) {
    const scrolledElement = document.querySelector(container);

    // Type guard
    if (!scrolledElement) return;

    // Scroll bottom
    if (window.innerHeight - 100 < event.clientY) {
      let interval = window.innerHeight - event.clientY;
      if (!scrolling.exists) {
        setScroll(setScrolling, scrolledElement, event.clientY, 10, interval);
      } else {
        if (Math.abs(event.clientY - scrolling.clientY!) > 5) {
          clearInterval(scrolling.interval);
          setScroll(setScrolling, scrolledElement, event.clientY, 10, interval);
        }
      }
      // Scroll top
    } else if (event.clientY < 150) {
      let interval = event.clientY;
      if (!scrolling.exists) {
        setScroll(setScrolling, scrolledElement, event.clientY, -10, interval);
      } else {
        if (Math.abs(event.clientY - scrolling.clientY!) > 5) {
          clearInterval(scrolling.interval);
          setScroll(
            setScrolling,
            scrolledElement,
            event.clientY,
            -10,
            interval
          );
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

const setScroll = (
  setter: React.Dispatch<React.SetStateAction<ScrollingTypes>>,
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

export interface ScrollingTypes {
  exists: boolean;
  element: React.ReactElement | Element | undefined;
  clientY: number | undefined;
  interval: number | ReturnType<typeof setTimeout>;
}

export const scrollingDefault = {
  exists: false,
  element: undefined,
  clientY: undefined,
  interval: 0,
};

export default scroll_div;