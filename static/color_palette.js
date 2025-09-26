(function () {
  const baseEl = document.getElementById('cpBase');
  const countEl = document.getElementById('cpCount');
  const schemeEl = document.getElementById('cpScheme');
  const genBtn = document.getElementById('cpGenerate');
  const rndBtn = document.getElementById('cpRandom');
  const outEl = document.getElementById('cpOutput');

  if (!baseEl || !countEl || !schemeEl || !genBtn || !outEl) return;

  // Utilities
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mod(n, m) { return ((n % m) + m) % m; }

  function hexToRgb(hex) {
    const h = hex.replace('#', '').trim();
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b };
    } else if (h.length === 6) {
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
    }
    return { r: 255, g: 255, b: 0 };
  }

  function rgbToHex(r, g, b) {
    const toHex = (x) => x.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h = mod(h, 360) / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;

    if (s === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function getContrastText(hex) {
    const { r, g, b } = hexToRgb(hex);
    // Relative luminance
    const srgb = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return L > 0.5 ? '#111827' : '#f9fafb';
  }

  function generatePalette(baseHex, scheme, count) {
    const { r, g, b } = hexToRgb(baseHex);
    const base = rgbToHsl(r, g, b);
    const colors = [];

    const push = (h, s, l) => {
      const rgb = hslToRgb(h, s, l);
      colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    };

    switch (scheme) {
      case 'monochrome': {
        const s = clamp(base.s, 20, 90);
        const start = 15, end = 85;
        for (let i = 0; i < count; i++) {
          const l = start + (end - start) * (i / (count - 1));
          push(base.h, s, l);
        }
        break;
      }
      case 'analogous': {
        const step = 20;
        const startIdx = -Math.floor((count - 1) / 2);
        for (let i = 0; i < count; i++) {
          const idx = startIdx + i;
          const h = base.h + idx * step;
          const s = clamp(base.s + (idx % 2 === 0 ? 0 : -5), 40, 90);
          const l = clamp(base.l + (idx % 2 === 0 ? 0 : 5), 25, 85);
          push(h, s, l);
        }
        break;
      }
      case 'complementary': {
        const comp = mod(base.h + 180, 360);
        const seq = [];
        for (let i = 0; i < count; i++) {
          seq.push(i % 2 === 0 ? base.h : comp);
        }
        for (let i = 0; i < count; i++) {
          const h = seq[i];
          const l = clamp(base.l + ((i - Math.floor(count / 2)) * 8), 20, 85);
          push(h, base.s, l);
        }
        break;
      }
      case 'triadic': {
        const angles = [0, 120, 240];
        for (let i = 0; i < count; i++) {
          const h = base.h + angles[i % 3];
          const l = clamp(base.l + ((i % 3) - 1) * 6, 25, 85);
          push(h, base.s, l);
        }
        break;
      }
      case 'split': {
        const angles = [0, 150, 210];
        for (let i = 0; i < count; i++) {
          const h = base.h + angles[i % angles.length];
          const s = clamp(base.s + (i % 2 === 0 ? 0 : -5), 35, 90);
          const l = clamp(base.l + (i % 2 === 0 ? 0 : 6), 25, 85);
          push(h, s, l);
        }
        break;
      }
      case 'tetradic': {
        const angles = [0, 90, 180, 270];
        for (let i = 0; i < count; i++) {
          const h = base.h + angles[i % 4];
          const l = clamp(base.l + ((i % 4) - 1.5) * 4, 25, 85);
          push(h, base.s, l);
        }
        break;
      }
      default: {
        // fallback: simple shades
        for (let i = 0; i < count; i++) {
          const l = 20 + (60 * i) / (count - 1);
          push(base.h, base.s, l);
        }
      }
    }
    return colors.map(c => c.toUpperCase());
  }

  function renderSwatches(colors) {
    outEl.innerHTML = '';
    colors.forEach((hex, idx) => {
      const tile = document.createElement('div');
      tile.style.borderRadius = '12px';
      tile.style.overflow = 'hidden';
      tile.style.border = '1px solid rgba(255,255,255,0.15)';
      tile.style.boxShadow = '0 10px 24px rgba(0,0,0,0.22)';
      tile.style.background = hex;
      tile.style.position = 'relative';
      tile.style.height = '120px';

      const textColor = getContrastText(hex);

      const bar = document.createElement('div');
      bar.style.position = 'absolute';
      bar.style.left = '8px';
      bar.style.right = '8px';
      bar.style.bottom = '8px';
      bar.style.display = 'flex';
      bar.style.alignItems = 'center';
      bar.style.justifyContent = 'space-between';
      bar.style.gap = '8px';

      const label = document.createElement('strong');
      label.textContent = hex;
      label.style.color = textColor;
      label.style.font = "600 14px/1.2 'Poppins','Segoe UI',sans-serif";

      const btn = document.createElement('button');
      btn.className = 'btn-outline';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.style.padding = '6px 10px';
      btn.style.fontSize = '12px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(255,255,255,0.5)';
      btn.style.color = textColor;
      btn.style.background = 'rgba(0,0,0,0.15)';

      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(hex);
          const old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = old), 800);
        } catch {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = hex; document.body.appendChild(ta);
          ta.select(); document.execCommand('copy');
          document.body.removeChild(ta);
          const old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = old), 800);
        }
      });

      bar.appendChild(label);
      bar.appendChild(btn);
      tile.appendChild(bar);
      outEl.appendChild(tile);
    });
  }

  function currentPalette() {
    const base = baseEl.value || '#FFEB3B';
    const count = clamp(parseInt(countEl.value, 10) || 5, 3, 10);
    const scheme = schemeEl.value || 'complementary';
    return generatePalette(base, scheme, count);
  }

  function generateAndRender() {
    renderSwatches(currentPalette());
  }

  function randomHex() {
    const n = Math.floor(Math.random() * 0xffffff);
    return `#${n.toString(16).padStart(6, '0')}`.toUpperCase();
  }

  // Events
  genBtn.addEventListener('click', generateAndRender);
  rndBtn?.addEventListener('click', () => {
    baseEl.value = randomHex();
    generateAndRender();
  });
  [baseEl, countEl, schemeEl].forEach(el => el.addEventListener('change', generateAndRender));

  // Seed and render
  generateAndRender();
})();
