const db_utils = require('./db_functions');


async function setUp() {
    await db_utils.createUsersTable();
    await db_utils.addUser('hayri');
    await db_utils.addUser('mahmut');
    await db_utils.addItem({'name': 'unit_1', 'owner': 'hayri', 'item_type': 'folder', 'parent': 1});
    await db_utils.addItem({'name': 'unit_2', 'owner': 'hayri', 'item_type': 'folder', 'parent': 1});
    await db_utils.addItem({'name': 'folder_1', 'owner': 'hayri', 'item_type': 'folder', 'parent': 3});
    await db_utils.addItem({'name': 'folder_2', 'owner': 'hayri', 'item_type': 'folder', 'parent': 3});
    await db_utils.addItem({'name': 'folder_1', 'owner': 'hayri', 'item_type': 'folder', 'parent': 4});
    await db_utils.addItem({'name': 'file_1', 'owner': 'hayri', 'item_type': 'file', 'parent': 2, 'content': 'roof.png'});
    await db_utils.addItem({'name': 'file_2', 'owner': 'hayri', 'item_type': 'file', 'parent': 2, 'content': 'roof.png, natural.png'});
    await db_utils.addItem({'name': 'file_3', 'owner': 'hayri', 'item_type': 'file', 'parent': 2, 'content': 'roof.png, elevator.png'});
    await db_utils.addItem({'name': 'file_4', 'owner': 'hayri', 'item_type': 'file', 'parent': 3, 'content': 'roof.png'});
    await db_utils.addItem({'name': 'file_5', 'owner': 'hayri', 'item_type': 'file', 'parent': 4, 'content': 'roof.png, elevator.png'});
    await db_utils.addItem({'name': 'file_6', 'owner': 'hayri', 'item_type': 'file', 'parent': 4, 'content': 'roof.png'});
    await db_utils.addItem({'name': 'file_7', 'owner': 'hayri', 'item_type': 'file', 'parent': 6, 'content': 'roof.png, elevator.png'});
    await db_utils.addItem({'name': 'file_8', 'owner': 'hayri', 'item_type': 'file', 'parent': 1, 'content': 'roof.png'});
    await db_utils.addItem({'name': 'mahmut_1', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 1});
    await db_utils.addItem({'name': 'mahmut_2', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 1});
    await db_utils.addItem({'name': 'mahmut_3', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 3});
    await db_utils.addItem({'name': 'mahmut_1', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 4});
    await db_utils.addItem({'name': 'file_1_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 2, 'content': 'roof.png'});
    await db_utils.addItem({'name': 'file_2_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 3, 'content': 'roof.png, elevator.png'});
    await db_utils.addItem({'name': 'file_3_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 4, 'content': 'roof.png'});
    await db_utils.addItem({'name': 'file_4_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 4, 'content': 'roof.png'});
}


async function teardown() {
    await db_utils.dropTable('mahmut_table');
    await db_utils.dropTable('hayri_table');
    await db_utils.dropTable('users');
}

module.exports = {
    setUp, teardown
}