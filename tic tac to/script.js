const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const restartBtn = document.getElementById("restartBtn");

const gameMode = document.getElementById("gameMode");
const difficulty = document.getElementById("difficulty");

const xScoreText = document.getElementById("xScore");
const oScoreText = document.getElementById("oScore");
const drawScoreText = document.getElementById("drawScore");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;

let xScore = localStorage.getItem("xScore") || 0;
let oScore = localStorage.getItem("oScore") || 0;
let drawScore = localStorage.getItem("drawScore") || 0;

xScoreText.innerText = xScore;
oScoreText.innerText = oScore;
drawScoreText.innerText = drawScore;

const winPatterns = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

cells.forEach(cell => {
  cell.addEventListener("click", cellClicked);
});

restartBtn.addEventListener("click", restartGame);

function cellClicked(){

  const index = this.dataset.index;

  if(board[index] !== "" || !running){
    return;
  }

  updateCell(this, index);
  checkWinner();

  if(
    gameMode.value === "ai" &&
    currentPlayer === "O" &&
    running
  ){
    setTimeout(aiMove, 500);
  }

}

function updateCell(cell, index){

  board[index] = currentPlayer;
  cell.innerText = currentPlayer;

}

function changePlayer(){

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  statusText.innerText = `Player ${currentPlayer} Turn`;

}

function checkWinner(){

  let roundWon = false;

  for(let i = 0; i < winPatterns.length; i++){

    const condition = winPatterns[i];

    const a = board[condition[0]];
    const b = board[condition[1]];
    const c = board[condition[2]];

    if(a === "" || b === "" || c === ""){
      continue;
    }

    if(a === b && b === c){

      roundWon = true;
      break;

    }

  }

  if(roundWon){

    statusText.innerText = `${currentPlayer} Wins!`;

    if(currentPlayer === "X"){
      xScore++;
      localStorage.setItem("xScore", xScore);
      xScoreText.innerText = xScore;
    }
    else{
      oScore++;
      localStorage.setItem("oScore", oScore);
      oScoreText.innerText = oScore;
    }

    running = false;
    return;

  }

  if(!board.includes("")){

    statusText.innerText = "Match Draw!";

    drawScore++;
    localStorage.setItem("drawScore", drawScore);
    drawScoreText.innerText = drawScore;

    running = false;
    return;

  }

  changePlayer();

}

function restartGame(){

  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  running = true;

  statusText.innerText = "Player X Turn";

  cells.forEach(cell => {
    cell.innerText = "";
  });

}

function aiMove(){

  let move;

  if(difficulty.value === "easy"){

    move = randomMove();

  }
  else if(difficulty.value === "medium"){

    move = mediumMove();

  }
  else{

    move = bestMove();

  }

  board[move] = "O";
  cells[move].innerText = "O";

  checkWinner();

}

function randomMove(){

  let emptyCells = [];

  board.forEach((cell, index) => {
    if(cell === ""){
      emptyCells.push(index);
    }
  });

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];

}

function mediumMove(){

  for(let pattern of winPatterns){

    let values = pattern.map(index => board[index]);

    if(
      values.filter(v => v === "O").length === 2 &&
      values.includes("")
    ){

      return pattern[values.indexOf("")];

    }

  }

  for(let pattern of winPatterns){

    let values = pattern.map(index => board[index]);

    if(
      values.filter(v => v === "X").length === 2 &&
      values.includes("")
    ){

      return pattern[values.indexOf("")];

    }

  }

  return randomMove();

}

function bestMove(){

  let bestScore = -Infinity;
  let move;

  for(let i = 0; i < board.length; i++){

    if(board[i] === ""){

      board[i] = "O";

      let score = minimax(board, 0, false);

      board[i] = "";

      if(score > bestScore){

        bestScore = score;
        move = i;

      }

    }

  }

  return move;

}

function minimax(board, depth, isMaximizing){

  let result = checkResult();

  if(result !== null){

    const scores = {
      O: 1,
      X: -1,
      draw: 0
    };

    return scores[result];

  }

  if(isMaximizing){

    let bestScore = -Infinity;

    for(let i = 0; i < board.length; i++){

      if(board[i] === ""){

        board[i] = "O";

        let score = minimax(board, depth + 1, false);

        board[i] = "";

        bestScore = Math.max(score, bestScore);

      }

    }

    return bestScore;

  }
  else{

    let bestScore = Infinity;

    for(let i = 0; i < board.length; i++){

      if(board[i] === ""){

        board[i] = "X";

        let score = minimax(board, depth + 1, true);

        board[i] = "";

        bestScore = Math.min(score, bestScore);

      }

    }

    return bestScore;

  }

}

function checkResult(){

  for(let pattern of winPatterns){

    const [a,b,c] = pattern;

    if(
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ){

      return board[a];

    }

  }

  if(!board.includes("")){

    return "draw";

  }

  return null;

}