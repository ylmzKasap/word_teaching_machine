const { get_key_values } = require("../database/db_functions/common/functions");

async function locate_images (pool, wordArray, searchLanguage, target, source) {
    let images = [];

    const wordQuery = `
        SELECT *
            FROM word_content
        LEFT JOIN translations
            ON word_content.word_content_id = translations.translation_id
        WHERE ${searchLanguage} = $1
        LIMIT 3;
    `
    for (word of wordArray) {
        const response = await pool.query(wordQuery, [word])
            .then(res => res.rows).catch((err) => console.log(err));

        let wordImages = [];

        for (imgObj of response) {
            wordImages.push(get_key_values(imgObj,
                ['artist_content_id', 'image_path', target, source ? source : 'source_language']));
        }
        
        if (wordImages.length === 0) {
            wordImages.push({
                'artist_content_id': null,
                'image_path': null,
                [target]: searchLanguage === target ? word : null,
                [source ? source : 'source_language']: searchLanguage === source ? word : null
            })
        }

        images.push(wordImages);
    }

    return images;
}

function find_unique_violation(firstObjArray, secondObjArray, columns) {
    const getValues = (obj) => {
        let values = [];
        if (obj) {
            for (let col of columns) {
                values.push(obj[col]);
            }
        }
        return values;
    }

    if (firstObjArray.length === 0 || secondObjArray === 0) {
        return false;
    }

    const firstDirValues = firstObjArray.map(obj => getValues(obj));
    const secondDirValues = secondObjArray.map(obj => getValues(obj));

    for (let values of firstDirValues) {
        for (let otherValues of secondDirValues) {
            if (values.every(x => otherValues.includes(x))) {
                return true;
            }
        }
    }
    return false;
}

module.exports = {
    locate_images, find_unique_violation
}