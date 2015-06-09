var player1Turn = true,
	onlyAllowedMove = false,
	onlyAllowedPiece = null,
	vsComputer = false;

//this function will generate a 8x8 board alternating black and white squares and the pieces on it
function generateBoard () {
	var white = true, //the first cell will be white and then alternate
		html = '<table>', //initialice the board table
		i,
		j,
		cell;

	for (i = 0; i < 8; i++) { //loop board lines
		html += '<tr>';
		for (j = 0; j < 8; j++) { //loop board columns
			if (white) { //set a white cell
				cell = 'white">';
			} else { //set a black cell
				if (i < 3) { //if first 3 lines, set player2 pieces (red) on black spaces
					cell = 'black"><div class="piece man player2" />';
				} else if (i >= 5) { //if last 3 lines, set player1 pieces (white) on black spaces
					cell = 'black"><div class="piece man player1"/>';
				} else { //middle of the board = no players
					cell = 'black">';
				}
			}
			//create the table cell with the correct information and change the "white" value
			html += '<td data-line="'+ i +'" data-cell="'+ j +'" class="cell '+ cell +'</td>';
			white = !white;
		}
		//end the table line and change the 'white' value
		html += '</tr>';
		white = !white;
	}
	//end the table, the board is complete
	html += '</table>';
	return html;
}

//return a 'piece' object with all the information needed to interact with it
function getPieceObject (piece) {
	var parent = piece.parentNode,
		pieceObj = {
			type: piece.classList.contains('king') ? 'king' : 'man',
			line: parseInt(parent.getAttribute('data-line')),
			cell: parseInt(parent.getAttribute('data-cell')),
			player: piece.classList.contains('player1') ? 'player1' : 'player2',
			element: piece
		};

	return pieceObj;
}

//check if the move is to an end of the board where the piece will become a king
function upgradeToKing (lineNo) {
	return lineNo === 0 || lineNo === 7;
}

//return a random move of any possibilties of a piece
function getRandomMove (element) {
	var pieceObj = getPieceObject(element),
		array = possibleMoves(pieceObj);

	if (array.length > 0) {
		randomSelector = Math.floor(Math.random() * array.length);
		return {piece: pieceObj, move: array[randomSelector]};
	}
	return false;
}

//remove all previous selection marks
function removePreviousSelectors () {
	var elements = document.querySelectorAll('td');
	Array.prototype.forEach.call(elements, function(el, i){
		elements[i].classList.remove('selected');
  		elements[i].classList.remove('option');
	});
}

//Check which player won (the other player pieces are all gone) and
//remove the 'piece' event listener so no more clicks are allowed
function checkWinner () {
	var player1Pieces = document.getElementsByClassName('player1'),
		player2Pieces = document.getElementsByClassName('player2');

	if (player1Pieces.length === 0) {
		alert("GAME OVER. Player 2 (Red) won.");
		removeEventListenerByClass('piece', 'click', pieceOptions);
	} else if (player2Pieces.length === 0) {
		alert("GAME OVER. Player 1 (White) won.");
		removeEventListenerByClass('piece', 'click', pieceOptions);
	}
}

//end the turn, resets board selectors and changes player turn
function endTurn () {
	removePreviousSelectors();
	player1Turn = !player1Turn;
	onlyAllowedMove = false;
	onlyAllowedPiece = null;
	checkWinner();
	if (!player1Turn && vsComputer) {
		pieceOptions();
	}
}

//move the piece to the selected cell
function movePiece (newCell, pieceCell, piece, pieceToEat) {
	//create a copy of the element to avoid event listeners mixed up
	var new_el = newCell.cloneNode(true), //true = a deep copy
		becomesAking = upgradeToKing(parseInt(newCell.getAttribute('data-line'))) && !piece.element.classList.contains('king');

	//replace the cell content with the clone to avoid previous listeners being triggered
	newCell.parentNode.replaceChild(new_el, newCell);
	//create a one-time event
    new_el.addEventListener('click', function(e) {
        //remove event
        e.target.removeEventListener(e.type, arguments.callee);
        //Handler:
        //if the cell is not an option then return and no action
        if (!this.classList.contains('option')) return;
        //remove the piece from the firs cell
       	pieceCell.removeChild(piece.element);
       	//check if there's a piece to eat and remove it if needed
       	if (pieceToEat) {
        	pieceToEat.innerHTML = '';
    	}
    	//check if the piece becomes a king
        if (becomesAking) {
        	piece.element.classList.remove('man');
			piece.element.classList.add('king');
        }
        //finally put the piece in the new cell
        this.appendChild(piece.element);
        //if the piece moved to an empty space without eating an enemy or became a king, the turn ends
        if (!pieceToEat || becomesAking) {
       		endTurn();
       	} else { //the piece ate an enemy so the turn continues. Evaluate the same piece again
       		//update cell and line values and trigger the click action
       		piece.line = newCell.getAttribute('data-line');
       		piece.cell = newCell.getAttribute('data-cell');
       		onlyAllowedMove = true;
			onlyAllowedPiece = piece.element;
       		piece.element.click();
       	}
    });
}

