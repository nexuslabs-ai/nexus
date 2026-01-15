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
  ParsedIdentifier,
  Tier,
  Version,
  Visibility,
} from './identity.js';

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
  ExtractedDataSchema,
  ExtractedPropSchema,
  ExtractionMethodSchema,
  ExtractionResultSchema,
  HashSchema,
  PropTypeCategorySchema,
} from './extracted.js';

// Extracted data types - types
export type {
  ExtractedData,
  ExtractedProp,
  ExtractionMethod,
  ExtractionResult,
  Hash,
  PropTypeCategory,
} from './extracted.js';

// Meta types - schemas (values)
export {
  AIContextSchema,
  COMPONENT_PATTERNS,
  ComponentMetaSchema,
  ComponentPatternSchema,
  MetaGenerationRequestSchema,
  MetaGenerationResultSchema,
} from './meta.js';

// Meta types - types
export type {
  AIContext,
  ComponentMeta,
  ComponentPattern,
  MetaGenerationRequest,
  MetaGenerationResult,
} from './meta.js';

// Manifest types - schemas (values)
export {
  ComponentManifestSchema,
  ComponentWithHistorySchema,
  CreateManifestInputSchema,
  MANIFEST_SCHEMA_VERSION,
  ManifestSummarySchema,
  UpdateManifestInputSchema,
  VersionHistoryEntrySchema,
} from './manifest.js';

// Manifest types - types
export type {
  ComponentManifest,
  ComponentWithHistory,
  CreateManifestInput,
  ManifestSummary,
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
