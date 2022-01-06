export function handleItemName(synthEvent) {
    // Used by CreateDeckOverlay and CreateFolderOverlay.

    const itemNameFilter = /[.,\\'"]/;
    const itemName = synthEvent.target.value;
    const generalError = {display: {"display": "none"}, errorClass: "", description: ""};
    let itemNameError = {errorClass: "", description: ""};

    if (itemNameFilter.test(itemName)) {
        itemNameError = {
            errorClass: "forbidden-input",
            description: `Forbidden character ' ${itemName.match(itemNameFilter)} '`};
    } else if (itemName.length > 40) {
        itemNameError = {
            errorClass: "forbidden-input",
            description: `Input too long: ${itemName.length} characters > 40`};
    } else if (itemName.replace(/[\s]/g, "") === "" && itemName !== "") {
        itemNameError = {
            errorClass: "forbidden-input",
            description: "Input cannot only contain spaces"};
    } else {
        itemNameError = {
            errorClass: "", description: ""};
    };

    return [itemName, itemNameError, generalError];
}


export function handleDownOnDragged(targetElem, props, cloneTimeout) {
    // Used by PageItem component.

    if (!cloneTimeout.exists) {
        const elementDimensions = targetElem.getBoundingClientRect();
        const draggedElement = {
            'name': props.name, 'type': props.type, 'clonedStyle': elementDimensions}
        return draggedElement;
    } else {
        return {}
    }
}