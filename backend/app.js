const express = require('express');
const path = require('path')
const cors = require('cors');

const user_info = require("./routes/user_info");
const item_creation = require("./routes/item_creation");
const item_actions = require("./routes/item_actions");
const directory_actions = require("./routes/directory_actions");
const clipboard = require("./routes/clipboard");


module.exports = (database) => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.set('database', database);

    // Serve media files.
    app.use("/media", express.static(path.join(__dirname, "public/images")));
    app.use("/media", express.static(path.join(__dirname, "public/sounds")));

    /* Routing */

    // User info
    app.get('/u/:username/:directory_id?', user_info.serve_user);
    app.get('/u/:username/:directory_id/item/:item_id', user_info.serve_item);

    // Item actions
    app.post("/create_deck/:username", item_creation.create_deck);
    app.post("/create_folder/:username", item_creation.create_folder);
    app.post("/create_category/:username", item_creation.create_category);
    app.delete("/delete_item/:username", item_creation.delete_item);
    app.put("/updateorder/:username", item_actions.change_item_order);

    // Clipboard
    app.put('/paste/:username', clipboard);

    // Change directory
    app.get('/goback/:username/:parent_id', directory_actions.set_back);
    app.put('/updatedir/:username', item_actions.set_item_directory);

    // Invalid route
    app.use('*', (req, res) => {
        return res.status(404).send({"errDesc": "Invalid request"});
    })

    // Error handling
    app.use((err, req, res, next) => {
        /* console.log('catched: \n', err.stack); */
        return res.status(404).send({"errDesc": "Invalid request"});
    })

    return app;
}