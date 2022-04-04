const express = require('express');
const path = require('path')
const cors = require('cors');

const user_info = require("./routes/user_info");
const item_actions = require("./routes/item_actions");
const directory_actions = require("./routes/directory_actions");


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
    app.post("/u/:username/create_deck", item_actions.create_deck);
    app.post("/u/:username/create_folder", item_actions.create_folder);
    app.post("/u/:username/create_category", item_actions.create_category);
    app.delete("/u/:username/delete_item", item_actions.delete_item);
    app.put("/updateorder/:username", item_actions.update_directory);

    // Clipboard
    app.put('/paste/:username', require("./routes/clipboard"));

    // Change directory
    app.get('/updir/:username/:parent_id', directory_actions.set_back);
    app.put('/updatedir/:username', directory_actions.set_forward);

    return app;
}