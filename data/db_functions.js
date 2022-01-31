const pool = require('./db_info')

const errorCodes = {
    42601: 'Syntax Error',
    23505: "Unique Violation",
    22001: "Input too long",
    42703: "Column does not exist",
    23503: "Directory does not exist anymore.", // Foreign key violation.
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
        user_picture VARCHAR(200),
        root_id INT UNIQUE
    );`).catch(err => console.log(err));
}


async function createItemTable() {
    await pool.query(`CREATE TABLE items (
        item_id BIGSERIAL PRIMARY KEY NOT NULL,
        owner VARCHAR(40) NOT NULL REFERENCES users (username)
        ON DELETE CASCADE,
        item_type VARCHAR(20) NOT NULL,
        item_name VARCHAR(40) NOT NULL,
        parent_id INT REFERENCES items (item_id)
        ON DELETE CASCADE,
        item_order DECIMAL NOT NULL,
        CONSTRAINT unique_items UNIQUE (owner, item_type, item_name, parent_id)
    );`).catch(err => console.log(err));
}


async function createContentTable() {
    await pool.query(`CREATE TABLE contents (
        content_id INT PRIMARY KEY NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
        words VARCHAR(4000),
        color VARCHAR(40)
    );`).catch(err => console.log(err));
}


async function dropTable(table) {
    await pool.query(`DROP TABLE ${table};`).catch(err => console.log(err));
}


async function addUser(name) {
    await pool.query(`INSERT INTO users (username, user_picture) VALUES ('${name}', 'no_pic.png');`)
        .then(() => {addItem({
            'owner': name,
            'name': `${name}_root`,
            'item_type': 'root_folder'
        })
        .then(() => pool.query(`
            UPDATE users
            SET root_id = (SELECT item_id FROM items WHERE owner = '${name}' AND item_type = 'root_folder')
            WHERE username = '${name}';
        `))
    });
    return true;
}


async function deleteUser(name) {
    await pool.query(`DELETE FROM users WHERE username = '${name}'`).catch(err => console.log(err));
}


async function addItem(infObj) {
    const { name, item_type, owner, parent, content } = infObj;
    const orderSubQuery = `(SELECT count(*) + 1 FROM items WHERE owner = '${owner}' AND parent_id = '${parent}')`;
    if (item_type === 'root_folder') {
        await pool.query(
            `INSERT INTO items (owner, item_name, item_type, item_order)
            VALUES ('${owner}', '${name}', '${item_type}', 0);`
        )
    } 
        
    else if (item_type === 'folder') {
        await pool.query(
            `INSERT INTO items (owner, item_name, item_type, parent_id, item_order)
            VALUES ('${owner}', '${name}', '${item_type}', '${parent}', ${orderSubQuery});`
        )
    }
    
    else if (item_type === 'file' || item_type === 'category') {
        await pool.query(
            `INSERT INTO items (owner, item_name, item_type, parent_id, item_order)
            VALUES ('${owner}', '${name}', '${item_type}', '${parent}', ${orderSubQuery});`
        )

        const item_id = await pool.query(
            `SELECT item_id FROM items
            WHERE (owner = '${owner}' AND item_name = '${name}' AND parent_id = '${parent}' AND item_type = '${item_type}')
            LIMIT 1`
        )

        const contentKey = Object.keys(content);
        await pool.query(
            `INSERT INTO contents (content_id, ${contentKey})
            VALUES (${item_id.rows[0].item_id}, '${content[contentKey]}')
            `
        ).catch(err => console.log(err))
    }
}


async function getUserInfo(owner) {
    const userInfo = await pool.query(`
        SELECT * FROM users WHERE username = '${owner}';
    `).catch(() => null);
    return userInfo;
}


async function getRoot(owner) {
    const rootInfo = await pool.query(`
        SELECT root_id FROM users WHERE username = '${owner}';
    `).catch(() => null);
    return rootInfo ? rootInfo.rows[0].root_id : rootInfo;
}


async function getItemInfo(item_id) {
    const itemInfo = await pool.query(`
        SELECT * FROM items LEFT JOIN contents ON items.item_id = contents.content_id
        WHERE item_id = '${item_id}';
    `).catch(() => null);
    
    if (itemInfo === null) {
        return false;
    } else if (itemInfo.rows.length === 0) {
        return false;
    } else {
        return itemInfo.rows[0];
    }
}


async function checkDirectory(owner, item_id) {
    const checkDir = await pool.query(`
        SELECT * FROM items WHERE owner = '${owner}' AND item_id = '${item_id}' AND item_type IN ('folder', 'root_folder');
    `).catch(() => null);

    if (checkDir === null) {
        return false;
    } else if (checkDir.rows.length === 0) {
        return false;
    } else {
        return true;
    }
}


async function getDirectory(owner, item_id) {
    const dirExists = await checkDirectory(owner, item_id);

    if (!dirExists) {
        return null;
    }

    const directory = await pool.query(`
        SELECT * FROM items LEFT JOIN contents ON items.item_id = contents.content_id
        WHERE owner = '${owner}' AND parent_id = '${item_id}';
    `)
    return directory.rows;
}


async function updateColumnValue(item_id, column_name, new_value) {
    if (isNaN(new_value)) {
        new_value = `'${new_value}'`}

    await pool.query(`
        UPDATE items
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
        var new_parent_id = await getGrandparent(parent_id);

        if (!new_parent_id) {
            return {'exists': true, 'code': 23503}
        }
    }

    // Move the item.
    const moveStatus = await pool.query(`
        UPDATE items
        SET 
        parent_id = ${new_parent_id},
        item_order = (SELECT count(*) + 1 from items WHERE owner = '${owner}' AND parent_id = ${new_parent_id})
        WHERE item_id = ${item_id};
    `)
    .then(() => ({'exists': false}))
    .catch((err) => ({'exists': true, 'code': err.code}));

    if (moveStatus.exists) {
        return moveStatus;
    }

    // Fix the order of remeaning items.
    const orderStatus = await reorderDirectory(owner, parent_id)
    .then(() => ({'exists': false}))
    .catch((err) => ({'exists': true, 'code': err.code}));

    return orderStatus;
}


