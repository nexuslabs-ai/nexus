import { useLayoutEffect, useRef } from 'react';

import { tabIcons } from './dock-icons';
import { Dock, DockItem, DockLabel, DockPanel } from './PreviousDock';

import './nexus-dock-comparison.css';

export function PreviousNexusDock({
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  hasControls,
  hugActive = false,
  compactControls = false,
  children,
}) {
  const root = useRef(null);
  const activeTool = tabs[selected];
  useLayoutEffect(() => {
    if (!hugActive) return;
    const dock = root.current;
    const item = dock?.querySelector(
      '[data-slot="dock-item"][data-state="active"]'
    );
    const label = item?.querySelector('[data-slot="dock-label"]');
    const icon = item?.querySelector('svg');
    if (!dock || !item || !label || !icon) return;
    function measure() {
      const style = getComputedStyle(item);
      const width =
        label.getBoundingClientRect().width +
        icon.getBoundingClientRect().width +
        parseFloat(style.columnGap) +
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight);
      dock.style.setProperty('--story-hug-width', `${Math.ceil(width)}px`);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(label);
    observer.observe(icon);
    return () => observer.disconnect();
  }, [hugActive, activeTool]);
  return (
    <Dock
      ref={root}
      className={hugActive ? 'nexus-hug-dock' : undefined}
      value={activeTool}
      onValueChange={(value) => onSelect(tabs.indexOf(value))}
      aria-label={title}
      panel={
        hasControls ? (
          <DockPanel
            title={activeTool}
            className={compactControls ? 'compact-nexus-panel' : undefined}
          >
            {children}
          </DockPanel>
        ) : undefined
      }
    >
      {tabs.map((tab, index) => {
        const Icon = tabIcons[tab];
        return (
          <DockItem
            key={tab}
            value={tab}
            aria-label={tab}
            id={`story-tab-${chapter}-${index}`}
            aria-controls={hasControls ? undefined : 'story-panel'}
          >
            <Icon aria-hidden="true" />
            <DockLabel>{tab}</DockLabel>
          </DockItem>
        );
      })}
    </Dock>
  );
}
