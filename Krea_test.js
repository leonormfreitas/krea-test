const fs = require('fs');


/**
* Reads bingo input from file.
* @param {String} textFile
* @return none
*/
const readInput = (textFile) => {

    try {
        const data = fs.readFileSync(textFile, 'utf8');
        return data;
    } catch (err) {
        console.error(err);
    }
}

/**
* Parses text input of a single board and stores it in a Map (hashmap).
* @param {String} boardText
* @return {Map} boardMap
*/
const parseBoard = (boardText) => {

    const boardArray = boardText.split(/\s/).filter(n => n!=="");

    //each new board is a map with each board number for key, and an object with x coordinate, y coordinate and a flag (found) to indicate if the number has been marked 
    const boardMap = new Map(boardArray.map((el, index) => [el, {found: 0, x: Math.floor(index/5)+1, y: (index+1)%5 === 0? 5 : (index+1)%5}]));

    return boardMap;
}

/**
* Parses text input to obtain all the individual boards and calls parseBoard to parse each one.
* @param {String} inputBoards
* @return {Array} boards
*/
const storeBoards = (inputBoards) => {

    const boardsText = inputBoards.slice(inputBoards.lastIndexOf(':')+1); 
    
    const boards = boardsText.slice(0).split('\n\n');

    boards.forEach((board, index) => {
        boards[index] = parseBoard(board);
    });

    return boards;
}

/**
* Parses text input to obtain all the numbers to be drawn.
* @param {String} inputBoards
* @return {Array} drawNumbersSplit.split(',')
*/
const storeDrawNumbers = (inputBoards) => {

    const drawNumbersNoTitle = inputBoards.replace('Draw numbers:\n','');

    const drawNumbersSplit = drawNumbersNoTitle.substring(0, drawNumbersNoTitle.indexOf('\n'));

    return drawNumbersSplit.split(',');

}

/**
* Checks if number exists in board, if yes mark it as found and return its entry.
* @param {Num} number
* @param {Map} board
* @return {Object || Boolean} false OR number board entry (board.get(number))
*/
const checkNumberFromBoard = (number, board) => {

    if(board.has(number)){
        const x = board.get(number).x;
        const y = board.get(number).y;
        board.set(number, {found: 1, x: x, y: y});
        return board.get(number);
    }
    return false;
}

/**
* Checks if board won, by checking if there is either a winning line or a winning column.
* @param {Map} board
* @param {Num} x
* @param {Num} y
* @param {Num} index
* @param {Array} boards
* @return {Boolean} true OR false
*/
const checkBoardWins = (board, x, y, index, boards) => {

    if(checkRowWins(board, x) || checkColumnWins(board, y)){
        boards.splice(index,1);
        return true;
    } 
    return false;
}

/**
* Checks if row won, by checking (counting) if all the numbers with the same x value are marked found.
* @param {Map} board
* @param {Num} x
* @return {Boolean} true OR false
*/
const checkRowWins = (board, x) => {

    let countRow = 0;

    board.forEach((value, key) => {
        if(value.x === x && value.found) countRow++; 
    })

    return countRow === 5? true : false;
}

/**
* Checks if column won, by checking (counting) if all the numbers with the same y value are marked found.
* @param {Map} board
* @param {Num} y
* @return {Boolean} true OR false
*/
const checkColumnWins = (board, y) => {

    let countColumn = 0;

    board.forEach((value, key) => {
        if(value.y === y && value.found) countColumn++;
    })

    return countColumn === 5? true : false;
}

/**
* Calculates score for a board that won, by summing all numbers in the board that were not found and multiplying by current drawn number.
* @param {Num} drawNumber
* @param {Map} board
* @return {Num} sum*drawNumber
*/
const calculateScore = (drawNumber, board) => {

    let sum = 0;

    board.forEach((value, key) => {
        if(!value.found) sum += parseInt(key);
    })
    console.log("FINAL SCORE: ", sum*drawNumber);

    return sum*drawNumber;
}



const inputFile = "./real_input.txt"; 

const boardInput = readInput(inputFile);

if(boardInput){

    const drawNumbers = storeDrawNumbers(boardInput);

    let boards = storeBoards(boardInput);

    let finalNumber = 0;

    for (let n of drawNumbers) {
        
        for(i = (boards.length)-1; i >= 0; i--){
            const b = boards[i];
            
            const numberFound = checkNumberFromBoard(n, b);

            if(numberFound){ //if the drawn number was checked on the board, check for wins
                const boardWon = checkBoardWins(b, numberFound.x, numberFound.y, i, boards);

                //check if there is only one board left, if yes and it won calculate its score
                if(boards.length === 0 && boardWon){
                    calculateScore(n, b);
                    finalNumber = 1;
                } 
            } 
        }
        if(finalNumber) {break;} //if final board already won, stop drawing numbers
    }
}else {
    console.log("No input detected");
}
