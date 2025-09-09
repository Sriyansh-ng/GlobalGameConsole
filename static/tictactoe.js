const board = document.getElementById("tictactoeBoard");
let cells = [];
let currentPlayer = "X";

function createBoard() {
  board.innerHTML = "";
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => makeMove(cell), { once: true });
    board.appendChild(cell);
    cells.push(cell);
  }
}

function makeMove(cell) {
  cell.innerText = currentPlayer;
  if (checkWinner()) {
    alert(currentPlayer + " wins!");
    restartTicTacToe();
    return;
  }
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function checkWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => cells[index].innerText === currentPlayer)
  );
}

function restartTicTacToe() {
  currentPlayer = "X";
  createBoard();
}

createBoard();