//check if there's any option available, mark them and add call 'movePiece' in order to add a 'click' event
//... listener to it so we catch the following click and know where to move the current piece to.
//Note: it will return 'true' or 'false' depending on if it is a possible move or not, this will be useful
//... for the computer AI logic.
function tryMove (piece, optionLine, optionCell) {
	var optionElement = document.querySelector('td[data-line="'+ optionLine +'"][data-cell="'+ optionCell +'"]'),
		pieceElement = document.querySelector('td[data-line="'+ piece.line +'"][data-cell="'+ piece.cell +'"]');

	if (optionElement) {
		if (optionElement.hasChildNodes()) { //check if the cell has pieces
			//Don't allow move if the adjacent piece is from the same player
			if (optionElement.childNodes[0].classList.contains(piece.player)) {
				return false;
			}
			//evaluate the next possible move, if there is another child then give up
			var newOptLine = optionLine + (optionLine - piece.line),
				newOptCell = optionCell + (optionCell - piece.cell),
				newOptionElement = document.querySelector('td[data-line="'+ newOptLine +'"][data-cell="'+ newOptCell +'"]');
			if (newOptionElement) {
				//if there's no more child nodes, allow move and eat the piece in the middle
				if (!newOptionElement.hasChildNodes()) {
					//if it is the computer turn, return 'true' as possible move
					if (vsComputer && !player1Turn) {
						return true;
					}
					//Highlight the piece options and call 'movePiece' waiting for user interaction
					if (!pieceElement.classList.contains('selected')) {
						pieceElement.classList.add('selected');
					}
					newOptionElement.classList.add('option');
					movePiece(newOptionElement, pieceElement, piece, optionElement);
				} else { //give up, not possible move
					return false;
				}
				return true;
			}
			return false;
		} else { //no child so allow move
			//if the piece can just eat then 'normal' moves are not allowed, return
			if (onlyAllowedMove) {
				return false;
			}
			//if it is the computer turn, return 'true' as a possible move for that piece
			if (vsComputer && !player1Turn) {
				return true;
			}
			//highlight the piece options and call 'movePiece' waiting for user interaction
			if (!pieceElement.classList.contains('selected')) {
				pieceElement.classList.add('selected');
			}
			optionElement.classList.add('option');
			movePiece(optionElement, pieceElement, piece, false); //'false' = no piece to eat
		}
		return true;
	}
	return false;
}

//execute the computer selected move
function AI (selection) {
	var	optionElement = document.querySelector('td[data-line="'+ selection.move.toLine +'"][data-cell="'+ selection.move.toCell +'"]'),
		pieceElement = document.querySelector('td[data-line="'+ selection.piece.line +'"][data-cell="'+ selection.piece.cell +'"]'),
		becomesAking = upgradeToKing(selection.move.toLine) && !pieceElement.classList.contains('king'),
		pieceToEat;

	if (optionElement) {
		if (optionElement.hasChildNodes()) { //check if the cell has pieces
			//Don't allow move if the adjacent piece is from the same player
			if (optionElement.childNodes[0].classList.contains(selection.piece.player)) {
				return false;
			}
			//evaluate the next possible move, if there is another child then give up
			var newOptLine = selection.move.toLine + (selection.move.toLine - selection.piece.line),
				newOptCell = selection.move.toCell + (selection.move.toCell - selection.piece.cell),
				newOptionElement = document.querySelector('td[data-line="'+ newOptLine +'"][data-cell="'+ newOptCell +'"]');
			if (newOptionElement) {
				if (!newOptionElement.hasChildNodes()) { //allow move and eat the piece in the middle
					pieceToEat = optionElement;
					optionElement = newOptionElement;
					becomesAking = upgradeToKing(newOptLine) && !pieceElement.classList.contains('king');
				} else { //give up, not possible move
					return false;
				}
			}
		}
		//remove the piece from its coming cell
		pieceElement.removeChild(selection.piece.element);
		//if there's a piece to eat, remove it from the DOM
       	if (pieceToEat) {
        	pieceToEat.innerHTML = '';
    	}
    	//check if the piece becomes a king and update it class
        if (becomesAking) {
        	selection.piece.element.classList.remove('man');
			selection.piece.element.classList.add('king');
        }
        //append the piece to its new cell
        optionElement.appendChild(selection.piece.element);

        //if no piece was eaten or the piece became a king, the turn ends
        if (!pieceToEat || becomesAking) {
       		endTurn();
       	} else {
       		//otherwise the piece is forced to eat again if possible, so update its data and reevaluate
       		selection.piece.line = optionElement.getAttribute('data-line');
       		selection.piece.cell = optionElement.getAttribute('data-cell');
       		onlyAllowedMove = true;
			onlyAllowedPiece = selection.piece.element;
			pieceOptions();
       	}
	}
}

