'use client';
import { useState } from 'react';

import { BRAND_COLOR_PRESETS } from '@nexus_ds/core/palette';
import { Button, NativeSelect, NativeSelectOption } from '@nexus_ds/react';

import {
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
  updatePreviewResult,
} from './preview/accepted-result';
import { PreviewFrame } from './preview/preview-frame';
export function CreateWorkspace() {
  const [accepted, setAccepted] = useState(() =>
    createPreviewResult(PREVIEW_DEFAULT_STATE, 1)
  );
  return (
    <div className="nx:p-6 nx:space-y-6">
      <h1 className="nx:typography-heading-large">Create your Nexus</h1>
      <label className="nx:flex nx:flex-col nx:gap-2">
        Brand color
        <NativeSelect
          value={accepted.state.brandColor}
          onChange={(e) =>
            setAccepted(
              updatePreviewResult(accepted, { brandColor: e.target.value })
            )
          }
        >
          {BRAND_COLOR_PRESETS.map((p) => (
            <NativeSelectOption key={p.value} value={p.color}>
              {p.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <Button
        onClick={() =>
          setAccepted(
            updatePreviewResult(accepted, {
              mode: accepted.state.mode === 'light' ? 'dark' : 'light',
            })
          )
        }
      >
        Switch appearance
      </Button>
      <PreviewFrame result={accepted.render} />
    </div>
  );
}