async function reorderDirectory(owner, directory_id) {
    await pool.query(`
        UPDATE 
            items
        SET
            item_order = T2.row_number
        FROM 
            (SELECT item_id, item_order, row_number()
                OVER (ORDER BY item_order)
                FROM items
                WHERE owner = '${owner}' AND parent_id = ${directory_id})
            AS T2
        WHERE T2.item_id = items.item_id;
    `)
    return true;
}


async function updateItemOrder(owner, item_id, new_order, direction, parent_id) {
    if (direction === 'before') {
        await updateColumnValue(item_id, 'item_order', new_order - 0.1);
    } else if (direction === 'after') {
        await updateColumnValue(item_id, 'item_order', new_order + 0.1);
    }

    await reorderDirectory(owner, parent_id);
    return true;    
}


async function getGrandparent(parent_id) {
    const grandparent_id = await pool.query(`
        SELECT parent_id FROM items WHERE item_id = ${parent_id}
    `).catch(() => false);

    if (!grandparent_id || grandparent_id.rows.length === 0) {
        return false;
    } else {
        return grandparent_id.rows[0].parent_id;
    }
}


async function deleteItem(owner, item_id, parent_id) {
    const deleteStatus = await pool.query(`
        DELETE FROM items WHERE item_id = ${item_id};
        `).catch(() => false);
    
    if (!deleteStatus) {
        return false;
    }

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
                1 as depth,
                t1.item_id::VARCHAR as path
            FROM items t1
            WHERE owner = '${owner}' AND parent_id = '${item_id}'

            UNION ALL

            SELECT
                t2.item_id,
                t2.item_type,
                t2.item_name,
                t2.parent_id,
                t2.item_order,
                depth + 1,
                path::VARCHAR || '/' || t2.item_id::VARCHAR
            FROM items t2
            JOIN item_tree ht ON ht.item_id = t2.parent_id
        ) SELECT * FROM item_tree;
    `)
    return tree.rows;
}


module.exports = {
    createUsersTable,
    createItemTable,
    createContentTable,
    addUser,
    deleteUser,
    getUserInfo,
    getItemInfo,
    getRoot,
    checkDirectory,
    getDirectory,
    updateDirectory,
    updateItemOrder,
    getGrandparent,
    addItem,
    deleteItem,
    handleError,
    dropTable,
    recursive_tree
}