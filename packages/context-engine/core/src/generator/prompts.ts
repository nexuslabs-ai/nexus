/**
 * Generation Prompts
 *
 * Prompt templates for LLM-based metadata generation.
 * Designed for efficiency (minimal token usage) while providing rich context.
 */

import type { ExtractedData, Framework } from '../types/index.js';
import { COMPONENT_PATTERNS } from '../types/meta.js';

// =============================================================================
// System Prompt
// =============================================================================

/**
 * System prompt that explains the task to the LLM
 *
 * Kept concise to minimize token usage while providing clear instructions.
 */
export const SYSTEM_PROMPT = `You are a design system documentation expert. Generate metadata for React components based on extracted code information.

Output valid JSON only. No markdown, no explanations.`;

// =============================================================================
// User Prompt Template
// =============================================================================

/**
 * Template placeholders for user prompt
 */
export interface PromptPlaceholders {
  componentName: string;
  framework: Framework;
  propsSection: string;
  variantsSection: string;
  dependenciesSection: string;
  baseLibrarySection: string;
  sourceDescription: string;
  figmaUrl: string;
  hints: string;
}

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

/**
 * User prompt template
 *
 * Uses {{PLACEHOLDER}} syntax for template variables.
 */
export const USER_PROMPT_TEMPLATE = `Generate metadata for this component:

## Component
Name: {{COMPONENT_NAME}}
Framework: {{FRAMEWORK}}
{{SOURCE_DESCRIPTION}}

{{PROPS_SECTION}}

{{VARIANTS_SECTION}}

{{DEPENDENCIES_SECTION}}

{{BASE_LIBRARY_SECTION}}

{{FIGMA_URL}}

{{HINTS}}

## Output Format

Return a JSON object with this structure:

{
  "description": "One-line description (10-80 chars)",
  "semanticDescription": "Rich 2-5 sentence description for semantic search. Describe what this component is, its primary purpose, and key characteristics.",
  "tier": "free",
  "whenToUse": "Guidance on when to use this component",
  "whenNotToUse": "Guidance on when NOT to use this component",
  "patterns": ["pattern1", "pattern2"],
  "tokens": ["color-primary", "spacing-md"],
  "examples": ["<Component variant=\\"primary\\" />", "<Component disabled />"],
  "relatedComponents": ["RelatedOne", "RelatedTwo"],
  "a11yNotes": "Accessibility considerations"
}

## Pattern Reference

Standard patterns (use where applicable):
${COMPONENT_PATTERNS.map((p) => `- ${p}`).join('\n')}

## Guidelines

1. semanticDescription should be optimized for embedding-based search
2. Include 2-4 realistic JSX examples showing different usages
3. patterns must be from the standard list above
4. tokens should reference design tokens (colors, spacing, typography)
5. relatedComponents should be real component names that pair with this one
6. Set tier to "pro" only for complex components (data tables, advanced charts)

Return ONLY the JSON object.`;

// =============================================================================
// Prompt Builder
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

/**
 * Build the complete user prompt from extracted data
 *
 * @param input - Prompt builder input
 * @returns Formatted user prompt string
 */
export function buildUserPrompt(input: PromptBuilderInput): string {
  const { name, framework, extracted, figmaUrl, hints } = input;

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
  let prompt = USER_PROMPT_TEMPLATE;
  prompt = prompt.replace('{{COMPONENT_NAME}}', name);
  prompt = prompt.replace('{{FRAMEWORK}}', framework);
  prompt = prompt.replace('{{SOURCE_DESCRIPTION}}', sourceDescriptionLine);
  prompt = prompt.replace('{{PROPS_SECTION}}', propsSection);
  prompt = prompt.replace('{{VARIANTS_SECTION}}', variantsSection);
  prompt = prompt.replace('{{DEPENDENCIES_SECTION}}', dependenciesSection);
  prompt = prompt.replace('{{BASE_LIBRARY_SECTION}}', baseLibrarySection);
  prompt = prompt.replace('{{FIGMA_URL}}', figmaLine);
  prompt = prompt.replace('{{HINTS}}', hintsLine);

  // Clean up empty lines (more than 2 consecutive newlines become 2)
  prompt = prompt.replace(/\n{3,}/g, '\n\n');

  return prompt.trim();
}

/**
 * Build the complete prompt for LLM generation
 *
 * @param input - Prompt builder input
 * @returns Object with system and user prompts
 */
export function buildPrompt(input: PromptBuilderInput): {
  system: string;
  user: string;
} {
  return {
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(input),
  };
}

// =============================================================================
// Response Format
// =============================================================================

/**
 * Expected JSON structure from LLM response
 *
 * This matches ParsedLLMMetaResponse from types.ts
 */
export interface ExpectedLLMResponse {
  description: string;
  semanticDescription: string;
  tier?: 'free' | 'pro';
  whenToUse?: string;
  whenNotToUse?: string;
  patterns?: string[];
  tokens?: string[];
  examples?: string[];
  relatedComponents?: string[];
  a11yNotes?: string;
}

/**
 * Validate that a pattern is from the standard list
 */
export function isValidPattern(pattern: string): boolean {
  return (COMPONENT_PATTERNS as readonly string[]).includes(pattern);
}

/**
 * Filter patterns to only include valid ones
 */
export function filterValidPatterns(patterns: string[]): string[] {
  return patterns.filter(isValidPattern);
}
