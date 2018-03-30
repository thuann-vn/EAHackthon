// set grid rows and columns and the size of each square
var rows = 10;
var cols = 20;
var squareSize = 50;

// get the container element
var gameBoardContainer = document.getElementById("gameboard");

//Call invite to get session
var invite=function(){
	var shipPerTypes = 2;
	if($('#ships').val() > 0){
		shipPerTypes= parseInt($('#ships').val());
	}
	var inviteParams= {
		"debug":true,
		"boardWidth": cols,
		"boardHeight": rows, 
		"ships": [
			{
				"type": "CV",
				"quantity": shipPerTypes
			},
			{
				"type": "BB",
				"quantity": shipPerTypes
			},
			{
				"type": "CA",
				"quantity": shipPerTypes
			},
			{
				"type": "DD",
				"quantity": shipPerTypes
			},
			{
				"type": "OR",
				"quantity": shipPerTypes
			}
		]
	};
	
	$.post('/invite', inviteParams, function(result){
		console.log(result);
		placeShips();
	});
}


//Call place ships
var placeShips= function(){
	var placeShipParams = {
		"debug": true,
		"cornerPriority": $('#corner').val(),
		"strategy": 'corner',
		"player1": "EA4T", 
		"player2": "EA9T"
	}
	$.post('/place-ships', placeShipParams, function(result){
		console.log(result);
		//Prepare empty board
		var gameBoard = [];
		for(i = 0; i < rows; i++){
			var col = [];
			for (j = 0; j < cols; j++) {
				col.push(0);							
			}
			gameBoard.push(col);
		}

		for(var k=0; k<result.ships.length; k++){
			var setPosition = result.ships[k].coordinates;
			for(var i=0; i<setPosition.length; i++){
				var x = setPosition[i][0];
				var y = setPosition[i][1];

				gameBoard[x][y] = 1;
			}
		}
		initGameBoard(gameBoard);
	});
}

$('#changePositions').click(function(e){
	e.preventDefault();
	$(gameBoardContainer).html('');
	invite();
})
invite();

var initGameBoard= function(gameBoard){
	// make the grid columns and rows
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			var valid= true;
			if($('#s' + i + j).length){
				valid=false;
			}
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
			if(valid==false){
				square.style.background = 'yellow';
			}					
		}
	}
}

