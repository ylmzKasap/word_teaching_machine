const pool = require('./db_info')

const errorCodes = {
    23505: "Unique Violation",
    22001: "Input too long",
    42703: "Column does not exist"
}

function handleError(errorCode) {
    if (errorCodes.hasOwnProperty(errorCode)) {
        return errorCodes[errorCode]
    } else {
        return `Error code: ${errorCode}`
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
        item_order BIGINT NOT NULL,
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

async function updateDirectory(
    owner, parent_id, item_name, item_type, parent_name) {
        if (parent_name) {
            // Moving item into a subfolder.
            var new_parent_id = await getItemId(owner, parent_name, parent_id);
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
            WHERE item_name = '${item_name}' AND item_type = '${item_type}' AND parent_id = ${parent_id};
        `)

        // Fix the order of remeaning items.
        const directory = await getDirectory(owner, parent_id, 'item_order')
        for (let i = 0; i < directory.length; i++) {
            await updateColumnValue(owner, directory[i].item_id, 'item_order', i + 1);
        }
        return true;
}

async function getItemId(owner, folder_name, parent_id) {
    const item_id = await pool.query(`
        SELECT item_id FROM ${owner}_table WHERE item_name = '${folder_name}' AND parent_id = ${parent_id};
    `).catch(err => console.log(err));
    return item_id.rows[0].item_id;
}

async function getGrandparent(owner, parent_id) {
    const grandparent_id = await pool.query(`
        SELECT parent_id FROM ${owner}_table WHERE item_id = ${parent_id}
    `).catch(err => console.log(err));
    return grandparent_id.rows[0].parent_id;
}

async function deleteItem(owner, name, parent_id, item_type) {
    await pool.query(`
        DELETE FROM ${owner}_table WHERE 
        (parent_id = ${parent_id} AND item_name = '${name}' AND item_type = '${item_type}');
        `).catch(err => console.log(err));
    return true;
}


module.exports = {
    createUsersTable,
    addUser,
    deleteUser,
    getUserInfo,
    getDirectory,
    updateDirectory,
    updateColumnValue,
    getGrandparent,
    getItemId,
    addItem,
    deleteItem,
    handleError,
    dropTable
}