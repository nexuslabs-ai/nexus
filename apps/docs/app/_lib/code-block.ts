/**
 * Shared surface for every docs code block — the MDX `pre` and the
 * hand-written samples in `_pages`. Syntax roles are APCA-gated against
 * `container`, so the fill token is part of the contract, not a style choice.
 */
export const CODE_BLOCK_SURFACE =
  'nx:typography-code-block nx:bg-container nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:overflow-x-auto';
