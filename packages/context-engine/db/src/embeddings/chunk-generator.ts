/**
 * Chunk Generator
 *
 * Generates semantic chunks from component AI manifests for embedding.
 * Components are split into meaningful semantic units to improve
 * retrieval accuracy in vector search.
 */

import type { AIManifest, CategorizedProps } from '@context-engine/core';

import type { Chunk } from '../types.js';

/**
 * Maximum chunk length in characters.
 * Voyage AI handles up to ~16K tokens. 4000 chars provides enough context
 * for complex components (e.g., Select with 8 examples, Dialog with 8 sub-components)
 * without being unfocused for retrieval.
 */
const MAX_CHUNK_LENGTH = 4000;

/**
 * Generate semantic chunks from a component's AI manifest.
 *
 * Chunking strategy:
 * - description: Name + description + base library info
 * - import: Primary and type-only import statements
 * - props: Prop signatures with types and descriptions
 * - composition: Sub-components for compound components (Dialog, Select, etc.)
 * - examples: Usage examples (minimal, common, advanced)
 * - patterns: Related components, base library info, sub-components, dependencies
 * - guidance: When to use / when not to use / accessibility
 *
 * @param manifest - The AI manifest to chunk
 * @returns Array of semantic chunks
 */
export function generateChunks(manifest: AIManifest): Chunk[] {
  const chunks: Chunk[] = [];

  // Description chunk
  const descContent = buildDescriptionChunk(manifest);
  if (descContent) {
    chunks.push({ type: 'description', content: descContent, index: 0 });
  }

  // Import chunk (right after description)
  const importContent = buildImportChunk(manifest);
  if (importContent) {
    chunks.push({ type: 'import', content: importContent, index: 0 });
  }

  // Props chunk
  const propsContent = buildPropsChunk(manifest);
  if (propsContent) {
    chunks.push({ type: 'props', content: propsContent, index: 0 });
  }

  // Composition chunk (for compound components)
  const compositionContent = buildCompositionChunk(manifest);
  if (compositionContent) {
    chunks.push({ type: 'composition', content: compositionContent, index: 0 });
  }

  // Examples chunk
  const examplesContent = buildExamplesChunk(manifest);
  if (examplesContent) {
    chunks.push({ type: 'examples', content: examplesContent, index: 0 });
  }

  // Patterns chunk
  const patternsContent = buildPatternsChunk(manifest);
  if (patternsContent) {
    chunks.push({ type: 'patterns', content: patternsContent, index: 0 });
  }

  // Guidance chunk
  const guidanceContent = buildGuidanceChunk(manifest);
  if (guidanceContent) {
    chunks.push({ type: 'guidance', content: guidanceContent, index: 0 });
  }

  return chunks;
}

/**
 * Build description chunk from manifest.
 * Includes: name, description, base library info, radix primitive info
 */
function buildDescriptionChunk(manifest: AIManifest): string | null {
  const parts: string[] = [];

  parts.push(`Component: ${manifest.name}`);

  if (manifest.description) {
    parts.push(`Description: ${manifest.description}`);
  }

  if (manifest.baseLibrary) {
    const libraryPart = manifest.baseLibrary.component
      ? `Built on ${manifest.baseLibrary.name} (${manifest.baseLibrary.component}).`
      : `Built on ${manifest.baseLibrary.name}.`;
    parts.push(libraryPart);
  }

  if (manifest.radixPrimitive) {
    parts.push(
      `Uses Radix ${manifest.radixPrimitive.primitive} primitive. Docs: ${manifest.radixPrimitive.docsUrl}`
    );
  }

  const content = parts.join('\n');
  return content.length > 0 ? truncate(content) : null;
}

/**
 * Build import chunk from manifest.
 * Includes: primary import statement and optional type-only import
 */
function buildImportChunk(manifest: AIManifest): string | null {
  if (!manifest.importStatement) return null;

  const parts: string[] = [`${manifest.name} imports:`];

  parts.push('\nPrimary:');
  parts.push(manifest.importStatement.primary);

  if (manifest.importStatement.typeOnly) {
    parts.push('\nType-only:');
    parts.push(manifest.importStatement.typeOnly);
  }

  return truncate(parts.join('\n'));
}

