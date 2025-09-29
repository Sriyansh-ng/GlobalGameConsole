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

  function highlightById(id) {
    if (!id) return;
    try {
      // Scope to the correct inner-tabs bar within the same hub section
      var content = document.getElementById(id);
      var hub = content ? (content.closest('.tabcontent') || document) : document;
      var found = null;
      hub.querySelectorAll('.inner-tabs .tablink').forEach(function (b) {
        var onclick = b.getAttribute('onclick') || '';
        if (!found && onclick.indexOf("openInnerTab('" + id + "')") !== -1) {
          found = b;
        } else if (!found && b.dataset && b.dataset.target === id) {
          found = b;
        }
      });
      if (found) setActive(found);
    } catch (_) {}
  }

  // Click handler to highlight inner tab buttons (run after other handlers)
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.inner-tabs .tablink') : null;
    if (!btn) return;
    // Delay to let any inline onclick/openInnerTab logic run first
    setTimeout(function () { setActive(btn); }, 0);
  });

  // Late wrap openInnerTab AFTER other scripts define it
  function wrapOpenInnerTabOnce() {
    var current = window.openInnerTab;
    if (typeof current !== 'function' || current.__mtl_wrapped) return;
    var original = current;
    function wrapped(id) {
      var ret;
      try { ret = original.apply(this, arguments); }
      finally {
        // Ensure highlighting for the requested id
        try { highlightById(id); } catch (_) {}
      }
      return ret;
    }
    wrapped.__mtl_wrapped = true;
    window.openInnerTab = wrapped;
  }

  // Fallback open/show if openInnerTab was not provided
  function ensureFallback() {
    if (typeof window.openInnerTab === 'function') return;
    window.openInnerTab = function (id) {
      try {
        var target = document.getElementById(id);
        if (target && target.classList && target.classList.contains('inner-tabcontent')) {
          var host = target.closest('.tabcontent') || document;
          host.querySelectorAll('.inner-tabcontent').forEach(function (el) {
            el.style.display = 'none';
          });
          target.style.display = 'block';
          highlightById(id);
        }
      } catch (_) {}
    };
  }

  // Initialize highlight for any already-visible inner tab contents
  function initFromVisible() {
    try {
      var seen = {};
      document.querySelectorAll('.inner-tabcontent').forEach(function (el) {
        var visible = el.style.display !== 'none' && el.offsetParent !== null;
        if (visible && !seen[el.id]) {
          seen[el.id] = true;
          highlightById(el.id);
        }
      });
    } catch (_) {}
  }

  // Try early, then again after DOM ready and on load to win race conditions
  ensureFallback();
  wrapOpenInnerTabOnce();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ensureFallback();
      wrapOpenInnerTabOnce();
      // Post a microtask to run after any inline DOMContentLoaded handlers
      setTimeout(function () {
        wrapOpenInnerTabOnce();
        initFromVisible();
      }, 0);
    });
  } else {
    setTimeout(function () {
      wrapOpenInnerTabOnce();
      initFromVisible();
    }, 0);
  }

  window.addEventListener('load', function () {
    wrapOpenInnerTabOnce();
    setTimeout(initFromVisible, 0);
  });
})();
