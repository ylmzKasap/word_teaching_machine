import { useState, useLayoutEffect } from "react";
import { DirectoryInfoTypes } from "../types/profilePageTypes";

function get_column_number(containerName: string) {
  const container = document.querySelector(containerName);

  if (container) {
    var gridComputedStyle = window.getComputedStyle(container);
    var gridColumnCount = gridComputedStyle
      .getPropertyValue("grid-template-columns")
      .split(" ").length;
  } else {
    gridColumnCount = 0;
  }
  return [gridColumnCount];
}

export function useWindowSize(dirInfo: DirectoryInfoTypes, reload: boolean) {
  const [columnNumber, setColumnNumber] = useState([0]);
  useLayoutEffect(() => {
    if (!dirInfo) return;
    const container =
      dirInfo.item_type === "thematic_folder" ? ".category" : ".card-container";
    function updateSize() {
      setColumnNumber(get_column_number(container));
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [dirInfo, reload]);
  return columnNumber;
}
