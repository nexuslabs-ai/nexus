import { LIGHT_SURFACE_LADDER, SURFACE_TOKENS } from '@nexus_ds/core';
import { describe, expect, it } from 'vitest';

import { collisionGroupFor, formatAnchorLabel } from './ladder-collisions';

describe('formatAnchorLabel', () => {
  it('formats base, shade, and dark-step anchors', () => {
    expect(formatAnchorLabel('base')).toBe('base');
    expect(formatAnchorLabel(150)).toBe('stone.150');
    expect(formatAnchorLabel(50, 'slate')).toBe('slate.50');
    expect(formatAnchorLabel({ step: 3.2 })).toBe('step 3.2');
  });
});

describe('collisionGroupFor', () => {
  it('derives collision siblings from the light ladder', () => {
    expect(collisionGroupFor('background', LIGHT_SURFACE_LADDER)).toEqual([
      'container',
      'popover',
    ]);
    expect(collisionGroupFor('muted', LIGHT_SURFACE_LADDER)).toEqual([
      'container-hover',
      'nav-background',
    ]);
    expect(collisionGroupFor('container-active', LIGHT_SURFACE_LADDER)).toEqual(
      ['popover-hover', 'popover-active', 'disabled']
    );
    expect(
      collisionGroupFor('control-background', LIGHT_SURFACE_LADDER)
    ).toEqual([
      'background-active',
      'nav-item-hover',
      'nav-item-active',
      'nav-border',
    ]);
  });

  it('accounts for every surface token exactly once', () => {
    expect(SURFACE_TOKENS).toHaveLength(18);
    const singletonTokens = SURFACE_TOKENS.filter(
      (token) => collisionGroupFor(token, LIGHT_SURFACE_LADDER).length === 0
    );
    expect(singletonTokens).toEqual([
      'background-hover',
      'control-background-hover',
      'border-active',
    ]);
  });
});
