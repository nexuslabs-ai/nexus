// Compares computed styles of [data-probe] elements between two fixture pages.
// usage: node compare-styles.mjs <url-a> <url-b> [--probes host-] [--click-b a,b]
//   --probes   data-probe prefix to compare (default host-; host- adds <html> and <body>)
//   --click-b  data-probe elements to click on page B, in order, before reading it
// Portalled probes are read by opening each trigger in TRIGGERS.
import { chromium } from 'playwright';

const PROPERTIES = [
  'color',
  'background-color',
  'border-top-color',
  'border-top-style',
  'border-top-width',
  'border-top-left-radius',
  'box-sizing',
  'color-scheme',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'margin-top',
  'padding-top',
  'padding-left',
  'list-style-type',
  'text-decoration-line',
];
const TRIGGERS = ['nexus-dialog-trigger', 'nexus-popover-trigger'];

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
}

const [urlA, urlB] = process.argv.slice(2);
if (!urlA || !urlB) {
  throw new Error('usage: node compare-styles.mjs <url-a> <url-b> [--probes host-] [--click-b a,b]');
}
const prefix = option('--probes', 'host-');
const clicksB = option('--click-b', '').split(',').filter(Boolean);

function readProbes({ prefix, properties }) {
  const elements = [...document.querySelectorAll(`[data-probe^="${prefix}"]`)];
  if (prefix === 'host-') elements.push(document.documentElement, document.body);
  return Object.fromEntries(
    elements.map((element) => {
      const style = getComputedStyle(element);
      const values = properties.map((name) => [name, style.getPropertyValue(name)]);
      return [element.dataset.probe ?? element.localName, Object.fromEntries(values)];
    })
  );
}

// Waits for finite animations and transitions; indeterminate Progress runs forever.
function settle() {
  const finite = document
    .getAnimations()
    .filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
  return Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
}

async function snapshot(page, url, clicks) {
  await page.goto(url, { waitUntil: 'networkidle' });
  for (const probe of clicks) await page.click(`[data-probe="${probe}"]`);
  await page.evaluate(settle);
  const probes = await page.evaluate(readProbes, { prefix, properties: PROPERTIES });

  for (const trigger of TRIGGERS) {
    const handle = page.locator(`[data-probe="${trigger}"]`);
    if ((await handle.count()) === 0) continue;
    await handle.click();
    await page.waitForSelector('[role="dialog"][data-state="open"]');
    await page.evaluate(settle);
    Object.assign(probes, await page.evaluate(readProbes, { prefix, properties: PROPERTIES }));
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'detached' });
  }
  return probes;
}

const browser = await chromium.launch();
const context = await browser.newContext({
  colorScheme: 'light',
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
const a = await snapshot(page, urlA, []);
const b = await snapshot(page, urlB, clicksB);
await browser.close();

const shared = Object.keys(a).filter((probe) => probe in b).sort();
const changed = shared.flatMap((probe) =>
  PROPERTIES.filter((name) => a[probe][name] !== b[probe][name]).map((name) => ({
    probe,
    property: name,
    a: a[probe][name],
    b: b[probe][name],
  }))
);

for (const { probe, property, a: before, b: after } of changed) {
  console.log(`${probe} ${property}: ${before} -> ${after}`);
}
console.log(
  JSON.stringify({ prefix, clicksB, probes: shared.length, properties: PROPERTIES.length, changed: changed.length })
);
