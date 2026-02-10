#!/usr/bin/env node
/**
 * Test Extract Endpoint Script
 *
 * Reads a real component file and sends it to the extract API endpoint.
 *
 * Usage:
 *   tsx --env-file=.env scripts/test-extract.ts [component-name]
 *
 * Examples:
 *   yarn test:extract                  # Uses Button by default
 *   yarn test:extract Badge            # Test with Badge component
 *
 * Environment (add to .env):
 *   API_URL        Base URL (default: http://localhost:3000)
 *   ORG_ID         Organization ID (required)
 *   API_KEY        API key with component:write scope (required)
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Configuration
// =============================================================================

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const ORG_ID = process.env.ORG_ID;
const API_KEY = process.env.API_KEY;

// Component paths relative to this script directory
// Matches core/scripts/components.ts
const COMPONENTS: Record<string, { source: string; stories?: string }> = {
  Button: {
    source: '../../../../packages/react/src/components/ui/button.tsx',
    stories: '../../../../packages/react/src/components/ui/Button.stories.tsx',
  },
  Badge: {
    source: '../../../../packages/react/src/components/ui/badge.tsx',
    stories: '../../../../packages/react/src/components/ui/Badge.stories.tsx',
  },
  Card: {
    source: '../../../../packages/react/src/components/ui/card.tsx',
    stories: '../../../../packages/react/src/components/ui/Card.stories.tsx',
  },
  Avatar: {
    source: '../../../../packages/react/src/components/ui/avatar.tsx',
    stories: '../../../../packages/react/src/components/ui/Avatar.stories.tsx',
  },
  Input: {
    source: '../../../../packages/react/src/components/ui/input.tsx',
    stories: '../../../../packages/react/src/components/ui/Input.stories.tsx',
  },
  Switch: {
    source: '../../../../packages/react/src/components/ui/switch.tsx',
    stories: '../../../../packages/react/src/components/ui/Switch.stories.tsx',
  },
  Accordion: {
    source: '../../../../packages/react/src/components/ui/accordion.tsx',
    stories:
      '../../../../packages/react/src/components/ui/Accordion.stories.tsx',
  },
  Alert: {
    source: '../../../../packages/react/src/components/ui/alert.tsx',
    stories: '../../../../packages/react/src/components/ui/Alert.stories.tsx',
  },
  Dialog: {
    source: '../../../../packages/react/src/components/ui/dialog.tsx',
    stories: '../../../../packages/react/src/components/ui/Dialog.stories.tsx',
  },
  Tabs: {
    source: '../../../../packages/react/src/components/ui/tabs.tsx',
    stories: '../../../../packages/react/src/components/ui/Tabs.stories.tsx',
  },
  Tooltip: {
    source: '../../../../packages/react/src/components/ui/tooltip.tsx',
    stories: '../../../../packages/react/src/components/ui/Tooltip.stories.tsx',
  },
  Select: {
    source: '../../../../packages/react/src/components/ui/select.tsx',
    stories: '../../../../packages/react/src/components/ui/Select.stories.tsx',
  },
  DropdownMenu: {
    source: '../../../../packages/react/src/components/ui/dropdown-menu.tsx',
    stories:
      '../../../../packages/react/src/components/ui/DropdownMenu.stories.tsx',
  },
};

// =============================================================================
// Main
// =============================================================================

async function main() {
  const componentName = process.argv[2] ?? 'Button';

  // Validate environment
  if (!ORG_ID) {
    console.error('❌ ORG_ID environment variable is required');
    console.error('   Set it in packages/context-engine/server/.env');
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('❌ API_KEY environment variable is required');
    console.error('   Set it in packages/context-engine/server/.env');
    process.exit(1);
  }

  // Find component
  const component = COMPONENTS[componentName];
  if (!component) {
    console.error(`❌ Unknown component: ${componentName}`);
    console.error(`   Available: ${Object.keys(COMPONENTS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n📦 Testing extract endpoint with: ${componentName}\n`);

  // Read source files
  const sourcePath = resolve(__dirname, component.source);
  let sourceCode: string;
  try {
    sourceCode = await readFile(sourcePath, 'utf-8');
    console.log(`✓ Read source: ${component.source}`);
  } catch (err) {
    console.error(`❌ Failed to read source: ${sourcePath}`);
    console.error(err);
    process.exit(1);
  }

  let storiesCode: string | undefined;
  if (component.stories) {
    const storiesPath = resolve(__dirname, component.stories);
    try {
      storiesCode = await readFile(storiesPath, 'utf-8');
      console.log(`✓ Read stories: ${component.stories}`);
    } catch {
      console.log(`⚠ Stories file not found (optional)`);
    }
  }

  // Build request payload
  const payload = {
    name: componentName,
    framework: 'react' as const,
    sourceCode,
    filePath: component.source,
    ...(storiesCode && {
      storiesCode,
      storiesFilePath: component.stories,
    }),
  };

  console.log(
    `\n🚀 Sending request to: ${API_URL}/api/v1/organizations/${ORG_ID}/processing/extract\n`
  );

  // Make request
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${ORG_ID}/processing/extract`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    }
  );

  // Handle response
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ Request failed with status ${response.status}`);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(`✅ Extraction successful!\n`);
  console.log(`Component ID: ${data.data.componentId}`);
  console.log(`Slug: ${data.data.slug}`);
  console.log(`Source Hash: ${data.data.sourceHash}`);
  console.log(`Extraction Method: ${data.data.metadata.extractionMethod}`);
  console.log(`Fallback Triggered: ${data.data.metadata.fallbackTriggered}`);

  // Print extracted props summary
  if (data.data.extraction?.props) {
    const propCount = Object.keys(data.data.extraction.props).length;
    console.log(`Props Found: ${propCount}`);
  }

  console.log(`\n📄 Full response:\n`);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
