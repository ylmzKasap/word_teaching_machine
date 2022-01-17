const express = require('express');
const app = express();

const path = require('path')
const cors = require('cors');
const fs = require('fs');

const db_utils = require('./data/db_functions');
const db_tests = require('./data/db_tests');
const pool = require('./data/db_info');


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
            await db_utils.getDirectory(username, directory_id)
            .then(directory => res.status(200).send(directory))
            .catch(() => res.status(404).send('Not Found'));
        } else {
            res.status(200).send(userInfo)
        }
    } else {
        res.status(404).send('Not Found')
    }
});


// Handle deck creation.
app.post("/u/:username/create_deck", async (req, res) => {
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


// Handle folder creation.
app.post("/u/:username/create_folder", async (req, res) => {
    const { username } = req.params;
    const { folderName, parent_id } = req.body;

    // Create folder
    const newFolder = await db_utils.addItem({
        'name': folderName,
        'owner': username,
        'item_type': 'folder',
        'parent': parent_id,
    })
    .then(() => res.end())
    .catch(err => {
        const description = db_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Folder '${folderName}' already exists.` : description);
    });
})


// Delete File or Folder.
app.delete("/u/:username/delete_item", async (req, res) => {
    const { username } = req.params;
    const { item_id, parent_id } = req.body;

    await db_utils.deleteItem(username, item_id, parent_id)
    .then(() => res.end()).catch(() => res.status(400).send('Something went wrong...'));
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

// Send an item to a specific folder.
app.put('/updatedir/:username', async (req, res) => {
    const { username } = req.params;
    const { item_id, parent_id, target_id, direction, item_name, parent_name } = req.body;

    await db_utils.updateDirectory(username, item_id, parent_id, target_id, direction)
        .then(() => res.end())
        .catch(err => {
            const description = db_utils.handleError(err.code);
            return res.status(400).send(
                description == 'Unique Violation'
                ? 
                `Item '${item_name}' already exists in ${parent_name ? parent_name : 'parent folder'}.`
                : description ? description : err);
        })
})

app.put('/paste/:username', async (req, res) => {
    const { username } = req.params;
    const { item_id, old_parent, new_parent, action } = req.body;

    if (item_id === undefined || action === undefined) {
        return res.status(400).send('Clipboard is empty.')};

    // Get copied item.
    let item = await pool.query(`SELECT * FROM ${username}_table WHERE item_id = ${item_id}`);
    item = item.rows[0];
    
    // Check whether a folder is copied into its own subdirectory.
    if (item.item_type === 'folder') {
        var subtree = await db_utils.recursive_tree(username, item_id);
        const subIds = subtree.map(item => parseInt(item.item_id));
        if (subIds.includes(parseInt(new_parent)) || parseInt(item_id) === parseInt(new_parent)) {
            res.status(400).send('Target directory is a subdirectory of the copied folder.');
            return res.end();
        } 
    }

    // Insert copied item.
    if (action === 'copy') {
        await db_utils.addItem({
            'name': item.item_name, 'item_type': item.item_type, 'owner': username,
            'parent': new_parent, 'content': item.content
        }).catch(() => res.status(400).send(
            `${item.item_type} '${item.item_name}' already exists in the directory.`));
        return res.end();
    }

    // Update the directory of cut item.
    else if (action === 'cut') {
        await db_utils.updateDirectory(username, item_id, old_parent, new_parent, 'subfolder')
        .catch(() => res.status(400).send(
            `${item.item_type} '${item.item_name}' already exists in the directory.`));
        return res.end();
    }

    else {
        return res.end()
    }
})

app.put('/updateorder/:username', async (req, res) => {
    const { username } = req.params;
    const { item_id, new_order, direction, parent_id } = req.body;
    
    await db_utils.updateItemOrder(username, item_id, new_order, direction, parent_id)
        .then(() => res.send())
        .catch(err => console.log(err));
})

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


async function main() {
    const xxx = await db_utils.recursive_tree('hayri', 116);
    console.log(xxx.rows.map(x => x.item_id))
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));