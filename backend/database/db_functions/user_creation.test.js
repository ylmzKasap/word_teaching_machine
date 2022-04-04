const db = require('../test_database');
const roV = require('./other_functions').roV;

const user_utils = require('./user_creation');
const setup = require('./setup');
const glob = require('../build_database').glob;


setup.setupBeforeAndAfter();

test('Add users and root', async () => {
  const userQuery = `
    SELECT * FROM users
      LEFT JOIN items ON users.username = items.owner
      AND items.item_type = 'root_folder'
    WHERE username = $1`;
  
  const [userData1, userData2] = await Promise.all([
    db.query(userQuery, [glob.user_1]),
    db.query(userQuery, [glob.user_2])
  ]);

  expect(roV(userData1).username).toBe(glob.user_1);
  expect(roV(userData1).root_id).toBe(1);
  expect(roV(userData1).item_name).toBe(`${glob.user_1}_root`);

  expect(roV(userData2).username).toBe(glob.user_2);
  expect(roV(userData2).root_id).toBe(2);
  expect(roV(userData2).item_name).toBe(`${glob.user_2}_root`);
});


test('Delete the user', async () => {
  await user_utils.deleteUser(db, glob.user_2);

  const userQuery = `
    SELECT * FROM users WHERE username = $1
  `
  const userData = await db.query(userQuery, [glob.user_2]);

  expect(roV(userData)).toBe(undefined);
});


test('Get user info', async () => {
  let [user_1, user_2] = await Promise.all([
    user_utils.getUserInfo(db, glob.user_1), user_utils.getUserInfo(db, glob.user_2)
  ]);

  expect(user_1.user_id).toBe("1");
  expect(user_1.username).toBe(glob.user_1);
  expect(user_1.user_picture).toBe('no_pic.png');
  expect(user_1.root_id).toBe(1);

  expect(user_2.user_id).toBe("2");
  expect(user_2.username).toBe(glob.user_2);
  expect(user_2.root_id).toBe(2);
});


