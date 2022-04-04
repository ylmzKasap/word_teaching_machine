const addItem = require('./item_creation').addItem;
const utils = require('./index')


async function addUser(pool, name) {
    const addUserQuery = "INSERT INTO users (username, user_picture) VALUES ($1, 'no_pic.png');";
    const addUserParam = [name];
    await pool.query(addUserQuery, addUserParam)

    await addItem(pool, {
        'owner': name,
        'name': `${name}_root`,
        'item_type': 'root_folder'
    })
    const queryText = `
        UPDATE users
        SET root_id = (SELECT item_id FROM items WHERE owner = $1 AND item_type = 'root_folder')
        WHERE username = $2;`
    const parameters = [name, name];
    await pool.query(queryText, parameters)
}


async function deleteUser(pool, name) {
    const queryString = 'DELETE FROM users WHERE username = $1';
    const parameters = [name];

    await pool.query(queryString, parameters).catch(err => console.log(err));
}


async function getUserInfo(pool, owner) {
    const queryString = 'SELECT * FROM users WHERE username = $1;';
    const parameters = [owner];

    const userInfo = await pool.query(queryString, parameters)
    .catch(() => utils.emptyRows);

    return userInfo.rows[0] ? userInfo.rows[0] : false;
}

module.exports = {
    addUser, deleteUser, getUserInfo
}