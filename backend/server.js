require('dotenv').config();
const database = require('./database/development_database');
const db_tests = require('./database/build_database');
const startApp = require('./app');
const app = startApp(database);


async function main() {
    await db_tests.teardown(database);
    await db_tests.setUp(database);
}

main()

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));