const { get_key_values } = require("../database/db_functions/common/functions");

async function locate_images (pool, wordArray, searchLanguage, target, source) {
  let images = [];
  
  const wordQuery = `
  SELECT *
  FROM word_content
  LEFT JOIN translations
  ON word_content.word_content_id = translations.translation_id
  WHERE UPPER(${searchLanguage}) LIKE UPPER($1);
  `

  for (word of wordArray) {
    const response = await pool.query(wordQuery, [word])
    .then(res => res.rows).catch((err) => console.log(err));
    
    let wordImages = [];
    
    for (let i=0; i < response.length; i++) {
      wordImages.push(get_key_values(response[i],
        ['artist_content_id', 'image_path', target, source ? source : 'source_language']));
        wordImages[i]['selected'] = i === 0;
        wordImages[i]['sourceEditable'] = !Boolean(wordImages[i][source]);
        wordImages[i]['targetEditable'] = !Boolean(wordImages[i][target]);
      }
      
      if (wordImages.length === 0) {
        wordImages.push({
          artist_content_id: null,
          image_path: null,
          [target]: searchLanguage === target ? word : null,
          [source ? source : 'source_language']: searchLanguage === source ? word : null,
          selected: true,
          sourceEditable: searchLanguage === source ? false : true,
          targetEditable: searchLanguage === target ? false : true
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