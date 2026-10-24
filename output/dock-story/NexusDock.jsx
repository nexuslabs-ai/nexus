import { Dock, DockItem, DockLabel, DockPanel } from '@nexus-dock/source';

import { tabIcons } from './dock-icons';

export function NexusDock({
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
  const activeTool = tabs[selected];
  return (
    <Dock
      activeWidth={hugActive ? 'hug' : 'roomy'}
      value={activeTool}
      onValueChange={(value) => onSelect(tabs.indexOf(value))}
      aria-label={title}
      panel={
        hasControls ? (
          <DockPanel
            title={activeTool}
            density={compactControls ? 'compact' : 'default'}
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
