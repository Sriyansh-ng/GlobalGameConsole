const boardElement = document.getElementById("tictactoeBoard");
let board, currentPlayer, gameActive;

function startTicTacToe() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  boardElement.innerHTML = "";
  document.getElementById("tictactoeResult").innerText = ""; // clear old result

  board.forEach((_, index) => {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => makeMove(index));
    boardElement.appendChild(cell);
  });
}

function makeMove(index) {
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  boardElement.children[index].innerText = currentPlayer;

  if (checkWinner()) {
    document.getElementById("tictactoeResult").innerText = `${currentPlayer} wins! 🎉`;
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    document.getElementById("tictactoeResult").innerText = "It's a draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function checkWinner() {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winningCombos.some(combo =>
    board[combo[0]] &&
    board[combo[0]] === board[combo[1]] &&
    board[combo[0]] === board[combo[2]]
  );
}

function restartTicTacToe() {
  startTicTacToe();
}

startTicTacToe();
