/**
 * Generation Prompts
 *
 * Prompt templates for LLM-based metadata generation via tool calling.
 * Designed for efficiency (minimal token usage) while providing rich context.
 */

import type { ExtractedData, Framework } from '../types/index.js';
import { COMPONENT_PATTERNS } from '../types/meta.js';

// =============================================================================
// Helper Functions for Building Prompt Sections
// =============================================================================

/**
 * Build the props section for the prompt
 */
function buildPropsSection(extracted: ExtractedData): string {
  if (extracted.props.length === 0) {
    return 'Props: None extracted';
  }

  const propsLines = extracted.props.map((p) => {
    const parts = [`- ${p.name}: ${p.type}`];
    if (p.required) parts.push('(required)');
    if (p.description) parts.push(`- ${p.description}`);
    if (p.possibleValues?.length) {
      parts.push(`[${p.possibleValues.join(', ')}]`);
    }
    return parts.join(' ');
  });

  return `Props:\n${propsLines.join('\n')}`;
}

/**
 * Build the variants section for the prompt
 */
function buildVariantsSection(extracted: ExtractedData): string {
  const variantEntries = Object.entries(extracted.variants);
  if (variantEntries.length === 0) {
    return '';
  }

  const variantsLines = variantEntries.map(
    ([name, values]) => `- ${name}: ${values.join(', ')}`
  );

  let section = `Variants (CVA):\n${variantsLines.join('\n')}`;

  const defaultEntries = Object.entries(extracted.defaultVariants);
  if (defaultEntries.length > 0) {
    const defaultsLines = defaultEntries.map(
      ([name, value]) => `  ${name}: ${value}`
    );
    section += `\nDefaults:\n${defaultsLines.join('\n')}`;
  }

  return section;
}

/**
 * Build the dependencies section for the prompt
 */
function buildDependenciesSection(extracted: ExtractedData): string {
  const sections: string[] = [];

  if (extracted.internalDependencies.length > 0) {
    sections.push(
      `Internal Dependencies: ${extracted.internalDependencies.join(', ')}`
    );
  }

  const npmDeps = Object.keys(extracted.npmDependencies);
  if (npmDeps.length > 0) {
    // Filter to show only relevant deps (not React itself)
    const relevantDeps = npmDeps.filter(
      (dep) => !['react', 'react-dom'].includes(dep)
    );
    if (relevantDeps.length > 0) {
      sections.push(`NPM Dependencies: ${relevantDeps.join(', ')}`);
    }
  }

  return sections.join('\n');
}

/**
 * Build the base library section for the prompt
 */
function buildBaseLibrarySection(extracted: ExtractedData): string {
  if (!extracted.baseLibrary) {
    return '';
  }

  const parts = [`Base Library: ${extracted.baseLibrary.name}`];
  if (extracted.baseLibrary.component) {
    parts.push(`(${extracted.baseLibrary.component})`);
  }

  return parts.join(' ');
}

// =============================================================================
// Prompt Builder Input
// =============================================================================

/**
 * Input for building a generation prompt
 */
export interface PromptBuilderInput {
  /** Component name */
  name: string;

  /** Target framework */
  framework: Framework;

  /** Extracted data from code analysis */
  extracted: ExtractedData;

  /** Optional Figma design URL */
  figmaUrl?: string;

  /** Optional hints for generation */
  hints?: string;
}

// =============================================================================
// Response Validation
// =============================================================================

/**
 * Validate that a pattern is from the standard list
 */
function isValidPattern(pattern: string): boolean {
  return (COMPONENT_PATTERNS as readonly string[]).includes(pattern);
}

/**
 * Filter patterns to only include valid ones
 */
export function filterValidPatterns(patterns: string[]): string[] {
  return patterns.filter(isValidPattern);
}

// =============================================================================
// Tool Calling Prompts
// =============================================================================

/**
 * System prompt for tool calling generation
 *
 * Optimized for tool calling - no JSON format instructions needed since the
 * tool schema defines the output format.
 */
