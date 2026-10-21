/**
 * Wrap the provider's runtime CSS in the `nx-runtime` layer. The order
 * statement ranks it after Tailwind's layers whichever stylesheet loads first,
 * so it overrides the generated `@layer theme` defaults and unlayered CSS
 * overrides it.
 */
export function inRuntimeLayer(css: string): string {
  return `@layer properties, theme, base, components, utilities, nx-runtime;\n@layer nx-runtime {\n${css}\n}\n`;
}
