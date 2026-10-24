'use client';

import { useEffect, useRef } from 'react';

import { IconPaint } from '@tabler/icons-react';

import { createFoilMaterial } from './foil-material';

import './foil-journey.css';

const defaults = {
  strength: 0.7,
  sparkle: 0.35,
  roughness: 0.4,
  tilt: 12,
  autoRotate: true,
};

function FoilSample({ expanded, settings }) {
  const canvas = useRef(null);
  const card = useRef(null);
  const pointer = useRef({ x: 0, y: 0, engaged: false });
  useEffect(() => {
    const material = createFoilMaterial(canvas.current);
    const element = card.current;
    let frame;
    let x = 0;
    let y = 0;
    let last = 0;
    function render(now) {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const orbit = settings.autoRotate && !pointer.current.engaged;
      const targetX = orbit ? Math.sin(now / 1900) * 0.55 : pointer.current.x;
      const targetY = orbit ? Math.cos(now / 2400) * 0.35 : pointer.current.y;
      const blend = 1 - Math.exp(-delta * 12);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      element.style.transform = `perspective(600px) rotateX(${-y * settings.tilt}deg) rotateY(${x * settings.tilt}deg)`;
      material.draw(x, y, settings);
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      material.dispose();
    };
  }, [settings]);
  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: (0.5 - (event.clientY - rect.top) / rect.height) * 2,
      engaged: true,
    };
  }
  function leave() {
    pointer.current = { x: 0, y: 0, engaged: false };
  }
  function turn() {
    pointer.current = {
      x: pointer.current.x > 0 ? -0.7 : 0.7,
      y: 0.3,
      engaged: true,
    };
  }
  function steer(event) {
    const directions = {
      ArrowLeft: [-0.7, 0],
      ArrowRight: [0.7, 0],
      ArrowUp: [0, 0.7],
      ArrowDown: [0, -0.7],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    pointer.current = { x: direction[0], y: direction[1], engaged: true };
  }
  return (
    <div className="foil-sample">
      <div
        className="foil-hit-area"
        onPointerMove={move}
        onPointerLeave={leave}
      >
        <button
          type="button"
          onClick={turn}
          ref={card}
          className="foil-card"
          style={{ width: expanded ? 180 : 72 }}
          aria-label={`${expanded ? 'Expanded' : 'Compact'} Theme foil sticker. Use arrow keys to tilt.`}
          onKeyDown={steer}
          onBlur={leave}
        >
          <canvas
            ref={canvas}
            width={expanded ? 344 : 128}
            height={128}
            aria-hidden="true"
          />
          <span className="foil-ink">
            <IconPaint size={24} stroke={1.8} />
            {expanded && <span>Theme</span>}
          </span>
        </button>
      </div>
      <p>{expanded ? '180 × 72 · Expanded' : '72 × 72 · Compact'}</p>
    </div>
  );
}

export function FoilJourney({ tuning }) {
  const settings = tuning?.foil ?? defaults;
  return (
    <section className="foil-study">
      <p className="foil-eyebrow">Material study · 01</p>
      <h1>Foil, in the light.</h1>
      <p className="foil-description">
        One material. Two sizes. Move over a sticker to catch the light.
      </p>
      <div className="foil-samples">
        <FoilSample settings={settings} />
        <FoilSample expanded settings={settings} />
      </div>
      <p className="foil-note">
        Fine metallic grain. Angle-shifting color. Solid printed ink.
      </p>
    </section>
  );
}
