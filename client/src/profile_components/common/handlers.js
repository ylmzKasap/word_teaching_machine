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
            'id': props.id,
            'name': props.name,
            'type': props.type,
            'clonedStyle': elementDimensions}
        return draggedElement;
    } else {
        return {}
    }
}


export function create_context_menu(evnt, closestItem) {
	// Completely unrelated div.
	if (!closestItem) {
		var contextMenu = {
			closest: evnt.target, openedElem: {type: 'void'}, ops: ['no actions']
		}
	} else {
		var contextMenu = {
			closest: closestItem, openedElem: {}, ops: []
		}

		// Containers
		if (['card-container', 'category-container'].includes(closestItem.className)) {
			contextMenu.openedElem = {id: null, type: 'container'};
			contextMenu.ops = ['paste'];
		
		} else {
			// Page item like file, folder, thematic-folder, category.
			contextMenu.openedElem = {
				'id': closestItem.id,
				'type': closestItem.className,
				'name': closestItem.className === 'category' ? 
                    closestItem.querySelector('.category-header').innerText : closestItem.innerText}

			if (closestItem.className === 'category') {
				contextMenu.ops = ['cut', 'paste', 'delete'];
			} else if (closestItem.className === 'file') {
				contextMenu.ops = ['copy', 'cut', 'delete'];
			} else {
				contextMenu.ops = ['cut', 'delete'];
			}
		}
	}
	return contextMenu;
}