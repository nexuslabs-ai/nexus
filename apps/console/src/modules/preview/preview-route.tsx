import { useState } from 'react';

import { BRAND_COLOR_PRESETS } from '@nexus_ds/core/palette';
import { Button, NativeSelect, NativeSelectOption } from '@nexus_ds/react';
import { Link } from '@tanstack/react-router';

import { PageHeading } from '../../components/page-heading';
import {
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
  updatePreviewResult,
} from '../../preview/accepted-result';
import { PreviewFrame } from '../../preview/preview-frame';

export function PreviewRoute() {
  const [accepted, setAccepted] = useState(() =>
    createPreviewResult(PREVIEW_DEFAULT_STATE, 1)
  );
  const [error, setError] = useState(false);
  const [resetId, setResetId] = useState(0);

  function changePreview(patch: Parameters<typeof updatePreviewResult>[1]) {
    try {
      setAccepted(updatePreviewResult(accepted, patch));
      setError(false);
    } catch {
      setError(true);
    }
  }

  function resetPreview() {
    try {
      setAccepted(
        createPreviewResult(PREVIEW_DEFAULT_STATE, accepted.render.revision + 1)
      );
      setError(false);
      setResetId(resetId + 1);
    } catch {
      setError(true);
    }
  }

  return (
    <div className="nx:space-y-8" data-slot="component-preview">
      <header className="nx:space-y-4">
        <p className="nx:typography-label-small nx:text-muted-foreground">
          COMPONENT PREVIEW
        </p>
        <PageHeading title="Component preview" />
        <p className="nx:max-w-2xl nx:text-muted-foreground">
          Change the preview’s brand color or switch between light and dark. The
          Console around it keeps its own appearance.
        </p>
      </header>
      <div className="nx:grid nx:items-start nx:gap-8 nx:lg:grid-cols-2">
        <section aria-label="Preview controls" className="nx:space-y-6">
          <div className="nx:flex nx:flex-col nx:gap-2">
            <label
              htmlFor="preview-brand"
              className="nx:typography-label-small"
            >
              Preview brand color
            </label>
            <NativeSelect
              id="preview-brand"
              value={accepted.state.brandColor}
              onChange={(event) =>
                changePreview({ brandColor: event.target.value })
              }
            >
              {BRAND_COLOR_PRESETS.map((preset) => (
                <NativeSelectOption key={preset.value} value={preset.color}>
                  {preset.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="nx:flex nx:flex-col nx:gap-2">
            <label htmlFor="preview-mode" className="nx:typography-label-small">
              Preview appearance
            </label>
            <NativeSelect
              id="preview-mode"
              value={accepted.state.mode}
              onChange={(event) =>
                changePreview({
                  mode: event.target.value === 'dark' ? 'dark' : 'light',
                })
              }
            >
              <NativeSelectOption value="light">Light</NativeSelectOption>
              <NativeSelectOption value="dark">Dark</NativeSelectOption>
            </NativeSelect>
          </div>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            These are real Nexus components. Open the dialog or look closer at a
            floating surface to see the theme across layers.
          </p>
          <Button variant="outline" onClick={resetPreview}>
            Reset preview
          </Button>
          {error && (
            <p role="alert" className="nx:text-error-foreground">
              This theme could not be calculated. The preview shows the last
              successful result. Try another color or reset.
            </p>
          )}
        </section>
        <PreviewFrame key={resetId} result={accepted.render} />
      </div>
      <Button variant="link" asChild>
        <Link to="/explore">Explore the tokens behind it</Link>
      </Button>
    </div>
  );
}
