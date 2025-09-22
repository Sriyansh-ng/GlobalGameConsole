// News Hub: category search -> opens results in a popup window
(function () {
  const q = document.getElementById('newsQuery');
  const btn = document.getElementById('newsSearchBtn');
  const lucky = document.getElementById('newsLuckyBtn');

  if (!q || !btn) return;

  function buildNewsUrl(query) {
    const enc = encodeURIComponent(query.trim());
    // Google News search keeps it simple and relevant
    return `https://news.google.com/search?q=${enc}&hl=en-US&gl=US&ceid=US:en`;
  }

  function openPopup(url) {
    // Try to open a focused popup; fall back to new tab if blocked
    const features = 'noopener,noreferrer,width=900,height=700,menubar=no,toolbar=no,location=no,status=no';
    const w = window.open(url, 'newsPopup', features);
    if (!w) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  function search() {
    const query = (q.value || '').trim();
    if (!query) {
      alert('Please enter a news category or topic (e.g., sports, politics).');
      q?.focus();
      return;
    }
    const url = buildNewsUrl(query);
    openPopup(url);
  }

  function randomCategory() {
    const cats = ['sports', 'politics', 'technology', 'science', 'health', 'business', 'entertainment', 'world', 'travel', 'education'];
    return cats[Math.floor(Math.random() * cats.length)];
  }

  btn.addEventListener('click', search);
  if (lucky) {
    lucky.addEventListener('click', () => {
      const topic = randomCategory();
      q.value = topic;
      openPopup(buildNewsUrl(topic));
    });
  }
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  });
})();
