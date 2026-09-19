import { useEffect } from 'react';

import { Button } from '@nexus_ds/react';
import { Link } from '@tanstack/react-router';

import {
  applyColorDraft,
  type ColorDraftOverrides,
  removeColorDraft,
} from './color-draft';
import { useColorDraftStore } from './color-draft-store';

function draftModeSummary(overrides: ColorDraftOverrides): string {
  const values = Object.values(overrides);
  const hasLight = values.some(
    (override) => override.mode === 'light' || override.mode === 'both'
  );
  const hasDark = values.some(
    (override) => override.mode === 'dark' || override.mode === 'both'
  );

  if (hasLight && hasDark) return 'Light + dark draft';
  if (hasDark) return 'Dark draft';
  return 'Light draft';
}

export function ColorDraftSync() {
  const overrides = useColorDraftStore((state) => state.overrides);
  const resetAll = useColorDraftStore((state) => state.resetAll);
  const count = Object.keys(overrides).length;
  const modeSummary = draftModeSummary(overrides);

  useEffect(() => {
    applyColorDraft(overrides);

    return removeColorDraft;
  }, [overrides]);

  if (count === 0) return null;

  return (
    <div className="nx:fixed nx:right-4 nx:bottom-4 nx:z-toast nx:flex nx:max-w-[calc(100vw-2rem)] nx:flex-wrap nx:items-center nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-popover nx:px-3 nx:py-2 nx:text-popover-foreground nx:shadow-lg">
      <span className="nx:typography-label-small">
        {count} color {count === 1 ? 'override' : 'overrides'}
      </span>
      <span className="nx:typography-label-small nx:text-muted-foreground">
        {modeSummary}
      </span>
      <Button asChild size="sm" variant="ghost">
        <Link to="/design/color-atlas">Color Atlas</Link>
      </Button>
      <Button size="sm" variant="outline" onClick={resetAll}>
        Reset
      </Button>
    </div>
  );
}