export const TOOL_CALLING_SYSTEM_PROMPT = `You are a design system documentation expert. Generate comprehensive metadata for UI components to make them AI-accessible.

Your goal is to help AI coding assistants understand and correctly use this component. Focus on:
1. Clear, searchable descriptions
2. Practical code examples
3. Guidance on when to use (and not use) this component
4. Accessibility considerations

Use the generate_component_metadata tool to provide your analysis.`;

/**
 * User prompt template for tool calling
 *
 * Simpler than the JSON template since the tool schema defines the output structure.
 */
export const TOOL_CALLING_USER_PROMPT_TEMPLATE = `Analyze this {{FRAMEWORK}} component and generate metadata using the generate_component_metadata tool.

## Component: {{COMPONENT_NAME}}
{{SOURCE_DESCRIPTION}}

{{PROPS_SECTION}}

{{VARIANTS_SECTION}}

{{DEPENDENCIES_SECTION}}

{{BASE_LIBRARY_SECTION}}

{{FIGMA_URL}}

{{HINTS}}

## Pattern Reference

Valid patterns (use where applicable):
${COMPONENT_PATTERNS.map((p) => `- ${p}`).join('\n')}

## Instructions

Use the generate_component_metadata tool to provide:

1. **description**: A clear, concise one-liner (10-500 chars) that states what this component is AND its primary purpose/action (e.g., 'A button for triggering user actions and form submissions')
2. **tier**: "free" for basic components, "pro" for advanced/complex ones
3. **minimalExample**: The simplest working JSX code example (single line if possible)
4. **examples**: Structured examples showing minimal, common, and advanced usage
5. **guidance**: When to use, when not to use, accessibility notes, patterns, related components
6. **semanticDescription**: Detailed description for AI search (50-2000 chars) - include purpose, key features, and use cases
7. **tokens**: Design tokens this component uses (e.g., "color-primary", "spacing-md")

Focus on making this component discoverable and usable by AI coding assistants.`;

/**
 * Build the user prompt for tool calling
 *
 * @param input - Prompt builder input
 * @returns Formatted user prompt string for tool calling
 */
function buildToolCallingUserPrompt({
  name,
  framework,
  extracted,
  figmaUrl,
  hints,
}: PromptBuilderInput): string {
  // Build all sections
  const propsSection = buildPropsSection(extracted);
  const variantsSection = buildVariantsSection(extracted);
  const dependenciesSection = buildDependenciesSection(extracted);
  const baseLibrarySection = buildBaseLibrarySection(extracted);

  // Build optional sections
  const sourceDescriptionLine = extracted.sourceDescription
    ? `Description: ${extracted.sourceDescription}`
    : '';
  const figmaLine = figmaUrl ? `Figma: ${figmaUrl}` : '';
  const hintsLine = hints ? `Additional Context: ${hints}` : '';

  // Replace placeholders
  let prompt = TOOL_CALLING_USER_PROMPT_TEMPLATE;
  prompt = prompt.replace('{{COMPONENT_NAME}}', name);
  prompt = prompt.replace('{{FRAMEWORK}}', framework);
  prompt = prompt.replace('{{SOURCE_DESCRIPTION}}', sourceDescriptionLine);
  prompt = prompt.replace('{{PROPS_SECTION}}', propsSection);
  prompt = prompt.replace('{{VARIANTS_SECTION}}', variantsSection);
  prompt = prompt.replace('{{DEPENDENCIES_SECTION}}', dependenciesSection);
  prompt = prompt.replace('{{BASE_LIBRARY_SECTION}}', baseLibrarySection);
  prompt = prompt.replace('{{FIGMA_URL}}', figmaLine);
  prompt = prompt.replace('{{HINTS}}', hintsLine);

  // Clean up empty lines
  prompt = prompt.replace(/\n{3,}/g, '\n\n');

  return prompt.trim();
}

/**
 * Build the complete prompt for tool calling generation
 *
 * @param input - Prompt builder input
 * @returns Object with system and user prompts for tool calling
 */
export function buildToolCallingPrompt(input: PromptBuilderInput): {
  system: string;
  user: string;
} {
  return {
    system: TOOL_CALLING_SYSTEM_PROMPT,
    user: buildToolCallingUserPrompt(input),
  };
}
