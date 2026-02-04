/**
 * Types Index
 *
 * Re-exports all type definitions from @context-engine/core
 */

// Identity types - schemas (values)
export {
  BaseLibrarySchema,
  ComponentIdentitySchema,
  ComponentIdSchema,
  ComponentNameSchema,
  ComponentSlugSchema,
  FrameworkSchema,
  IdentifierTypeSchema,
  ManifestIdentitySchema,
  ParsedIdentifierSchema,
  SLUG_PATTERN,
  TierSchema,
  UUID_PATTERN,
  VersionSchema,
  VisibilitySchema,
} from './identity.js';

// Identity types - types
export type {
  BaseLibrary,
  ComponentId,
  ComponentIdentity,
  ComponentName,
  ComponentSlug,
  Framework,
  IdentifierType,
  ManifestIdentity,
  ParsedIdentifier,
  Tier,
  Version,
  Visibility,
} from './identity.js';

// Output types - shared discriminant for success/failure
export type { OutputType as OutputTypeValue } from './output.js';
export { OutputType } from './output.js';

// Extracted data types - schemas (values)
export {
  CompoundComponentInfoSchema,
  ExtractedDataSchema,
  ExtractedPropSchema,
  ExtractedSubComponentSchema,
  ExtractionMethodSchema,
  ExtractionResultSchema,
  HashSchema,
  RadixPrimitiveInfoSchema,
} from './extracted.js';

// Extracted data types - types
export type {
  CompoundComponentInfo,
  ExtractedData,
  ExtractedProp,
  ExtractedSubComponent,
  ExtractionMethod,
  ExtractionResult,
  Hash,
  RadixPrimitiveInfo,
} from './extracted.js';

// Storybook types
export type {
  ExtractedStory,
  StorybookExtractionResult,
  StoryComplexity,
} from '../extractor/storybook/types.js';

// Meta types - schemas (values)
// NOTE: AIContextSchema is exported for generator module internal use.
// It is NOT part of the final manifest schema (use GuidanceSchema instead).
export {
  AIContextSchema,
  COMPONENT_PATTERNS,
  ComponentMetaSchema,
  ComponentPatternSchema,
} from './meta.js';

// Meta types - types
export type { AIContext, ComponentMeta, ComponentPattern } from './meta.js';

// Import statement types - schemas (values)
export { ImportStatementSchema } from './import-statement.js';

// Import statement types - types
export type { ImportStatement } from './import-statement.js';

// Base prop types - schemas (values)
export { BasePropSchema } from './base-prop.js';

// Base prop types - types
export type { BaseProp } from './base-prop.js';

// Props types - schemas (values)
export { CategorizedPropsSchema, PropDefinitionSchema } from './props.js';

// Props types - types
export type {
  CategorizedProps,
  CategorizedPropsCategory,
  PropDefinition,
} from './props.js';

// CVA variant types - schemas (values)
export { CvaVariantSchema, CvaVariantsSchema } from './cva-variant.js';

// CVA variant types - types
export type { CvaVariant, CvaVariants } from './cva-variant.js';

// Examples types - schemas (values)
export { CodeExampleSchema, StructuredExamplesSchema } from './examples.js';

// Examples types - types
export type { CodeExample, StructuredExamples } from './examples.js';

// Guidance types - schemas (values)
export { GuidanceSchema } from './guidance.js';

// Guidance types - types
export type { Guidance } from './guidance.js';

// Manifest types - schemas (values)
export {
  AIManifestSchema,
  ChildrenInfoSchema,
  CreateManifestInputSchema,
  DependenciesSchema,
  ManifestOutputSchema,
  SubComponentSchema,
  UpdateManifestInputSchema,
  VersionHistoryEntrySchema,
} from './manifest.js';

// Manifest types - types
export type {
  AIManifest,
  ChildrenInfo,
  CreateManifestInput,
  Dependencies,
  ManifestOutput,
  SubComponent,
  UpdateManifestInput,
  VersionHistoryEntry,
} from './manifest.js';

// Error types - schemas and classes (values)
export {
  ApiErrorSchema,
  ComponentNotFoundError,
  ContextEngineError,
  EmbeddingError,
  ERROR_STATUS_MAP,
  ErrorCodeSchema,
  ExtractionError,
  ForbiddenError,
  getErrorStatus,
  isContextEngineError,
  ManifestBuildError,
  MetaGenerationError,
  NotFoundError,
  RateLimitedError,
  StateStoreError,
  UnauthorizedError,
  ValidationError,
  ValidationErrorDetailSchema,
} from './errors.js';

// Error types - types
export type { ApiError, ErrorCode, ValidationErrorDetail } from './errors.js';
