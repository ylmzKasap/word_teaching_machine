const db = require('../test_database');
const setup = require('./setup');
const roV = require('./other_functions').roV;


setup.setupBeforeAndAfter();

test('Create database tables', async () => {
  const tableExistsQuery = "SELECT EXISTS (SELECT relname FROM pg_class WHERE relname = $1);"
  let userQuery = db.query(tableExistsQuery, ['users']);
  let itemQuery = db.query(tableExistsQuery, ['items']);
  let contentQuery = db.query(tableExistsQuery, ['contents']);
  
  const [userTable, itemTable, contentTable] = await Promise.all([
    userQuery, itemQuery, contentQuery])

  expect(
    roV(userTable).exists &&
    roV(itemTable).exists &&
    roV(contentTable).exists).toBe(true);
});