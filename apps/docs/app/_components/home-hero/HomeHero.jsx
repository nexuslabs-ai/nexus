'use client';

import { useSyncExternalStore } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';
import dynamic from 'next/dynamic';

import { CtaJourney } from './CtaJourney';
import { FeatureStripJourney } from './FeatureStripJourney';
import { FoilJourney } from './FoilJourney';
import { HeadlineJourney } from './HeadlineJourney';
import { InlineStacksJourney } from './InlineStacksJourney';
import { RotatingHeadlineJourney } from './RotatingHeadlineJourney';
import { ScrollHeadlineJourney } from './ScrollHeadlineJourney';
import { StackedHeadlineJourney } from './StackedHeadlineJourney';
import { TileShuffleJourney } from './TileShuffleJourney';
import { TiltedCtaJourney } from './TiltedCtaJourney';
import { TiltedJourney } from './TiltedJourney';
import { VinylJourney } from './VinylJourney';
import { WorkbenchJourney } from './WorkbenchJourney';

const HeroDialLab = dynamic(
  () => import('./HeroDialLab').then((module) => module.HeroDialLab),
  { ssr: false }
);
function subscribe(callback) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}
function readSearch() {
  return window.location.search;
}
function serverSearch() {
  return '';
}

export function HomeHero({ children }) {
  const { resolvedMode } = useNxdsAppearance();
  const search = useSyncExternalStore(subscribe, readSearch, serverSearch);
  const params = new URLSearchParams(search);
  const iteration = params.get('iteration') ?? 'tilted-cta';
  if (params.has('tune'))
    return <HeroDialLab mode={resolvedMode}>{children}</HeroDialLab>;
  if (iteration === 'tile-shuffle')
    return (
      <TileShuffleJourney mode={resolvedMode}>{children}</TileShuffleJourney>
    );
  if (iteration === 'scroll-headlines')
    return (
      <ScrollHeadlineJourney mode={resolvedMode}>
        {children}
      </ScrollHeadlineJourney>
    );
  if (iteration === 'stacked-headlines')
    return (
      <StackedHeadlineJourney mode={resolvedMode}>
        {children}
      </StackedHeadlineJourney>
    );
  if (iteration === 'rotating')
    return (
      <RotatingHeadlineJourney mode={resolvedMode}>
        {children}
      </RotatingHeadlineJourney>
    );
  if (iteration === 'foil') return <FoilJourney />;
  if (iteration === 'vinyl')
    return <VinylJourney mode={resolvedMode}>{children}</VinylJourney>;
  if (iteration === 'tilted-cta')
    return <TiltedCtaJourney mode={resolvedMode}>{children}</TiltedCtaJourney>;
  if (iteration === 'tilted')
    return <TiltedJourney mode={resolvedMode}>{children}</TiltedJourney>;
  if (iteration === 'strip')
    return (
      <FeatureStripJourney mode={resolvedMode}>{children}</FeatureStripJourney>
    );
  if (iteration === 'cta')
    return <CtaJourney mode={resolvedMode}>{children}</CtaJourney>;
  if (iteration === 'stacks')
    return (
      <InlineStacksJourney mode={resolvedMode}>{children}</InlineStacksJourney>
    );
  if (iteration === 'headline')
    return <HeadlineJourney mode={resolvedMode}>{children}</HeadlineJourney>;
  return (
    <WorkbenchJourney
      key={iteration}
      mode={resolvedMode}
      compact={iteration !== 'workbench' && iteration !== 'wheel'}
      wheel={iteration === 'wheel'}
      tuning={undefined}
    >
      {children}
    </WorkbenchJourney>
  );
}
