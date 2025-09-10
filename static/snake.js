const snakeCanvas = document.getElementById("snakeCanvas");
const snakeCtx = snakeCanvas.getContext("2d");

const box = 20;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = randomFood();
let score = 0;
let snakeGame;

document.addEventListener("keydown", setDirection);

function setDirection(event) {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

// Handle mobile direction buttons
function setDirectionButton(dir) {
  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  else if (dir === "UP" && direction !== "DOWN") direction = "UP";
  else if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  else if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
  };
}

function drawSnakeGame() {
  snakeCtx.fillStyle = "#1e1e2f";
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  for (let i = 0; i < snake.length; i++) {
    snakeCtx.fillStyle = i === 0 ? "#4CAF50" : "#81C784";
    snakeCtx.fillRect(snake[i].x, snake[i].y, box, box);
    snakeCtx.strokeStyle = "#1e1e2f";
    snakeCtx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  snakeCtx.fillStyle = "#FF5722";
  snakeCtx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  if (snakeX === food.x && snakeY === food.y) {
    score++;
    document.getElementById("snakeScore").innerText = "Score: " + score;
    food = randomFood();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  if (
    snakeX < 0 ||
    snakeX >= snakeCanvas.width ||
    snakeY < 0 ||
    snakeY >= snakeCanvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(snakeGame);
    alert("Game Over! Final Score: " + score);
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

function restartSnake() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  score = 0;
  document.getElementById("snakeScore").innerText = "Score: 0";
  clearInterval(snakeGame);
  snakeGame = setInterval(drawSnakeGame, 200);
}

restartSnake();

function setDirectionFromButton(dir) {
  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  if (dir === "UP" && direction !== "DOWN") direction = "UP";
  if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
}
