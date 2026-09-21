/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/consistent-type-imports -- Ambient virtual modules require import() types for relative references. */

declare module 'virtual:nexus-token-catalog' {
  const result: import('../../../packages/core/scripts/token-catalog').CatalogResult;
  export default result;
}
declare module 'virtual:nexus-theme-inspection' {
  const result: import('../../../packages/core/scripts/token-catalog').InspectionResult;
  export default result;
}
