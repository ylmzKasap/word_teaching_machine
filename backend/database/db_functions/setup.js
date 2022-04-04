const db = require('../test_database');
const db_builder = require('../build_database');


function setupBeforeAndAfter() {
    afterAll(async () => {
        await db.end();
    });
    beforeEach(async () => {
        await db_builder.setUp(db);        
    });
    afterEach(async () => {
        await db_builder.teardown(db);
    });
}

module.exports = {
    setupBeforeAndAfter
}