const table_utils = require('./db_functions/table_creation');
const user_utils = require('./db_functions/user_creation');
const item_utils = require('./db_functions/item_creation');
const media_utils = require('./db_functions/media_creation');


const glob = {
    user_1: 'hayri',
    user_2: 'mahmut'
}

async function setup(db) {
    const words = ['palace', 'coffee table', 'elevator', 'roof', 'square'];
    const worter = ['Palast', 'Kaffetisch', 'Aufzug', 'dach', 'Quadrat'];
    const kelimeler = ['saray', 'sehpa', 'asansör', 'çatı', 'meydan'];

    // Create tables
    await table_utils.create_users_table(db);
    await table_utils.create_item_table(db);
    await table_utils.create_artist_table(db);
    await table_utils.create_reference_table(db);
    await table_utils.create_word_content_table(db);
    await table_utils.create_translation_table(db);
    await table_utils.create_translation_approval_table(db);
    await table_utils.create_sound_table(db);
    await table_utils.create_sound_approval_table(db);
    await table_utils.create_deck_content_table(db);
    await table_utils.create_word_table(db);
    await table_utils.create_category_content_table(db);

    // Add users
    await user_utils.add_user(db, glob.user_1);
    await user_utils.add_user(db, glob.user_2);

    // Add images
    await media_utils.add_image(db, 'Van Gogh', 'van_gogh.com', 'media/square.png', 'admin', {english: 'square', turkish: 'meydan', german: 'Quadrat'});
    await media_utils.add_image(db, 'Van Gogh', 'van_gogh.com', 'media/square_2.png', 'admin', {english: 'square', turkish: 'karesini almak', german: 'zu quadrieren'});
    await media_utils.add_image(db, 'Caravaggio', 'caravaggio.com', 'media/palace.png', 'admin', {english: 'palace', turkish: 'saray', german: 'Palast'});
    await media_utils.add_image(db, 'Paul Gaugin', 'paul.com', 'media/coffee_table.jpg', 'admin', {english: 'coffee table', turkish: 'sehpa', german: 'Kaffetisch', greek: 'τραπεζάκι του καφέ'});
    await media_utils.add_image(db, 'Caspar David Friedrich', 'caspar.org', 'media/elevator.png', 'admin', {english: 'elevator', turkish: 'asansör', german: 'Aufzug'});
    await media_utils.add_image(db, 'Caspar David Friedrich', 'caspar.org', 'media/elevator_2.PNG', 'admin', {english: 'elevator', turkish: '', german: 'Aufzug'});
    await media_utils.add_image(db, 'Caspar David Friedrich', 'caspar.org', 'media/elevator_3.PNG', 'admin', {english: 'elevator', turkish: 'yükseltici', german: 'Aufzug'});
    await media_utils.add_image(db, 'Caspar David Friedrich', 'caspar.org', 'media/elevator_4.PNG', 'admin', {english: 'elevator', turkish: 'asansör', german: 'Aufzug'});
    await media_utils.add_image(db, 'Caspar David Friedrich', 'caspar.org', 'media/elevator_5.PNG', 'admin', {english: 'elevator', turkish: 'asansör', german: 'Aufzug'});
    await media_utils.add_image(db, 'Caspar David Friedrich', 'caspar.org', 'media/elevator_6.jpeg', 'admin', {english: 'elevator', turkish: 'asansör', german: 'Aufzug'});
    await media_utils.add_image(db, 'Cladue Monet', 'monet.org', 'media/roof.png', 'admin', {english: 'roof', turkish: 'çatı', german: 'dach'});

    // Add sounds
    await media_utils.add_sound(db, 1, 'english', 'media/square.mp3');
    await media_utils.add_sound(db, 2, 'english', 'media/square.mp3');
    await media_utils.add_sound(db, 3, 'english', 'media/palace.mp3');
    await media_utils.add_sound(db, 4, 'english', 'media/coffee table.mp3');
    await media_utils.add_sound(db, 5, 'english', 'media/elevator.mp3');
    await media_utils.add_sound(db, 6, 'english', 'media/roof.mp3');
    await media_utils.add_sound(db, 1, 'turkish', 'media/meydan.mp3');
    await media_utils.add_sound(db, 3, 'turkish', 'media/saray.mp3');
    await media_utils.add_sound(db, 4, 'turkish', 'media/sehpa.mp3');
    await media_utils.add_sound(db, 5, 'turkish', 'media/asansör.mp3');
    await media_utils.add_sound(db, 6, 'turkish', 'media/çatı.mp3');

    // Add user_1 items.
    // Root
    await item_utils.add_folder(db, glob.user_1, 'folder_1', 'folder', 1);
    await item_utils.add_folder(db, glob.user_1, 'folder_2', 'folder', 1);
    await item_utils.add_folder(db, glob.user_1, 'thematic_1', 'thematic_folder', 1);
    await item_utils.add_folder(db, glob.user_1, 'thematic_2', 'thematic_folder', 1);
    await item_utils.add_deck(db, glob.user_1, 'deck_1', 1, kelimeler, 'english', 'turkish', "learn");

    // Categories
    await item_utils.add_category(db, glob.user_1, 'category_1', 5, '#333', 'english', 'turkish', "teach");
    await item_utils.add_category(db, glob.user_1, 'category_2', 5, '#666', 'english', 'turkish', "teach");
    await item_utils.add_category(db, glob.user_1, 'category_1', 6, '#999', 'turkish', 'german', "learn");
    await item_utils.add_category(db, glob.user_1, 'category_3', 6, '#BBB', 'german', 'turkish', "learn");

    // Category items
    await item_utils.add_deck(db, glob.user_1, 'deck_1', 5, words, undefined, undefined, "teach", false, 8);
    await item_utils.add_deck(db, glob.user_1, 'deck_2', 5, words, undefined, undefined, "teach", false, 8);
    await item_utils.add_deck(db, glob.user_1, 'deck_3', 5, words, undefined, undefined, "teach", false, 9);
    await item_utils.add_deck(db, glob.user_1, 'deck_4', 5, words, undefined, undefined, "teach", true, 9);
    await item_utils.add_deck(db, glob.user_1, 'deck_5', 6, kelimeler, undefined, undefined, "teach", true, 10);
    await item_utils.add_deck(db, glob.user_1, 'deck_6', 6, kelimeler, undefined, undefined, "teach", false, 10);
    await item_utils.add_deck(db, glob.user_1, 'deck_1', 6, worter, undefined, undefined, "teach", true, 11);
    await item_utils.add_deck(db, glob.user_1, 'deck_7', 6, worter, undefined, undefined, "teach", false, 11);
    await item_utils.add_deck(db, glob.user_1, 'haha yes', 6, worter, undefined, undefined, "teach", true, 11);

    // Folder Content
    await item_utils.add_deck(db, glob.user_1, 'deck_1', 4, words, 'english', 'turkish', "teach", true);
    await item_utils.add_folder(db, glob.user_1, 'folder_3', 'folder', 4);
    await item_utils.add_folder(db, glob.user_1, 'thematic_1', 'thematic_folder', 4);

    await item_utils.add_folder(db, glob.user_1, 'folder_444', 'folder', 3);
    await item_utils.add_folder(db, glob.user_1, 'folder_1', 'folder', 24);
    await item_utils.add_folder(db, glob.user_1, 'thematic_22', 'thematic_folder', 25);
    await item_utils.add_deck(db, glob.user_1, 'deck_11', 25, words, 'english', 'turkish', "teach", true);

    // Add user 2 items.
    await item_utils.add_folder(db, glob.user_2, 'folder_1', 'folder', 2);
    await item_utils.add_folder(db, glob.user_2, 'folder_2', 'folder', 2);
    await item_utils.add_folder(db, glob.user_2, 'thematic_1', 'thematic_folder', 2);
    await item_utils.add_category(db, glob.user_2, 'category_1', 30, '#333', 'turkish', 'german', "teach");
    await item_utils.add_category(db, glob.user_2, 'category_2', 30, '#F28', 'german', 'english', "teach");
    await item_utils.add_deck(db, glob.user_2, 'deck_1', 30, kelimeler, undefined, undefined, "teach", false, 31);
    await item_utils.add_deck(db, glob.user_2, 'deck_2', 30, worter, undefined, undefined, "teach", true, 32);
    await item_utils.add_deck(db, glob.user_2, 'deck_1', 2, words, 'english', 'turkish', "teach", true);
    await item_utils.add_deck(db, glob.user_2, 'deck_1', 29, words, 'english', 'german', "teach");
    await item_utils.add_folder(db, glob.user_2, 'folder_1', 'folder', 28);

    // Later stuff for testing
    await item_utils.add_category(db, glob.user_1, 'category_33', 26, '#BBB', 'german', 'english', "teach");
}


async function teardown(db) {
    await table_utils.drop_table(db, 'words');
    await table_utils.drop_table(db, 'deck_content');
    await table_utils.drop_table(db, 'category_content');
    await table_utils.drop_table(db, 'sound_approval');
    await table_utils.drop_table(db, 'sound_paths');
    await table_utils.drop_table(db, 'artist_references');
    await table_utils.drop_table(db, 'translation_approval');
    await table_utils.drop_table(db, 'translations');
    await table_utils.drop_table(db, 'word_content');
    await table_utils.drop_table(db, 'artists');
    await table_utils.drop_table(db, 'items');
    await table_utils.drop_table(db, 'users');
}

module.exports = {
    setup, teardown, glob
}