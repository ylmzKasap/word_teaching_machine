const directoryUtils = require('./directory');
const utils = require('./index');


async function getItemInfo(pool, item_id) {
    const queryString = `
        SELECT * FROM items LEFT JOIN contents ON items.item_id = contents.content_id
        WHERE item_id = $1;`;
    const parameters = [item_id];

    const itemInfo = await pool.query(queryString, parameters)
    .catch(() => utils.emptyRows);

    return itemInfo.rows ? itemInfo.rows[0] : false;
}


async function checkFilePath(pool, owner, dir_id, item_id) {
    const queryText = `
        SELECT * FROM items WHERE owner = $1
        AND item_id = $2
        AND parent_id = $3
        AND item_type = 'file';
    `
    const parameters = [owner, item_id, dir_id];

    const checkPath = await pool.query(queryText, parameters)
    .catch(() => utils.emptyRows);

    return checkPath.rows[0] ? true : false;
}


async function updateColumnValue(pool, item_id, column_name, new_value) {
    if (isNaN(new_value)) {
        new_value = `'${new_value}'`};

    const queryText = `
        UPDATE items
        SET
        ${column_name} = $1
        WHERE item_id = $2;
    `
    const parameters = [new_value, item_id];

    await pool.query(queryText, parameters);
}


async function updateItemOrder(pool, owner, item_id, new_order, direction, parent_id, category_id) {
    if (direction === 'before') {
        await updateColumnValue(pool, item_id, 'item_order', new_order - 0.1);
    } else if (direction === 'after') {
        await updateColumnValue(pool, item_id, 'item_order', new_order + 0.1);
    }

    if (category_id) {
        await updateColumnValue(pool, item_id, 'category_id', category_id);
    }

    await directoryUtils.reorderDirectory(pool, owner, parent_id);
    return true;    
}


module.exports = {
    getItemInfo, checkFilePath, updateColumnValue, updateItemOrder
}