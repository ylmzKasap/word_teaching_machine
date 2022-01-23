import { useState, useLayoutEffect } from "react";

import { get_column_number } from "./functions";

export function useWindowSize() {
  const [columnNumber, setColumnNumber] = useState([0]);
  useLayoutEffect(() => {
    function updateSize() {
      setColumnNumber(get_column_number('.card-container', document, window))
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return columnNumber;
}