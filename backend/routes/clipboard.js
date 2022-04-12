const item_utils = require('../database/db_functions/item_functions');
const dir_utils = require('../database/db_functions/directory');
const utils = require("./functions");

const { addItem } = require('../database/db_functions/item_creation');
const  { updateDirectory } = require('../database/db_functions/item_relocation');

module.exports = async (req, res) => {
    const { username } = req.params;
    const { item_id, item_type, old_parent, new_parent, category_id, action } = req.body;

    const db = req.app.get('database');

    if (item_id === undefined || action === undefined) {
        return res.status(400).send('Clipboard is empty.')};

    // Get copied item.
    let item = await item_utils.getItemInfo(db, item_id);
    if (!item) {
        return res.status(404).send('Item does not exist anymore.')
    }
    
    // Check whether a folder is copied into its own subdirectory.
    if (item.item_type === 'folder') {
        const subtree = await dir_utils.getRecursiveTree(db, username, item_id);
        const subIds = subtree.map(item => parseInt(item.item_id));
        if (subIds.includes(parseInt(new_parent)) || parseInt(item_id) === parseInt(new_parent)) {
            res.status(400).send(`This directory is a subdirectory of '${item.item_name}'.`);
            return res.end();
        } 
    }

    const titleType = item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1);
    // Insert copied item.
    if (action === 'copy') {
        await addItem(db, {
            'name': item.item_name, 'item_type': item.item_type, 'category_id': category_id,
            'owner': username, 'parent': new_parent, 'content': {'words': item.words}
        }).catch((err) => res.status(400).send(
            `${titleType} '${item.item_name}' already exists in the directory.`));
        return res.end();
    }
    // Update the directory of cut item.
    else if (action === 'cut') {
        const newDirectory = await dir_utils.getDirectory(db, username, new_parent);
        const categoryItems = await dir_utils.getDirectory(
            db, username, old_parent, item_id)

        if (old_parent !== new_parent) {
            if (utils.find_unique_violation(
                newDirectory[0], categoryItems[0], ['item_type', 'owner', 'item_name'])) {
                    return  res.status(400).send('Paste failed: items with the same name')
                }
        }

        const updateStatus = await updateDirectory(
            db, username, item_id, old_parent, new_parent, category_id, 'subfolder')

        if (updateStatus.exists) {
            return res.status(400).send(
                `${titleType} '${item.item_name}' already exists in the directory.`)
        }

         // Move the category. 
        for (let item of categoryItems[0]) {
            await item_utils.updateColumnValue(db, item.item_id, 'parent_id', new_parent);
        }

        return res.end();
    }
    else {
        return res.end()
    }
};