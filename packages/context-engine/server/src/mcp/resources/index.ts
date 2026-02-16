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
  COMPONENT_DETAIL_DESCRIPTION,
  COMPONENT_DETAIL_NAME,
  COMPONENT_DETAIL_URI_PATTERN,
  handleComponentDetail,
} from './component-detail.js';
export {
  COMPONENT_EXAMPLES_DESCRIPTION,
  COMPONENT_EXAMPLES_NAME,
  COMPONENT_EXAMPLES_URI_PATTERN,
  handleComponentExamples,
} from './component-examples.js';
export {
  COMPONENT_GUIDANCE_DESCRIPTION,
  COMPONENT_GUIDANCE_NAME,
  COMPONENT_GUIDANCE_URI_PATTERN,
  handleComponentGuidance,
} from './component-guidance.js';
export {
  COMPONENT_PROPS_DESCRIPTION,
  COMPONENT_PROPS_NAME,
  COMPONENT_PROPS_URI_PATTERN,
  handleComponentProps,
} from './component-props.js';
export {
  handleIndexStats,
  INDEX_STATS_DESCRIPTION,
  INDEX_STATS_NAME,
  INDEX_STATS_URI,
} from './index-stats.js';
