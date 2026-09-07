/**
 * Shared surface for every docs code block — the MDX `pre` and the
 * hand-written samples in `_pages`. Both are tab stops — Shiki sets `tabindex`
 * on the `pre` it emits, `CodeSample` sets its own — so the focus ring travels
 * with the surface.
 */
export const CODE_BLOCK_SURFACE =
  'nx:typography-code-block nx:bg-container nx:border nx:border-border-default nx:rounded-md nx:p-4 nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)';
