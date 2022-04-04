const err_utils = require('../database/db_functions/index');
const item_crt_utils = require('../database/db_functions/item_creation');
const item_utils = require('../database/db_functions/item_functions');
const utils = require("./functions");

const addItem = require('../database/db_functions/item_creation').addItem;


// Handle deck creation.
const create_deck = async (req, res) => {
    const { username } = req.params;
    const { deckName, content, parent_id, category_id } = req.body;

    const db = req.app.get('database');
    
    // Locate image files.
    const imageExtensions = ['.jpg', '.png', '.PNG', '.jpeg', '.webp'];
    const [missingFiles, foundFiles] = utils.findFiles(
        "public/images/", content.words.split(','), imageExtensions);

    if (missingFiles.length > 0) {
        return res.status(417).send(`Images not found: ${missingFiles.join(', ')}.`);
    }
    
    // Create deck
    await addItem(db, {
        'name': deckName,
        'owner': username,
        'item_type': 'file',
        'parent': parent_id,
        'category_id': category_id,
        'content': {'words': foundFiles.join(',')}
    })
    .then(() => res.end())
    .catch(err => {
        const description = err_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Deck '${deckName}' already exists.` : description);
    });
};


// Handle folder creation.
const create_folder = async (req, res) => {
    const { username } = req.params;
    const { folder_name, parent_id, folder_type } = req.body;

    const db = req.app.get('database');
    const itemType = (folder_type === 'Thematic folder') ? 'thematic_folder' : 'folder';

    await addItem(db, {
        'name': folder_name,
        'owner': username,
        'item_type': itemType,
        'parent': parent_id,
    })
    .then(() => res.sendStatus(200))
    .catch(err => {
        const description = err_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Folder '${folder_name}' already exists.` : description);
    });
};


// Handle category creation.
const create_category = async (req, res) => {
    const { username } = req.params;
    const { category_name, parent_id, content } = req.body;

    const db = req.app.get('database');

    await addItem(db, {
        'name': category_name,
        'owner': username,
        'item_type': 'category',
        'parent': parent_id,
        'content': content
    })
    .then(() => res.end())
    .catch(err => {
        const description = err_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Category '${category_name}' already exists.` : description);
    });
};


// Delete File, Folder or Category.
const delete_item = async (req, res) => {
    const { username } = req.params;
    const { item_id, parent_id } = req.body;

    const db = req.app.get('database');

    const deleteStatus = await item_crt_utils.deleteItem(db, username, item_id, parent_id);

    if (deleteStatus) {
        return res.end();
    } else {
        return res.status(400).send('Something went wrong...');
    }
};


// Change item order in a directory.
const update_directory = async (req, res) => {
    const { username } = req.params;
    const { item_id, new_order, direction, parent_id, category_id } = req.body;

    const db = req.app.get('database');
    
    await item_utils.updateItemOrder(db, username, item_id, new_order, direction, parent_id, category_id)
        .then(() => res.send())
        .catch(err => console.log(err));
};


module.exports = {
    create_deck, create_folder, create_category,
    delete_item, update_directory
}