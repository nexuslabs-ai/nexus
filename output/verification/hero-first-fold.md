# Desktop hero first fold

Guidance: modern-web-guidance search "viewport height hero responsive layout"; retrieved `responsive-design`. Followed viewport-unit guidance with `svh` for a stable initial fold, and the repository's 64rem desktop page-shell breakpoint.

Decision: use a minimum height for the hero introduction, subtracting the shell header and one 256px preview row plus half its 16px gap. The two-row gallery remains in normal document flow; nothing is clipped or made inaccessible. Narrow layouts retain their original natural height. Short desktop windows retain the content's minimum size, so less than half the gallery may be visible.

Verification: Playwright Chromium against the running rotating homepage with DialKit. 1440x900 and 1920x1080 show exactly half the gallery; 1280x720 and 1024x600 show smaller previews with Frameworks below the fold. 390x844 has no forced hero height. No horizontal overflow in any of the five sizes. CSS Prettier check passed. Repository stylesheet and standalone preview stylesheet updated; full Next.js build not run.
