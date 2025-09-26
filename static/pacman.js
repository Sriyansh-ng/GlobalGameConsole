(function () {
  const canvas = document.getElementById('pacmanCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Grid configuration
  const COLS = 28;
  const ROWS = 28;
  const TILE = Math.floor(Math.min(canvas.width / COLS, canvas.height / ROWS));
  const W = COLS * TILE;
  const H = ROWS * TILE;

  // Resize canvas to fit grid exactly
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;

  // Colors and aesthetics
  const COLORS = {
    bg: '#000000',
    wall: '#1a6df2',
    pellet: '#ffd966',
    pacman: '#ffeb3b',
    ghost: '#ff4d4d',
    ghostEyeWhite: '#ffffff',
    ghostEyeBlue: '#263238',
  };

  // Maze
  const WALL = 1;
  const PATH = 0;

  function makeGrid(cols, rows, fill = PATH) {
    return Array.from({ length: rows }, () => Array(cols).fill(fill));
  }

  function generateMaze(cols, rows) {
    const g = makeGrid(cols, rows, PATH);
    // Border
    for (let c = 0; c < cols; c++) { g[0][c] = WALL; g[rows - 1][c] = WALL; }
    for (let r = 0; r < rows; r++) { g[r][0] = WALL; g[r][cols - 1] = WALL; }

    // Horizontal bands every 4 rows with gaps
    for (let r = 4; r < rows - 1; r += 4) {
      for (let c = 1; c < cols - 1; c++) {
        if (c === 4 || c === cols - 5) continue; // gaps
        g[r][c] = WALL;
      }
    }
    // Vertical bands with gaps
    const vCols = [6, 12, 18, 22];
    for (const c of vCols) {
      for (let r = 1; r < rows - 1; r++) {
        if (r === 6 || r === rows - 7) continue;
        g[r][c] = WALL;
      }
    }
    // Central box
    for (let r = rows / 2 - 2; r <= rows / 2 + 2; r++) {
      for (let c = cols / 2 - 5; c <= cols / 2 + 5; c++) {
        if (r === rows / 2 - 2 || r === rows / 2 + 2 || c === cols / 2 - 5 || c === cols / 2 + 5) {
          g[r | 0][c | 0] = WALL;
        }
      }
    }
    return g;
  }

  const grid = generateMaze(COLS, ROWS);

  // Pellets
  const pellets = makeGrid(COLS, ROWS, false);
  let pelletCount = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === PATH) {
        pellets[r][c] = true;
        pelletCount++;
      }
    }
  }
  // Clear pellets inside the central box
  for (let r = ROWS / 2 - 1; r <= ROWS / 2 + 1; r++) {
    for (let c = COLS / 2 - 3; c <= COLS / 2 + 3; c++) {
      pellets[r | 0][c | 0] = false;
      pelletCount--;
    }
  }

  // Entities
  const DIRS = {
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    NONE: { x: 0, y: 0 },
  };

  const pacman = {
    x: 1,
    y: 1,
    dir: DIRS.RIGHT,
    nextDir: DIRS.NONE,
    mouthPhase: 0,
  };

  const ghost = {
    x: COLS - 2,
    y: ROWS - 2,
    dir: DIRS.LEFT,
    lastTurnTick: 0,
  };

  let score = 0;
  let running = true;
  let tickId = null;
  let tickCount = 0;

  function setScoreText() {
    const el = document.getElementById('pacmanScore');
    if (el) el.textContent = `Score: ${score}`;
  }

  function isWall(c, r) {
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
    return grid[r][c] === WALL;
  }

  function tryTurn(entity, desiredDir) {
    const nx = entity.x + desiredDir.x;
    const ny = entity.y + desiredDir.y;
    if (!isWall(nx, ny)) {
      entity.dir = desiredDir;
      return true;
    }
    return false;
  }

  function moveEntity(entity) {
    const nx = entity.x + entity.dir.x;
    const ny = entity.y + entity.dir.y;

    // Wrap horizontally
    let tx = nx, ty = ny;
    if (tx < 0) tx = COLS - 1;
    if (tx >= COLS) tx = 0;

    if (!isWall(tx, ty)) {
      entity.x = tx;
      entity.y = ty;
    }
  }

  function manhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function ghostStep() {
    const options = [DIRS.LEFT, DIRS.RIGHT, DIRS.UP, DIRS.DOWN].filter(d => !isWall(ghost.x + d.x, ghost.y + d.y));
    if (options.length === 0) return;

    // Avoid immediate reversal if possible
    const reverse = { x: -ghost.dir.x, y: -ghost.dir.y };
    let candidates = options;
    if (options.length > 1) {
      candidates = options.filter(d => !(d.x === reverse.x && d.y === reverse.y));
      if (candidates.length === 0) candidates = options;
    }

    // Choose the option with minimal Manhattan distance, slight randomness
    let best = candidates[0];
    let bestDist = manhattan(ghost.x + best.x, ghost.y + best.y, pacman.x, pacman.y);
    for (let i = 1; i < candidates.length; i++) {
      const d = candidates[i];
      const dist = manhattan(ghost.x + d.x, ghost.y + d.y, pacman.x, pacman.y);
      if (dist < bestDist || (dist === bestDist && Math.random() < 0.3)) {
        best = d; bestDist = dist;
      }
    }
    ghost.dir = best;
    moveEntity(ghost);
  }

  function eatPelletIfAny() {
    if (pellets[pacman.y]?.[pacman.x]) {
      pellets[pacman.y][pacman.x] = false;
      score += 10;
      pelletCount--;
      setScoreText();
      if (pelletCount <= 0) {
        gameOver(true);
      }
    }
  }

  function gameOver(win) {
    running = false;
    if (tickId) clearInterval(tickId);
    const el = document.getElementById('pacmanScore');
    if (el) el.textContent = win ? `You Win! Score: ${score}` : `Game Over! Score: ${score}`;
  }

  function drawWalls() {
    ctx.fillStyle = COLORS.wall;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === WALL) {
          const x = c * TILE;
          const y = r * TILE;
          ctx.fillRect(x, y, TILE, TILE);
        }
      }
    }
  }

  function drawPellets() {
    ctx.fillStyle = COLORS.pellet;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (pellets[r][c]) {
          const cx = c * TILE + TILE / 2;
          const cy = r * TILE + TILE / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(2, TILE * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function drawPacman() {
    const cx = pacman.x * TILE + TILE / 2;
    const cy = pacman.y * TILE + TILE / 2;

    // Animate mouth
    const mouth = 0.2 + 0.15 * Math.abs(Math.sin(pacman.mouthPhase));
    let angle = 0;
    if (pacman.dir === DIRS.RIGHT) angle = 0;
    if (pacman.dir === DIRS.LEFT) angle = Math.PI;
    if (pacman.dir === DIRS.UP) angle = -Math.PI / 2;
    if (pacman.dir === DIRS.DOWN) angle = Math.PI / 2;

    ctx.fillStyle = COLORS.pacman;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, TILE * 0.45, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();
  }

  function drawGhost() {
    const gx = ghost.x * TILE;
    const gy = ghost.y * TILE;

    ctx.fillStyle = COLORS.ghost;
    ctx.beginPath();
    // Head (semi-circle)
    ctx.arc(gx + TILE / 2, gy + TILE * 0.55, TILE * 0.45, Math.PI, 0);
    // Body and feet
    ctx.lineTo(gx + TILE * 0.95, gy + TILE * 0.9);
    const feet = 3;
    for (let i = feet - 1; i >= 0; i--) {
      const fx = gx + TILE * (0.2 + (i * (0.6 / (feet - 1))));
      ctx.lineTo(fx + TILE * 0.1, gy + TILE);
      ctx.lineTo(fx, gy + TILE * 0.9);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = COLORS.ghostEyeWhite;
    const eyeOffsetX = TILE * 0.12;
    const eyeOffsetY = -TILE * 0.05;
    const eyeR = TILE * 0.12;
    const dir = ghost.dir;
    const pupilOffset = { x: dir.x * TILE * 0.06, y: dir.y * TILE * 0.06 };

    const leftEye = { x: gx + TILE / 2 - eyeOffsetX, y: gy + TILE * 0.55 + eyeOffsetY };
    const rightEye = { x: gx + TILE / 2 + eyeOffsetX, y: gy + TILE * 0.55 + eyeOffsetY };

    ctx.beginPath(); ctx.arc(leftEye.x, leftEye.y, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEye.x, rightEye.y, eyeR, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = COLORS.ghostEyeBlue;
    ctx.beginPath(); ctx.arc(leftEye.x + pupilOffset.x, leftEye.y + pupilOffset.y, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEye.x + pupilOffset.x, rightEye.y + pupilOffset.y, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
  }

  function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    drawWalls();
    drawPellets();
    drawPacman();
    drawGhost();
  }

  function tick() {
    if (!running) return;

    tickCount++;

    // Attempt buffered turn first
    if (pacman.nextDir !== DIRS.NONE) {
      tryTurn(pacman, pacman.nextDir);
    }

    // Move Pac-Man
    moveEntity(pacman);
    eatPelletIfAny();

    // Move Ghost
    if (tickCount - ghost.lastTurnTick >= 1) {
      ghostStep();
      ghost.lastTurnTick = tickCount;
    }

    // Collision
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      gameOver(false);
    }

    // Animate mouth
    pacman.mouthPhase += 0.2;

    draw();
  }

  function resetGame() {
    // Reset pellets
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        pellets[r][c] = (grid[r][c] === PATH);
      }
    }
    // Clear central box pellets again
    for (let r = ROWS / 2 - 1; r <= ROWS / 2 + 1; r++) {
      for (let c = COLS / 2 - 3; c <= COLS / 2 + 3; c++) {
        pellets[r | 0][c | 0] = false;
      }
    }

    pelletCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (pellets[r][c]) pelletCount++;
      }
    }

    // Reset entities and score
    pacman.x = 1; pacman.y = 1; pacman.dir = DIRS.RIGHT; pacman.nextDir = DIRS.NONE; pacman.mouthPhase = 0;
    ghost.x = COLS - 2; ghost.y = ROWS - 2; ghost.dir = DIRS.LEFT; ghost.lastTurnTick = 0;
    score = 0;
    setScoreText();
    running = true;

    if (tickId) clearInterval(tickId);
    tickId = setInterval(tick, 140); // game speed
  }

  // Input
  function dirFromKey(code) {
    switch (code) {
      case 'ArrowLeft': case 'KeyA': return DIRS.LEFT;
      case 'ArrowRight': case 'KeyD': return DIRS.RIGHT;
      case 'ArrowUp': case 'KeyW': return DIRS.UP;
      case 'ArrowDown': case 'KeyS': return DIRS.DOWN;
      default: return null;
    }
  }

  document.addEventListener('keydown', (e) => {
    const d = dirFromKey(e.code);
    if (!d) return;
    e.preventDefault();
    // Try to turn immediately; otherwise buffer it
    if (!tryTurn(pacman, d)) {
      pacman.nextDir = d;
    }
  }, { passive: false });

  // Expose restart for button
  window.restartPacman = function () {
    resetGame();
  };

  // Start
  setScoreText();
  resetGame();
  draw();
})();
