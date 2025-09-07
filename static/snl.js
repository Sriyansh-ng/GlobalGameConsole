window.onload = function() {
  const boardDiv = document.getElementById("board");
  const rollBtn = document.getElementById("rollDice");
  const statusP = document.getElementById("snl-status");

  let playerPos = 1;
  const snakes = {16:6, 48:30, 62:19, 88:24, 95:56, 97:78};
  const ladders = {2:38, 7:14, 8:31, 15:26, 28:84, 36:44, 51:67, 71:91, 78:98, 87:94};

  function createBoard() {
    boardDiv.innerHTML = '';
    let flip = false;
    for (let row = 10; row >= 1; row--) {
      let rowNumbers = [];
      for (let col = 1; col <= 10; col++) {
        rowNumbers.push((row-1)*10 + col);
      }
      if (flip) rowNumbers.reverse();
      flip = !flip;

      rowNumbers.forEach(num => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.innerText = num;
        if (snakes[num]) cell.classList.add('snake');
        if (ladders[num]) cell.classList.add('ladder');
        if (num === playerPos) cell.classList.add('player');
        boardDiv.appendChild(cell);
      });
    }
  }

  function movePlayer() {
    let roll = Math.floor(Math.random()*6) + 1;
    statusP.innerText = `You rolled a ${roll}!`;

    playerPos += roll;
    if (playerPos > 100) playerPos = 100;

    // Check ladders
    if (ladders[playerPos]) {
      playerPos = ladders[playerPos];
      statusP.innerText += ` Ladder! Move to ${playerPos}`;
    }

    // Check snakes
    if (snakes[playerPos]) {
      playerPos = snakes[playerPos];
      statusP.innerText += ` Snake! Move to ${playerPos}`;
    }

    createBoard();

    if (playerPos === 100) {
      statusP.innerText = "🎉 You won!";
      rollBtn.disabled = true;
    }
  }

  rollBtn.addEventListener('click', movePlayer);

  function restartSNL() {
    playerPos = 1;
    rollBtn.disabled = false;
    statusP.innerText = "Click roll to start!";
    createBoard();
  }

  window.restartSNL = restartSNL; // expose globally
  createBoard();
};
