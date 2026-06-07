declare const process: { env: { NODE_ENV?: string } };

/**
 * Dev-only `console.warn` for design-system usage violations — missing
 * accessible names, invalid prop combinations, and the like.
 *
 * The `process.env.NODE_ENV` check is statically replaced by consumer bundlers
 * (Next.js, Vite, etc.), so calls are tree-shaken out of production builds and
 * never reach end users.
 *
 * @param condition Emit the warning only when this is `true`.
 * @param message   The message to log.
 *
 * @example
 * ```ts
 * devWarn(isIconOnly && !hasAccessibleName, 'Badge: icon-only badge needs a label.');
 * ```
 */
export function devWarn(condition: boolean, message: string): void {
  if (process.env.NODE_ENV !== 'production' && condition) {
    console.warn(message);
  }
}
