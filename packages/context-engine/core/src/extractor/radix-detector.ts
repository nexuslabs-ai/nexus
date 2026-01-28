/**
 * Radix Primitive Detector
 *
 * Detects when a component is a direct re-export or wrapper of a Radix primitive.
 * Returns primitive name and docs URL for AI consumption.
 */

export interface RadixPrimitiveInfo {
  /** The primitive component name (e.g., "Root", "Trigger", "Content") */
  primitive: string;
  /** Documentation URL for the Radix primitive */
  docsUrl: string;
}

/**
 * Base URL for Radix UI documentation
 */
const RADIX_DOCS_BASE = 'https://www.radix-ui.com/primitives/docs/components';

/**
 * Generate the Radix documentation URL for a primitive
 *
 * @example
 * generateRadixDocsUrl('@radix-ui/react-dialog', 'Root')
 * // => 'https://www.radix-ui.com/primitives/docs/components/dialog#root'
 *
 * generateRadixDocsUrl('@radix-ui/react-dropdown-menu', 'Content')
 * // => 'https://www.radix-ui.com/primitives/docs/components/dropdown-menu#content'
 */
export function generateRadixDocsUrl(
  packageName: string,
  primitive: string
): string {
  // Extract component name from package: @radix-ui/react-dialog → dialog
  const match = packageName.match(/@radix-ui\/react-(.+)/);
  if (!match) return '';

  const component = match[1]; // "dialog", "dropdown-menu", etc.
  const primitiveLower = primitive.toLowerCase(); // "Root" → "root"

  return `${RADIX_DOCS_BASE}/${component}#${primitiveLower}`;
}

/**
 * Extract Radix import info from source code
 */
