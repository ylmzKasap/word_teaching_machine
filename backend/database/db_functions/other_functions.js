const roV = (queryResult, order=0) => {
    // Returns a row value of a database query.
  
    try {
      const rowValue = queryResult.rows[order];
      return rowValue;
    } 
    catch {
      console.log('Cannot get row value.', queryResult.rows, order);
    }
}


module.exports = {
    roV
}