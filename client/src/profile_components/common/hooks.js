import { useState, useLayoutEffect } from "react";


function get_column_number(containerName, doc, win) {
  const container = doc.querySelector(containerName);

  if (container) {
    var gridComputedStyle = win.getComputedStyle(container);
    var gridColumnCount = gridComputedStyle.getPropertyValue("grid-template-columns").split(" ").length;
  } else {
    gridColumnCount = 0;
  }
  return [gridColumnCount];
}

export function useWindowSize(dirInfo, reload) {
  const [columnNumber, setColumnNumber] = useState([0]);
  const container = dirInfo.item_type === 'thematic_folder' ? `.category` : '.card-container';
  useLayoutEffect(() => {
    function updateSize() {
      setColumnNumber(get_column_number(container, document, window))
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [dirInfo, reload]);
  return columnNumber;
}