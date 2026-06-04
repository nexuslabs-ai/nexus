/**
 * Emits an inline script that runs before React hydration to apply
 * stored theme prefs (base / brand / typography / shadow / radius /
 * borderwidth / spacing / dark-mode). Without this, the page would
 * flash with default tokens before the picker hydrated.
 *
 * Reads the same storage shape Zustand's persist middleware writes:
 *   localStorage['nexus-docs-tokens'] = { state: {...}, version: 0 }
 *
 * Dark mode is stored separately (single boolean key) so the bootstrap
 * can apply the class with no JSON parsing risk.
 */
export function ThemeBootstrap() {
  const script = `(function () {
    try {
      var ls = window.localStorage;
      var PATH = '/themes/';
      var PREFIX = {
        base: 'base-',
        brand: 'brands-',
        typography: 'typography-',
        shadow: 'shadow-',
        radius: 'radius-',
        borderwidth: 'borderwidth-',
      };
      var DEFAULTS = {
        base: 'stone',
        brand: 'blue',
        spacing: 'vega',
        typography: 'vega',
        shadow: 'vega',
        radius: 'sharp',
        borderwidth: 'vega',
      };
      var VALID_BRANDS = ['blue', 'purple', 'pink', 'teal', 'orange', 'black'];
      var prefs = Object.assign({}, DEFAULTS);
      var stored = ls.getItem('nexus-docs-tokens');
      if (stored) {
        try {
          var parsed = JSON.parse(stored);
          if (parsed && parsed.state) {
            Object.keys(DEFAULTS).forEach(function (key) {
              if (typeof parsed.state[key] === 'string') {
                prefs[key] = parsed.state[key];
              }
            });
          }
        } catch (e) {}
      }
      if (VALID_BRANDS.indexOf(prefs.brand) === -1) {
        prefs.brand = DEFAULTS.brand;
      }
      // focus is single-variant today
      var focusLink = document.createElement('link');
      focusLink.rel = 'stylesheet';
      focusLink.href = PATH + 'focus-default.css';
      document.head.appendChild(focusLink);
      // per-mode dynamic links
      Object.keys(PREFIX).forEach(function (key) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.dataset.theme = key;
        link.href = PATH + PREFIX[key] + prefs[key] + '.css';
        document.head.appendChild(link);
      });
      // spacing density via data-style attribute
      document.documentElement.setAttribute('data-style', prefs.spacing);
      // dark mode
      var darkPref = ls.getItem('nexus-docs-theme');
      if (darkPref === 'dark' ||
          (darkPref === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
