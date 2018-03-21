/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  console.log(req);
  var rowCount = 20;
  var colCount = 8;
  var board= [];
  for(var i=1; i<=rowCount; i++){
    var cols= [];
    for(var j=1; j<= colCount; j++){
      cols.push(0);
    }
    board.push(cols);
  }

  res.render('home', {
    title: 'Home',
    board: board
  });
};
