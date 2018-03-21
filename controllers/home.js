/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  console.log(req);
  res.render('home', {
    title: 'Home'
  });
};

/**
 * GET /
 * Invite
 */
exports.getInvite = (req, res) => {
  // generate position
  // CV = carrier
  // BB = battleship
  // CA = cruiser
  // DD = destroyer
  // OR = oil rig
  var ships=[
    {
      'type': 'CV',
      'quantity': 2
    },
    {
      'type': 'BB',
      'quantity': 1
    },
    {
      'type': 'CA',
      'quantity': 1
    },
    {
      'type': 'DD',
      'quantity': 1
    },
    {
      'type': 'OR',
      'quantity': 1
    },
  ]

  if(req.session.rows>0){
    res.status(200).send(false);
  }else{
    //Save to session
    req.session.rows= 20;
    req.session.cols= 10;
    req.session.ships= ships;
    req.session.enemyBoard =generateGameBoard(req.session.rows, req.session.cols);
    //Response
    res.status(200).send(true);
  }
}

/**
 * GET /
 * Invite
 */
exports.getPlaceShips = (req, res) => {
  var rows = req.session.rows;
  var cols = req.session.cols;

  // get position list can use
  var checkIfBlankPosition = function(startPointX, startPointY, shipType, verticalDirection){
    if(!verticalDirection){
      switch(shipType){
        case 'BB': //Ship 4 pieces
          if(startPointX+3>rows-1){
            return false;
          }

          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX+1][startPointY]==0 && gameBoard[startPointX+2][startPointY]==0 && gameBoard[startPointX+3][startPointY]==0){
            return [
              [startPointX,startPointY],
              [startPointX+1,startPointY],
              [startPointX+2,startPointY],
              [startPointX+3,startPointY]
            ]
          };
          break;
        case 'DD': //Ship 2 pieces
          if(startPointX+1>rows-1){
            return false;
          }
          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX+1][startPointY]==0) {
            return [
              [startPointX,startPointY],
              [startPointX+1,startPointY]
            ]
          };
          break;
        case 'CA': //Ship 3 pieces
          if(startPointX+2>rows-1){
            return false;
          }
          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX+1][startPointY]==0 && gameBoard[startPointX+2][startPointY]==0){
            return [
              [startPointX,startPointY],
              [startPointX+1,startPointY],
              [startPointX+2,startPointY]
            ]
          };
          break;
        case 'CV': //Ship 5 pieces
          if(startPointX+3>rows-1 || startPointY-1 < 0){
            return false;
          }

          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX+1][startPointY]==0 && gameBoard[startPointX+2][startPointY]==0 && gameBoard[startPointX+3][startPointY]==0 && gameBoard[startPointX+2][startPointY+1]==0){
            return [
              [startPointX,startPointY],
              [startPointX+1,startPointY],
              [startPointX+2,startPointY],
              [startPointX+3,startPointY],
              [startPointX+1,startPointY-1]
            ]
          }
          break;
        case 'OR': //Ship square
          if(startPointX+1>rows-1 || startPointY+1 > cols-1){
            return false;
          }

          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX+1][startPointY]==0&&gameBoard[startPointX][startPointY+1]==0 && gameBoard[startPointX+1][startPointY+1]==0){
            return [
              [startPointX,startPointY],
              [startPointX+1,startPointY],
              [startPointX,startPointY+1],
              [startPointX+1,startPointY+1]
            ]
          };
          break;
      }	
    }else{
      switch(shipType){
        case 'BB': //Ship 4 pieces
          if(startPointY+3>cols-1){
            return false;
          }

          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX][startPointY+1]==0 && gameBoard[startPointX][startPointY+2]==0 && gameBoard[startPointX][startPointY+3]==0){
            return [
              [startPointX,startPointY],
              [startPointX,startPointY+1],
              [startPointX,startPointY+2],
              [startPointX,startPointY+3]
            ]
          };
          break;
        case 'DD': //Ship 2 pieces
          if(startPointY+1>cols-1){
            return false;
          }
          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX][startPointY+1]==0) {
            return [
              [startPointX,startPointY],
              [startPointX,startPointY+1]
            ]
          };
          break;
        case 'CA': //Ship 3 pieces
          if(startPointY+2>cols-1){
            return false;
          }
          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX][startPointY+1]==0 && gameBoard[startPointX][startPointY+2]==0){
            return [
              [startPointX,startPointY],
              [startPointX,startPointY+1],
              [startPointX,startPointY+2]
            ]
          };
          break;
        case 'CV': //Ship 5 pieces
          if(startPointY+3>cols-1 || startPointX-1 < 0){
            return false;
          }

          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX][startPointY+1]==0 && gameBoard[startPointX][startPointY+2]==0 && gameBoard[startPointX][startPointY+3]==0 && gameBoard[startPointX-1][startPointY]==0){
            return [
              [startPointX,startPointY],
              [startPointX,startPointY+1],
              [startPointX,startPointY+2],
              [startPointX,startPointY+3],
              [startPointX-1,startPointY+2]
            ]
          }
          break;
        case 'OR': //Ship square
          if(startPointX+1>rows-1 || startPointY+1 > cols-1){
            return false;
          }

          if(gameBoard[startPointX][startPointY]==0 && gameBoard[startPointX][startPointY+1]==0&&gameBoard[startPointX+1][startPointY]==0 && gameBoard[startPointX+1][startPointY+1]==0){
            return [
              [startPointX,startPointY],
              [startPointX,startPointY+1],
              [startPointX+1,startPointY],
              [startPointX+1,startPointY+1]
            ]
          };
          break;
      }	
    }

    return false;
  }

  //@param direction: 0:Vertical, 1: Horizon
  var getBlankPositions =function (shipType, verticalDirection){
    var result = [];
    for(x = 0; x < rows; x++){
      for (y = 0; y < cols; y++) {
        var arrayPositions = checkIfBlankPosition(x, y,shipType,verticalDirection);
        if(arrayPositions != false){
          result.push(arrayPositions);
        }
      }
    }
    return result;
  }

  //Get random position in blanks list
  function getRandomPosition(positions) {
    min = 0;
    max = positions.length-1;
    return positions[Math.floor(Math.random() * (max - min)) + min];
  }
  // generate position
  // CV = carrier
  // BB = battleship
  // CA = cruiser
  // DD = destroyer
  // OR = oil rig
  var ships=req.session.ships;

  //Prepare empty board
  var gameBoard = generateGameBoard(rows, cols);

  var response= {
    ships: []
  };

  for(var k=0; k<ships.length; k++){
    for(var l= 0; l<ships[k].quantity; l++){
      var verticalDirection =Math.random() >= 0.5;
      var positions = getBlankPositions(ships[k].type,verticalDirection);
      var setPosition = getRandomPosition(positions);
      response.ships.push({
        'type': ships[k].type,
        'coordinates': setPosition
      });

      for(var i=0; i<setPosition.length; i++){
        var x = setPosition[i][0];
        var y = setPosition[i][1];
        
        gameBoard[x][y] = 1;
      }
    }
  }

  req.session.gameBoard=gameBoard;
  //response.gameBoard = gameBoard;  
  res.status(200).send(response);
};

var generateGameBoard = function(rows, cols){
  //Prepare empty board
  var gameBoard = [];
  for(i = 0; i < rows; i++){
    var col = [];
    for (j = 0; j < cols; j++) {
      col.push(0);							
    }
    gameBoard.push(col);
  }
  return gameBoard;
}

