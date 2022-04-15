const dir_utils = require('../database/db_functions/directory');

// Set directory to parent folder.
const set_back = async (req, res) => {
    const { username, parent_id } = req.params;

    const db = req.app.get('database');
    const grandparent_id = await dir_utils.getGrandparent(db, parent_id, username);

    if (isNaN(parent_id)) {
        return res.status(400).send({"errDesc": "Type mismatch"});
    };

    // Redirect to root the folder if parent is somehow deleted.
    if (!grandparent_id) {
        const rootId = await dir_utils.getRoot(db, username);
        if (rootId) {
            return res.status(200).send({"parent_id": rootId});
        } else {
            return res.status(400).send({"errDesc": "User does not exist"});
        }
    }

    if (grandparent_id) {
        return res.status(200).send({"parent_id": grandparent_id});
    } else {
        return res.status(400).send({"errDesc": "Something went wrong"});
    }
};

module.exports = {
    set_back
}
