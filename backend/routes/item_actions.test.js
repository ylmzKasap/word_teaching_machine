const app = require('../app');
const request = require('supertest');

const db = require('../database/test_database');
const setup = require('../database/db_functions/setup');
const { glob } = require('../database/build_database');

const test_utils = require('../test/functions');
const { getItemInfo } = require('../database/db_functions/item_functions');
const { fail_with_json, numbers_in_order, group_objects } = require('../test/functions');
const { getDirectory } = require('../database/db_functions/directory');


setup.setupBeforeAndAfter(db);

describe('Change item directory', () => {
    const updateUrl = `/updatedir/${glob.user_1}`;

    test('To a subfolder', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 4,
            target_id: 3
        });

        expect(response.status).toEqual(200);

        // Moved into a correct folder with a correct item order.
        const movedItem = await getItemInfo(db, 4);
        expect(movedItem.parent_id).toEqual(3);
        expect(movedItem.item_order).toEqual("2");

        // Following item's order is decremented.
        const followingItem = await getItemInfo(db, 5);
        expect(followingItem.item_order).toEqual("2");

        // All old directory items are in order.
        const previousDirectory = await getDirectory(db, glob.user_1, 1);
        let oldItemOrders = previousDirectory[0].map(x => x.item_order);
        oldItemOrders = oldItemOrders.map(n => parseInt(n));
        expect(numbers_in_order(oldItemOrders)).toBe(true);

        // All new directory items are in order.
        const newDirectory = await getDirectory(db, glob.user_1, 3);
        let newItemOrders = newDirectory[0].map(x => x.item_order);
        newItemOrders = newItemOrders.map(n => parseInt(n));
        expect(numbers_in_order(newItemOrders)).toBe(true);
    });

    test('To a parent folder', async () => {
        const notYetMovedItem = await getItemInfo(db, 19);

        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 19,
            target_id: null
        });

        expect(response.status).toEqual(200);

        // Moved into a correct folder with a correct item order.
        const movedItem = await getItemInfo(db, 19);
        expect(movedItem.parent_id).toEqual(1);
        expect(movedItem.item_order).toEqual("6");
        expect(movedItem.category_id).toBe(null);

        const oldDirectory = await getDirectory(db, glob.user_1, notYetMovedItem.parent_id);
        // All items in categories are ordered.
        const groupedDir = group_objects(oldDirectory[0], 'category_id');
        for (let group in groupedDir) {
            let itemOrders = groupedDir[group].map(x => x.item_order);
            itemOrders = itemOrders.map(x => parseInt(x));
            expect(numbers_in_order(itemOrders)).toBe(true);
        }
    });

    test('No duplicate items', async () => {
        const parentResponse = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 18,
            target_id: null
        });

        fail_with_json(parentResponse, 400, "'deck_1' already exists in the parent folder.");

        const targetResponse = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 7,
            target_id: 4
        });

        fail_with_json(targetResponse, 400, "'deck_1' already exists in 'folder_2'.");
    });

    test('Should not move the item outside of the root folder', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 4,
            target_id: null
        });

        fail_with_json(response, 400, 'Invalid directory');
    });

    test('New directory must belong to the same user', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 6,
            target_id: 29
        });

        fail_with_json(response, 400, 'Invalid directory');
    });

    test('Only move into regular or root folder', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 4,
            target_id: 5
        });

        fail_with_json(response, 400, 'Invalid directory');
    });

    test('Categories can only be moved to thematic folders', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 10,
            target_id: 1
        });

        fail_with_json(response, 400, 'Invalid directory');
    });

    test('Should not move a directory to its subdirectory', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 3,
            target_id: 25
        });

        fail_with_json(response, 400, 'Invalid directory');
    });

    test('Should not move a directory into itself', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 3,
            target_id: 3
        });

        fail_with_json(response, 400, 'Invalid directory');
    });

    test('Should not move a root folder', async () => {
        const response = await request(app(db))
        .put(updateUrl)
        .send({
            item_id: 1,
            target_id: 3
        });

        fail_with_json(response);
    });

    test("Body values must be present and valid", async () => {
        await test_utils.check_type_blank({
            item_id: 4,
            target_id: 3
        }, updateUrl, 'put', app, db);
    }); 
});

