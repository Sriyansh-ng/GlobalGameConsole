// Utility Hub: QR Code Generator
(function () {
  const els = {
    data: document.getElementById('qrData'),
    size: document.getElementById('qrSize'),
    gen: document.getElementById('qrGenerateBtn'),
    dl: document.getElementById('qrDownloadBtn'),
    out: document.getElementById('qrOutput'),
    img: document.getElementById('qrImage')
  };

  function buildQrUrl(text, size) {
    const s = `${size}x${size}`;
    const encoded = encodeURIComponent(text);
    // Public QR generator image API
    return `https://api.qrserver.com/v1/create-qr-code/?size=${s}&data=${encoded}&margin=2`;
  }

  function generate() {
    const text = (els.data?.value || '').trim();
    const size = els.size?.value || '256';
    if (!text) {
      alert('Please enter text or a URL to generate a QR code.');
      return;
    }
    const url = buildQrUrl(text, size);
    if (els.img) {
      els.img.src = url;
      els.img.alt = `QR code for: ${text}`;
    }
    if (els.dl) {
      els.dl.href = url;
      els.dl.setAttribute('download', 'qr.png');
    }
    if (els.out) els.out.style.display = 'block';
  }

  if (els.gen) els.gen.addEventListener('click', generate);

  // Optional: regenerate on Enter key in input
  if (els.data) {
    els.data.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        generate();
      }
    });
  }
})();
