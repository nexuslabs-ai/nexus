import { expect } from 'storybook/test';

function resolveCssColor(element: Element, color: string) {
  const probe = element.ownerDocument.createElement('span');
  probe.style.color = color;
  element.ownerDocument.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

export function expectInsetOutlinePseudoElement(
  element: Element | null,
  {
    token,
    missingMessage = 'element not found',
  }: {
    token: string;
    missingMessage?: string;
  }
) {
  if (!element) throw new Error(missingMessage);

  const expectedColor = resolveCssColor(
    element,
    getComputedStyle(element).getPropertyValue(token).trim()
  );
  const afterStyles = getComputedStyle(element, '::after');

  expect(afterStyles.outlineStyle).toBe('solid');
  expect(afterStyles.outlineWidth).toBe('1px');
  expect(afterStyles.outlineOffset).toBe('-1px');
  expect(afterStyles.outlineColor).toBe(expectedColor);
}
