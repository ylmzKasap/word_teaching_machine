export function handleItemName(synthEvent) {
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