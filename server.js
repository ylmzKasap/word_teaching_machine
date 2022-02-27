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
app.get('/u/:username/:directory_id?', async (req, res) => {
    const { username, directory_id } = req.params;
    const info = await db_utils.getUserInfo(username);

    const dirId = directory_id === 'home' ? await db_utils.getRoot(username) : directory_id;
    
    if (info) {
        if (dirId) {
            const [directory, dirInfo] = await db_utils.getDirectory(username, dirId);

            if (directory) {
                return res.status(200).send([directory, dirInfo]);
            } else {
                return res.status(404).send('Directory Not Found.')
            }

        } else {
            res.status(200).send(info);
        }
    } else {
        res.status(404).send('User Not Found');
    }
});



// Serve Item Info.
app.get('/u/:username/:directory_id/item/:item_id', async (req, res) => {
    const { username, directory_id, item_id } = req.params;
    const pathExists = await db_utils.checkFilePath(username, directory_id, item_id);

    if (!pathExists) {
        return res.status(404).send("Item does not exist.");
    }

    const itemInfo = await db_utils.getItemInfo(item_id);
    
    if (itemInfo === null) {
        return res.status(404).send('Deck does not exist.');
    } else {
        return res.status(200).send(itemInfo);
    }
});



// Handle deck creation.
app.post("/u/:username/create_deck", async (req, res) => {
    const { username } = req.params;
    const { deckName, content, parent_id, category_id } = req.body;
    
    // Locate image files.
    const imageExtensions = ['.jpg', '.png', '.PNG', '.jpeg', '.webp'];
    const [missingFiles, foundFiles] = findFiles(
        "media/images/", content.words.split(','), imageExtensions);

    if (missingFiles.length > 0) {
        return res.status(417).send(`Images not found: ${missingFiles.join(', ')}.`);
    }
    
    // Create deck
    await db_utils.addItem({
        'name': deckName,
        'owner': username,
        'item_type': 'file',
        'parent': parent_id,
        'category_id': category_id,
        'content': {'words': foundFiles.join(',')}
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
    const { folder_name, parent_id, folder_type } = req.body;

    const itemType = (folder_type === 'Thematic folder') ? 'thematic_folder' : 'folder';

    await db_utils.addItem({
        'name': folder_name,
        'owner': username,
        'item_type': itemType,
        'parent': parent_id,
    })
    .then(() => res.end())
    .catch(err => {
        const description = db_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Folder '${folder_name}' already exists.` : description);
    });
})


// Handle category creation.
app.post("/u/:username/create_category", async (req, res) => {
    const { username } = req.params;
    const { category_name, parent_id, content } = req.body;

    await db_utils.addItem({
        'name': category_name,
        'owner': username,
        'item_type': 'category',
        'parent': parent_id,
        'content': content
    })
    .then(() => res.end())
    .catch(err => {
        const description = db_utils.handleError(err.code);
        return res.status(400).send(
            description == 'Unique Violation' ? `Category '${category_name}' already exists.` : description);
    });
})


// Delete File, Folder or Category.
app.delete("/u/:username/delete_item", async (req, res) => {
    const { username } = req.params;
    const { item_id, parent_id } = req.body;

    const deleteStatus = await db_utils.deleteItem(username, item_id, parent_id);

    if (deleteStatus) {
        return res.end();
    } else {
        return res.status(400).send('Something went wrong...');
    }
});



// Set directory to parent folder.
app.get('/updir/:username/:parent_id', async (req, res) => {
    const { username, parent_id } = req.params;

    const grandparent_id = await db_utils.getGrandparent(parent_id);

    // Redirect to root the folder if parent is somehow deleted.
    if (!grandparent_id) {
        const rootId = await db_utils.getRoot(username);
        if (rootId) {
            return res.status(200).send(String(rootId));
        } else {
            return res.status(404).send('Not found');
        }
    }

    if (grandparent_id) {
        return res.status(200).send(String(grandparent_id));
    } else {
        return res.status(400).send('Something went horribly wrong.');
    }
});



// Send an item to a specific folder.
app.put('/updatedir/:username', async (req, res) => {
    const { username } = req.params;
    const { item_id, parent_id, target_id, direction, item_name, parent_name } = req.body;

    const updateStatus = await db_utils.updateDirectory(
        username, item_id, parent_id, target_id, null, direction);

    if (!updateStatus.exists) {
        return res.end()
    } else {
        const description = db_utils.handleError(updateStatus.code);
        return res.status(400).send(
            description == 'Unique Violation' ? 
            `'${item_name}' already exists in ${parent_name ? `folder '${parent_name}'` : 'the parent folder'}.`
            :
            description ?
            description : `Error: ${err.code}, sorry.`);
    }
})


// Copy & paste stuff.
app.put('/paste/:username', async (req, res) => {
    const { username } = req.params;
    const { item_id, item_type, old_parent, new_parent, category_id, action } = req.body;

    if (item_id === undefined || action === undefined) {
        return res.status(400).send('Clipboard is empty.')};

    // Get copied item.
    let item = await db_utils.getItemInfo(item_id);
    if (!item) {
        return res.status(404).send('Item does not exist anymore.')
    }
    
    // Check whether a folder is copied into its own subdirectory.
    if (item.item_type === 'folder') {
        var subtree = await db_utils.recursive_tree(username, item_id);
        const subIds = subtree.map(item => parseInt(item.item_id));
        if (subIds.includes(parseInt(new_parent)) || parseInt(item_id) === parseInt(new_parent)) {
            res.status(400).send(`This directory is a subdirectory of '${item.item_name}'.`);
            return res.end();
        } 
    }

    const titleType = item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1);
    // Insert copied item.
    if (action === 'copy') {
        await db_utils.addItem({
            'name': item.item_name, 'item_type': item.item_type, 'category_id': category_id,
            'owner': username, 'parent': new_parent, 'content': {'words': item.words}
        }).catch((err) => res.status(400).send(
            `${titleType} '${item.item_name}' already exists in the directory.`));
        return res.end();
    }
    // Update the directory of cut item.
    else if (action === 'cut') {
        const updateStatus = await db_utils.updateDirectory(
            username, item_id, old_parent, new_parent, category_id, 'subfolder')

        if (updateStatus.exists) {
            return res.status(400).send(
                `${titleType} '${item.item_name}' already exists in the directory.`)
        }

        // Move the category.
        const categoryItems = await db_utils.getDirectory(
            username, old_parent, item_id
        )
        for (let item of categoryItems[0]) {
            await db_utils.updateColumnValue(item.item_id, 'parent_id', new_parent);
        }
        return res.end();
    }
    else {
        return res.end()
    }
})



app.put('/updateorder/:username', async (req, res) => {
    const { username } = req.params;
    const { item_id, new_order, direction, parent_id, category_id } = req.body;
    
    await db_utils.updateItemOrder(username, item_id, new_order, direction, parent_id, category_id)
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
    db_tests.setUp()
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));