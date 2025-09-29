// News Hub: category radio selection -> opens Google News and AP results in popups
(function () {
  const q = document.getElementById('newsQuery');
  const btn = document.getElementById('newsSearchBtn');
  const lucky = document.getElementById('newsLuckyBtn');

  // Require at least the search button to wire up
  if (!btn) return;

  // Hide legacy controls not used anymore
  if (q) q.style.display = 'none';
  if (lucky) lucky.style.display = 'none';

  // Inject scoped styles for a soothing News Hub background and polished radio layout
  injectStyles();

  // Inject radio buttons for categories
  const categories = [
    { label: 'Sports', value: 'sports' },
    { label: 'Finance', value: 'finance' },
    { label: 'World News', value: 'world news' },
    { label: 'Politics', value: 'politics' },
    { label: 'Science', value: 'science' },
    { label: 'Technology', value: 'technology' },
    { label: 'Astronomy', value: 'astronomy' }
  ];

  // Create group container
  const group = document.createElement('div');
  group.id = 'newsCategoryGroup';
  group.className = 'news-category-group';

  // Build radio options
  categories.forEach((cat, idx) => {
    const id = `newsCat_${cat.value.replace(/\s+/g, '_')}`;
    const wrapper = document.createElement('label');
    wrapper.setAttribute('for', id);
    wrapper.className = 'news-radio';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'newsCategory';
    input.value = cat.value;
    input.id = id;
    if (idx === 0) input.checked = true;

    const text = document.createElement('span');
    text.textContent = cat.label;
    text.className = 'news-radio-text';

    wrapper.appendChild(input);
    wrapper.appendChild(text);
    group.appendChild(wrapper);
  });

  // Prefer inserting inside the News Hub container to keep layout bounded
  const hub = document.getElementById('newshub');
  if (hub) {
    if (btn && hub.contains(btn) && btn.parentElement) {
      btn.parentElement.insertBefore(group, btn);
    } else if (q && hub.contains(q) && q.parentElement) {
      q.parentElement.insertBefore(group, q.nextSibling);
    } else {
      hub.insertBefore(group, hub.firstChild);
    }
  } else if (q && q.parentElement) {
    q.parentElement.insertBefore(group, q.nextSibling);
  } else if (btn && btn.parentElement) {
    btn.parentElement.insertBefore(group, btn);
  } else {
    document.body.appendChild(group);
  }

  // Move Search button to the bottom of the News Hub
  if (hub && btn) {
    const actions = document.createElement('div');
    actions.className = 'news-actions-bottom';
    actions.appendChild(btn);
    hub.appendChild(actions);
  }

  function buildGoogleNewsUrl(query) {
    const enc = encodeURIComponent(query.trim());
    // Google News search results for the category
    return `https://news.google.com/search?q=${enc}&hl=en-US&gl=US&ceid=US:en`;
  }

  function buildApNewsUrl(query) {
    const enc = encodeURIComponent(query.trim());
    // AP News site search for the category
    return `https://apnews.com/search?q=${enc}`;
  }

  function openPopup(url, nameSuffix = '') {
    // Try to open a focused popup; fall back to new tab if blocked
    const features = 'noopener,noreferrer,width=1000,height=800,menubar=no,toolbar=no,location=no,status=no';
    const w = window.open(url, `newsPopup${nameSuffix}`, features);
    if (!w) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  function search() {
    const selected = document.querySelector('input[name="newsCategory"]:checked');
    const query = (selected?.value || '').trim();

    if (!query) {
      alert('Please select a category: Sports, Finance, World News, Politics, Science, Technology, or Astronomy.');
      return;
    }

    // Open both Google News and AP results for the chosen category
    openPopup(buildGoogleNewsUrl(query), 'Google');
    openPopup(buildApNewsUrl(query), 'AP');
  }

  btn.addEventListener('click', search);

  // Disable Enter-to-search behavior tied to the old text input
  if (q) {
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }

  // Adds a style tag with scoped styles for the News Hub and radio layout
  function injectStyles() {
    const STYLE_ID = 'newsHubStyles';
    if (document.getElementById(STYLE_ID)) return;

    const css = `
      /* Soothing background specifically for the News Hub panel */
      #newshub {
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.10), rgba(16, 185, 129, 0.10)) !important; /* sky blue -> teal */
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        position: relative;
        overflow: hidden;
      }

      /* Slightly reduce the title size and spacing if present */
      #newshub h2 {
        font-size: clamp(18px, 2.2vw, 22px);
        margin: 0 0 10px 0;
        line-height: 1.3;
      }

      /* Responsive, aesthetic radio group layout constrained to the News Hub */
      #newshub #newsCategoryGroup.news-category-group {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        width: 100%;
        max-width: 100%;
        margin: 10px 0 14px 0;
        justify-items: stretch;
        align-items: stretch;
        box-sizing: border-box;
      }

      /* Radio as pill buttons */
      #newsCategoryGroup .news-radio {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid var(--prem-card-border, rgba(255, 255, 255, 0.12));
        background: rgba(255, 255, 255, 0.06);
        cursor: pointer;
        user-select: none;
        transition: transform .12s ease, box-shadow .12s ease, background .2s ease, border-color .2s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.12);
      }

      #newsCategoryGroup .news-radio:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(0,0,0,0.16);
      }

      #newsCategoryGroup .news-radio input[type="radio"] {
        accent-color: var(--prem-accent-2, #2575fc);
      }

      /* Highlight selected radio nicely */
      #newsCategoryGroup .news-radio:has(input[type="radio"]:checked) {
        background: rgba(37, 117, 252, 0.18);
        border-color: var(--prem-accent-2, #2575fc);
        box-shadow: 0 6px 14px rgba(37, 117, 252, 0.25);
      }

      #newsCategoryGroup .news-radio-text {
        font-weight: 600;
      }

      /* Bottom action bar for the Search button */
      #newshub .news-actions-bottom {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-top: 16px;
        padding-top: 10px;
        border-top: 1px dashed rgba(255, 255, 255, 0.12);
        box-sizing: border-box;
      }

      /* Add a little breathing room on small screens */
      @media (max-width: 640px) {
        #newshub {
          padding-bottom: 18px;
        }
      }
    `;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
})();
