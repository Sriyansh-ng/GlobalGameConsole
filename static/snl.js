const snlCanvas = document.getElementById("snlCanvas");
const snlCtx = snlCanvas.getContext("2d");

const rows = 10;
const cols = 10;
const cellSize = snlCanvas.width / cols;

let playerPos = 1;
let diceResult = document.getElementById("diceResult");

const snakes = { 16: 6, 48: 30, 62: 19, 64: 60, 97: 78 };
const ladders = { 1: 38, 4: 14, 9: 31, 28: 84, 21: 42, 36: 44, 51: 67, 71: 91, 80: 100 };

function drawBoard() {
  snlCtx.clearRect(0, 0, snlCanvas.width, snlCanvas.height);
  snlCtx.font = "12px Arial";
  snlCtx.textAlign = "center";
  snlCtx.textBaseline = "middle";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let number = r % 2 === 0
        ? r * cols + c + 1
        : r * cols + (cols - c);

      let x = c * cellSize;
      let y = snlCanvas.height - (r + 1) * cellSize;

      snlCtx.fillStyle = (r + c) % 2 === 0 ? "#f2f2f2" : "#cccccc";
      snlCtx.fillRect(x, y, cellSize, cellSize);
      snlCtx.strokeRect(x, y, cellSize, cellSize);
      snlCtx.fillStyle = "black";
      snlCtx.fillText(number, x + cellSize / 2, y + cellSize / 2);
    }
  }

  // Draw snakes (red lines)
  snlCtx.strokeStyle = "red";
  snlCtx.lineWidth = 3;
  for (let start in snakes) {
    drawLine(start, snakes[start]);
  }

  // Draw ladders (green lines)
  snlCtx.strokeStyle = "green";
  snlCtx.lineWidth = 3;
  for (let start in ladders) {
    drawLine(start, ladders[start]);
  }

  // Draw player
  let { x, y } = getCoordinates(playerPos);
  snlCtx.beginPath();
  snlCtx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
  snlCtx.fillStyle = "blue";
  snlCtx.fill();
}

function getCoordinates(num) {
  let r = Math.floor((num - 1) / cols);
  let c = (r % 2 === 0) ? (num - 1) % cols : cols - 1 - ((num - 1) % cols);
  return { x: c * cellSize, y: snlCanvas.height - (r + 1) * cellSize };
}

function drawLine(start, end) {
  let startCoord = getCoordinates(start);
  let endCoord = getCoordinates(end);
  snlCtx.beginPath();
  snlCtx.moveTo(startCoord.x + cellSize / 2, startCoord.y + cellSize / 2);
  snlCtx.lineTo(endCoord.x + cellSize / 2, endCoord.y + cellSize / 2);
  snlCtx.stroke();
}

document.getElementById("rollDiceBtn").addEventListener("click", () => {
  let roll = Math.floor(Math.random() * 6) + 1;
  diceResult.innerText = `You rolled: ${roll}`;

  playerPos += roll;
  if (playerPos in snakes) {
    playerPos = snakes[playerPos];
  } else if (playerPos in ladders) {
    playerPos = ladders[playerPos];
  }

  if (playerPos >= 100) {
    diceResult.innerText = "🎉 You win!";
    playerPos = 100;
  }
  drawBoard();
});

drawBoard();
