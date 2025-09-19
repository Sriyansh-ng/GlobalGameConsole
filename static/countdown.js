// Utility Hub: Countdown Timer
(function () {
  const els = {
    min: document.getElementById('cdMin'),
    sec: document.getElementById('cdSec'),
    text: document.getElementById('cdText'),
    fill: document.getElementById('cdFill'),
    start: document.getElementById('cdStart'),
    pause: document.getElementById('cdPause'),
    reset: document.getElementById('cdReset'),
  };

  // If the section isn't present, bail.
  if (!els.text || !els.start) return;

  let totalMs = 0;
  let remainingMs = 0;
  let endTime = 0;
  let timerId = null;
  let running = false;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function msFromInputs() {
    const m = clamp(parseInt(els.min?.value || '0', 10) || 0, 0, 999);
    const s = clamp(parseInt(els.sec?.value || '0', 10) || 0, 0, 59);
    return (m * 60 + s) * 1000;
  }

  function format(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  function setUI(msLeft, msTotal) {
    if (els.text) {
      els.text.textContent = format(msLeft);
      // urgency colors
      els.text.style.color = msLeft <= 60000 ? '#b91c1c' : msLeft <= 120000 ? '#b45309' : '#111827';
    }
    if (els.fill && msTotal > 0) {
      const pct = Math.max(0, Math.min(100, (msLeft / msTotal) * 100));
      els.fill.style.width = `${pct}%`;
    }
  }

  function stopTimer(updateText = true) {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    running = false;
    els.start.disabled = false;
    els.pause.disabled = true;
    if (updateText) setUI(0, totalMs || 1);
  }

  function tick() {
    const now = Date.now();
    remainingMs = Math.max(0, endTime - now);
    setUI(remainingMs, totalMs);
    if (remainingMs <= 0) {
      stopTimer(true);
    }
  }

  function start() {
    // If already running, ignore
    if (running) return;

    // If never started or was reset, compute from inputs
    if (remainingMs <= 0 || remainingMs > totalMs) {
      totalMs = msFromInputs();
      if (totalMs <= 0) {
        alert('Please set a duration greater than 0 seconds.');
        return;
      }
      remainingMs = totalMs;
      setUI(remainingMs, totalMs);
    }

    endTime = Date.now() + remainingMs;
    running = true;
    els.start.disabled = true;
    els.pause.disabled = false;
    tick();
    timerId = setInterval(tick, 250);
  }

  function pause() {
    if (!running) return;
    // Freeze remaining time
    tick();
    stopTimer(false);
  }

  function reset() {
    stopTimer(false);
    totalMs = msFromInputs();
    remainingMs = totalMs;
    setUI(remainingMs, totalMs);
  }

  // Wire up events
  els.start.addEventListener('click', start);
  els.pause.addEventListener('click', pause);
  els.reset.addEventListener('click', reset);

  // Keep display in sync when inputs change
  ['change', 'input'].forEach(evt => {
    els.min.addEventListener(evt, () => {
      if (!running) {
        totalMs = msFromInputs();
        remainingMs = totalMs;
        setUI(remainingMs, totalMs);
      }
    });
    els.sec.addEventListener(evt, () => {
      if (!running) {
        totalMs = msFromInputs();
        remainingMs = totalMs;
        setUI(remainingMs, totalMs);
      }
    });
  });

  // Initialize UI
  totalMs = msFromInputs();
  remainingMs = totalMs;
  setUI(remainingMs, totalMs);
  els.pause.disabled = true;
})();
