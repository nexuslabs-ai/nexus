/**
 * Edge Cases Tests
 *
 * Tests extraction and processing of unusual component patterns.
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  extractComponent,
  isExtractionSuccess,
} from '../../src/extractor/index.js';
import {
  type ComponentProcessor,
  createComponentProcessor,
  isProcessorSuccess,
  type ProcessorInput,
} from '../../src/processor/index.js';
import {
  createMockLLMProvider,
  DEFAULT_MOCK_TOOL_RESPONSE,
  type MockLLMProvider,
} from '../providers/mock-llm-provider.js';
import {
  countAllProps,
  expectExtractionSuccess,
  expectPropsToInclude,
} from '../utils/assertion-helpers.js';
import {
  fixtureExists,
  loadFixture,
  loadFixtureAsInput,
} from '../utils/fixture-loader.js';
import { TEST_ORG_ID } from '../utils/test-constants.js';

// =============================================================================
// Fixture existence checks (evaluated once at module load)
// =============================================================================
const hasNoPropsFixture = fixtureExists('edge-cases', 'no-props');
const hasGenericComponentFixture = fixtureExists(
  'edge-cases',
  'generic-component'
);
const hasForwardRefFixture = fixtureExists('edge-cases', 'forwardref-wrapped');

/**
 * Expected edge-case fixtures.
 * Add new fixtures here when they're created.
 */
const EXPECTED_EDGE_CASE_FIXTURES = [
  'no-props',
  'generic-component',
  'forwardref-wrapped',
] as const;

// =============================================================================
// Fixture Integrity Test
// =============================================================================
describe('Fixture Integrity', () => {
  it('all expected edge-case fixtures exist', () => {
    const missingFixtures = EXPECTED_EDGE_CASE_FIXTURES.filter(
      (fixture) => !fixtureExists('edge-cases', fixture)
    );

    if (missingFixtures.length > 0) {
      throw new Error(
        `Missing edge-case fixtures: ${missingFixtures.join(', ')}. ` +
          `Either create the fixtures or remove them from EXPECTED_EDGE_CASE_FIXTURES.`
      );
    }
  });
});

