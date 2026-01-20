// Nexus config (nexus.json)
export {
  DEFAULT_CONFIG,
  type InstalledComponent,
  InstalledComponentSchema,
  type InstalledFile,
  InstalledFileSchema,
  type NexusConfig,
  NexusConfigSchema,
} from './nexus-config.js';

// User config (~/.nexusrc)
export { type UserConfig, UserConfigSchema } from './user-config.js';

// Registry API responses
export {
  type AuthResponse,
  AuthResponseSchema,
  type ComponentListResponse,
  ComponentListResponseSchema,
  type ComponentManifest,
  ComponentManifestSchema,
  type ComponentVersion,
  ComponentVersionSchema,
  type SourceCodeResponse,
  SourceCodeResponseSchema,
} from './registry.js';
