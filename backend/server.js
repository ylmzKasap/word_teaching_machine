require('dotenv').config();
const db_tests = require('./database/build_database');
const startApp = require('./app');
const development_db = require('./database/development_database');
const { Pool } = require("pg");
const synthesize_speech = require('./api/speech/SpeechSynthesis');
const { upload_file } = require('./api/storage/s3_functions');

const isProduction = process.env.NODE_ENV === "production";

let database;
if (isProduction) {
  database = new Pool({
    connectionString: process.env.DATABASE_URL
  , ssl: {
    rejectUnauthorized: false,
  }});
} else {
  database = new Pool({
    connectionString: development_db});
}

const app = startApp(database);

async function main() {
  await db_tests.teardown(database);
  await db_tests.setup(database);
}

main()

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));