//evaluate all possible moves of a piece, it will always evaluate the two options forward
//... and add the two backwards in case is a 'king' piece
function possibleMoves (piece) {
	//removes previous selectors
	removePreviousSelectors();
	//evaluate two forward moves
	var forwardCellRight = piece.cell + 1,
		forwardCellLeft = piece.cell -1,
		forwardLine = -1,
		backwardLine = -1,
		possibleMove1 = false,
		possibleMove2 = false,
		possibleMove3 = false,
		possibleMove4 = false;

	if (piece.player === 'player1') { //player1 turn, piece moves forward from bottom to top
		forwardLine = piece.line - 1;
		if (piece.type === 'king') { //king, prepare backwardLine value
			backwardLine = piece.line + 1;
		}
	}
	if (piece.player === 'player2') { //player2 moves forward, from top to bottom
		forwardLine = piece.line + 1;
		if (piece.type === 'king') { //king, prepare backwardLine value
			backwardLine = piece.line - 1;
		}
	}

	//evaluate all possible moves and store its 'true' or 'false' value
	if (forwardLine > -1) {
		possibleMove1 = tryMove(piece, forwardLine, forwardCellLeft);
		possibleMove2 = tryMove(piece, forwardLine, forwardCellRight);
	}

	if (backwardLine > -1) {
		possibleMove3 = tryMove(piece, backwardLine, forwardCellLeft);
		possibleMove4 = tryMove(piece, backwardLine, forwardCellRight);
	}

	//check if there's at least one possible move
	var possibleMove = possibleMove1 || possibleMove2 || possibleMove3 || possibleMove4;

	//if it is the turn of a player (not computer) end the turn if there's no possible moves
	//... and the piece was forced to carry on eating
	if((player1Turn && vsComputer) || !vsComputer){
		if (onlyAllowedMove && !possibleMove) {
			endTurn();
		}
	} else {
		//It it is the computer turn, return an array with all the possible moves and
		//... its valuable data: 'toLine' and 'toCell' indicating where the piece moves to
		var possibleMoveOptions = [];

		if (possibleMove) {
			if (possibleMove1) {
				possibleMoveOptions.push({
					toLine: forwardLine,
					toCell: forwardCellLeft
				});
			}
			if (possibleMove2) {
				possibleMoveOptions.push({
					toLine: forwardLine,
					toCell: forwardCellRight
				});
			}
			if (possibleMove3) {
				possibleMoveOptions.push({
					toLine: backwardLine,
					toCell: forwardCellLeft
				});
			}
			if (possibleMove4) {
				possibleMoveOptions.push({
					toLine: backwardLine,
					toCell: forwardCellRight
				});
			}
		}
		return possibleMoveOptions;
	}
}

//evaluate the selected piece options
function pieceOptions () {
	//If the game mode is player1 vs player2 or is the 'Player1' turn on player vs computer
	if((player1Turn && vsComputer) || !vsComputer){
		//return when the player is forced to move the same piece (he just ate one enemy)
		if (onlyAllowedMove && onlyAllowedPiece != this) return;

		//if the piece clicked is not the current player's then return
		if(player1Turn){
			if (!this.classList.contains('player1')) return;
		} else {
			if (!this.classList.contains('player2')) return;
		}

		//if everything is correct, create a piece object and check its possible moves
		var pieceObj = getPieceObject(this);
		possibleMoves(pieceObj);
	} else {
		//The game mode is player1 vs computer and it is the computer turn, so run the AI
		var player2Selection = [],
		 	randomSelector;

		//if the computer just ate a piece, force to eat more if possible
		//select a random eating move if some
		if (onlyAllowedMove && onlyAllowedPiece) {
			var obj = getRandomMove(onlyAllowedPiece);
			if (obj) {
				player2Selection.push(obj);
			}
		} else { //normal move, evaluate all pieces and their possibilities
			//get a random move for each piece
			var player2Pieces = document.getElementsByClassName('player2');
			Array.prototype.forEach.call(player2Pieces, function(el, i) {
				var obj = getRandomMove(el);
				if (obj) {
					player2Selection.push(obj);
				}
			});
		}

		//select a random piece to move and apply it
		if (player2Selection.length > 0) {
			randomSelector = Math.floor(Math.random() * player2Selection.length);
			AI(player2Selection[randomSelector]);
		} else { //if there's no possible moves the turn ends
			endTurn();
		}
	}
}

function playerVSplayer () {
	//generate and insert board into the DOM
	document.body.innerHTML = generateBoard();
	//it is a player vs player game
	vsComputer = false;
	//add the 'click' event to all pieces
	addEventListenerByClass('piece', 'click', pieceOptions);
}

function playerVScomputer () {
	//generate and insert board into the DOM
	document.body.innerHTML = generateBoard();
	//it is a player vs computer game
	vsComputer = true;
	//add the 'click' event to 'Player1' pieces only. 'Player2' will be the computer
	addEventListenerByClass('player1', 'click', pieceOptions);
}