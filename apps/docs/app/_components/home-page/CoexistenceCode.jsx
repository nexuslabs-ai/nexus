'use client';

import { lazy, Suspense } from 'react';

const VisualExample = lazy(() => import('./CoexistenceVisuals'));

export function CoexistenceCode() {
  return (
    <Suspense fallback={<p role="status">Loading the component example…</p>}>
      <VisualExample iteration="add" />
    </Suspense>
  );
}
