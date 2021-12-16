const express = require('express');
const app = express();

var serveStatic = require('serve-static')
const path = require('path')
const cors = require('cors');
const pool = require('./data/decks/db');
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());

// Serve User Info.
app.get('/u/:username/:userInfo?', async (req, res) => {
  const { username, userInfo } = req.params;
  const decks = await pool.query(
    `SELECT * FROM user_info WHERE username = '${username}'`
  ).catch(err => console.log(err));

  const user = decks.rows[0]; 
  
  if (user) {
    if (userInfo) {
      if (user.hasOwnProperty(userInfo)) {
        res.status(200).send(user[userInfo]);
      } else {
        res.status(404).send('Not Found')
      }
    } else {
      res.status(200).send(user);
    }
  } else {
    res.status(404).send('Not Found')
  }
});

// Handle deck creation.
app.post("/u/:username/:userInfo?", async (req, res) => {
  const { username } = req.params;
  const deckInfo = req.body;

  const getDecks = await pool.query(
    `SELECT * FROM user_info WHERE username = '${username}'`
  ).catch(err => console.log(err));

  const currentDecks = getDecks.rows[0]['user_decks'];

  if (currentDecks.hasOwnProperty(deckInfo['deckName'])) {
    res.status(409).send(`Deck '${deckInfo['deckName']}' already exists.`)
  }

  currentDecks[deckInfo['deckName']] = deckInfo['cards'];
  const updateDecks =  await pool.query(
    `UPDATE user_info SET user_decks = '${JSON.stringify(currentDecks)}' WHERE username = '${username}';`
  ).catch(err => console.log(err));
  res.status(200).send('Created the deck.')
});

// Delete decks.
app.delete("/u/:username/:userInfo?", async (req, res) => {
  const { username } = req.params;
  const deckInfo = req.body;

  const getDecks = await pool.query(
    `SELECT * FROM user_info WHERE username = '${username}'`
  ).catch(err => console.log(err));

  const currentDecks = getDecks.rows[0]['user_decks'];
  delete currentDecks[deckInfo['deck']];

  const updateDecks =  await pool.query(
    `UPDATE user_info SET user_decks = '${JSON.stringify(currentDecks)}' WHERE username = '${username}';`
  ).catch(err => console.log(err));
  res.status(200).send('Deleted the deck.');
});


const findFiles = (directory, wordArray, extensions) => {
  // Directory -> `${process.cwd()}\\media\\images\\`
  let missingFiles = [];
  let foundFiles = [];
  for (let word of wordArray) {
    let fileFound = false;
    for (let extension of extensions) {
      if (fs.existsSync(directory + word + extension)) {
        foundFiles.push(directory + word + extension);
        fileFound = true;
        break;
      }
    }
    if (!fileFound) {
      missingFiles.push(word);
    }
  };
};


// findFiles(`${process.cwd()}\\media\\images\\`, ['curtain', 'egoo', 'coffee table', 'hm', 'cof'], ['.jpg', '.png', '.jpeg', '.webp']);

// Serve media files.
app.use(serveStatic(path.join(__dirname, 'media/images')))
app.use(serveStatic(path.join(__dirname, 'media/sounds')))


const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));