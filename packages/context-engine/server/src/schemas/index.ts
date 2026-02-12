/**
 * Schema Exports
 *
 * Barrel file for all Zod schemas used in the Context Engine API.
 * These schemas serve dual purposes:
 * 1. Request/response validation at runtime
 * 2. OpenAPI documentation generation
 */

// Common schemas (errors, health, pagination)
export {
  ErrorSchema,
  HealthSchema,
  PaginationMetaSchema,
  PaginationQuerySchema,
  ReadySchema,
} from './common.js';

// Organization schemas
export {
  type CreateOrganization,
  CreateOrganizationSchema,
  DeleteOrganizationResponseSchema,
  type Organization,
  type OrganizationList,
  OrganizationListSchema,
  type OrganizationResponse,
  OrganizationResponseSchema,
  OrganizationSchema,
  OrgIdParamSchema,
  OrgIdPathParamSchema,
  type UpdateOrganization,
  UpdateOrganizationSchema,
} from './organizations.js';

// Component schemas
export {
  type Component,
  ComponentIdParamSchema,
  type ComponentList,
  ComponentListSchema,
  type ComponentResponse,
  ComponentResponseSchema,
  ComponentSchema,
  ComponentSlugParamSchema,
  type ComponentSummary,
  ComponentSummarySchema,
  type CreateComponent,
  CreateComponentSchema,
  DeleteComponentResponseSchema,
  type EmbeddingStatus,
  EmbeddingStatusEnum,
  type Framework,
  FrameworkEnum,
  type IndexComponentResponse,
  IndexComponentResponseSchema,
  type ListComponentsQuery,
  ListComponentsQuerySchema,
  type UpdateComponent,
  UpdateComponentSchema,
  type Visibility,
  VisibilityEnum,
} from './components.js';

// Search schemas
export {
  type SearchMode,
  SearchModeEnum,
  SearchParamsSchema,
  type SearchRequest,
  SearchRequestSchema,
  type SearchResponse,
  SearchResponseSchema,
  type SearchResult,
  SearchResultSchema,
} from './search.js';

// Processing schemas
export {
  type BuildRequest,
  BuildRequestSchema,
  type BuildResponse,
  BuildResponseSchema,
  type ExtractionMetadata,
  ExtractionMetadataSchema,
  type ExtractRequest,
  ExtractRequestSchema,
  type ExtractResponse,
  ExtractResponseSchema,
  type GenerateRequest,
  GenerateRequestSchema,
  type GenerateResponse,
  GenerateResponseSchema,
  ProcessingParamsSchema,
} from './processing.js';

// API key schemas
export {
  ApiKeyIdParamSchema,
  type ApiKeyList,
  ApiKeyListSchema,
  type ApiKeyResponse,
  ApiKeySchema,
  AuthScopeEnum,
  type CreateApiKey,
  type CreateApiKeyResponse,
  CreateApiKeyResponseSchema,
  CreateApiKeySchema,
  type RevokeApiKeyResponse,
  RevokeApiKeyResponseSchema,
} from './api-keys.js';

// Reconciliation schemas
export {
  ForceReindexParamsSchema,
  ForceReindexResponseSchema,
  MigrateEmbeddingsRequestSchema,
  MigrateEmbeddingsResponseSchema,
  ProcessPendingRequestSchema,
  ProcessPendingResponseSchema,
  ReconciliationStatusSchema,
  RetryFailedResponseSchema,
} from './reconciliation.js';
