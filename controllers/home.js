/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

/**
 * POST /
 * Invite
 */
exports.getInvite = (req, res) => {
  var params = req.body;

  //Save to session
  req.session.boardWidth = params.boardWidth;
  req.session.boardHeight = params.boardHeight;
  req.session.ships = params.ships;
  req.session.enemyBoard = generateGameBoard(req.params.boardHeight, req.session.boardWidth);

  //Response
  if (params.debug) {
    res.status(200).send(req.session);
  } else {
    res.sendStatus(200);
  }
}

/**
 * POST /
 * Invite
 */
exports.getPlaceShips = (req, res) => {
  var params = req.body;
  req.session.player1 = params.player1;
  req.session.player2 = params.player2;

  var boardHeight = parseInt(req.session.boardHeight);
  var boardWidth = parseInt(req.session.boardWidth);

  //Opitimize position
  var optimizePosition = function (arrangedShips, gameBoard) {
    try{
      var results = [];
      for (var i = 0; i < arrangedShips.length; i++) {
        var ship = arrangedShips[i];
        var ramdomRange = Math.random() >= 0.5 ? 2 : 1;
        
        //Try to move to 2 range
        var newCoordinates = swapPositions(ship, gameBoard, 2);
        
        //Check if new Coodinates is valid
        var isMoved = false;
        for (var j = 0; j < newCoordinates.length; j++) {
          if(newCoordinates[j]!=ship.coordinates[j]){
            isMoved = true;
            break;
          }
        }

        //Check arround ship
        if(isMoved == false){
          var newCoordinates = swapPositions(ship, gameBoard, 1);
        }

        //Update old coorinates to zero
        for (var j = 0; j < ship.coordinates.length; j++) {
          var coordinate = ship.coordinates[j];
          gameBoard[coordinate[0]][coordinate[1]] = 0;
        }
  
        // Update current coorinates
        for (var j = 0; j < newCoordinates.length; j++) {
          var coordinate = newCoordinates[j];
          gameBoard[coordinate[0]][coordinate[1]] = 1;
        }
  
        ship.coordinates=newCoordinates;
      }
      return {gameBoard: gameBoard, ships:arrangedShips};
    }catch(ex){
      console.warn('Error on optimize ships',[ex]);
      return {gameBoard: gameBoard, ships:arrangedShips};
    }
  }

  var checkCoordinateInArray=function(pointX, pointY, coordinates){
    for(var k = 0; k < coordinates.length; k++){
      if(coordinates[k][0]==pointX & coordinates[k][1]==pointY){
        return true;
      }
    }
    return false;
  }

  //get arround points matrix
  var checkHasNearShip = function (shipType, coordinates, gameBoard, range) {
    var results = [];
    var maxX = boardHeight - 1;
    var maxY = boardWidth - 1;

    var hasNearShip = false;
    for (var i = 0; i < coordinates.length; i++) {
      var coordinate = coordinates[i];
      var pointX = coordinate[0];
      var pointY = coordinate[1];

      for (var j = 1; j <= range; j++) {
        //Check next point has ship
        var checkNextPointX = pointX + j;
        var checkNextPointY = pointY + j;
        var checkPrevPointX = pointX - j;
        var checkPrevPointY = pointY - j;

        if (checkNextPointX <= maxX && checkNextPointY <= maxY) {
          if (!checkCoordinateInArray(checkNextPointX, checkNextPointY, coordinates) && gameBoard[checkNextPointX][checkNextPointY] == 1) {
            return true;
          }
        }

        //Check prev point has ship
        if (checkPrevPointX >= 0 && checkPrevPointY >= 0) {
          if (!checkCoordinateInArray(checkPrevPointX, checkPrevPointY, coordinates) && gameBoard[checkPrevPointX][checkPrevPointY] == 1) {
            return true;
          }
        }
        

        //Check prev point has ship
        if (checkPrevPointX >= 0 && checkNextPointY <= maxY) {
          if (!checkCoordinateInArray(checkPrevPointX, checkNextPointY, coordinates) && gameBoard[checkPrevPointX][checkNextPointY] == 1) {
            return true;
          }
        }

        //Check prev point has ship
        if (checkNextPointX <= maxX && checkPrevPointY >= 0) {
          if (!checkCoordinateInArray(checkNextPointX, checkPrevPointY, coordinates) && gameBoard[checkNextPointX][checkPrevPointY] == 1) {
            return true;
          }
        }


        //Check prev point has ship
        if (pointX <= maxX && checkPrevPointY >= 0) {
          if (!checkCoordinateInArray(pointX, checkPrevPointY, coordinates) && gameBoard[pointX][checkPrevPointY] == 1) {
            return true;
          }
        }
        

        //Check prev point has ship
        if (pointX <= maxX && checkNextPointY <= maxY) {
          if (!checkCoordinateInArray(pointX, checkNextPointY, coordinates) && gameBoard[pointX][checkNextPointY] == 1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  //Get next random position
  var getSwapPositions = function (ship, gameBoard, ramdomRange) {
    var startPointX = ship.coordinates[0][0];
    var startPointY = ship.coordinates[0][1];

    var newStartPointX = startPointX;
    var newStartPointY = startPointY;

    //Check if the position can move to
    //Try to move to the top
    while (newStartPointX - 1 >= 0) {
      newStartPointX = newStartPointX - 1;
      var newPosition = checkIfBlankPosition(newStartPointX, startPointY, ship.type, ship.vertical, gameBoard);
      if (newPosition != false && checkHasNearShip(ship.type, newPosition, gameBoard, ramdomRange) == false) {
        return newPosition;
      }
    };


    //Try to move to the bottom
    newStartPointX = startPointX;
    newStartPointY = startPointY;
    while (newStartPointX + 1 < boardHeight) {
      newStartPointX = newStartPointX + 1;
      var newPosition = checkIfBlankPosition(newStartPointX, startPointY, ship.type, ship.vertical, gameBoard);
      if (newPosition != false && checkHasNearShip(ship.type, newPosition, gameBoard, ramdomRange) == false) {
        return newPosition;
      }
    };

    //Try to move to right
    newStartPointX = startPointX;
    newStartPointY = startPointY;
    while (newStartPointY + 1 < boardWidth) {
      newStartPointY = newStartPointY + 1;
      var newPosition = checkIfBlankPosition(startPointX, newStartPointY, ship.type, ship.vertical, gameBoard);
      if (newPosition != false && checkHasNearShip(ship.type, newPosition, gameBoard, ramdomRange) == false) {
        return newPosition;
      }
    };

    //Try to move to left
    newStartPointX = startPointX;
    newStartPointY = startPointY;
    while (newStartPointY - 1 >= 0) {
      newStartPointY = newStartPointY - 1;
      var newPosition = checkIfBlankPosition(startPointX, newStartPointY, ship.type, ship.vertical, gameBoard);
      if (newPosition != false && checkHasNearShip(ship.type, newPosition, gameBoard, ramdomRange) == false) {
        return newPosition;
      }
    };

    return ship.coordinates;
  }

  //check if around points is valid
  var swapPositions = function (ship, gameBoard, ramdomRange) {
    var coordinates = ship.coordinates;

    //Check if have ship near arround
    var hasNearShip = checkHasNearShip(ship.type, coordinates, gameBoard, ramdomRange)

    //if has near ship -> rearrange the ship
    if (hasNearShip) {
      //Try to move to another position
      var newCoordinates = getSwapPositions(ship, gameBoard, ramdomRange);


      //Update
      coordinates =newCoordinates;
    }
    return coordinates;
  }

  // get position list can use
  var checkIfBlankPosition = function (startPointX, startPointY, shipType, verticalDirection, gameBoard) {
    try {
      if (!verticalDirection) {
        switch (shipType) {
          case 'BB': //Ship 4 pieces
            if (startPointX + 3 > boardHeight - 1) {
              return false;
            }

            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX + 1][startPointY] == 0 && gameBoard[startPointX + 2][startPointY] == 0 && gameBoard[startPointX + 3][startPointY] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX + 1, startPointY],
                [startPointX + 2, startPointY],
                [startPointX + 3, startPointY]
              ]
            };
            break;
          case 'DD': //Ship 2 pieces
            if (startPointX + 1 > boardHeight - 1) {
              return false;
            }
            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX + 1][startPointY] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX + 1, startPointY]
              ]
            };
            break;

          case 'CA': //Ship 3 pieces
            if (startPointX + 2 > boardHeight - 1) {
              return false;
            }
            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX + 1][startPointY] == 0 && gameBoard[startPointX + 2][startPointY] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX + 1, startPointY],
                [startPointX + 2, startPointY]
              ]
            };
            break;
          case 'CV': //Ship 5 pieces
            if (startPointX + 3 > boardHeight - 1 || startPointY - 1 < 0) {
              return false;
            }

            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX + 1][startPointY] == 0 && gameBoard[startPointX + 2][startPointY] == 0 && gameBoard[startPointX + 3][startPointY] == 0 && gameBoard[startPointX + 1][startPointY - 1] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX + 1, startPointY],
                [startPointX + 2, startPointY],
                [startPointX + 3, startPointY],
                [startPointX + 1, startPointY - 1]
              ]
            }
            break; 2
          case 'OR': //Ship square
            if (startPointX + 1 > boardHeight - 1 || startPointY + 1 > boardWidth - 1) {
              return false;
            }

            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX + 1][startPointY] == 0 && gameBoard[startPointX][startPointY + 1] == 0 && gameBoard[startPointX + 1][startPointY + 1] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX + 1, startPointY],
                [startPointX, startPointY + 1],
                [startPointX + 1, startPointY + 1]
              ]
            };
            break;
        }
      } else {
        switch (shipType) {
          case 'BB': //Ship 4 pieces
            if (startPointY + 3 > boardWidth - 1) {
              return false;
            }

            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX][startPointY + 1] == 0 && gameBoard[startPointX][startPointY + 2] == 0 && gameBoard[startPointX][startPointY + 3] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX, startPointY + 1],
                [startPointX, startPointY + 2],
                [startPointX, startPointY + 3]
              ]
            };
            break;
          case 'DD': //Ship 2 pieces
            if (startPointY + 1 > boardWidth - 1) {
              return false;
            }
            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX][startPointY + 1] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX, startPointY + 1]
              ]
            };
            break;
          case 'CA': //Ship 3 pieces
            if (startPointY + 2 > boardWidth - 1) {
              return false;
            }
            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX][startPointY + 1] == 0 && gameBoard[startPointX][startPointY + 2] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX, startPointY + 1],
                [startPointX, startPointY + 2]
              ]
            };
            break;
          case 'CV': //Ship 5 pieces
            if (startPointY + 3 > boardWidth - 1 || startPointX - 1 < 0) {
              return false;
            }

            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX][startPointY + 1] == 0 && gameBoard[startPointX][startPointY + 2] == 0 && gameBoard[startPointX][startPointY + 3] == 0 && gameBoard[startPointX - 1][startPointY + 1] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX, startPointY + 1],
                [startPointX, startPointY + 2],
                [startPointX, startPointY + 3],
                [startPointX - 1, startPointY + 1]
              ]
            }
            break;
          case 'OR': //Ship square
            if (startPointX + 1 > boardHeight - 1 || startPointY + 1 > boardWidth - 1) {
              return false;
            }

            if (gameBoard[startPointX][startPointY] == 0 && gameBoard[startPointX][startPointY + 1] == 0 && gameBoard[startPointX + 1][startPointY] == 0 && gameBoard[startPointX + 1][startPointY + 1] == 0) {
              return [
                [startPointX, startPointY],
                [startPointX, startPointY + 1],
                [startPointX + 1, startPointY],
                [startPointX + 1, startPointY + 1]
              ]
            };
            break;
        }
      }
    } catch (ex) {
      console.log('Place ship exception', [ex, startPointX, startPointY, shipType, verticalDirection, gameBoard]);
    }
    return false;
  }

  //@param direction: 0:Vertical, 1: Horizon
  var getRandomCoordinate = function (shipType, verticalDirection, gameBoard) {
    var isValid = false;
    while (!isValid) {
      var minX = 0;
      var maxX = req.session.boardHeight - 1;
      var x = Math.floor(Math.random() * (maxX - minX)) + minX;

      var minY = 0;
      var maxY = req.session.boardWidth - 1;
      var y = Math.floor(Math.random() * (maxY - minY)) + minY;

      var position = checkIfBlankPosition(x, y, shipType, verticalDirection, gameBoard);
      if (position) {
        return position;
      }
    }
    return [];
  }

  var ships = req.session.ships;
  //Arrage ships, return false if can not arrange a ship, return object have gameboard and ships if valid
  var arrangeShips = function (triedTime) {
    var arrangedShips = [];
    var gameBoard = generateGameBoard(boardHeight, boardWidth);
    //Get position for per ships
    for (var k = 0; k < ships.length; k++) {
      for (var l = 0; l < parseInt(ships[k].quantity); l++) {
        var verticalDirection = Math.random() >= 0.5;
        var position = getRandomCoordinate(ships[k].type, verticalDirection, gameBoard);
        if (position.length > 0) {
          for (var i = 0; i < position.length; i++) {
            var x = position[i][0];
            var y = position[i][1];

            gameBoard[x][y] = 1;
          }

          //Add to response
          arrangedShips.push({
            'type': ships[k].type,
            'coordinates': position,
            'vertical': verticalDirection
          });
        } else {
          console.log('Arrange Ships Failed (' + triedTime + ' times)');
          console.log({ gameBoard: gameBoard, ships: arrangedShips });
          return false;
        }
      }
    }

    return { gameBoard: gameBoard, ships: arrangedShips };
  }

  var gameBoard = null;
  var arrangedShips = [];
  var arrangeShipTriedCount = 0;

  while (!gameBoard) {
    arrangeShipTriedCount++;
    var result = arrangeShips(arrangeShipTriedCount);
    if (result != false) {
      gameBoard = result.gameBoard;
      arrangedShips = result.ships;
    }
  }

  //Optimize gameboard
  console.log(gameBoard);
  optimizeResult = optimizePosition(arrangedShips, gameBoard);
  console.log(optimizeResult.gameBoard);

  req.session.gameBoard = optimizeResult.gameBoard;
  req.session.ourShips = optimizeResult.ships;

  //Return response
  if (params.debug) {
    res.status(200).send(optimizeResult);
  } else {
    res.status(200).send({
      ships: optimizeResult.ships
    });
  }
};

