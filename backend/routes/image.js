const test_utils = require("../test/other_functions");
const utils = require("./functions");

const get_image = async (req, res) => {
    const { word, search, target, source } = req.params;

    const db = req.app.get('database');

    let decodedWord;
    try {
        decodedWord = decodeURIComponent(word)
    } catch {
        return res.status(400).send({"errDesc": "Input contains forbidden characters"});
    }    

    // Body values are missing or extra
    if (test_utils.does_not_exist([decodedWord, search, target]) || Object.keys(req.params).length > 4) {
        return res.status(400).send({"errDesc": "Missing or extra body"});
    }

    // Type mismatch
    if ([decodedWord, search, target].some(x => typeof x !== "string")
        || (source && typeof source !== "string")) {
        return res.status(400).send({"errDesc": "Type mismatch"});
    }

    const imageInfo = await utils.locate_images(db, [decodedWord], search, target, source)

    return res.status(200).send(imageInfo);
};

module.exports = {
    get_image
}