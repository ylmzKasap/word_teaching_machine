const app = require('../app');
const request = require('supertest');

const db = require('../database/test_database');
const setup = require('../database/db_functions/setup');
const { glob } = require('../database/build_database');
const { fail_with_json } = require('../test/functions');


setup.setupBeforeAndAfter(db);


describe('Give parent directory', () => {
    test('Should work with normal input', async () => {
        const response = await request(app(db)).get(`/goback/${glob.user_1}/24`);

        expect(response.status).toEqual(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.parent_id).toEqual(3);

        const response_2 = await request(app(db)).get(`/goback/${glob.user_1}/23`);
        expect(response_2.status).toEqual(200);
        expect(response_2.headers["content-type"]).toMatch(/json/);
        expect(response_2.body.parent_id).toEqual(4);

        const response_3 = await request(app(db)).get(`/goback/${glob.user_1}/4`);
        expect(response_3.status).toEqual(200);
        expect(response_3.headers["content-type"]).toMatch(/json/);
        expect(response_3.body.parent_id).toEqual(1);
    });

    test('Return root folder if parent does not exist', async () => {
        const response = await request(app(db)).get(`/goback/${glob.user_1}/32523`);

        expect(response.status).toEqual(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.parent_id).toEqual(1);

        const response_2 = await request(app(db)).get(`/goback/${glob.user_2}/32523`);

        expect(response_2.status).toEqual(200);
        expect(response_2.headers["content-type"]).toMatch(/json/);
        expect(response_2.body.parent_id).toEqual(2);
    });

    test("Return correct root on someone else's directory", async () => {
        const response = await request(app(db)).get(`/goback/${glob.user_1}/37`);

        expect(response.status).toEqual(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.parent_id).toEqual(1);

        const response_2 = await request(app(db)).get(`/goback/${glob.user_2}/24`);

        expect(response_2.status).toEqual(200);
        expect(response_2.headers["content-type"]).toMatch(/json/);
        expect(response_2.body.parent_id).toEqual(2);
    });

    test('Fail on non-existing user', async () => {
        const response = await request(app(db)).get(`/goback/hmm_yes/4`);

        fail_with_json(response, 400, "User does not exist");
    });

    test('Parameters must be valid', async () => {
        const response = await request(app(db)).get(`/goback/hayri/ffs`);

        fail_with_json(response, 400, "Type mismatch");
    })
});