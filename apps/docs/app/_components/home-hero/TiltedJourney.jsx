'use client';

import { HeadlineJourney } from './HeadlineJourney';

import './tilted-journey.css';

export function TiltedJourney(props) {
  return (
    <div className="tilted-journey">
      <HeadlineJourney {...props} />
    </div>
  );
}
