/**
 * MCP Resources
 *
 * Exports all MCP resource handlers, URIs, and metadata.
 * Resources are read-only data that AI assistants can access.
 */

export {
  COMPONENT_CATALOG_DESCRIPTION,
  COMPONENT_CATALOG_NAME,
  COMPONENT_CATALOG_URI,
  handleComponentCatalog,
} from './component-catalog.js';
export {
  handleIndexStats,
  INDEX_STATS_DESCRIPTION,
  INDEX_STATS_NAME,
  INDEX_STATS_URI,
} from './index-stats.js';
