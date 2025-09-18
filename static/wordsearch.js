// Simple Word Search game
(function () {
  const gridEl = document.getElementById('wsGrid');
  if (!gridEl) return; // not on this page/template

  const wordListEl = document.getElementById('wsWordList');
  const statusEl = document.getElementById('wsStatus');
  const newBtn = document.getElementById('wsNewBtn');

  const gridSize = 10;
  const directions = [
    [1, 0],  // down
    [0, 1],  // right
    [1, 1],  // down-right
    [-1, 0], // up
    [0, -1], // left
    [-1, -1],// up-left
    [1, -1], // down-left
    [-1, 1], // up-right
  ];

  const ALL_WORDS = [
    "PYTHON","CODE","GAME","SNAKE","QUIZ",
    "LOGIC","DEBUG","ARRAY","LOOP","STACK",
    "OBJECT","CLASS","CACHE","BINARY","INPUT"
  ];

  let grid = [];
  let selectedStart = null;
  let foundWords = new Set();
  let activeWords = [];
  // Map of serialized path -> word (both forward and reversed are stored)
  const pathToWord = new Map();
  // Track each word's exact placed path (forward)
  const wordPath = new Map();

  function randInt(n) { return Math.floor(Math.random() * n); }

  function computeCellSize() {
    // Responsive-ish sizing
    const s = Math.floor(Math.min(40, Math.max(24, window.innerWidth / 18)));
    return s;
  }

  function styleGrid() {
    const size = computeCellSize();
    gridEl.style.display = 'grid';
    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, ${size}px)`;
    gridEl.style.gridAutoRows = `${size}px`;
    gridEl.style.gap = '4px';
    gridEl.style.userSelect = 'none';
    gridEl.style.margin = '0 auto';
  }

  function styleCell(el) {
    const size = computeCellSize();
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.border = '1px solid #e5e7eb';
    el.style.borderRadius = '6px';
    el.style.background = '#ffffff';
    el.style.font = '600 14px/1 Poppins, Segoe UI, sans-serif';
    el.style.color = '#111827';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 1px 1px rgba(0,0,0,0.04)';
    el.style.padding = '0';
  }

  function makeCell(r, c, ch) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = ch;
    btn.dataset.r = String(r);
    btn.dataset.c = String(c);
    btn.setAttribute('aria-label', `Row ${r + 1} Column ${c + 1} letter ${ch}`);
    styleCell(btn);
    btn.addEventListener('click', onCellClick);
    return btn;
  }

  function resetSelectionHighlight() {
    const cells = gridEl.querySelectorAll('[data-r][data-c]');
    cells.forEach(cell => {
      cell.style.outline = '';
      cell.style.background = '#ffffff';
      cell.style.borderColor = '#e5e7eb';
      cell.style.color = '#111827';
    });
    // Re-apply found styling
    for (const [word, path] of wordPath.entries()) {
      if (foundWords.has(word)) {
        markFound(path);
      }
    }
  }

  function markSelectedPath(path) {
    path.forEach(([r, c]) => {
      const cell = getCellEl(r, c);
      if (!cell) return;
      cell.style.outline = '2px solid #f59e0b';
      cell.style.background = '#fef3c7';
    });
  }

  function markFound(path) {
    path.forEach(([r, c]) => {
      const cell = getCellEl(r, c);
      if (!cell) return;
      cell.style.background = '#d1fae5';
      cell.style.borderColor = '#10b981';
      cell.style.color = '#065f46';
      cell.style.outline = '';
    });
  }

  function flashPath(path, ok) {
    const bg = ok ? '#d1fae5' : '#fee2e2';
    const bd = ok ? '#10b981' : '#ef4444';
    path.forEach(([r, c]) => {
      const cell = getCellEl(r, c);
      if (!cell) return;
      cell.style.background = bg;
      cell.style.borderColor = bd;
    });
    setTimeout(() => resetSelectionHighlight(), 250);
  }

  function getCellEl(r, c) {
    return gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  }

  function serializePath(path) {
    return path.map(([r, c]) => `${r},${c}`).join('|');
  }

  function inBounds(r, c) {
    return r >= 0 && c >= 0 && r < gridSize && c < gridSize;
  }

  function canPlace(word, r, c, dr, dc) {
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      if (!inBounds(rr, cc)) return false;
      const ch = grid[rr][cc];
      if (ch !== '' && ch !== word[i]) return false;
    }
    return true;
  }

  function placeWord(word) {
    const attempts = 200;
    for (let k = 0; k < attempts; k++) {
      const [dr, dc] = directions[randInt(directions.length)];
      // compute a safe start bounding box
      const maxR = dr === 1 ? gridSize - word.length : dr === -1 ? gridSize - 1 : gridSize - 1;
      const minR = dr === -1 ? word.length - 1 : 0;
      const maxC = dc === 1 ? gridSize - word.length : dc === -1 ? gridSize - 1 : gridSize - 1;
      const minC = dc === -1 ? word.length - 1 : 0;

      const r0 = minR + randInt(maxR - minR + 1);
      const c0 = minC + randInt(maxC - minC + 1);

      if (!canPlace(word, r0, c0, dr, dc)) continue;

      const path = [];
      for (let i = 0; i < word.length; i++) {
        const rr = r0 + dr * i;
        const cc = c0 + dc * i;
        grid[rr][cc] = word[i];
        path.push([rr, cc]);
      }

      // map paths
      const forwardKey = serializePath(path);
      const reversedPath = [...path].reverse();
      const reverseKey = serializePath(reversedPath);

      pathToWord.set(forwardKey, word);
      pathToWord.set(reverseKey, word);
      wordPath.set(word, path);
      return true;
    }
    return false;
  }

  function randomLetter() {
    // Favor common letters slightly
    const letters = "EEEEAAAARRIIOONNSTTLCCUDPMHGBFYWKVXZJQ";
    return letters[randInt(letters.length)];
  }

  function generateGrid(words) {
    grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => ''));
    pathToWord.clear();
    wordPath.clear();
    foundWords.clear();

    // Try until all words placed
    let ok = false;
    for (let tries = 0; tries < 50; tries++) {
      grid.forEach(row => row.fill(''));
      pathToWord.clear();
      wordPath.clear();
      ok = true;
      for (const w of words) {
        if (!placeWord(w)) { ok = false; break; }
      }
      if (ok) break;
    }
    if (!ok) {
      // Fallback: reduce words if extremely unlucky
      while (!ok && words.length > 5) {
        words.pop();
        ok = generateGrid(words);
      }
    }

    // Fill blanks
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === '') grid[r][c] = randomLetter();
      }
    }

    return ok;
  }

  function render(words) {
    styleGrid();
    gridEl.innerHTML = '';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        gridEl.appendChild(makeCell(r, c, grid[r][c]));
      }
    }

    wordListEl.innerHTML = '';
    for (const w of words) {
      const li = document.createElement('li');
      li.id = `ws-word-${w}`;
      li.textContent = w;
      li.style.border = '1px solid #e5e7eb';
      li.style.borderRadius = '6px';
      li.style.padding = '6px 8px';
      li.style.background = 'transparent';
      li.style.color = 'inherit';
      li.style.font = '600 13px/1 Poppins, Segoe UI, sans-serif';
      wordListEl.appendChild(li);
    }

    updateStatus();
  }

  function updateStatus() {
    const remaining = activeWords.length - foundWords.size;
    if (remaining > 0) {
      statusEl.textContent = `Find ${remaining} more ${remaining === 1 ? 'word' : 'words'}.`;
    } else {
      statusEl.textContent = 'Great job! Puzzle complete 🎉';
    }
  }

  function getLinePath(r1, c1, r2, c2) {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    const dR = Math.abs(r2 - r1);
    const dC = Math.abs(c2 - c1);
    if (!(r1 === r2 || c1 === c2 || dR === dC)) {
      return null; // not straight line
    }
    const steps = Math.max(dR, dC);
    const path = [];
    for (let i = 0; i <= steps; i++) {
      const rr = r1 + dr * i;
      const cc = c1 + dc * i;
      if (!inBounds(rr, cc)) return null;
      path.push([rr, cc]);
    }
    return path;
  }

  function onCellClick(e) {
    const r = parseInt(e.currentTarget.dataset.r, 10);
    const c = parseInt(e.currentTarget.dataset.c, 10);

    if (!selectedStart) {
      selectedStart = [r, c];
      resetSelectionHighlight();
      markSelectedPath([[r, c]]);
      return;
    }

    const [sr, sc] = selectedStart;
    if (sr === r && sc === c) {
      // Cancel selection
      selectedStart = null;
      resetSelectionHighlight();
      return;
    }

    const path = getLinePath(sr, sc, r, c);
    if (!path) {
      // Invalid line
      flashPath([[sr, sc], [r, c]], false);
      selectedStart = null;
      return;
    }

    const key = serializePath(path);
    const matchedWord = pathToWord.get(key);
    if (matchedWord && !foundWords.has(matchedWord)) {
      foundWords.add(matchedWord);
      markFound(path);
      const li = document.getElementById(`ws-word-${matchedWord}`);
      if (li) {
        li.style.textDecoration = 'line-through';
        li.style.color = '#6b7280';
        li.style.background = '#f9fafb';
      }
      flashPath(path, true);
      updateStatus();
    } else {
      flashPath(path, false);
    }

    selectedStart = null;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function newPuzzle() {
    selectedStart = null;
    resetSelectionHighlight();
    const words = shuffle(ALL_WORDS.slice()).slice(0, 8); // pick 8 words
    activeWords = words;
    generateGrid(words);
    render(words);
  }

  // Bindings
  if (newBtn) newBtn.addEventListener('click', newPuzzle);
  window.addEventListener('resize', () => {
    // re-style grid and cells
    styleGrid();
    gridEl.querySelectorAll('[data-r][data-c]').forEach(styleCell);
  });

  // Initialize on load
  newPuzzle();
})();
