'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';

import './tile-wheel.css';

export function TileWheel({ details, colors, tuning }) {
  const { state } = useNxdsAppearance();
  const reduceMotion = state.prefs.reduceMotion;
  const count = details.length;
  const wheelId = useId();
  const [position, setPosition] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const dragged = useRef(false);
  const selected = ((Math.round(position) % count) + count) % count;
  useEffect(() => {
    if (
      reduceMotion ||
      interacted ||
      tuning?.autoTour === false ||
      position >= count
    )
      return;
    const timer = setTimeout(
      () => setPosition((p) => p + 1),
      position === 0 ? 3200 : (tuning?.holdMs ?? 1300)
    );
    return () => clearTimeout(timer);
  }, [
    reduceMotion,
    position,
    interacted,
    count,
    tuning?.autoTour,
    tuning?.holdMs,
  ]);
  function advance(delta) {
    setInteracted(true);
    setPosition((p) => Math.round(p) + delta);
  }
  function select(index) {
    if (dragged.current) return;
    setInteracted(true);
    const delta =
      ((index - selected + count + Math.floor(count / 2)) % count) -
      Math.floor(count / 2);
    setPosition((p) => Math.round(p) + delta);
  }
  function keyDown(event) {
    dragged.current = false;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      advance(event.key === 'ArrowRight' ? 1 : -1);
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : count - 1);
    }
  }
  function pointerDown(event) {
    if (event.button !== 0) return;
    setInteracted(true);
    dragged.current = false;
    drag.current = { x: event.clientX, position };
  }
  function pointerMove(event) {
    if (!drag.current) return;
    const distance = event.clientX - drag.current.x;
    if (Math.abs(distance) > 4) {
      dragged.current = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setPosition(drag.current.position - distance / 85);
  }
  function finishDrag() {
    drag.current = null;
    setDragging(false);
    setPosition((p) => Math.round(p));
  }
  return (
    <div
      className="tile-wheel journey-enter"
      style={{
        '--arrival': '900ms',
        '--wheel-depth': `${tuning?.depth ?? 150}px`,
      }}
    >
      <div
        className="wheel-stage"
        role="listbox"
        aria-activedescendant={`${wheelId}-${selected}`}
        aria-label="Customize every detail — rotating wheel"
        data-dragging={dragging}
        tabIndex={0}
        onKeyDown={keyDown}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
      >
        <div
          className="wheel-rotor"
          style={{ '--wheel-rotation': `${(-position * 360) / count}deg` }}
        >
          {details.map(([label, Icon, colorIndex], index) => {
            const angle = ((index - position) * Math.PI * 2) / count;
            const front = Math.cos(angle);
            const behind = front <= 0;
            return (
              <button
                type="button"
                key={label}
                className="wheel-tile"
                aria-label={label}
                role="option"
                id={`${wheelId}-${index}`}
                aria-selected={selected === index}
                aria-hidden={behind || undefined}
                tabIndex={selected === index ? 0 : -1}
                data-behind={behind}
                onClick={() => select(index)}
                onFocus={() => setInteracted(true)}
                style={{
                  ...colors[colorIndex ?? index],
                  '--wheel-angle': `${(index * 360) / count}deg`,
                }}
                data-front={selected === index}
              >
                <Icon aria-hidden="true" />
                <span className="wheel-label" aria-hidden="true">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
