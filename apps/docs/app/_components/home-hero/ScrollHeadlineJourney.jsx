'use client';

import { useEffect, useRef, useState } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';

import {
  groups,
  StackedHeadlineJourney,
  StackedTileGroup,
} from './StackedHeadlineJourney';
import { TiltedCtaJourney } from './TiltedCtaJourney';

import './scroll-headline-journey.css';

export function smoothStep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function ScrollHeadlineJourney({
  children,
  Panel = ScrollHeadlinePanel,
  ...props
}) {
  const track = useRef(null);
  const stage = useRef(null);
  const [progress, setProgress] = useState(0);
  const slide = Math.min(2, Math.floor(progress * 3));
  const { state } = useNxdsAppearance();
  const reduceMotion = state.prefs.reduceMotion;

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    function measure() {
      frame = 0;
      if (!track.current || !stage.current) return;
      const rect = track.current.getBoundingClientRect();
      const distance = rect.height - stage.current.offsetHeight;
      if (distance <= 0) return;
      const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
      const progress = Math.max(0, Math.min(1, (inset - rect.top) / distance));
      setProgress(progress);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(track.current);
    observer.observe(stage.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  if (reduceMotion)
    return (
      <StackedHeadlineJourney {...props}>{children}</StackedHeadlineJourney>
    );

  return (
    <div className="scroll-headline-journey">
      <div className="scroll-headline-track" ref={track}>
        <div className="scroll-headline-stage" ref={stage}>
          <div
            className="rotating-headline-journey stacked-headline-journey"
            data-slide="0"
            data-scroll-slide={slide}
          >
            <TiltedCtaJourney
              {...props}
              details={[]}
              customizationHeading={
                <div className="scroll-headline-panels">
                  {groups.map((group, index) => (
                    <Panel
                      key={group.title}
                      group={group}
                      index={index}
                      progress={progress}
                      slide={slide}
                      tuning={props.tuning}
                    />
                  ))}
                </div>
              }
            />
          </div>
          <p
            className="scroll-headline-progress"
            aria-hidden={progress >= 0.95}
            style={{ opacity: 1 - smoothStep((progress - 0.85) / 0.1) }}
          >
            Scroll to explore
          </p>
        </div>
      </div>
      <div className="scroll-headline-mobile">
        <StackedHeadlineJourney {...props} />
      </div>
      {children}
    </div>
  );
}

function ScrollHeadlinePanel({ group, index, progress, slide, tuning }) {
  const enter = index === 0 ? 1 : smoothStep((progress - index / 3) / 0.09);
  const leave =
    index === 2 ? 0 : smoothStep((progress - (index + 1) / 3 + 0.09) / 0.09);
  const opacity = enter * (1 - leave);
  return (
    <div
      className="scroll-headline-panel"
      inert={index !== slide || opacity === 0}
      aria-hidden={index !== slide}
      style={{
        opacity,
        transform: `translateY(${(1 - enter - leave) * 18}px)`,
      }}
    >
      <StackedTileGroup {...group} tuning={tuning} />
    </div>
  );
}
