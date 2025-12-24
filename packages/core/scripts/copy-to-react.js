#!/usr/bin/env node

/**
 * Copy generated globals.css to React package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(CORE_DIR, 'dist');
const REACT_GENERATED_DIR = path.join(
  CORE_DIR,
  '..',
  'react',
  'src',
  'generated'
);

// Ensure React generated directory exists
if (!fs.existsSync(REACT_GENERATED_DIR)) {
  fs.mkdirSync(REACT_GENERATED_DIR, { recursive: true });
}

// Copy globals.css to React package
const globalsCSS = fs.readFileSync(path.join(DIST_DIR, 'globals.css'), 'utf8');
const outputPath = path.join(REACT_GENERATED_DIR, 'globals.css');
fs.writeFileSync(outputPath, globalsCSS);

console.log(`✓ Copied globals.css to: ${outputPath}`);
