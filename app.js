var player1 = true;

//this function will generate a 8x8 board alternating black and white squares
function generateBoard () {
	var white = true,
		html = '<table>',
		i,
		j,
		square;

	for (i = 0; i < 8; i++){
		html += '<tr>';
		for (j = 0; j < 8; j++){
			if (white) { //white square
				square = 'white">';
			} else { //black square
				//set player pieces on black spaces
				if (i < 3) {
					square = 'black"><div class="piece player2" />';
				} else if (i >= 5) {
					square = 'black"><div class="piece player1"/>';
				} else {
					square = 'black">';
				}
			}
			html += '<td data-line="'+ i +'" data-cell="'+ j +'" class="square '+ square +'</td>';
			white = !white;
		}
		html += '</tr>';
		white = !white;
	}

	html += '</table>';
	return html;
}

//custom function to add even listener to every element with the same class
function addEventListenerByClass(className, event, fn) {
    var list = document.getElementsByClassName(className);
    for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
    }
}

//remove all previous selection marks
function removePreviousSelectors () {
	var elements = document.querySelectorAll("td"),
		i;

	for (i = 0; i < elements.length; ++i) {
  		elements[i].classList.remove("selected");
  		elements[i].classList.remove("option");
	}
}

//end the turn, resets board selectors and changes player turn
function endTurn () {
	removePreviousSelectors();
	//switch player
	player1 = !player1;
}

//move the piece to the selected cell
function movePiece (player, newCell, parent, piece) {
	// create a one-time event
    newCell.addEventListener("click", function(e) {
        // remove event
        e.target.removeEventListener(e.type, arguments.callee);
        // call handler
        //if the cell is not an option or the player has changed then return and no action
        if (!this.classList.contains("option") || player != player1) return;
        //else, move the piece to the selected cell and end turn
        parent.removeChild(piece);
        this.appendChild(piece);
        endTurn();
    });
}

//evaluate the player options, highlight them and prepares the cells to be clicked
function evaluateOptions () {
	removePreviousSelectors();
	if(player1){
		if(!this.classList.contains("player1")) return;
	} else {
		if(!this.classList.contains("player2")) return;
	}

	var parent = this.parentNode,
		piece = this,
		line = parseInt(parent.getAttribute("data-line")),
		cell = parseInt(parent.getAttribute("data-cell")),
		opt1 = cell + 1,
		opt2 = cell - 1,
		option1,
		option2;

	if (player1) {
		if (line < 7 ) {
			line++;
		}
	} else {
		if (line > 0) {
			line--;
		}
	}

	console.log(line, cell, opt1, opt2)

	if (opt1 < 8) {
		option1 = document.querySelector("td[data-line='"+ line +"'][data-cell='"+ opt1 +"']");
		if (option1.hasChildNodes())
			option1 = null;
	}
	if (opt2 >= 0) {
		option2 = document.querySelector("td[data-line='"+ line +"'][data-cell='"+ opt2 +"']");
		if (option2.hasChildNodes())
			option2 = null;
	}

	if (!parent.classList.contains("selected")) {
		parent.classList.add("selected");
		if (option1) {
			option1.classList.add("option");
			movePiece(player1, option1, parent, piece);
		}
		if (option2) {
			option2.classList.add("option");
			movePiece(player1, option2, parent, piece);
		}
	}
}

function mainFunction () {
	document.body.innerHTML = generateBoard(); //insert board into the DOM
	addEventListenerByClass('piece', 'click', evaluateOptions); //add the "click" event listener to all pieces
}