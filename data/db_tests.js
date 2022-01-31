const db_utils = require('./db_functions');


async function setUp() {
    await db_utils.createUsersTable();
    await db_utils.createItemTable();
    await db_utils.createContentTable();
    await db_utils.addUser('hayri');
    await db_utils.addUser('mahmut');
    await db_utils.addItem({'name': 'folder_1', 'owner': 'hayri', 'item_type': 'folder', 'parent': 1});
    await db_utils.addItem({'name': 'folder_2', 'owner': 'hayri', 'item_type': 'folder', 'parent': 1});
    await db_utils.addItem({'name': 'folder_3', 'owner': 'hayri', 'item_type': 'folder', 'parent': 3});
    await db_utils.addItem({'name': 'folder_4', 'owner': 'hayri', 'item_type': 'folder', 'parent': 3});
    await db_utils.addItem({'name': 'folder_5', 'owner': 'hayri', 'item_type': 'folder', 'parent': 4});
    await db_utils.addItem({'name': 'file_1', 'owner': 'hayri', 'item_type': 'file', 'parent': 1, 'content': {'words': 'roof.png'}});
    await db_utils.addItem({'name': 'file_2', 'owner': 'hayri', 'item_type': 'file', 'parent': 1, 'content': {'words': 'roof.png,natural.png'}});
    await db_utils.addItem({'name': 'file_3', 'owner': 'hayri', 'item_type': 'file', 'parent': 1, 'content': {'words': 'roof.png,elevator.png'}});
    await db_utils.addItem({'name': 'file_4', 'owner': 'hayri', 'item_type': 'file', 'parent': 3, 'content': {'words': 'roof.png'}});
    await db_utils.addItem({'name': 'file_5', 'owner': 'hayri', 'item_type': 'file', 'parent': 4, 'content': {'words': 'roof.png,elevator.png'}});
    await db_utils.addItem({'name': 'file_6', 'owner': 'hayri', 'item_type': 'file', 'parent': 4, 'content': {'words': 'roof.png'}});
    await db_utils.addItem({'name': 'file_7', 'owner': 'hayri', 'item_type': 'file', 'parent': 6, 'content': {'words': 'roof.png,elevator.png'}});
    await db_utils.addItem({'name': 'file_8', 'owner': 'hayri', 'item_type': 'file', 'parent': 1, 'content': {'words': 'roof.png'}});
    await db_utils.addItem({'name': 'folder_1', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 2});
    await db_utils.addItem({'name': 'folder_2', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 2});
    await db_utils.addItem({'name': 'folder_3', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 2});
    await db_utils.addItem({'name': 'file_1', 'owner': 'mahmut', 'item_type': 'file', 'parent': 2, 'content': {'words': 'roof.png'}});
    await db_utils.addItem({'name': 'file_2', 'owner': 'mahmut', 'item_type': 'file', 'parent': 2, 'content': {'words': 'roof.png,elevator.png'}});
    await db_utils.addItem({'name': 'file_3', 'owner': 'mahmut', 'item_type': 'file', 'parent': 2, 'content': {'words': 'roof.png'}});
    await db_utils.addItem({'name': 'file_4', 'owner': 'mahmut', 'item_type': 'file', 'parent': 2, 'content': {'words': 'roof.png'}});
}


async function teardown() {
    await db_utils.dropTable('contents');
    await db_utils.dropTable('items');
    await db_utils.dropTable('users');
}

module.exports = {
    setUp, teardown
}