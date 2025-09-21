// Utility Hub: Unit Converter
(function () {
  const els = {
    category: document.getElementById('ucCategory'),
    value: document.getElementById('ucValue'),
    from: document.getElementById('ucFrom'),
    to: document.getElementById('ucTo'),
    convert: document.getElementById('ucConvert'),
    swap: document.getElementById('ucSwap'),
    result: document.getElementById('ucResult'),
    copy: document.getElementById('ucCopy'),
  };

  if (!els.category || !els.from || !els.to) return;

  // Base-unit factor maps (to base)
  const LENGTH = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  };

  const WEIGHT = {
    g: 1,
    kg: 1000,
    mg: 0.001,
    lb: 453.59237,
    oz: 28.349523125,
    t: 1_000_000, // metric ton -> grams
  };

  const TEMP = ['C', 'F', 'K']; // handled with formulas

  const LABELS = {
    // length
    m: 'Meter (m)',
    km: 'Kilometer (km)',
    cm: 'Centimeter (cm)',
    mm: 'Millimeter (mm)',
    in: 'Inch (in)',
    ft: 'Foot (ft)',
    yd: 'Yard (yd)',
    mi: 'Mile (mi)',
    // weight
    g: 'Gram (g)',
    kg: 'Kilogram (kg)',
    mg: 'Milligram (mg)',
    lb: 'Pound (lb)',
    oz: 'Ounce (oz)',
    t: 'Tonne (t)',
    // temp
    C: 'Celsius (°C)',
    F: 'Fahrenheit (°F)',
    K: 'Kelvin (K)',
  };

  function populateUnits(category) {
    let units = [];
    if (category === 'length') units = Object.keys(LENGTH);
    else if (category === 'weight') units = Object.keys(WEIGHT);
    else if (category === 'temperature') units = TEMP.slice();

    const makeOptions = (select, arr) => {
      select.innerHTML = '';
      arr.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = LABELS[u] || u;
        select.appendChild(opt);
      });
    };

    makeOptions(els.from, units);
    makeOptions(els.to, units);

    // Set sensible defaults
    if (category === 'length') { els.from.value = 'm'; els.to.value = 'ft'; }
    if (category === 'weight') { els.from.value = 'kg'; els.to.value = 'lb'; }
    if (category === 'temperature') { els.from.value = 'C'; els.to.value = 'F'; }
  }

  function toFixedSmart(val) {
    if (!isFinite(val)) return '';
    // 6 significant digits, but keep reasonable decimals
    const abs = Math.abs(val);
    if (abs === 0) return '0';
    if (abs >= 1e6 || abs < 1e-3) return val.toExponential(4);
    let s = String(Math.round(val * 1e6) / 1e6);
    // trim trailing zeros
    if (s.includes('.')) s = s.replace(/\.?0+$/, '');
    return s;
  }

  // Temperature conversions
  function convertTemp(value, from, to) {
    let c;
    if (from === 'C') c = value;
    else if (from === 'F') c = (value - 32) * (5 / 9);
    else if (from === 'K') c = value - 273.15;

    let out;
    if (to === 'C') out = c;
    else if (to === 'F') out = c * (9 / 5) + 32;
    else if (to === 'K') out = c + 273.15;
    return out;
  }

  function performConversion() {
    const category = els.category.value;
    const raw = (els.value.value || '').trim();
    if (raw === '') {
      els.result.value = '';
      return;
    }
    const val = Number(raw);
    if (!isFinite(val)) {
      alert('Please enter a valid number.');
      return;
    }

    const from = els.from.value;
    const to = els.to.value;
    let output = 0;

    if (category === 'length') {
      // value -> meters -> target
      const meters = val * (LENGTH[from] || 1);
      output = meters / (LENGTH[to] || 1);
    } else if (category === 'weight') {
      // value -> grams -> target
      const grams = val * (WEIGHT[from] || 1);
      output = grams / (WEIGHT[to] || 1);
    } else if (category === 'temperature') {
      output = convertTemp(val, from, to);
    }

    els.result.value = toFixedSmart(output);
  }

  function swapUnits() {
    const f = els.from.value;
    els.from.value = els.to.value;
    els.to.value = f;
    performConversion();
  }

  async function copyResult() {
    const text = els.result.value || '';
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        els.result.select();
        document.execCommand('copy');
        els.result.blur();
      }
      const original = els.copy.textContent;
      els.copy.textContent = 'Copied!';
      setTimeout(() => (els.copy.textContent = original), 1000);
    } catch {
      alert('Unable to copy. Please copy manually.');
    }
  }

  // Wire up
  els.category.addEventListener('change', () => {
    populateUnits(els.category.value);
    performConversion();
  });

  ['input', 'change'].forEach(evt => {
    els.value.addEventListener(evt, performConversion);
    els.from.addEventListener(evt, performConversion);
    els.to.addEventListener(evt, performConversion);
  });

  els.convert.addEventListener('click', performConversion);
  els.swap.addEventListener('click', swapUnits);
  els.copy.addEventListener('click', copyResult);

  // Enter triggers convert
  els.value.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performConversion();
    }
  });

  // Init
  populateUnits(els.category.value || 'length');
  performConversion();
})();
