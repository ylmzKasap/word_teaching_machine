const express = require('express');
const app = express();

const path = require('path')
const cors = require('cors');
const fs = require('fs');

const db_utils = require('./data/db_functions');
const db_tests = require('./data/db_tests');


// Middleware
app.use(cors());
app.use(express.json());

// Serve media files.
app.use("/media", express.static(path.join(__dirname, 'media/images')));
app.use("/media", express.static(path.join(__dirname, 'media/sounds')));



// Serve User Info.
app.get('/u/:username/:directory_id?', async (req, res, next) => {
    const { username, directory_id } = req.params;
    const userInfo = await db_utils.getUserInfo(username);
    
    if (userInfo) {
        if (directory_id) {
            const directory = await db_utils.getDirectory(username, directory_id);
            if (directory) {
                res.status(200).send(directory);
            } else {
                res.status(404).send('Not Found')
            }
        } else {
            res.status(200).send(userInfo)
        }
    } else {
        res.status(404).send('Not Found')
    }
});


// Handle deck creation.
app.post("/u/:username/:create_deck", async (req, res, next) => {
    const { username } = req.params;
    const { deckName, cards, parent_id } = req.body;
    
    // Locate image files.
    const imageExtensions = ['.jpg', '.png', '.PNG', '.jpeg', '.webp'];
    const [missingFiles, foundFiles] = findFiles(
        "media\\images\\", cards.split(','), imageExtensions);

    if (missingFiles.length > 0) {
        return res.status(417).send(`Images not found: ${missingFiles.join(', ')}.`);
    }
    
    // Create deck
    const newDeck = await db_utils.addItem({
        'name': deckName,
        'owner': username,
        'item_type': 'file',
        'parent': parent_id,
        'content': foundFiles
    })
    .then(() => res.end())
    .catch(err => {
        const description = db_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Deck '${deckName}' already exists.` : description);
    });
});


// Delete deck.
app.delete("/u/:username/:delete_deck", async (req, res) => {
    const { username } = req.params;
    const { deckName, parent_id } = req.body;

    await db_utils.deleteFolder(username, deckName, parent_id)
    .then(() => res.end()).catch(res.status(400).send('Something went wrong...'));
});


// Set directory to child folder.
app.get('/subdir/:username/:folder_name/:parent_id', async (req, res) => {
    const { username, folder_name, parent_id } = req.params;

    const childDirectoryId = await db_utils.getItemId(username, folder_name, parent_id);

    if (childDirectoryId) {
        res.status(200).send(childDirectoryId)
    } else {
        res.status(400).send('Folder not found.')
    }
});

// Set directory to parent folder.
app.get('/updir/:username/:parent_id', async (req, res) => {
    const { username, parent_id } = req.params;

    const grandparent_id = await db_utils.getGrandparent(username, parent_id);

    if (grandparent_id) {
        res.status(200).send(grandparent_id.toString());
    } else {
        res.status(400).send('Something went horribly wrong.');
    }
});

function findFiles (directory, wordArray, extensions) {
    // Directory -> `${process.cwd()}\\media\\images\\`
    let missingFiles = [];
    let foundFiles = [];
    for (let word of wordArray) {
        let fileFound = false;
        for (let extension of extensions) {
            if (fs.existsSync(directory + word + extension)) {
                foundFiles.push(word + extension);
                fileFound = true;
                break;
            }
        }
        if (!fileFound) {
            missingFiles.push(word);
        }
    };
    return [missingFiles, foundFiles];
};


const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));