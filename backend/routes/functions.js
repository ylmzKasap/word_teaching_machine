const fs = require('fs');

function findFiles (directory, wordArray, extensions) {
    // Directory -> `${process.cwd()}\\public\\images\\`
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


function find_unique_violation(firstObjArray, otherObjArray, columns) {
    for (let object of firstObjArray) {
        for (let otherObject of otherObjArray) {
            const equals = [];
            for (let column of columns) {
                equals.push(object[column] === otherObject[column])
            }
            if (equals.every(x => x === true)) {
                return true;
            }
        }
    }
    return false;
}


module.exports = {
    findFiles, find_unique_violation
}