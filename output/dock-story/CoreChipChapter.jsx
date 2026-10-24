import { useState } from 'react';

import {
  IconAdjustmentsHorizontal,
  IconBorderAll,
  IconBrightness,
  IconDeviceDesktop,
  IconLayersIntersect,
  IconShadow,
  IconStack2,
  IconWaveSine,
} from '@tabler/icons-react';

import { tabIcons } from './dock-icons';

import './framework-chapter.css';
import './core-chip-chapter.css';

const inputs = [
  ['Brand color', tabIcons.Colors],
  ['Surfaces', IconStack2],
  ['Contrast', IconBrightness],
  ['Typography', tabIcons.Typography],
  ['Spacing', tabIcons.Spacing],
  ['Radius', tabIcons.Radius],
  ['Borders', IconBorderAll],
  ['Shadows', IconShadow],
  ['Motion', IconWaveSine],
  ['Easing', IconAdjustmentsHorizontal],
  ['Breakpoints', IconDeviceDesktop],
  ['Layering', IconLayersIntersect],
];

const inputGroups = [
  { name: 'Theme inputs', lane: 'theme', items: inputs.slice(0, 3) },
  { name: 'Token and preset inputs', lane: 'preset', items: inputs.slice(3) },
];

const frameworks = [
  ['React', 'Components'],
  ['Vue', 'Growing library'],
  ['Svelte', 'Q1 ’27', true],
  ['Angular', 'Q1 ’27', true],
  ['React Native', 'Q1 ’27', true],
];

const modules = [
  { name: 'Theme engine', className: 'chip-engine', lane: 'theme' },
  { name: 'Semantic colors', className: 'chip-colors', lane: 'theme' },
  { name: 'Tokens & presets', className: 'chip-presets', lane: 'preset' },
  { name: 'Token values', className: 'chip-values', lane: 'preset' },
  { name: 'Shared theme', className: 'chip-shared', lane: 'shared' },
];

function FlowTrace({ className = '', active }) {
  return (
    <span
      className={`chip-trace ${className}`}
      data-flowing={active}
      aria-hidden="true"
    >
      <i />
    </span>
  );
}

export function CoreChipChapter({ framework, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const active = hovered ?? focused;
  const activeGroup = inputGroups.find(({ items }) =>
    items.some(([name]) => name === active)
  );
  const activeModule = modules.find(({ name }) => name === active);
  const activeFramework = frameworks.find(([name]) => name === active);
  const allLanes = activeModule?.lane === 'shared' || Boolean(activeFramework);
  const activeLane = activeGroup?.lane ?? activeModule?.lane;
  const themeFlow = allLanes || activeLane === 'theme';
  const presetFlow = allLanes || activeLane === 'preset';

  function enterNode(event) {
    setHovered(event.currentTarget.dataset.flowNode);
  }

  function leaveNode() {
    setHovered(null);
  }

  function focusNode(event) {
    if (event.currentTarget.matches(':focus-visible')) setHovered(null);
    setFocused(event.currentTarget.dataset.flowNode);
  }

  function blurNode() {
    setFocused(null);
  }

  const nodeEvents = {
    onPointerEnter: enterNode,
    onPointerLeave: leaveNode,
    onFocus: focusNode,
    onBlur: blurNode,
    onClick: focusNode,
  };

  return (
    <div className="framework-chapter story-chapter-content">
      <div
        className="framework-flow chip-flow"
        data-flow-source={active ?? undefined}
        data-flow-motion={Boolean(hovered)}
      >
        <div className="framework-token-group">
          <span className="framework-column-label">Design tokens</span>
          <div className="chip-token-container">
            {inputGroups.map(({ name: groupName, lane, items }) => (
              <div
                className="chip-token-lane"
                role="group"
                aria-label={groupName}
                key={groupName}
              >
                {items.map(([name, Icon]) => {
                  const flowing = activeGroup
                    ? active === name
                    : lane === 'theme'
                      ? themeFlow
                      : presetFlow;
                  return (
                    <button
                      type="button"
                      className="framework-token"
                      data-flow-node={name}
                      data-flowing={flowing}
                      {...nodeEvents}
                      key={name}
                    >
                      <Icon size={24} stroke={1.5} aria-hidden="true" />
                      <span>{name}</span>
                      <FlowTrace
                        className="chip-trace-input"
                        active={flowing}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="framework-core-column">
          <span className="framework-column-label">Nexus core</span>
          <div
            className="chip-core"
            role="group"
            aria-label="Nexus core: brand color, surfaces and contrast feed the theme engine to derive semantic colors. The remaining tokens supply token values through tokens and presets. Both contribute to the shared theme."
          >
            {modules.map(({ name, className, lane }) => {
              const flowing =
                lane === 'shared'
                  ? Boolean(active)
                  : lane === 'theme'
                    ? themeFlow
                    : presetFlow;
              return (
                <button
                  type="button"
                  className={`chip-module ${className}`}
                  data-flow-node={name}
                  data-flowing={flowing}
                  {...nodeEvents}
                  key={name}
                >
                  {name}
                  {lane !== 'shared' && <FlowTrace active={flowing} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="framework-output-group">
          <span className="framework-column-label">Frameworks</span>
          <div className="framework-destinations">
            {frameworks.map(([name, status, planned], index) => {
              const Icon = tabIcons[name];
              const flowing =
                Boolean(active) && (!activeFramework || active === name);
              return (
                <button
                  type="button"
                  className="framework-destination chip-destination"
                  data-active={name === framework}
                  data-planned={planned || undefined}
                  data-flow-node={name}
                  data-flowing={flowing}
                  aria-pressed={name === framework}
                  {...nodeEvents}
                  onClick={() => onSelect(index)}
                  key={name}
                >
                  <Icon size={40} stroke={1.5} aria-hidden="true" />
                  <strong>{name}</strong>
                  <span
                    className="chip-status"
                    aria-label={planned ? 'Planned for Q1 2027' : undefined}
                  >
                    {status}
                  </span>
                  <FlowTrace className="chip-trace-output" active={flowing} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
