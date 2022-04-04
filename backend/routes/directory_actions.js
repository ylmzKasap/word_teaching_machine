const dir_utils = require('../database/db_functions/directory');
const err_utils = require('../database/db_functions/index');

const updateDirectory = require('../database/db_functions/item_relocation').updateDirectory;

// Set directory to parent folder.
const set_back = async (req, res) => {
    const { username, parent_id } = req.params;

    const db = req.app.get('database');
    const grandparent_id = await dir_utils.getGrandparent(db, parent_id);

    // Redirect to root the folder if parent is somehow deleted.
    if (!grandparent_id) {
        const rootId = await dir_utils.getRoot(db, username);
        if (rootId) {
            return res.status(200).send(String(rootId));
        } else {
            return res.status(404).send('Not found');
        }
    }

    if (grandparent_id) {
        return res.status(200).send(String(grandparent_id));
    } else {
        return res.status(400).send('Something went horribly wrong.');
    }
};

// Send an item to a specific folder.
const set_forward = async (req, res) => {
    const { username } = req.params;
    const { item_id, parent_id, target_id, direction, item_name, parent_name } = req.body;

    const db = req.app.get('database');

    const updateStatus = await updateDirectory(
        db, username, item_id, parent_id, target_id, null, direction);

    if (!updateStatus.exists) {
        return res.end()
    } else {
        const description = err_utils.handleError(updateStatus.code);
        return res.status(400).send(
            description == 'Unique Violation' ? 
            `'${item_name}' already exists in ${parent_name ? `folder '${parent_name}'` : 'the parent folder'}.`
            :
            description ?
            description : `Failed, sorry.`);
    }
};

module.exports = {
    set_back, set_forward
}
