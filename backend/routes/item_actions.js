const err_utils = require('../database/db_functions/index');
const item_utils = require('../database/db_functions/item_functions');


const updateDirectory = require('../database/db_functions/item_relocation').updateDirectory;


// Change item order in a directory.
const update_directory = async (req, res) => {
    const { username } = req.params;
    const { item_id, new_order, direction, parent_id, category_id } = req.body;

    const db = req.app.get('database');
    
    await item_utils.updateItemOrder(db, username, item_id, new_order, direction, parent_id, category_id)
        .then(() => res.send())
        .catch(err => console.log(err));
};


// Send an item to a specific folder.
const send_item = async (req, res) => {
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
    update_directory, send_item
}