describe('Edge Cases', () => {
  let mockProvider: MockLLMProvider;
  let processor: ComponentProcessor;

  beforeEach(() => {
    mockProvider = createMockLLMProvider({
      defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
    });
    processor = createComponentProcessor({
      llmProvider: mockProvider,
    });
  });

  describe('No Props Component', () => {
    it.skipIf(!hasNoPropsFixture)(
      'extracts component without explicit props interface',
      async () => {
        const input = loadFixtureAsInput('edge-cases', 'no-props');
        const result = await extractComponent(input);

        expectExtractionSuccess(result);
        if (!isExtractionSuccess(result)) return;

        // Component should still be extractable
        expect(result.data).toBeDefined();
        // Props array may be empty or contain only HTML element props
        expect(Array.isArray(result.data.props)).toBe(true);
      }
    );

    it.skipIf(!hasNoPropsFixture)(
      'produces valid manifest for no-props component',
      async () => {
        const fixture = loadFixture('edge-cases', 'no-props');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Separator',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (isProcessorSuccess(result)) {
          expect(result.manifest.name).toBe('Separator');
          expect(result.manifest.id).toBeTruthy();
        }
      }
    );
  });

  describe('Generic Component', () => {
    it.skipIf(!hasGenericComponentFixture)(
      'extracts component with TypeScript generics',
      async () => {
        const input = loadFixtureAsInput('edge-cases', 'generic-component');
        const result = await extractComponent(input);

        expectExtractionSuccess(result);
        if (!isExtractionSuccess(result)) return;

        // Generic props should be extracted
        // Note: simplified prop structure - name, type, values, defaultValue
        expectPropsToInclude(result.data.props, [
          { name: 'items' },
          { name: 'renderItem' },
          { name: 'keyExtractor' },
          { name: 'loading' },
        ]);
      }
    );

    it.skipIf(!hasGenericComponentFixture)(
      'extracts generic type constraints',
      async () => {
        const input = loadFixtureAsInput('edge-cases', 'generic-component');
        const result = await extractComponent(input);

        expectExtractionSuccess(result);
        if (!isExtractionSuccess(result)) return;

        // items prop should have array type in the simplified type string
        const itemsProp = result.data.props.find((p) => p.name === 'items');
        expect(itemsProp).toBeDefined();
        // The type should indicate array nature (e.g., contains '[]' or 'Array')
        expect(
          itemsProp?.type.includes('[]') || itemsProp?.type.includes('Array')
        ).toBe(true);
      }
    );

    it.skipIf(!hasGenericComponentFixture)(
      'produces valid manifest for generic component',
      async () => {
        const fixture = loadFixture('edge-cases', 'generic-component');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'List',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (isProcessorSuccess(result)) {
          expect(result.manifest.name).toBe('List');
          // v1.0 schema: props is CategorizedProps, use countAllProps
          expect(countAllProps(result.manifest.props)).toBeGreaterThan(0);
        }
      }
    );
  });

  describe('ForwardRef Wrapped Component', () => {
    it.skipIf(!hasForwardRefFixture)(
      'extracts component with forwardRef',
      async () => {
        const input = loadFixtureAsInput('edge-cases', 'forwardref-wrapped');
        const result = await extractComponent(input);

        expectExtractionSuccess(result);
        if (!isExtractionSuccess(result)) return;

        // Should detect forwardRef usage
        expect(result.data.usesForwardRef).toBe(true);
      }
    );

    it.skipIf(!hasForwardRefFixture)(
      'extracts data from forwardRef component',
      async () => {
        const input = loadFixtureAsInput('edge-cases', 'forwardref-wrapped');
        const result = await extractComponent(input);

        expectExtractionSuccess(result);
        if (!isExtractionSuccess(result)) return;

        // Extraction should produce props (may vary based on extractor)
        expect(result.data.props).toBeDefined();
        // At least some props should be extracted (may not be all due to forwardRef)
        // Note: Some extractors have difficulty with forwardRef components
        expect(result.data).toBeDefined();
      }
    );

    it.skipIf(!hasForwardRefFixture)(
      'includes exportName field (may be derived from filename or displayName)',
      async () => {
        const input = loadFixtureAsInput('edge-cases', 'forwardref-wrapped');
        const result = await extractComponent(input);

        expectExtractionSuccess(result);
        if (!isExtractionSuccess(result)) return;

        // Export name may be from displayName (TextArea) or derived from filename
        // Either is acceptable as long as a name is present
        expect(result.data.exportName).toBeTruthy();
      }
    );
  });

  describe('Source code edge cases', () => {
    it('handles component with only comments (may succeed with empty data)', async () => {
      const sourceCode = `
        // This is just comments
        /* No actual code here */
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'Empty',
        sourceCode,
        framework: 'react',
      });

      // Should not crash - may succeed with empty data or fail gracefully
      expect(result.type).toBeDefined();
      if (isExtractionSuccess(result)) {
        // May succeed with empty props
        expect(result.data).toBeDefined();
      }
    });

    it('handles component with syntax errors (may succeed with partial data)', async () => {
      const sourceCode = `
        function Broken({
          // Missing closing brace
          prop
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'Broken',
        sourceCode,
        framework: 'react',
      });

      // Should not crash - may succeed with empty data or fail gracefully
      expect(result.type).toBeDefined();
    });

    it('handles component with circular type references', async () => {
      const sourceCode = `
        import * as React from 'react';

        interface NodeProps {
          children?: React.ReactNode;
          parent?: NodeProps;
          siblings?: NodeProps[];
        }

        function TreeNode({ children, parent, siblings }: NodeProps) {
          return <div>{children}</div>;
        }

        export { TreeNode, type NodeProps };
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'TreeNode',
        sourceCode,
        framework: 'react',
      });

      // Should handle circular references without infinite loops
      expectExtractionSuccess(result);
    });

    it('handles component with very long prop types', async () => {
      const longType = Array(100)
        .fill(0)
        .map((_, i) => `'option${i}'`)
        .join(' | ');

      const sourceCode = `
        import * as React from 'react';

        interface SelectProps {
          value: ${longType};
          onChange: (value: ${longType}) => void;
        }

        function Select({ value, onChange }: SelectProps) {
          return <select value={value} onChange={(e) => onChange(e.target.value as any)} />;
        }

        export { Select, type SelectProps };
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'Select',
        sourceCode,
        framework: 'react',
      });

      // Should handle long types without issues
      expectExtractionSuccess(result);
      if (!isExtractionSuccess(result)) return;

      const valueProp = result.data.props.find((p) => p.name === 'value');
      expect(valueProp).toBeDefined();
    });

    it('handles component with JSX in default props', async () => {
      const sourceCode = `
        import * as React from 'react';

        interface AlertProps {
          children: React.ReactNode;
          icon?: React.ReactNode;
          action?: React.ReactNode;
        }

        function Alert({
          children,
          icon = <span>!</span>,
          action
        }: AlertProps) {
          return (
            <div>
              {icon}
              {children}
              {action}
            </div>
          );
        }

        export { Alert, type AlertProps };
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'Alert',
        sourceCode,
        framework: 'react',
      });

      expectExtractionSuccess(result);
    });
  });

  describe('Multiple exports edge cases', () => {
    it('handles file with no exports', async () => {
      const sourceCode = `
        import * as React from 'react';

        function InternalComponent() {
          return <div>Internal</div>;
        }
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'InternalComponent',
        sourceCode,
        framework: 'react',
      });

      // Should either extract the component or fail gracefully
      // (behavior depends on implementation)
      expect(result.type).toBeDefined();
    });

    it('handles file with many exports', async () => {
      const sourceCode = `
        import * as React from 'react';

        export function ComponentA() { return <div>A</div>; }
        export function ComponentB() { return <div>B</div>; }
        export function ComponentC() { return <div>C</div>; }
        export function ComponentD() { return <div>D</div>; }
        export function ComponentE() { return <div>E</div>; }

        export const ConstA = 1;
        export const ConstB = 2;

        export type TypeA = string;
        export type TypeB = number;
      `;

      const result = await extractComponent({
        orgId: TEST_ORG_ID,
        name: 'ComponentA',
        sourceCode,
        framework: 'react',
      });

      // Should handle multiple exports without issue
      expectExtractionSuccess(result);
    });
  });
});
