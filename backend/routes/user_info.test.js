const app = require('../app');
const request = require('supertest');

const db = require('../database/test_database');
const setup = require('../database/db_functions/setup');
const { glob } = require('../database/build_database');
const { fail_with_json } = require('../test/functions');


setup.setupBeforeAndAfter(db);


describe('Serve user info', () => {
    test('Existing user', async () => {
        const response = await request(app(db)).get(`/u/${glob.user_1}`);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(200);
        expect(response.body.username).toEqual(glob.user_1); 
        expect(response.body.user_id).toEqual("1");        
    });

    test('Fail on non-existing user', async () => {
        const response = await request(app(db)).get(`/u/random_user`);

        fail_with_json(response, 404, "User not found");
    });

    test('Existing directory', async () => {
        const response = await request(app(db)).get(`/u/${glob.user_1}/1`);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(200);
        expect(response.body[0].length).toEqual(5);        
    });

    test('Fail on non-existing directory', async () => {
        const response = await request(app(db)).get(`/u/${glob.user_2}/1`);

        fail_with_json(response, 404, "Directory not found"); 
    });

    test('Fail on gibberish', async () => {
        const response = await request(app(db)).get(`/u/+%+R+^H)?=()(K6/HT+G/1`);

        fail_with_json(response, 404, "Invalid request");
    });
});


describe('Serve item info', () => {
    test('Existing user, existing item', async () => {
        const response = await request(app(db)).get(`/u/${glob.user_1}/1/item/7`);
        
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(200);
        expect(response.body.item_id).toEqual("7");  
        expect(response.body.words).toEqual("roof.png,square.png,elevator.png,sock.png");   
    });

    test('Fail on existing user, non-existing item', async () => {
        const response = await request(app(db)).get(`/u/${glob.user_1}/1/item/202`);
        
        fail_with_json(response, 404, "Item not found");
    });

    test("Fail on existing user, someone else's item", async () => {
        const response = await request(app(db)).get(`/u/${glob.user_1}/2/item/35`);
        
        fail_with_json(response, 404, "Item not found");
    });

    test('Fail on non-existing user, existing item', async () => {
        const response = await request(app(db)).get(`/u/random_user/1/item/7`);
        
        fail_with_json(response, 404, "Item not found");
    });
});