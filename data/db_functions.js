const pool = require('./db_info')

const errorCodes = {
    23505: "Unique Violation"
}

function handleError(errorCode) {
    if (errorCodes.hasOwnProperty(errorCode)) {
        return errorCodes[errorCode]
    } else {
        return 'Something went wrong...'
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
        item_name VARCHAR(30) NOT NULL,
        parent_id INT REFERENCES ${name}_table (item_id)
        ON DELETE CASCADE,
        owner VARCHAR(30) REFERENCES users (username)
        ON DELETE CASCADE,
        content VARCHAR(1000),
        CONSTRAINT ${name}_unique_files UNIQUE (item_name, parent_id, owner)
    );`).catch(err => console.log(err));
}

async function addUser(name) {
    await pool.query(`INSERT INTO users (username, user_picture) VALUES ('${name}', 'no_pic.png');`)
        .then(() => createItemTable(name)
        .then(() => {addItem({
            'table': `${name}_table`,
            'name': `${name}_root`,
            'owner': name,
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
    if (item_type === 'root_folder') {
        await pool.query(
            `INSERT INTO ${owner}_table (item_name, item_type, owner)
            VALUES ('${name}', '${item_type}', '${owner}');`
        )
   
        } else if (item_type === 'folder') {
        await pool.query(
            `INSERT INTO ${owner}_table (item_name, item_type, owner, parent_id)
            VALUES ('${name}', '${item_type}', '${owner}', '${parent}');
        `)
   
        } else if (item_type === 'file') {
        await pool.query(
            `INSERT INTO ${owner}_table (item_name, item_type, owner, content, parent_id)
            VALUES ('${name}', '${item_type}', '${owner}', '${content}', '${parent}');
        `)
    }
}

async function getUserInfo(owner) {
    const userInfo = await pool.query(`
        SELECT * FROM users WHERE username = '${owner}';
    `).catch(err => console.log(err));
    return userInfo.rows[0];
}

async function getDirectory(owner, item_id) {
    const directory = await pool.query(`
        SELECT * FROM ${owner}_table WHERE parent_id = ${item_id};
    `).catch(err => console.log(err));
    return directory.rows;
}

async function getFiles(owner, parent_id) {
    const files = await pool.query(`
        SELECT * FROM ${owner}_table WHERE parent_id = ${parent_id} AND item_type = 'file';
    `).catch(err => console.log(err));
    return files.rows;
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

async function deleteFolder(owner, folder, parent_id) {
    await pool.query(`
        DELETE FROM ${owner}_table WHERE (parent_id = ${parent_id} AND item_name = '${folder}');
        `).catch(err => console.log(err));
    return true;
}

module.exports = {
    addUser,
    deleteUser,
    getUserInfo,
    addItem,
    getDirectory,
    getFiles,
    getGrandparent,
    getItemId,
    deleteFolder,
    handleError
}