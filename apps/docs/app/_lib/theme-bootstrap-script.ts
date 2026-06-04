import {
  DEFAULT_THEME_STATE,
  DOCS_DARK_MODE_STORAGE_KEY,
  DOCS_THEME_STORAGE_KEY,
  THEME_MODE_KEYS,
  THEME_MODE_VALUES,
  THEME_STYLESHEET_HREFS,
  THEME_STYLESHEET_MODE_KEYS,
} from './theme-modes';

const DEFAULTS = JSON.stringify(DEFAULT_THEME_STATE);
const DARK_MODE_STORAGE_KEY = JSON.stringify(DOCS_DARK_MODE_STORAGE_KEY);
const MODE_KEYS = JSON.stringify(THEME_MODE_KEYS);
const STORAGE_KEY = JSON.stringify(DOCS_THEME_STORAGE_KEY);
const STYLESHEET_HREFS = JSON.stringify(THEME_STYLESHEET_HREFS);
const STYLESHEET_MODE_KEYS = JSON.stringify(THEME_STYLESHEET_MODE_KEYS);
const VALID_MODES = JSON.stringify(THEME_MODE_VALUES);

/**
 * The docs app intentionally keeps one inline script so token stylesheets and
 * dark mode are selected before first paint. CSP code hashes this exact string.
 */
export const DOCS_THEME_BOOTSTRAP_SCRIPT = `(function () {
    try {
      var ls = window.localStorage;
      var DEFAULTS = ${DEFAULTS};
      var MODE_KEYS = ${MODE_KEYS};
      var STYLESHEET_HREFS = ${STYLESHEET_HREFS};
      var STYLESHEET_MODE_KEYS = ${STYLESHEET_MODE_KEYS};
      var VALID_MODES = ${VALID_MODES};
      var prefs = Object.assign({}, DEFAULTS);
      var stored = ls.getItem(${STORAGE_KEY});
      if (stored) {
        try {
          var parsed = JSON.parse(stored);
          var state =
            parsed && typeof parsed === 'object' && parsed.state
              ? parsed.state
              : null;
          if (state && typeof state === 'object') {
            MODE_KEYS.forEach(function (key) {
              var value = state[key];
              if (
                typeof value === 'string' &&
                VALID_MODES[key].indexOf(value) !== -1
              ) {
                prefs[key] = value;
              }
            });
          }
        } catch (e) {}
      }
      var focusLink = document.createElement('link');
      focusLink.rel = 'stylesheet';
      focusLink.href = '/themes/focus-default.css';
      document.head.appendChild(focusLink);
      STYLESHEET_MODE_KEYS.forEach(function (key) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.dataset.theme = key;
        link.href = STYLESHEET_HREFS[key][prefs[key]];
        document.head.appendChild(link);
      });
      document.documentElement.setAttribute('data-style', prefs.spacing);
      var darkPref = ls.getItem(${DARK_MODE_STORAGE_KEY});
      if (darkPref !== 'dark' && darkPref !== 'light') {
        darkPref = null;
      }
      if (
        darkPref === 'dark' ||
        (darkPref === null &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();`;