/**
 * POST /
 * Shoot
 */
exports.getShoot = (req, res) => {
  var params = req.body;

  //Save to session
  req.session.turn = params.turn;
  req.session.maxShots = params.maxShots;
  var enemyBoard = req.session.enemyBoard;

  if (req.session.findingShips) {

  } else {

  }


  //Response
  res.status(200).send(req.session);
}

/**
 * POST /
 * Notify
 */
exports.getNotify = (req, res) => {
  var params = req.body;

  //OUR TURN RESULT
  if (params.playerId == process.env.ENGINE_NAME) {
    var enemyBoard = req.session.enemyBoard;

    //Update shots
    if (params.shots) {
      for (var i = 0; i < params.shots.length; i++) {
        var shot = params.shots[i];

        //If shot is HIT
        if (shot.status == "HIT") {
          enemyBoard[shot.coordinate[0]][shot.coordinate[1]] = 1;

          //If HIT then check if ship still not SUNK => try to find the ship in next turn
          if (params.sunkShips.length > 0) {
            req.session.findingShips = true;
          }
        } else {
          enemyBoard[shot.coordinate[0]][shot.coordinate[1]] = -1;
        }
      }
    }

    //Update sunkShips
    if (params.sunkShips) {
      //Update sunkShips
      req.session.sunkShips = (req.session.sunkShips) ? req.session.sunkShips.concat(params.sunkShips) : params.sunkShips;

      //Update to enemyBoard
      for (var s = 0; s < params.sunkShips.length; s++) {
        var sunkShip = params.sunkShips[s];
        for (var c = 0; c < sunkShip.coordinates.length; c++) {
          var coordinate = sunkShip.coordinates[c];
          enemyBoard[coordinate[0]][coordinate[1]] = 1;
        }
      }
    }
    req.session.enemyBoard = enemyBoard;
    //ENEMY TURN RESULT
  } else {
    console.log('Enemy shot status');
    console.log(params);
  }

  //Response
  if (params.debug) {
    res.status(200).send(req.session);
  } else {
    res.sendStatus(200);
  }
}

//Generate blank game board
var generateGameBoard = function (boardHeight, boardWidth) {
  //Prepare empty board
  var gameBoard = [];
  for (i = 0; i < boardHeight; i++) {
    var col = [];
    for (j = 0; j < boardWidth; j++) {
      col.push(0);
    }
    gameBoard.push(col);
  }
  return gameBoard;
}

