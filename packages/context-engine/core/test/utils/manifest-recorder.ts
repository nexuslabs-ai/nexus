/**
 * Manifest Recorder
 *
 * Utilities for recording complete ComponentManifest outputs for testing
 * and documentation purposes. Recorded manifests serve as live examples
 * of what the pipeline produces.
 *
 * ## Recording Mode
 *
 * Enable with RECORD_MANIFESTS=true environment variable:
 *
 * ```bash
 * RECORD_MANIFESTS=true USE_CACHED=true yarn test test/integration/processor.test.ts
 * ```
 *
 * ## File Structure
 *
 * Recorded manifests are stored in `test/fixtures/manifests/{component}.json`:
 *
 * ```json
 * {
 *   "componentName": "Button",
 *   "manifest": { ... },  // Complete ComponentManifest
 *   "recordedAt": "2025-01-22T10:00:00.000Z",
 *   "fixtureSource": "shadcn/button"
 * }
 * ```
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ComponentManifest } from '../../src/types/manifest.js';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MANIFESTS_DIR = resolve(__dirname, '../fixtures/manifests');

/**
 * Recorded manifest with metadata
 */
export interface RecordedManifest {
  /** Component name this manifest is for */
  componentName: string;

  /** The complete component manifest */
  manifest: ComponentManifest;

  /** Recording timestamp (ISO string) */
  recordedAt: string;

  /** Source fixture used (e.g., "shadcn/button") */
  fixtureSource?: string;
}

// =============================================================================
// Environment Mode Detection
// =============================================================================

/**
 * Check if manifest recording mode is enabled
 */
export function isManifestRecordingMode(): boolean {
  return process.env.RECORD_MANIFESTS === 'true';
}

// =============================================================================
// Manifest Saving/Loading
// =============================================================================

/**
 * Save a manifest to the fixtures directory
 *
 * @param componentName - Component name (used as filename)
 * @param manifest - Complete ComponentManifest
 * @param options - Additional metadata options
 * @returns File path where manifest was saved
 */
export function saveRecordedManifest(
  componentName: string,
  manifest: ComponentManifest,
  options: {
    fixtureSource?: string;
  } = {}
): string {
  // Ensure directory exists
  if (!existsSync(MANIFESTS_DIR)) {
    mkdirSync(MANIFESTS_DIR, { recursive: true });
  }

  const record: RecordedManifest = {
    componentName,
    manifest,
    recordedAt: new Date().toISOString(),
    fixtureSource: options.fixtureSource,
  };

  const filePath = join(MANIFESTS_DIR, `${componentName.toLowerCase()}.json`);
  writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');

  console.log(`[ManifestRecorder] Saved manifest to: ${filePath}`);

  return filePath;
}

/**
 * Load a recorded manifest from fixtures
 *
 * @param componentName - Component name to load
 * @returns Complete ComponentManifest
 * @throws Error if manifest file not found
 */
export function loadRecordedManifest(componentName: string): ComponentManifest {
  const filePath = join(MANIFESTS_DIR, `${componentName.toLowerCase()}.json`);

  if (!existsSync(filePath)) {
    throw new Error(`Recorded manifest not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const recorded: RecordedManifest = JSON.parse(content);

  return recorded.manifest;
}

/**
 * Load a recorded manifest with full metadata
 */
export function loadRecordedManifestWithMeta(
  componentName: string
): RecordedManifest | null {
  const filePath = join(MANIFESTS_DIR, `${componentName.toLowerCase()}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Check if a recorded manifest exists
 */
export function hasRecordedManifest(componentName: string): boolean {
  const filePath = join(MANIFESTS_DIR, `${componentName.toLowerCase()}.json`);
  return existsSync(filePath);
}

/**
 * Get all available recorded manifests
 */
export function getAvailableManifests(): string[] {
  if (!existsSync(MANIFESTS_DIR)) {
    return [];
  }

  return readdirSync(MANIFESTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

/**
 * Get the manifests directory path
 */
export function getManifestsDir(): string {
  return MANIFESTS_DIR;
}