/**
 * Build props chunk from manifest.
 * Groups props by: variants, behaviors, events, slots, other
 *
 * CategorizedProps structure:
 * - variants: Control styling/appearance (variant, size, color)
 * - behaviors: Control component state (disabled, loading, required)
 * - events: Event handlers (onValueChange, onOpenChange)
 * - slots: React elements (children, icon, leftIcon)
 * - other: Uncategorized props
 */
function buildPropsChunk(manifest: AIManifest): string | null {
  if (!manifest.props) return null;

  const parts: string[] = [`${manifest.name} props:`];

  // Variant props (control styling/appearance)
  if (manifest.props.variants && manifest.props.variants.length > 0) {
    parts.push('\nVariants:');
    for (const prop of manifest.props.variants) {
      let line = `- ${prop.name}: ${prop.values?.join(' | ') || prop.type}`;
      if (prop.defaultValue !== undefined)
        line += ` (default: ${prop.defaultValue})`;
      if (prop.description) line += ` - ${prop.description}`;
      parts.push(line);

      // Add valueDescriptions as indented lines
      if (prop.valueDescriptions && prop.values) {
        for (const value of prop.values) {
          const description = prop.valueDescriptions[value];
          if (description) {
            parts.push(`  • ${value}: ${description}`);
          }
        }
      }
    }
  }

  // Behavior props (control component state)
  if (manifest.props.behaviors && manifest.props.behaviors.length > 0) {
    parts.push('\nBehaviors:');
    for (const prop of manifest.props.behaviors) {
      let line = `- ${prop.name}: ${prop.type}`;
      if (prop.defaultValue !== undefined) line += ` = ${prop.defaultValue}`;
      if (prop.description) line += ` - ${prop.description}`;
      parts.push(line);
    }
  }

  // Event props (event handlers)
  if (manifest.props.events && manifest.props.events.length > 0) {
    parts.push('\nEvents:');
    for (const prop of manifest.props.events) {
      let line = `- ${prop.name}: ${prop.type}`;
      if (prop.description) line += ` - ${prop.description}`;
      parts.push(line);
    }
  }

  // Slot props (React elements)
  if (manifest.props.slots && manifest.props.slots.length > 0) {
    parts.push('\nSlots:');
    for (const prop of manifest.props.slots) {
      let line = `- ${prop.name}: ${prop.type}`;
      if (prop.required) line += ' (required)';
      if (prop.description) line += ` - ${prop.description}`;
      parts.push(line);
    }
  }

  // Other props (uncategorized)
  if (manifest.props.other && manifest.props.other.length > 0) {
    parts.push('\nOther:');
    for (const prop of manifest.props.other) {
      let line = `- ${prop.name}: ${prop.type}`;
      if (prop.defaultValue !== undefined) line += ` = ${prop.defaultValue}`;
      if (prop.description) line += ` - ${prop.description}`;
      parts.push(line);
    }
  }

  // Only return if we have more than just the header
  return parts.length > 1 ? truncate(parts.join('\n')) : null;
}

/**
 * Build composition chunk for compound components.
 * Includes: sub-component names, required markers, data-slots, descriptions, props, Radix primitives
 */
function buildCompositionChunk(manifest: AIManifest): string | null {
  if (!manifest.subComponents || manifest.subComponents.length === 0) {
    return null;
  }

  const parts: string[] = [
    `${manifest.name} composition (compound component):`,
    '',
    'Sub-components:',
  ];

  for (const sub of manifest.subComponents) {
    // Build the main line: name with (REQUIRED) marker and data-slot
    let mainLine = `- ${sub.name}`;
    if (sub.requiredInComposition) {
      mainLine += ' (REQUIRED)';
    }
    if (sub.dataSlot) {
      mainLine += ` [data-slot: ${sub.dataSlot}]`;
    }
    parts.push(mainLine);

    // Add description if present (indented)
    if (sub.description) {
      // Clean up description - remove the sub-component name if it starts with it
      const cleanDesc = sub.description.startsWith(`${sub.name}\n`)
        ? sub.description.slice(sub.name.length + 1).trim()
        : sub.description.trim();
      if (cleanDesc) {
        parts.push(`  ${cleanDesc}`);
      }
    }

    // Add props if the sub-component has any
    const propsLine = sub.props ? formatSubComponentProps(sub.props) : null;
    if (propsLine) {
      parts.push(`  ${propsLine}`);
    }

    // Add Radix primitive if present
    if (sub.radixPrimitive) {
      parts.push(`  Radix primitive: ${sub.radixPrimitive.primitive}`);
    }
  }

  return truncate(parts.join('\n'));
}

