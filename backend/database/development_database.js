const { Pool } = require("pg");

const db = new Pool({
    user: process.env["DEVELOPMENT_USER"],
    password: process.env["DEVELOPMENT_PASSWORD"],
    database: process.env["DEVELOPMENT_DATABASE"],
    host: process.env["DEVELOPMENT_HOST"],
    port: process.env["DEVELOPMENT_PORT"]
});

module.exports = db;