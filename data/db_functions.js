const pool = require('./db_info')

const errorCodes = {
    42601: 'Syntax Error',
    23505: "Unique Violation",
    22001: "Input too long",
    42703: "Column does not exist",
    "42P01": "Table does not exist",
    "22P02": "IntegerExpected"
}

function handleError(errorCode) {
    if (errorCodes.hasOwnProperty(errorCode)) {
        return errorCodes[errorCode]
    } else {
        return errorCode
    }
}

async function createUsersTable() {
    await pool.query(`CREATE TABLE users (
        user_id BIGSERIAL PRIMARY KEY NOT NULL,
        username VARCHAR(30) UNIQUE NOT NULL,
        user_picture VARCHAR(200)
    );`).catch(err => console.log(err));
}


async function dropTable(table) {
    await pool.query(`DROP TABLE ${table};`).catch(err => console.log(err));
}

async function createItemTable(name) {
    await pool.query(`CREATE TABLE ${name}_table (
        item_id BIGSERIAL PRIMARY KEY NOT NULL,
        item_type VARCHAR(20) NOT NULL,
        item_name VARCHAR(40) NOT NULL,
        parent_id INT REFERENCES ${name}_table (item_id)
        ON DELETE CASCADE,
        item_order DECIMAL NOT NULL,
        content VARCHAR(1000),
        CONSTRAINT ${name}_unique_files UNIQUE (item_type, item_name, parent_id)
    );`).catch(err => console.log(err));
}

async function addUser(name) {
    await pool.query(`INSERT INTO users (username, user_picture) VALUES ('${name}', 'no_pic.png');`)
        .then(() => createItemTable(name)
        .then(() => {addItem({
            'owner': name,
            'name': `${name}_root`,
            'item_type': 'root_folder'
    })}).catch(err => console.log(err)));
    return true;
}

async function deleteUser(name) {
    await dropTable(`${name}_table`)
        .then(() => pool.query(`DELETE FROM users WHERE username = '${name}'`))
        .catch(err => console.log(err));
}

async function addItem(infObj) {
    const { name, item_type, owner, parent, content } = infObj;
    const orderSubQuery = `(SELECT count(*) + 1 FROM ${owner}_table WHERE parent_id = ${parent})`;
    if (item_type === 'root_folder') {
        await pool.query(
            `INSERT INTO ${owner}_table (item_name, item_type, item_order)
            VALUES ('${name}', '${item_type}', 0);`
        )
   
        } else if (item_type === 'folder') {
        await pool.query(
            `INSERT INTO ${owner}_table (item_name, item_type, parent_id, item_order)
            VALUES ('${name}', '${item_type}', '${parent}', ${orderSubQuery});
        `)
   
        } else if (item_type === 'file') {
        await pool.query(
            `INSERT INTO ${owner}_table (item_name, item_type, content, parent_id, item_order)
            VALUES ('${name}', '${item_type}', '${content}', '${parent}', ${orderSubQuery});
        `)
    }
}

async function getUserInfo(owner) {
    const userInfo = await pool.query(`
        SELECT * FROM users WHERE username = '${owner}';
    `).catch(err => console.log(err));
    return userInfo.rows[0];
}

async function getItemInfo(owner, item_id, item_type) {
    const itemInfo = await pool.query(`
        SELECT * FROM ${owner}_table WHERE item_id = '${item_id}' AND item_type = '${item_type}';
    `).catch((err) => {
        return (err.code === "42P01") ? 'userError' 
        : ["42601", "42703", "22P02"].includes(err.code) ? 'deckSyntaxError'
        : []});
    return (itemInfo === 'userError' || itemInfo === 'deckSyntaxError') ? itemInfo : itemInfo.rows;
}

async function getDirectory(owner, item_id, orderBy = "") {
    const orderQuery = orderBy ? `ORDER BY ${orderBy}` : "";
    const directory = await pool.query(`
        SELECT * FROM ${owner}_table WHERE parent_id = ${item_id}${orderQuery};
    `)
    return directory.rows;
}

async function updateColumnValue(owner, item_id, column_name, new_value) {
    if (isNaN(new_value)) {
        new_value = `'${new_value}'`}

    await pool.query(`
        UPDATE ${owner}_table 
        SET
        ${column_name} = ${new_value}
        WHERE item_id = ${item_id}
    `)
}

async function updateDirectory(owner, item_id, parent_id, target_id, direction) {
        if (direction === 'subfolder') {
            // Moving item into a subfolder.
            var new_parent_id = target_id;
        } else {
            // Moving item back to the parent.
            var new_parent_id = await getGrandparent(owner, parent_id);
        }

        // Move the item.
        await pool.query(`
            UPDATE ${owner}_table 
            SET 
            parent_id = ${new_parent_id},
            item_order = (SELECT count(*) + 1 from ${owner}_table WHERE parent_id = ${new_parent_id})
            WHERE item_id = ${item_id};
        `)

        // Fix the order of remeaning items.
        await reorderDirectory(owner, parent_id);
        return true;
}

async function reorderDirectory(owner, directory_id) {
    await pool.query(`
        UPDATE 
            ${owner}_table
        SET
            item_order = T2.row_number
        FROM 
            (SELECT item_id, item_order, row_number()
                OVER (ORDER BY item_order)
                FROM ${owner}_table
                WHERE parent_id = ${directory_id})
            AS T2
        WHERE T2.item_id = ${owner}_table.item_id;
    `)
}

async function updateItemOrder(owner, item_id, new_order, direction, parent_id) {
    if (direction === 'before') {
        await updateColumnValue(owner, item_id, 'item_order', new_order - 0.1);
    } else if (direction === 'after') {
        await updateColumnValue(owner, item_id, 'item_order', new_order + 0.1);
    }

    await reorderDirectory(owner, parent_id);
    return true;    
}

async function getGrandparent(owner, parent_id) {
    const grandparent_id = await pool.query(`
        SELECT parent_id FROM ${owner}_table WHERE item_id = ${parent_id}
    `).catch(err => console.log(err));
    return grandparent_id.rows[0].parent_id;
}

async function deleteItem(owner, item_id, parent_id) {
    await pool.query(`
        DELETE FROM ${owner}_table WHERE item_id = ${item_id};
        `).catch(err => console.log(err));
    await reorderDirectory(owner, parent_id);
    return true;
}

async function recursive_tree(owner, item_id) {
    const tree = await pool.query(`
        WITH RECURSIVE item_tree AS (
            SELECT
                t1.item_id,
                t1.item_type,
                t1.item_name,
                t1.parent_id,
                t1.item_order,
                t1.content,
                1 as depth,
                t1.item_id::VARCHAR as path
            FROM ${owner}_table t1
            WHERE parent_id = ${item_id}

            UNION ALL

            SELECT
                t2.item_id,
                t2.item_type,
                t2.item_name,
                t2.parent_id,
                t2.item_order,
                t2.content,
                depth + 1,
                path::VARCHAR || '/' || t2.item_id::VARCHAR
            FROM ${owner}_table t2
            JOIN item_tree ht ON ht.item_id = t2.parent_id
        ) SELECT * FROM item_tree;
    `)
    return tree.rows;
}


module.exports = {
    createUsersTable,
    addUser,
    deleteUser,
    getUserInfo,
    getItemInfo,
    getDirectory,
    updateDirectory,
    updateColumnValue,
    updateItemOrder,
    getGrandparent,
    addItem,
    deleteItem,
    handleError,
    dropTable,
    recursive_tree
}