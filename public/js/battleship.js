// set grid rows and columns and the size of each square
var rows = 10;
var cols = 20;
var squareSize = 50;

// get the container element
var gameBoardContainer = document.getElementById("gameboard");


// get position list can use
var checkIfBlankPosition = function(startPointX, startPointY, shipType, verticalDirection){
	if(!verticalDirection){
		switch(shipType){
			case 0: //Ship 4 pieces
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
			case 1: //Ship 2 pieces
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
			case 2: //Ship 3 pieces
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
			case 4: //Ship 5 pieces
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
			case 5: //Ship square
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
			case 0: //Ship 4 pieces
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
			case 1: //Ship 2 pieces
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
			case 2: //Ship 3 pieces
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
			case 4: //Ship 5 pieces
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
			case 5: //Ship square
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
var ships=[
	1,2,2,4,5
]

//Prepare empty board
var gameBoard = [];
for(i = 0; i < rows; i++){
	var col = [];
	for (j = 0; j < cols; j++) {
		col.push(0);							
	}
	gameBoard.push(col);
}

for(var k=0; k<ships.length; k++){
	var verticalDirection =Math.random() >= 0.5;
	var positions = getBlankPositions(ships[k],verticalDirection);
	var setPosition = getRandomPosition(positions);

	for(var i=0; i<setPosition.length; i++){
		var x = setPosition[i][0];
		var y = setPosition[i][1];

		gameBoard[x][y] = 1;
	}
}


// make the grid columns and rows
for (i = 0; i < rows; i++) {
	for (j = 0; j < cols; j++) {
		// create a new div HTML element for each grid square and make it the right size
		var square = document.createElement("div");
		gameBoardContainer.appendChild(square);

    // give each div element a unique id based on its row and column, like "s00"
		square.id = 's' + i + j;			
		
		// set each grid square's coordinates: multiples of the current row or column number
		var topPosition = i * squareSize;
		var leftPosition = j * squareSize;			
		
		// use CSS absolute positioning to place each grid square on the page
		square.style.top = topPosition + 'px';
		square.style.left = leftPosition + 'px';
		if(gameBoard[i][j]==1){
			square.style.background = 'red';
		}						
	}
}

/* lazy way of tracking when the game is won: just increment hitCount on every hit
   in this version, and according to the official Hasbro rules (http://www.hasbro.com/common/instruct/BattleShip_(2002).PDF)
   there are 17 hits to be made in order to win the game:
      Carrier     - 5 hits
      Battleship  - 4 hits
      Destroyer   - 3 hits
      Submarine   - 3 hits
      Patrol Boat - 2 hits
*/
var hitCount = 0;

/* create the 2d array that will contain the status of each square on the board
   and place ships on the board (later, create function for random placement!)

   0 = empty, 1 = part of a ship, 2 = a sunken part of a ship, 3 = a missed shot
*/

// set event listener for all elements in gameboard, run fireTorpedo function when square is clicked
gameBoardContainer.addEventListener("click", fireTorpedo, false);

// initial code via http://www.kirupa.com/html5/handling_events_for_many_elements.htm:
function fireTorpedo(e) {
    // if item clicked (e.target) is not the parent element on which the event listener was set (e.currentTarget)
	if (e.target !== e.currentTarget) {
        // extract row and column # from the HTML element's id
		var row = e.target.id.substring(1,2);
		var col = e.target.id.substring(2,3);
        //alert("Clicked on row " + row + ", col " + col);
				
		// if player clicks a square with no ship, change the color and change square's value
		if (gameBoard[row][col] == 0) {
			e.target.style.background = '#bbb';
			// set this square's value to 3 to indicate that they fired and missed
			gameBoard[row][col] = 3;
			
		// if player clicks a square with a ship, change the color and change square's value
		} else if (gameBoard[row][col] == 1) {
			e.target.style.background = 'red';
			// set this square's value to 2 to indicate the ship has been hit
			gameBoard[row][col] = 2;
			
			// increment hitCount each time a ship is hit
			hitCount++;
			// this definitely shouldn't be hard-coded, but here it is anyway. lazy, simple solution:
			if (hitCount == 17) {
				alert("All enemy battleships have been defeated! You win!");
			}
			
		// if player clicks a square that's been previously hit, let them know
		} else if (gameBoard[row][col] > 1) {
			alert("Stop wasting your torpedos! You already fired at this location.");
		}		
    }
    e.stopPropagation();
}
