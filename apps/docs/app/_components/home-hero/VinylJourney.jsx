'use client';
import { TiltedJourney } from './TiltedJourney';

import './vinyl-journey.css';
export function VinylJourney(props) {
  return (
    <div className="vinyl-journey">
      <TiltedJourney {...props} />
    </div>
  );
}
