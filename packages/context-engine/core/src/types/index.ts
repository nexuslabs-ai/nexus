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

// Embedding types - schemas (values)
export {
  DEFAULT_EMBEDDING_MODEL,
  EmbeddingChunkTypeSchema,
  EmbeddingModelInfoSchema,
  EmbeddingProviderSchema,
  EmbeddingQueueEntrySchema,
  EmbeddingStatusInfoSchema,
  EmbeddingStatusSchema,
  EmbeddingStatusSummarySchema,
} from './embedding.js';

// Embedding types - types
export type {
  EmbeddingChunkType,
  EmbeddingModelInfo,
  EmbeddingProvider,
  EmbeddingQueueEntry,
  EmbeddingStatus,
  EmbeddingStatusInfo,
  EmbeddingStatusSummary,
} from './embedding.js';

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
// It is NOT part of the final ComponentManifest schema (use GuidanceSchema instead).
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
  ComponentManifestSchema,
  ComponentWithHistorySchema,
  CreateManifestInputSchema,
  DependenciesSchema,
  MANIFEST_SCHEMA_VERSION,
  ManifestMetadataSchema,
  ManifestOutputSchema,
  ManifestSummarySchema,
  SubComponentSchema,
  UpdateManifestInputSchema,
  VersionHistoryEntrySchema,
} from './manifest.js';

// Manifest types - types
export type {
  AIManifest,
  ChildrenInfo,
  ComponentManifest,
  ComponentWithHistory,
  CreateManifestInput,
  Dependencies,
  ManifestMetadata,
  ManifestOutput,
  ManifestSummary,
  SubComponent,
  UpdateManifestInput,
  VersionHistoryEntry,
} from './manifest.js';

// Database types - schemas (values)
export {
  ComponentEmbeddingRecordSchema,
  ComponentRecordSchema,
  EmbeddingQueueRecordSchema,
  OrganizationRecordSchema,
  TABLE_NAMES,
  VersionHistoryRecordSchema,
} from './database.js';

// Database types - types
export type {
  ComponentEmbeddingRecord,
  ComponentRecord,
  EmbeddingQueueRecord,
  InsertComponent,
  InsertComponentEmbedding,
  InsertEmbeddingQueue,
  InsertOrganization,
  InsertVersionHistory,
  OrganizationRecord,
  TableName,
  UpdateComponent,
  UpdateEmbeddingQueue,
  UpdateOrganization,
  VersionHistoryRecord,
} from './database.js';

// Auth types - schemas (values)
export {
  API_KEY_PATTERN,
  API_KEY_PREFIX,
  ApiKeyEnvironmentSchema,
  ApiKeyRecordSchema,
  ApiKeySchema,
  ApiKeySummarySchema,
  AuthContextSchema,
  CreateApiKeyInputSchema,
  CreateApiKeyResultSchema,
  PermissionLevelSchema,
  RateLimitInfoSchema,
  RateLimitStatusSchema,
} from './auth.js';

// Auth types - types
export type {
  ApiKey,
  ApiKeyEnvironment,
  ApiKeyRecord,
  ApiKeySummary,
  AuthContext,
  CreateApiKeyInput,
  CreateApiKeyResult,
  PermissionLevel,
  RateLimitInfo,
  RateLimitStatus,
} from './auth.js';

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
  MetaGenerationError,
  NotFoundError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
  ValidationErrorDetailSchema,
} from './errors.js';

// Error types - types
export type { ApiError, ErrorCode, ValidationErrorDetail } from './errors.js';

// API types - schemas (values)
export {
  CreateComponentBodySchema,
  CreateComponentResponseSchema,
  DeleteComponentParamsSchema,
  DeleteComponentResponseSchema,
  GetComponentParamsSchema,
  GetComponentQuerySchema,
  GetComponentResponseSchema,
  GetContextBodySchema,
  GetContextResponseSchema,
  GetStatsResponseSchema,
  ListComponentsQuerySchema,
  ListComponentsResponseSchema,
  PaginatedResponseSchema,
  PaginationMetaSchema,
  PaginationParamsSchema,
  SearchBodySchema,
  SearchResponseSchema,
  SearchResultItemSchema,
  SuccessResponseSchema,
  UpdateComponentBodySchema,
  UpdateComponentParamsSchema,
  UpdateComponentResponseSchema,
  WebhookEventTypeSchema,
  WebhookPayloadSchema,
} from './api.js';

// API types - types
export type {
  CreateComponentBody,
  CreateComponentResponse,
  DeleteComponentParams,
  DeleteComponentResponse,
  GetComponentParams,
  GetComponentQuery,
  GetComponentResponse,
  GetContextBody,
  GetContextResponse,
  GetStatsResponse,
  ListComponentsQuery,
  ListComponentsResponse,
  PaginationMeta,
  PaginationParams,
  SearchBody,
  SearchResponse,
  SearchResultItem,
  UpdateComponentBody,
  UpdateComponentParams,
  UpdateComponentResponse,
  WebhookEventType,
  WebhookPayload,
} from './api.js';
