var player1Turn = true;

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
				} else if (i >= 5) { //if last 3 lines, set player1 pieces on black spaces
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
}

//move the piece to the selected cell
function movePiece (player, newCell, parent, piece, upgradeToKing) {
	//create a copy of the element to avoid event listeners mixed up
	var new_el = newCell.cloneNode(true); //true = a deep copy
	newCell.parentNode.replaceChild(new_el, newCell);
	// create a one-time event
    new_el.addEventListener('click', function(e) {
        // remove event
        e.target.removeEventListener(e.type, arguments.callee);
        // call handler
        //if the cell is not an option or the player has changed then return and no action
        if (!this.classList.contains('option') || player != player1Turn) return;
        //else, check if the piece needs to be 'king', move it and end turn
        parent.removeChild(piece);
        if(upgradeToKing) {
        	piece.classList.remove('man');
			piece.classList.add('king');
        }
        this.appendChild(piece);
        endTurn();
    });
}

//Check if the cell option is available to be clicked and add the event "movePiece"
function cellOptions (line, cell, parent, piece, upgradeToKing) {
	var element = document.querySelector('td[data-line="'+ line +'"][data-cell="'+ cell +'"]');
	//if we have any option available then mark them as well and add a 'click' event listener to it
	//so we catch the following click and know where to move the current piece to.
	if (element) {
		if (element.hasChildNodes()){
			element = null;
		} else {
			if (!parent.classList.contains('selected')) {
				parent.classList.add('selected');
			}
			element.classList.add('option');
			movePiece(player1Turn, element, parent, piece, upgradeToKing);
		}
	}
}

//evaluate the selected piece options depending if is a 'king' or 'man' piece
function pieceOptions () {
	//removes previous selectors
	removePreviousSelectors();
	//if the piece clicked is not the current player's turn then return
	if(player1Turn){
		if(!this.classList.contains('player1')) return;
	} else {
		if(!this.classList.contains('player2')) return;
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

	if(isKing) { //evaluate all possible options (4) for a 'king' piece
		cellOptions(lineOpt1, cellOpt1, parent, piece, false);
		cellOptions(lineOpt1, cellOpt2, parent, piece, false);
		cellOptions(lineOpt2, cellOpt1, parent, piece, false);
		cellOptions(lineOpt2, cellOpt2, parent, piece, false);
	} else { //evaluate the only 2 possible options for a 'man' piece
		if (!player1Turn) { //player2 moves forward, from top to bottom
			if (line < 7) {
				line = lineOpt1; //increase line value
				upgradeToKing = (line === 7) ? true : false; //Does it needs to become a 'king'?
			}
		} else { //player1 moves forward, from bottom to top
			if (line > 0) {
				line = lineOpt2; //decrease line value
				upgradeToKing = (line === 0) ? true : false; //Does it needs to become a 'king'?
			}
		}
		cellOptions(line, cellOpt1, parent, piece, upgradeToKing);
		cellOptions(line, cellOpt2, parent, piece, upgradeToKing);
	}
}

function mainFunction () {
	//generate and insert board into the DOM
	document.body.innerHTML = generateBoard();
	//add the 'click' event to all pieces
	addEventListenerByClass('piece', 'click', pieceOptions);
}