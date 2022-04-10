const dir_utils = require('../database/db_functions/directory');

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

module.exports = {
    set_back
}
