let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;

function makeMove(index) {
  if (board[index] === "" && gameActive) {
    board[index] = currentPlayer;
    document.getElementsByClassName("cell")[index].innerText = currentPlayer;

    if (checkWin()) {
      document.getElementById("tictactoe-status").innerText = `🎉 Player ${currentPlayer} wins!`;
      gameActive = false;
    } else if (board.every(cell => cell !== "")) {
      document.getElementById("tictactoe-status").innerText = "🤝 It’s a draw!";
      gameActive = false;
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      document.getElementById("tictactoe-status").innerText = `Player ${currentPlayer}’s turn`;
    }
  }
}

function checkWin() {
  const winningCombos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winningCombos.some(combo =>
    board[combo[0]] === currentPlayer &&
    board[combo[1]] === currentPlayer &&
    board[combo[2]] === currentPlayer
  );
}

function restartTicTacToe() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  document.getElementById("tictactoe-status").innerText = "Player X’s turn";

  let cells = document.getElementsByClassName("cell");
  for (let cell of cells) {
    cell.innerText = "";
  }
}
