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
    if (p.description) parts.push(`- ${p.description}`);
    if (p.values?.length) {
      parts.push(`[${p.values.join(', ')}]`);
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
 * Build the sub-component variants section for the prompt
 *
 * For compound components (Dialog, Accordion, etc.), includes variant information
 * for each sub-component so the LLM can generate variant descriptions for them.
 */
function buildSubComponentVariantsSection(extracted: ExtractedData): string {
  if (!extracted.subComponents || extracted.subComponents.length === 0) {
    return '';
  }

  // Filter to only sub-components that have variants
  const subComponentsWithVariants = extracted.subComponents.filter(
    (sub) => sub.variants && Object.keys(sub.variants).length > 0
  );

  if (subComponentsWithVariants.length === 0) {
    return '';
  }

  const sections = subComponentsWithVariants.map((sub) => {
    const variantLines = Object.entries(sub.variants!).map(
      ([name, values]) => `  - ${name}: ${values.join(', ')}`
    );

    // Include defaults if available
    let subSection = `${sub.name}:\n${variantLines.join('\n')}`;
    if (sub.defaultVariants && Object.keys(sub.defaultVariants).length > 0) {
      const defaultLines = Object.entries(sub.defaultVariants).map(
        ([name, value]) => `    ${name}: ${value}`
      );
      subSection += `\n  Defaults:\n${defaultLines.join('\n')}`;
    }

    return subSection;
  });

  return `Sub-Component Variants:\n${sections.join('\n\n')}`;
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

  /**
   * Skip example generation in the prompt.
   * Set to true when Storybook examples are available from extraction.
   */
  skipExamples?: boolean;

  /**
   * Optional hints to guide LLM generation.
   * Provides additional context about the component beyond what's extracted from code.
   */
  hints?: string;
}

// =============================================================================
// Response Validation
// =============================================================================

/**
 * Filter patterns to only include valid ones
 */
export function filterValidPatterns(patterns: string[]): string[] {
  return patterns.filter((pattern) => COMPONENT_PATTERNS.includes(pattern));
}

// =============================================================================
// Prompt Constants
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
 * Pattern reference section (shared between both prompt paths)
 */
const PATTERN_REFERENCE = `## Pattern Reference

Valid patterns (use where applicable):
${COMPONENT_PATTERNS.map((p) => `- ${p}`).join('\n')}`;

// =============================================================================
// Prompt Builder
// =============================================================================

/**
 * Build the user prompt for tool calling using template literals
 *
 * @param input - Prompt builder input
 * @returns Formatted user prompt string for tool calling
 */
function buildToolCallingUserPrompt({
  name,
  framework,
  extracted,
  skipExamples = false,
  hints,
}: PromptBuilderInput): string {
  const propsSection = buildPropsSection(extracted);
  const variantsSection = buildVariantsSection(extracted);
  const subComponentVariantsSection =
    buildSubComponentVariantsSection(extracted);
  const dependenciesSection = buildDependenciesSection(extracted);
  const baseLibrarySection = buildBaseLibrarySection(extracted);

  const sourceDescription = extracted.sourceDescription
    ? `Description: ${extracted.sourceDescription}`
    : '';
  const hintsSection = hints ? `Additional Context: ${hints}` : '';

  const prompt = `Analyze this ${framework} component and generate metadata using the generate_component_metadata tool.

## Component: ${name}
${sourceDescription}

${propsSection}

${variantsSection}

${subComponentVariantsSection}

${dependenciesSection}

${baseLibrarySection}

${hintsSection}

${PATTERN_REFERENCE}

Generate comprehensive metadata to make this component AI-accessible.${!skipExamples ? ' Include practical code examples.' : ''}`;

  // Clean up empty lines (3+ newlines -> 2)
  return prompt.replace(/\n{3,}/g, '\n\n').trim();
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
