'use client';

import { lazy, Suspense } from 'react';

import { useDialKitController } from 'dialkit';

import { CoexistenceCode } from './CoexistenceCode';

const AdoptionComparisons = lazy(() => import('./AdoptionComparisons'));
const CssComparison = lazy(() => import('./CssComparison'));
const VisualExamples = lazy(() => import('./CoexistenceVisuals'));
const config = {
  iteration: {
    type: 'select',
    options: [
      { value: 'adoption-slider', label: 'Adoption comparison slider' },
      { value: 'adoption', label: 'Three adoption paths · side by side' },
      { value: 'code', label: 'Invite form' },
      { value: 'command', label: 'Command menu' },
      { value: 'css-comparison', label: 'CSS coexistence comparison' },
      { value: 'add', label: 'Add one component' },
      { value: 'side', label: 'Side-by-side controls' },
      { value: 'origins', label: 'Annotated app' },
    ],
    default: 'adoption-slider',
  },
};

export function CoexistenceSection({ docsBase = '' }) {
  const dial = useDialKitController('App studio', config, {
    id: 'nexus-coexistence-studio-v2',
    persist: true,
  });
  if (['adoption', 'adoption-slider'].includes(dial.values.iteration))
    return (
      <Suspense fallback={<p role="status">Loading adoption examples…</p>}>
        <AdoptionComparisons
          reveal={dial.values.iteration === 'adoption-slider'}
        />
      </Suspense>
    );
  if (dial.values.iteration === 'css-comparison')
    return (
      <Suspense fallback={<p role="status">Loading comparison…</p>}>
        <CssComparison />
      </Suspense>
    );
  if (dial.values.iteration === 'code')
    return <CoexistenceCode docsBase={docsBase} />;
  return (
    <Suspense fallback={<p role="status">Loading the component example…</p>}>
      <VisualExamples
        key={dial.values.iteration}
        iteration={dial.values.iteration}
      />
    </Suspense>
  );
}
