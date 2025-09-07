window.onload = function() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const box = 20;
  let snake = [{x: 9 * box, y: 10 * box}];
  let direction = null;
  let food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
  };
  let score = 0;

  document.addEventListener("keydown", setDirection);

  function setDirection(event) {
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  }

  function draw() {
    ctx.fillStyle = "#e9ffe9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i === 0 ? "#4CAF50" : "#81C784";
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
      ctx.strokeStyle = "#e9ffe9";
      ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#FF5722";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
      score++;
      document.getElementById("score").innerText = "Score: " + score;
      food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box
      };
    } else {
      snake.pop();
    }

    let newHead = {x: snakeX, y: snakeY};

    if (
      snakeX < 0 || snakeX >= canvas.width ||
      snakeY < 0 || snakeY >= canvas.height ||
      collision(newHead, snake)
    ) {
      clearInterval(game);
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

  function restartGame() {
    snake = [{x: 9 * box, y: 10 * box}];
    direction = null;
    score = 0;
    document.getElementById("score").innerText = "Score: 0";
    clearInterval(game);
    game = setInterval(draw, 200); // slower speed
  }

  let game = setInterval(draw, 200);
  window.restartGame = restartGame; // expose globally for button
};
