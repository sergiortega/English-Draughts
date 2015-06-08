var player1Turn = true,
	onlyAllowedMove = false,
	onlyAllowedPiece = null,
	player1Pieces = [],
	player2Pieces = [];

//this function will generate a 8x8 board alternating black and white squares and the pieces on it
function generateBoard () {
	var white = true, //the first cell will be white and then alternate
		html = '<table>', //initialice the board table
		i,
		j,
		cell;

	for (i = 0; i < 8; i++){ //loop board lines
		html += '<tr>';
		for (j = 0; j < 8; j++){ //loop board columns
			if (white) { //set a white cell
				cell = 'white">';
			} else { //set a black cell
				if (i < 3) { //if first 3 lines, set player2 pieces on black spaces
					cell = 'black"><div class="piece man player2" />';
					player2Pieces.push({
						type: 'man',
						line: i,
						cell: j
					});
				} else if (i >= 5) { //if last 3 lines, set player1 pieces on black spaces
					cell = 'black"><div class="piece man player1"/>';
					player1Pieces.push({
						type: 'man',
						line: i,
						cell: j
					});
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

//remove all previous selection marks
function removePreviousSelectors () {
	var elements = document.querySelectorAll('td');
	Array.prototype.forEach.call(elements, function(el, i){
		elements[i].classList.remove('selected');
  		elements[i].classList.remove('option');
	});
}

//end the turn, resets board selectors and changes player turn
function endTurn () {
	removePreviousSelectors();
	player1Turn = !player1Turn;
	onlyAllowedMove = false;
	onlyAllowedPiece = null;
}

function upgradeToKing (lineNo) {
	return lineNo === 0 || lineNo === 7;
}

//move the piece to the selected cell
function movePiece (newCell, pieceCell, piece, upgradeToKing, pieceToEat) {
	//create a copy of the element to avoid event listeners mixed up
	var new_el = newCell.cloneNode(true), //true = a deep copy
		becomesAking = upgradeToKing && !piece.element.classList.contains('king');
	newCell.parentNode.replaceChild(new_el, newCell);
	// create a one-time event
    new_el.addEventListener('click', function(e) {
        // remove event
        e.target.removeEventListener(e.type, arguments.callee);
        // call handler
        //if the cell is not an option then return and no action
        if (!this.classList.contains('option')) return;
        //else, check if the piece needs to be 'king', move it and end turn
       	pieceCell.removeChild(piece.element);
       	if (pieceToEat) {
        	pieceToEat.innerHTML = '';
    	}
        if (becomesAking) {
        	piece.element.classList.remove('man');
			piece.element.classList.add('king');
        }
        this.appendChild(piece.element);
        if (!pieceToEat || becomesAking) {
       		endTurn();
       	} else { //carry on with turn and evaluate that single piece again
       		//update cell and line values
       		piece.line = newCell.getAttribute('data-line');
       		piece.cell = newCell.getAttribute('data-cell');
       		onlyAllowedMove = true;
			onlyAllowedPiece = piece.element;
       		piece.element.click();
       	}
    });
}

function testing (piece, optionLine, optionCell) {
	var optionElement = document.querySelector('td[data-line="'+ optionLine +'"][data-cell="'+ optionCell +'"]'),
		pieceElement = document.querySelector('td[data-line="'+ piece.line +'"][data-cell="'+ piece.cell +'"]');
	//if we have any option available then mark them as well and add a 'click' event listener to it
	//so we catch the following click and know where to move the current piece to.
	if (optionElement) {
		if (optionElement.hasChildNodes()){ //check if the cell has pieces
			//Don't allow move if the adjacent piece is from the same player
			if (optionElement.childNodes[0].classList.contains(piece.player)) {
				return false;
			}
			//evaluate the next possible move, if there is another child then give up
			var newOptLine = optionLine + (optionLine - piece.line),
				newOptCell = optionCell + (optionCell - piece.cell),
				newOptionElement = document.querySelector('td[data-line="'+ newOptLine +'"][data-cell="'+ newOptCell +'"]');
			if (newOptionElement) {
				if (!newOptionElement.hasChildNodes()) { //allow move and eat the piece in the middle
					if (!pieceElement.classList.contains('selected')) {
						pieceElement.classList.add('selected');
					}
					newOptionElement.classList.add('option');
					movePiece(newOptionElement, pieceElement, piece, upgradeToKing(newOptLine), optionElement);
				} else { //give up, not possible move
					return false;
				}
			}
		} else { //no child there so allow move
			if (onlyAllowedMove) {
				return false;
			}
			if (!pieceElement.classList.contains('selected')) {
				pieceElement.classList.add('selected');
			}
			optionElement.classList.add('option');
			movePiece(optionElement, pieceElement, piece, upgradeToKing(optionLine), false); //no piece to eat
		}
	}
	return true;
}

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
		if (piece.type === 'king') { //king
			backwardLine = piece.line + 1;
		} else {
			upgradeToKing(forwardLine);//Does it needs to become a 'king'?
		}
	}
	if (piece.player === 'player2') { //player2 moves forward, from top to bottom
		forwardLine = piece.line + 1;
		if (piece.type === 'king') { //king
			backwardLine = piece.line - 1;
		} else {
			upgradeToKing(forwardLine);//Does it needs to become a 'king'?
		}
	}

	if (forwardLine > -1) {
		possibleMove1 = testing(piece, forwardLine, forwardCellLeft);
		possibleMove2 = testing(piece, forwardLine, forwardCellRight);
	}

	if (backwardLine > -1) {
		possibleMove3 = testing(piece, backwardLine, forwardCellLeft);
		possibleMove4 = testing(piece, backwardLine, forwardCellRight);
	}

	var possibleMove = possibleMove1 || possibleMove2 || possibleMove3 || possibleMove4;
	if (onlyAllowedMove && !possibleMove) {
		endTurn();
	}
}

//evaluate the selected piece options depending if is a 'king' or 'man' piece
function pieceOptions () {
	if (onlyAllowedMove && onlyAllowedPiece != this) return;
	//if the piece clicked is not the current player's turn then return
	if(player1Turn){
		if (!this.classList.contains('player1')) return;
	} else {
		if (!this.classList.contains('player2')) return;
	}

	var piece = this,
		parent = piece.parentNode,
		line = parseInt(parent.getAttribute('data-line')),
		cell = parseInt(parent.getAttribute('data-cell')),
		cellOpt1 = cell + 1, //possible cells to move to (diagonally)
		cellOpt2 = cell - 1,
		lineOpt1 = line + 1, //possible lines to move to (back and forward, will depend on piece type)
		lineOpt2 = line - 1,
		isKing = piece.classList.contains('king'),
		upgradeToKing = false; //determines wether the 'man' becomes a 'king' or not

	var pieceObj = {
			type: isKing ? 'king' : 'man',
			line: line,
			cell: cell,
			player: this.classList.contains('player1') ? 'player1' : 'player2',
			element: this
		};

	possibleMoves(pieceObj);
}

function checkGameOver (player) {
	console.log(player + " is a LOOOOSER!");
}

function evaluatePlayerOptions () {
	if(player1Turn){
		player1Pieces.forEach(function(item, i){
			//evaluate the 2 forward options
			var forwardCellRight = player1Pieces.cell + 1,
				forwardCellLeft = player1Pieces.cell -1,
				forwardLine = -1,
				backwardLine = -1,
				possibleMove1 = false,
				possibleMove2 = false,
				possibleMove3 = false,
				possibleMove4 = false;

			if (player1Pieces.player === 'player1') { //player1 turn, player1Pieces moves forward from bottom to top
				forwardLine = player1Pieces.line - 1;
				if (player1Pieces.type === 'king') { //king
					backwardLine = player1Pieces.line + 1;
				} else {
					upgradeToKing(forwardLine);//Does it needs to become a 'king'?
				}
			}
			if (player1Pieces.player === 'player2') { //player2 moves forward, from top to bottom
				forwardLine = player1Pieces.line + 1;
				if (player1Pieces.type === 'king') { //king
					backwardLine = player1Pieces.line - 1;
				} else {
					upgradeToKing(forwardLine);//Does it needs to become a 'king'?
				}
			}

			if (forwardLine > -1) {
				possibleMove1 = testing(player1Pieces, forwardLine, forwardCellLeft);
				possibleMove2 = testing(player1Pieces, forwardLine, forwardCellRight);
			}

			if (backwardLine > -1) {
				possibleMove3 = testing(player1Pieces, backwardLine, forwardCellLeft);
				possibleMove4 = testing(player1Pieces, backwardLine, forwardCellRight);
			}

			var possibleMove = possibleMove1 || possibleMove2 || possibleMove3 || possibleMove4;

			if (player1Pieces[i].type === 'king') { //evaluate the 2 backwards options

			}
		});
	} else {
		player2Pieces.forEach(function(item, i){
			console.log(player2Pieces[i]);
		});
	}
}

function mainFunction () {
	//generate and insert board into the DOM
	document.body.innerHTML = generateBoard();
	//add the 'click' event to all pieces
	addEventListenerByClass('piece', 'click', pieceOptions);
}