export const DISPLAY_SHADOW_KEYS = [
  '2xs',
  'xs',
  'sm',
  'base',
  'md',
  'lg',
  'xl',
  '2xl',
];

function alphaFromHexColor(color, path) {
  if (typeof color !== 'string' || !/^#[0-9a-f]{8}$/i.test(color)) {
    throw new Error(
      `${path} must be an 8-digit hex color with alpha, got ${String(color)}`
    );
  }
  return Number.parseInt(color.slice(7, 9), 16) / 255;
}

function dimensionValue(token, path) {
  const value = token?.$value;
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof value.value !== 'number' ||
    value.unit !== 'px'
  ) {
    throw new Error(`${path} must be a px dimension token`);
  }
  return value.value;
}

function isInsetLayer(layer) {
  return layer?.inset === true || layer?.inset?.$value === true;
}

export function shadowStrengthScore(modeData) {
  let score = 0;

  for (const key of DISPLAY_SHADOW_KEYS) {
    const shadow = modeData[key];
    if (!shadow || typeof shadow !== 'object') {
      throw new Error(`Missing display shadow key "${key}"`);
    }

    for (const [layerName, layer] of Object.entries(shadow)) {
      if (isInsetLayer(layer)) continue;

      const path = `${key}.${layerName}`;
      const x = dimensionValue(layer.x, `${path}.x`);
      const y = dimensionValue(layer.y, `${path}.y`);
      const blur = dimensionValue(layer.blur, `${path}.blur`);
      const spread = dimensionValue(layer.spread, `${path}.spread`);
      const alpha = alphaFromHexColor(layer.color?.$value, `${path}.color`);

      score +=
        alpha *
        (Math.abs(y) +
          Math.abs(x) * 0.25 +
          blur * 0.5 +
          Math.max(spread, 0) * 0.25);
    }
  }

  return score;
}
