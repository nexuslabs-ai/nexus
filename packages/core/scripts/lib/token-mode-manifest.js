import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const TOKENS_DIR = path.resolve(__dirname, '..', '..', 'tokens');
export const SEMANTIC_DIR = path.join(TOKENS_DIR, 'semantic');
export const PRIMITIVES_DIR = path.join(TOKENS_DIR, 'primitives');

export const BASELINE_MODE = 'regular';

// The seven canonical density modes.
// An unknown filename (e.g. spacing-foo.json) or a missing canonical mode
// is a structural error (exit 2), not key drift (exit 1).
export const CANONICAL_MODES = [
  'comfortable',
  'compact',
  'default',
  'regular',
  'relaxed',
  'spacious',
  'tight',
];
export const CANONICAL_RADIUS_MODES = [
  'blunt',
  'mellow',
  'sharp',
  'smooth',
  'subtle',
];
export const CANONICAL_BORDERWIDTH_MODES = [
  'lyra',
  'maia',
  'mira',
  'nova',
  'vega',
];
export const CANONICAL_SHADOW_MODES = ['lyra', 'maia', 'mira', 'nova', 'vega'];

export function tokenModeFamilies({
  semanticDir = SEMANTIC_DIR,
  primitivesDir = PRIMITIVES_DIR,
} = {}) {
  return [
    {
      family: 'spacing',
      dir: semanticDir,
      modePattern: /^spacing-([a-z]+)\.json$/,
    },
    {
      family: 'shadow',
      dir: path.join(primitivesDir, 'shadow'),
      modePattern: /^shadow-([a-z]+)-(light|dark)\.json$/,
    },
    {
      family: 'radius',
      dir: path.join(primitivesDir, 'radius'),
      modePattern: /^radius-([a-z]+(?:-[a-z]+)*)\.json$/,
    },
    {
      family: 'borderwidth',
      dir: path.join(primitivesDir, 'borderwidth'),
      modePattern: /^borderwidth-([a-z]+)\.json$/,
    },
    {
      family: 'typography',
      dir: path.join(primitivesDir, 'typography'),
      modePattern: /^typography-([a-z]+)\.json$/,
    },
  ];
}

export const TOKEN_MODE_FAMILIES = tokenModeFamilies();

export function keyParityModeFamilyConfigs({
  semanticDir = SEMANTIC_DIR,
  primitivesDir = PRIMITIVES_DIR,
} = {}) {
  return [
    {
      name: 'spacing',
      reportName: 'spacing',
      dir: semanticDir,
      baseline: BASELINE_MODE,
      expectedModes: CANONICAL_MODES,
      modePattern: /^spacing-([a-z]+)\.json$/,
      fileName: (mode) => `spacing-${mode}.json`,
    },
    {
      name: 'radius',
      reportName: 'radius',
      dir: path.join(primitivesDir, 'radius'),
      baseline: 'sharp',
      expectedModes: CANONICAL_RADIUS_MODES,
      modePattern: /^radius-([a-z]+(?:-[a-z]+)*)\.json$/,
      fileName: (mode) => `radius-${mode}.json`,
    },
    {
      name: 'borderwidth',
      reportName: 'borderwidth',
      dir: path.join(primitivesDir, 'borderwidth'),
      baseline: 'vega',
      expectedModes: CANONICAL_BORDERWIDTH_MODES,
      modePattern: /^borderwidth-([a-z]+)\.json$/,
      fileName: (mode) => `borderwidth-${mode}.json`,
    },
    {
      name: 'shadow-light',
      reportName: 'shadow light',
      dir: path.join(primitivesDir, 'shadow'),
      baseline: 'maia',
      expectedModes: CANONICAL_SHADOW_MODES,
      modePattern: /^shadow-([a-z]+)-light\.json$/,
      fileName: (mode) => `shadow-${mode}-light.json`,
    },
    {
      name: 'shadow-dark',
      reportName: 'shadow dark',
      dir: path.join(primitivesDir, 'shadow'),
      baseline: 'maia',
      expectedModes: CANONICAL_SHADOW_MODES,
      modePattern: /^shadow-([a-z]+)-dark\.json$/,
      fileName: (mode) => `shadow-${mode}-dark.json`,
    },
  ];
}

export const KEY_PARITY_MODE_FAMILY_CONFIGS = keyParityModeFamilyConfigs();
