async function setUp() {
    await createUsersTable();
    await addUser('hayri');
    await addUser('mahmut');
    await addItem({'name': 'unit_1', 'owner': 'hayri', 'item_type': 'folder', 'parent': 1});
    await addItem({'name': 'unit_2', 'owner': 'hayri', 'item_type': 'folder', 'parent': 1});
    await addItem({'name': 'folder_1', 'owner': 'hayri', 'item_type': 'folder', 'parent': 3});
    await addItem({'name': 'folder_2', 'owner': 'hayri', 'item_type': 'folder', 'parent': 3});
    await addItem({'name': 'folder_3', 'owner': 'hayri', 'item_type': 'folder', 'parent': 4});
    await addItem({'name': 'file_1', 'owner': 'hayri', 'item_type': 'file', 'parent': 2, 'content': 'curtain'});
    await addItem({'name': 'file_2', 'owner': 'hayri', 'item_type': 'file', 'parent': 2, 'content': 'natural, elevator'});
    await addItem({'name': 'file_3', 'owner': 'hayri', 'item_type': 'file', 'parent': 2, 'content': 'grotesque'});
    await addItem({'name': 'file_4', 'owner': 'hayri', 'item_type': 'file', 'parent': 3, 'content': 'haha, yes'});
    await addItem({'name': 'file_5', 'owner': 'hayri', 'item_type': 'file', 'parent': 4, 'content': 'hello, there'});
    await addItem({'name': 'file_6', 'owner': 'hayri', 'item_type': 'file', 'parent': 4, 'content': 'random word'});
    await addItem({'name': 'file_7', 'owner': 'hayri', 'item_type': 'file', 'parent': 6, 'content': 'fish'});
    await addItem({'name': 'file_8', 'owner': 'hayri', 'item_type': 'file', 'parent': 1, 'content': 'blue, purple'});
    await addItem({'name': 'mahmut_1', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 1});
    await addItem({'name': 'mahmut_2', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 1});
    await addItem({'name': 'mahmut_3', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 3});
    await addItem({'name': 'mahmut_1', 'owner': 'mahmut', 'item_type': 'folder', 'parent': 4});
    await addItem({'name': 'file_1_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 2, 'content': 'dawn, long'});
    await addItem({'name': 'file_2_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 3, 'content': 'forest, echo'});
    await addItem({'name': 'file_3_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 4, 'content': 'laughter'});
    await addItem({'name': 'file_4_M', 'owner': 'mahmut', 'item_type': 'file', 'parent': 4, 'content': 'makes, me, wonder'});
}


async function teardown() {
    await dropTable('mahmut_table');
    await dropTable('hayri_table');
    await dropTable('users');
}

module.exports = {
    setUp, teardown
}