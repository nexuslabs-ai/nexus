const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const HEX_BODY_RE = /^[0-9a-fA-F]{6}$/;

export function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) return trimmed.toLowerCase();
  if (HEX_BODY_RE.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  return null;
}
