(function () {
  function setActive(btn) {
    if (!btn) return;
    var container = btn.closest('.inner-tabs');
    if (!container) return;
    try {
      container.querySelectorAll('.tablink').forEach(function (b) {
        b.classList.remove('active');
        b.removeAttribute('aria-current');
      });
    } catch (_) {}
    btn.classList.add('active');
    btn.setAttribute('aria-current', 'page');
  }

  // Click handler to highlight inner tab buttons
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.inner-tabs .tablink') : null;
    if (!btn) return;
    setActive(btn);
  });

  // Wrap openInnerTab to also update highlighting, with fallback if not defined
  var original = window.openInnerTab;
  window.openInnerTab = function (id) {
    // Call original if present
    if (typeof original === 'function') {
      try { original.apply(this, arguments); } catch (_) {}
    } else {
      // Fallback: show the requested inner tab content and hide its siblings
      try {
        var target = document.getElementById(id);
        if (target && target.classList && target.classList.contains('inner-tabcontent')) {
          var host = target.closest('.tabcontent') || document;
          host.querySelectorAll('.inner-tabcontent').forEach(function (el) {
            el.style.display = 'none';
          });
          target.style.display = 'block';
        }
      } catch (_) {}
    }

    // Try to locate and activate the corresponding button
    try {
      var matchedBtn = null;
      var candidates = document.querySelectorAll('.inner-tabs .tablink');
      candidates.forEach(function (b) {
        var onclick = b.getAttribute('onclick') || '';
        if (onclick.indexOf("openInnerTab('" + id + "')") !== -1) {
          matchedBtn = b;
        }
        // Also support data-target="id" if used
        if (!matchedBtn && b.dataset && b.dataset.target === id) {
          matchedBtn = b;
        }
      });
      if (matchedBtn) setActive(matchedBtn);
    } catch (_) {}
  };
})();