function extractRadixImportInfo(
  sourceCode: string
): { importAlias: string; packageName: string } | undefined {
  const importMatch = sourceCode.match(
    /import\s+\*\s+as\s+(\w+Primitive)\s+from\s+['"](@radix-ui\/react-[\w-]+)['"]/
  );
  if (!importMatch) return undefined;

  return {
    importAlias: importMatch[1],
    packageName: importMatch[2],
  };
}

/**
 * Detect if a component is a Radix primitive re-export
 */
export function detectRadixPrimitive(
  componentName: string,
  sourceCode: string
): RadixPrimitiveInfo | undefined {
  const importInfo = extractRadixImportInfo(sourceCode);
  if (!importInfo) return undefined;

  const { importAlias, packageName } = importInfo;

  const directPattern = new RegExp(
    `(?:const|let|var)\\s+${componentName}\\s*=\\s*${importAlias}\\.(\\w+)`,
    'm'
  );
  const directMatch = sourceCode.match(directPattern);

  if (directMatch) {
    const primitive = directMatch[1];
    return {
      primitive,
      docsUrl: generateRadixDocsUrl(packageName, primitive),
    };
  }
  return undefined;
}

/**
 * Detect Radix primitive for a specific subComponent
 *
 * This handles multiple patterns:
 * 1. Direct assignment: `const DialogTrigger = DialogPrimitive.Trigger`
 * 2. forwardRef wrapper: `const DialogContent = forwardRef<...>((props, ref) => <DialogPrimitive.Content ...>)`
 * 3. Function wrapper: `function DialogContent(...) { return <DialogPrimitive.Content ...> }`
 *
 * @param subComponentName - The name of the subComponent to detect (e.g., "DialogTrigger")
 * @param sourceCode - The source code to analyze
 * @returns RadixPrimitiveInfo if detected, undefined otherwise
 */
export function detectRadixPrimitiveForSubComponent(
  subComponentName: string,
  sourceCode: string
): RadixPrimitiveInfo | undefined {
  const importInfo = extractRadixImportInfo(sourceCode);
  if (!importInfo) return undefined;

  const { importAlias, packageName } = importInfo;

  // Helper to create the result
  const createResult = (primitive: string): RadixPrimitiveInfo => ({
    primitive,
    docsUrl: generateRadixDocsUrl(packageName, primitive),
  });

  // Pattern 1: Direct assignment
  // e.g., `const DialogTrigger = DialogPrimitive.Trigger`
  const directPattern = new RegExp(
    `(?:const|let|var)\\s+${subComponentName}\\s*=\\s*${importAlias}\\.(\\w+)`,
    'm'
  );
  const directMatch = sourceCode.match(directPattern);
  if (directMatch) {
    return createResult(directMatch[1]);
  }

  // Pattern 2: forwardRef wrapper that renders a Radix primitive
  // e.g., `const DialogContent = forwardRef<...>((props, ref) => { ... <DialogPrimitive.Content ...> })`
  // We look for the component definition and then find what Radix primitive it renders
  const forwardRefPattern = new RegExp(
    `(?:const|let|var)\\s+${subComponentName}\\s*=\\s*(?:React\\.)?forwardRef[^(]*\\([^)]*\\)\\s*=>\\s*[({][\\s\\S]*?<${importAlias}\\.(\\w+)`,
    'm'
  );
  const forwardRefMatch = sourceCode.match(forwardRefPattern);
  if (forwardRefMatch) {
    return createResult(forwardRefMatch[1]);
  }

  // Pattern 3: Function component that renders a Radix primitive
  // e.g., `function DialogContent(...) { return <DialogPrimitive.Content ...> }`
  const functionPattern = new RegExp(
    `function\\s+${subComponentName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?<${importAlias}\\.(\\w+)`,
    'm'
  );
  const functionMatch = sourceCode.match(functionPattern);
  if (functionMatch) {
    return createResult(functionMatch[1]);
  }

  // Pattern 4: Arrow function component (non-forwardRef)
  // e.g., `const DialogHeader = ({ ... }) => { return <DialogPrimitive.Header ...> }`
  // or `const DialogHeader = ({ ... }) => (<DialogPrimitive.Header ...>)`
  const arrowPattern = new RegExp(
    `(?:const|let|var)\\s+${subComponentName}\\s*=\\s*(?:\\([^)]*\\)|[^=]+)\\s*=>\\s*[({][\\s\\S]*?<${importAlias}\\.(\\w+)`,
    'm'
  );
  const arrowMatch = sourceCode.match(arrowPattern);
  if (arrowMatch) {
    return createResult(arrowMatch[1]);
  }

  // Pattern 5: Infer from naming convention (fallback)
  // If subComponent is "DialogTrigger" and we have DialogPrimitive imported,
  // assume it maps to DialogPrimitive.Trigger
  const inferredPrimitive = inferPrimitiveFromName(
    subComponentName,
    importAlias
  );
  if (inferredPrimitive) {
    // Verify the primitive is actually used somewhere in the code
    const primitiveUsedPattern = new RegExp(
      `${importAlias}\\.${inferredPrimitive}\\b`
    );
    if (primitiveUsedPattern.test(sourceCode)) {
      return createResult(inferredPrimitive);
    }
  }

  return undefined;
}

/**
 * Infer the Radix primitive name from a subComponent name
 *
 * Examples:
 * - "DialogTrigger" with "DialogPrimitive" → "Trigger"
 * - "AccordionItem" with "AccordionPrimitive" → "Item"
 * - "DropdownMenuContent" with "DropdownMenuPrimitive" → "Content"
 */
function inferPrimitiveFromName(
  subComponentName: string,
  importAlias: string
): string | undefined {
  // Extract the base component name from the import alias
  // "DialogPrimitive" → "Dialog"
  // "DropdownMenuPrimitive" → "DropdownMenu"
  const baseMatch = importAlias.match(/^(\w+)Primitive$/);
  if (!baseMatch) return undefined;

  const baseName = baseMatch[1];

  // Check if subComponentName starts with baseName
  if (subComponentName.startsWith(baseName)) {
    // "DialogTrigger" with base "Dialog" → "Trigger"
    const primitive = subComponentName.slice(baseName.length);
    if (primitive) {
      return primitive;
    }
  }

  return undefined;
}
