const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");

const newGameBtn = document.getElementById("newGameBtn");

const saveBtn = document.getElementById("saveBtn");

const manualBtn = document.getElementById("manualBtn");

const aiBtn = document.getElementById("aiBtn");

const recordBtn = document.getElementById("recordBtn");

const playerXInput = document.getElementById("playerX");

const playerOInput = document.getElementById("playerO");

const xTitle = document.getElementById("xTitle");

const oTitle = document.getElementById("oTitle");

const xScoreText = document.getElementById("xScore");

const oScoreText = document.getElementById("oScore");

const drawScoreText = document.getElementById("drawScore");

let board = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "X";

let running = true;

let aiMode = false;

let difficulty = "medium";

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

manualBtn.addEventListener("click", () => {

    aiMode = false;

    playerOInput.value = "Player 2";

    oTitle.innerText = "PLAYER 2 ( O )";

    restartGame();

});

aiBtn.addEventListener("click", () => {

    aiMode = true;

    playerOInput.value = "AI Bot";

    oTitle.innerText = "AI BOT ( O )";

    restartGame();

});

recordBtn.addEventListener("click", () => {

    alert(
        `Player X Wins : ${xScore}\n` +
        `Player O Wins : ${oScore}\n` +
        `Draw Matches : ${drawScore}`
    );

});

cells.forEach(cell => {

    cell.addEventListener("click", cellClicked);

});

newGameBtn.addEventListener("click", restartGame);

saveBtn.addEventListener("click", saveResult);

function cellClicked(){

    const index = this.dataset.index;

    if(board[index] !== "" || !running){

        return;

    }

    updateCell(this, index);

    checkWinner();

    if(aiMode && currentPlayer === "O" && running){

        setTimeout(aiMove, 500);

    }

}

function updateCell(cell, index){

    board[index] = currentPlayer;

    cell.innerText = currentPlayer;

    cell.classList.add(currentPlayer.toLowerCase());

}

function changePlayer(){

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    let playerName;

    if(currentPlayer === "X"){

        playerName = playerXInput.value || "Player 1";

    }
    else{

        playerName = playerOInput.value || "Player 2";

    }

    statusText.innerText =
    `${playerName}'s turn (${currentPlayer})`;

}

function checkWinner(){

    let won = false;

    for(let pattern of winPatterns){

        const a = board[pattern[0]];

        const b = board[pattern[1]];

        const c = board[pattern[2]];

        if(a === "" || b === "" || c === ""){

            continue;

        }

        if(a === b && b === c){

            won = true;

            break;

        }

    }

    if(won){

        let winnerName;

        if(currentPlayer === "X"){

            winnerName = playerXInput.value || "Player 1";

            xScore++;

            localStorage.setItem("xScore", xScore);

            xScoreText.innerText = xScore;

        }
        else{

            winnerName = playerOInput.value || "Player 2";

            oScore++;

            localStorage.setItem("oScore", oScore);

            oScoreText.innerText = oScore;

        }

        statusText.innerText =
        `${winnerName} Wins 🎉`;

        running = false;

        return;

    }

    if(!board.includes("")){

        drawScore++;

        localStorage.setItem("drawScore", drawScore);

        drawScoreText.innerText = drawScore;

        statusText.innerText = "Match Draw 🤝";

        running = false;

        return;

    }

    changePlayer();

}

function restartGame(){

    board = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    running = true;

    statusText.innerText = "Player 1's turn (X)";

    cells.forEach(cell => {

        cell.innerText = "";

        cell.classList.remove("x");

        cell.classList.remove("o");

    });

}

function saveResult(){

    const results = {

        playerX: xScore,

        playerO: oScore,

        draws: drawScore

    };

    localStorage.setItem(
        "ticTacToeResults",
        JSON.stringify(results)
    );

    alert("Result Saved Successfully ✅");

}

/* =========================
   AI SECTION
========================= */

function aiMove(){

    let move;

    if(difficulty === "easy"){

        move = randomMove();

    }
    else if(difficulty === "medium"){

        move = mediumMove();

    }
    else{

        move = bestMove();

    }

    board[move] = "O";

    cells[move].innerText = "O";

    cells[move].classList.add("o");

    checkWinner();

}

function randomMove(){

    let empty = [];

    board.forEach((cell,index) => {

        if(cell === ""){

            empty.push(index);

        }

    });

    return empty[
        Math.floor(Math.random() * empty.length)
    ];

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

    return randomMove();

}