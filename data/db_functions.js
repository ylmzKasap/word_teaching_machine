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

const emptyRows = ({'rows': []});


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
        category_id BIGINT REFERENCES items (item_id) ON DELETE CASCADE,
        CONSTRAINT unique_items UNIQUE (owner, item_type, item_name, parent_id)
    );`).catch(err => console.log(err));
}


async function createContentTable() {
    await pool.query(`CREATE TABLE contents (
        content_number BIGSERIAL PRIMARY KEY NOT NULL,
        content_id INT NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
        words VARCHAR(4000),
        color VARCHAR(40)
    );`).catch(err => console.log(err));
}


async function dropTable(table) {
    await pool.query(`DROP TABLE ${table};`).catch(err => console.log(err));
}


async function addUser(name) {
    const addUserQuery = "INSERT INTO users (username, user_picture) VALUES ($1, 'no_pic.png');";
    const addUserParam = [name];

    await pool.query(addUserQuery, addUserParam)
        .then(() => {addItem({
            'owner': name,
            'name': `${name}_root`,
            'item_type': 'root_folder'
        })
        .then(() => {
            const queryText = `
                UPDATE users
                SET root_id = (SELECT item_id FROM items WHERE owner = $1 AND item_type = 'root_folder')
                WHERE username = $2;`
            const parameters = [name, name];
            pool.query(queryText, parameters);
            })
        });
    return true;
}


async function deleteUser(name) {
    const queryString = 'DELETE FROM users WHERE username = $1';
    const parameters = [name];

    await pool.query(queryString, parameters).catch(err => console.log(err));
}


async function addItem(infObj) {
    const { name, item_type, owner, parent, content } = infObj;
    let { category_id } = infObj;

    if (!category_id) {category_id = null};
    const categoryQuery = category_id ? ` AND category_id = $7` : "AND category_id IS NULL";
    const orderSubQuery = `
        (SELECT count(*) + 1 FROM items
        WHERE owner = $1 AND parent_id = $2${categoryQuery})`;

    if (item_type === 'root_folder') {
        const queryString = `
            INSERT INTO items (owner, item_name, item_type, item_order)
            VALUES ($1, $2, $3, 0);`
        const parameters = [owner, name, item_type];
        await pool.query(queryString, parameters);
    } 
        
    else if (['folder', 'file', 'category', 'thematic_folder'].includes(item_type)) {
        const queryString = `
            INSERT INTO items (owner, item_name, item_type, parent_id, item_order, category_id)
            VALUES ($3, $4, $5, $6, ${orderSubQuery}, $7);`
        const parameters = [owner, parent, owner, name, item_type, parent, category_id];
        await pool.query(queryString, parameters);

        // Add the content.
        if (['file', 'category'].includes(item_type)) {
            const contentQuery = `
                SELECT item_id FROM items
                WHERE (owner = $1
                AND item_name = $2
                AND parent_id = $3
                AND item_type = $4)
                LIMIT 1;`
            const contentParms = [owner, name, parent, item_type];
            const item_id = await pool.query(contentQuery, contentParms);

            const content_id = item_id.rows[0].item_id;
            await pool.query(`
                INSERT INTO contents (content_id)
                VALUES (${content_id});`);
                
            Object.keys(content).forEach(cKey => {
                const insertQuerry =  `
                    UPDATE contents SET ${cKey} = $1 WHERE content_id = $2`
                const insertParams = [content[cKey], content_id];
                pool.query(insertQuerry, insertParams)
                .catch(err => console.log(err));
            });
        }
    }
}


async function getUserInfo(owner) {
    const queryString = 'SELECT * FROM users WHERE username = $1;';
    const parameters = [owner];

    const userInfo = await pool.query(queryString, parameters)
    .catch(() => emptyRows);

    return userInfo.rows[0] ? userInfo.rows[0] : false;
}


async function getRoot(owner) {
    const queryString = 'SELECT root_id FROM users WHERE username = $1;';
    const parameters = [owner];

    const rootInfo = await pool.query(queryString, parameters)
    .catch(() => null);

    return rootInfo === null ? false : rootInfo.rows[0].root_id;
}


async function getItemInfo(item_id) {
    const queryString = `
        SELECT * FROM items LEFT JOIN contents ON items.item_id = contents.content_id
        WHERE item_id = $1;`;
    const parameters = [item_id];

    const itemInfo = await pool.query(queryString, parameters)
    .catch(() => null);
    
    if (itemInfo === null) {
        return false;
    } else if (itemInfo.rows.length === 0) {
        return false;
    } else {
        return itemInfo.rows[0];
    }
}


async function checkFilePath(owner, dir_id, item_id) {
    const queryText = `
        SELECT * FROM items WHERE owner = $1
        AND item_id = $2
        AND parent_id = $3
        AND item_type = 'file';
    `
    const parameters = [owner, item_id, dir_id];

    const checkPath = await pool.query(queryText, parameters)
    .catch(() => emptyRows);

    return checkPath.rows[0] ? true : false;
}


async function checkDirectory(owner, dir_id) {
    const queryText = `
        SELECT * FROM items WHERE owner = $1
        AND item_id = $2
        AND item_type IN ('folder', 'thematic_folder', 'root_folder')
        LIMIT 1;`;
    const parameters = [owner, dir_id];

    const checkDir = await pool.query(queryText, parameters)
    .catch(() => emptyRows);

    return checkDir.rows[0] ? {'exists': true, 'info': checkDir.rows[0]} : {'exists': false, 'info': null};
}


async function getDirectory(owner, dir_id, category_id='') {
    // Return values:
    // Directory exists -> [itemsOfDirectory, directoryInfo]
    // Directory does not exist -> [false]

    const dir = await checkDirectory(owner, dir_id);
    if (!dir.exists) {
        return [false];
    }

    const queryText = `
        SELECT * FROM items
        LEFT JOIN contents ON items.item_id = contents.content_id
        WHERE owner = $1 AND parent_id = $2${category_id && ` AND category_id = $3`};`
    const parameters = category_id ? [owner, dir_id, category_id] : [owner, dir_id];

    const directory = await pool.query(queryText, parameters)
    .catch((err) => console.log(err));

    return directory === null ? [false] : [directory.rows, dir.info];
}


async function updateColumnValue(item_id, column_name, new_value) {
    if (isNaN(new_value)) {
        new_value = `'${new_value}'`};

    const queryText = `
        UPDATE items
        SET
        ${column_name} = $1
        WHERE item_id = $2;
    `
    const parameters = [new_value, item_id];

    await pool.query(queryText, parameters)
    .catch(err => console.log(err));
}


async function updateDirectory(owner, item_id, parent_id, target_id, category_id, direction) {
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
    const orderStatus = await reorderDirectory(owner, parent_id)
    .then(() => ({'exists': false}))
    .catch((err) => ({'exists': true, 'code': err.code}));

    return orderStatus;
}


async function reorderDirectory(owner, directory_id) {
    const queryText = `
        UPDATE 
            items
        SET
            item_order = T2.row_number
        FROM 
            (SELECT item_id, item_order, category_id, row_number()
                OVER (
                    PARTITION BY category_id
                    ORDER BY category_id, item_order)
                FROM items
                WHERE owner = $1 AND parent_id = $2)
            AS T2
        WHERE T2.item_id = items.item_id;
    `
    const parameters = [owner, directory_id];

    await pool.query(queryText, parameters);    
    return true;
}


async function updateItemOrder(owner, item_id, new_order, direction, parent_id, category_id) {
    if (direction === 'before') {
        await updateColumnValue(item_id, 'item_order', new_order - 0.1);
    } else if (direction === 'after') {
        await updateColumnValue(item_id, 'item_order', new_order + 0.1);
    }

    if (category_id) {
        await updateColumnValue(item_id, 'category_id', category_id);
    }

    await reorderDirectory(owner, parent_id);
    return true;    
}


async function getGrandparent(parent_id) {
    const queryText = `
        SELECT parent_id FROM items WHERE item_id = $1;`;
    const parameters = [parent_id];

    const grandparent_id = await pool.query(queryText, parameters)
    .catch(() => emptyRows);

    return grandparent_id.rows.length === 0 ? false : grandparent_id.rows[0].parent_id;
}


async function deleteItem(owner, item_id, parent_id) {
    const queryText = `
        DELETE FROM items WHERE item_id = $1;`;
    const parameters = [item_id];

    const deleteStatus = await pool.query(queryText, parameters)
    .catch(() => false);
    
    if (!deleteStatus) {
        return false;
    }

    await reorderDirectory(owner, parent_id);
    return true;
}


async function recursive_tree(owner, item_id) {
    const queryText = `
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
            WHERE owner = $1 AND parent_id = $2

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
    `;
    const parameters = [owner, item_id];

    const tree = await pool.query(queryText, parameters);
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
    checkFilePath,
    getDirectory,
    updateDirectory,
    updateItemOrder,
    updateColumnValue,
    getGrandparent,
    addItem,
    deleteItem,
    handleError,
    dropTable,
    recursive_tree
}