/**
 * Format props for a sub-component in a single line.
 * Returns null if no props exist.
 */
function formatSubComponentProps(props: CategorizedProps): string | null {
  const propParts: string[] = [];

  // Collect props from all categories
  const allProps = [
    ...(props.variants || []),
    ...(props.behaviors || []),
    ...(props.events || []),
    ...(props.slots || []),
    ...(props.other || []),
  ];

  if (allProps.length === 0) {
    return null;
  }

  for (const prop of allProps) {
    let propStr = `${prop.name}: ${prop.type}`;
    if (prop.defaultValue !== undefined) {
      propStr += ` = ${prop.defaultValue}`;
    }
    propParts.push(propStr);
  }

  return `Props: ${propParts.join(', ')}`;
}

/**
 * Build examples chunk from manifest.
 * Includes: minimal, common, and advanced examples
 */
function buildExamplesChunk(manifest: AIManifest): string | null {
  if (!manifest.examples) return null;

  const parts: string[] = [`${manifest.name} examples:`];

  // Minimal example (required in schema)
  if (manifest.examples.minimal) {
    parts.push('\nMinimal usage:');
    if (manifest.examples.minimal.title) {
      parts.push(`// ${manifest.examples.minimal.title}`);
    }
    parts.push(manifest.examples.minimal.code);
  }

  // Common examples
  if (manifest.examples.common && manifest.examples.common.length > 0) {
    parts.push('\nCommon usage:');
    for (const ex of manifest.examples.common) {
      if (ex.title) parts.push(`// ${ex.title}`);
      parts.push(ex.code);
    }
  }

  // Advanced examples
  if (manifest.examples.advanced && manifest.examples.advanced.length > 0) {
    parts.push('\nAdvanced usage:');
    for (const ex of manifest.examples.advanced) {
      if (ex.title) parts.push(`// ${ex.title}`);
      parts.push(ex.code);
    }
  }

  return parts.length > 1 ? truncate(parts.join('\n')) : null;
}

/**
 * Build patterns chunk from manifest.
 * Includes: base library, sub-components, dependencies, patterns
 */
function buildPatternsChunk(manifest: AIManifest): string | null {
  const parts: string[] = [];

  // Base library info
  if (manifest.baseLibrary) {
    parts.push(`${manifest.name} is built on ${manifest.baseLibrary.name}.`);
  }

  // Sub-components (for compound components)
  if (manifest.subComponents && manifest.subComponents.length > 0) {
    const subNames = manifest.subComponents.map((s) => s.name).join(', ');
    parts.push(`\nSub-components: ${subNames}`);
  }

  // Internal dependencies
  if (
    manifest.dependencies?.internal &&
    manifest.dependencies.internal.length > 0
  ) {
    parts.push(`\nDepends on: ${manifest.dependencies.internal.join(', ')}`);
  }

  // Patterns from guidance
  if (manifest.guidance?.patterns && manifest.guidance.patterns.length > 0) {
    parts.push(`\nPatterns: ${manifest.guidance.patterns.join(', ')}`);
  }

  // Related components from guidance
  if (
    manifest.guidance?.relatedComponents &&
    manifest.guidance.relatedComponents.length > 0
  ) {
    parts.push(
      `\nRelated components: ${manifest.guidance.relatedComponents.join(', ')}`
    );
  }

  return parts.length > 0 ? truncate(parts.join('\n')) : null;
}

/**
 * Build guidance chunk from manifest.
 * Includes: when to use, when not to use, accessibility notes
 */
function buildGuidanceChunk(manifest: AIManifest): string | null {
  if (!manifest.guidance) return null;

  const parts: string[] = [];

  if (manifest.guidance.whenToUse) {
    parts.push(`When to use ${manifest.name}: ${manifest.guidance.whenToUse}`);
  }

  if (manifest.guidance.whenNotToUse) {
    parts.push(
      `When NOT to use ${manifest.name}: ${manifest.guidance.whenNotToUse}`
    );
  }

  if (manifest.guidance.accessibility) {
    parts.push(`Accessibility: ${manifest.guidance.accessibility}`);
  }

  return parts.length > 0 ? truncate(parts.join('\n\n')) : null;
}

/**
 * Truncate text to max length, adding ellipsis if truncated.
 */
function truncate(text: string, maxLength = MAX_CHUNK_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
