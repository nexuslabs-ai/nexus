/** Every framework the docs document, in tab order. Add one here to add a tab. */
export const FRAMEWORKS = [
  { id: 'react', label: 'React', file: 'tsx' },
  { id: 'vue', label: 'Vue', file: 'vue' },
] as const;

export type Framework = (typeof FRAMEWORKS)[number]['id'];

export const DEFAULT_FRAMEWORK: Framework = 'react';
export const FRAMEWORK_STORAGE_KEY = 'nxds-docs-framework';
/** `?framework=vue` opens a shared link on Vue and remembers it. */
export const FRAMEWORK_PARAM = 'framework';
export const FRAMEWORK_ATTRIBUTE = 'data-framework';

/**
 * Shows only the reader's framework panel before React hydrates, and without
 * JavaScript, where the default framework stands in for an unset one.
 */
export const FRAMEWORK_PANEL_CSS = `${FRAMEWORKS.map(({ id }) =>
  id === DEFAULT_FRAMEWORK
    ? `html[${FRAMEWORK_ATTRIBUTE}]:not([${FRAMEWORK_ATTRIBUTE}='${id}']) [data-framework-panel='${id}']`
    : `html:not([${FRAMEWORK_ATTRIBUTE}='${id}']) [data-framework-panel='${id}']`
).join(',')}{display:none}`;

export function frameworkLabel(framework: Framework): string {
  return FRAMEWORKS.find(({ id }) => id === framework)?.label ?? framework;
}

export function isFramework(value: unknown): value is Framework {
  return FRAMEWORKS.some((framework) => framework.id === value);
}

/**
 * Sets the reader's framework on `<html>` before first paint, so the matching
 * panel shows without a flash. Inline, so its hash is in the CSP.
 */
export const FRAMEWORK_BOOTSTRAP_SCRIPT = `(function(){try{var ids=${JSON.stringify(
  FRAMEWORKS.map((framework) => framework.id)
)};var key=${JSON.stringify(FRAMEWORK_STORAGE_KEY)};var param=new URLSearchParams(location.search).get(${JSON.stringify(
  FRAMEWORK_PARAM
)});var stored=localStorage.getItem(key);var f=ids.indexOf(param)>=0?param:ids.indexOf(stored)>=0?stored:${JSON.stringify(
  DEFAULT_FRAMEWORK
)};if(f===param)localStorage.setItem(key,f);document.documentElement.setAttribute(${JSON.stringify(
  FRAMEWORK_ATTRIBUTE
)},f);}catch(e){}})();`;
