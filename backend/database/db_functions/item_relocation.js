const directoryUtils = require('./directory')

async function updateDirectory(pool, owner, item_id, parent_id, target_id, category_id, direction) {
    if (direction === 'subfolder') {
        // Moving item into a subfolder.
        var new_parent_id = target_id;
    } else {
        // Moving item back to the parent.
        var new_parent_id = await directoryUtils.getGrandparent(pool, parent_id);

        if (!new_parent_id) {
            return {'exists': true, 'code': 23503}
        }
    }

    const categoryQuery = category_id ? ` AND category_id = $5` : " AND category_id IS NULL";
    // Move the item.
    const queryText = `
        UPDATE items
        SET 
            parent_id = $1,
            category_id = $5,
            item_order = (SELECT count(*) + 1 from items WHERE owner = $2 AND parent_id = $3${categoryQuery})
        WHERE item_id = $4;
    `;
    const parameters = [new_parent_id, owner, new_parent_id, item_id, category_id];

    const moveStatus = await pool.query(queryText, parameters)
    .then(() => ({'exists': false}))
    .catch((err) => ({'exists': true, 'code': err.code}));

    if (moveStatus.exists) {
        return moveStatus;
    }

    // Fix the order of remeaning items.
    const orderStatus = await directoryUtils.reorderDirectory(pool, owner, parent_id)
    .then(() => ({'exists': false}))
    .catch((err) => ({'exists': true, 'code': err.code}));

    return orderStatus;
}

module.exports = {
    updateDirectory
}