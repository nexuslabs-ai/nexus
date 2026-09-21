import type * as Engine from '../src/index';

export type TokenValue =
  | string
  | number
  | boolean
  | null
  | TokenValue[]
  | { [key: string]: TokenValue };
export interface TokenEmission {
  id: string;
  file: string;
  line: number;
  context: string;
  property: string;
  value: string;
  important: boolean;
  kind: 'utility' | 'theme' | 'rule';
  utility: string | null;
  variables: string[];
}
export interface TokenRecord {
  id: string;
  logicalId: string;
  namespace: string;
  family: string;
  path: string[];
  type: string;
  mode: string | null;
  variant: string | null;
  description: string | null;
  rawValue: TokenValue;
  resolvedValue: TokenValue;
  references: {
    field: string;
    reference: string;
    targetId: string;
    source: string;
    depth: number;
  }[];
  file: string | null;
  source: string;
  discovered: boolean;
  emissions: string[];
  utilityDefinitions: string[];
  themeExamples: string[];
  consumerEmissions: string[];
  notEmittedReason: string | null;
  notes: string[];
}
export interface TokenCatalog {
  schemaVersion: 1;
  build: {
    revision: string | null;
    repositoryUrl: string | null;
    input: Required<Engine.ThemeDerivationInput>;
    hasLocalChanges: boolean;
    config: Record<string, string | null>;
    contentHash: string;
    boundary: string;
  };
  counts: {
    authoredLeaves: number;
    authoredFiles: number;
    runtimeTokens: number;
    logicalTokens: number;
  };
  sources: {
    path: string;
    hash: string;
    committed: boolean;
    url: string | null;
  }[];
  records: TokenRecord[];
  emissions: TokenEmission[];
  artifacts: { file: string; hash: string }[];
}
export type CatalogResult =
  | { status: 'ready'; catalog: TokenCatalog }
  | { status: 'error'; message: string };
export type InspectionResult =
  | { status: 'ready'; inspection: Engine.ThemeInspection }
  | { status: 'error'; message: string };
export function generateTokenCatalog(options: {
  engine: typeof Engine;
  tokensDir?: string;
  repoDir?: string;
  config?: Record<string, string>;
}): Promise<{
  catalog: TokenCatalog;
  inspection: Engine.ThemeInspection;
  css: Record<string, string>;
}>;
export function indexCssArtifacts(
  files: Record<string, string>
): TokenEmission[];
