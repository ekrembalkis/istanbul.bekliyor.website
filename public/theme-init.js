// FOUC prevention — sets data-theme BEFORE React boots so the first paint
// uses the user's resolved theme. Loaded synchronously from index.html via
// <script src> so CSP `script-src 'self'` is satisfied (the previous
// inline IIFE was being blocked in production).
//
// Keep this file vanilla ES5: no imports, no modules, no async. The whole
// point is to run before the document body parses.
(function () {
  try {
    var stored = localStorage.getItem('ib-theme');
    var choice = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var resolved = choice === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : choice;
    var html = document.documentElement;
    html.setAttribute('data-theme', resolved);
    html.dataset.themeChoice = choice;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
