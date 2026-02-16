/**
 * MCP Tools
 *
 * Exports all MCP tool handlers and schemas.
 * Tools are pure functions that accept validated arguments and McpContext.
 */

export {
  type FindSimilarInput,
  findSimilarSchema,
  handleFindSimilar,
} from './find-similar.js';
export {
  type GetComponentInput,
  getComponentSchema,
  handleGetComponent,
} from './get-component.js';
export {
  type GetIndexStatsInput,
  getIndexStatsSchema,
  handleGetIndexStats,
} from './get-index-stats.js';
export {
  handleSearchComponents,
  type SearchComponentsInput,
  searchComponentsSchema,
} from './search-components.js';
