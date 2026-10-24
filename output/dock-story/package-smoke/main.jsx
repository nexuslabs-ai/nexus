import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Button,
  Dock,
  DockItem,
  DockLabel,
  DockPanel,
  NxdsAppearanceColorField,
  PropertySlider,
} from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

import './styles.css';
function App() {
  const [tool, setTool] = useState('settings');
  const [radius, setRadius] = useState(8);
  const [color, setColor] = useState('#3478f6');
  return (
    <NxdsAppearanceProvider>
      <main className="nx:bg-background nx:text-foreground nx:p-8">
        <h1 className="nx:typography-heading-small">Built package controls</h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            height: 500,
          }}
        >
          <Dock
            activeWidth="hug"
            defaultOpen
            value={tool}
            onValueChange={setTool}
            aria-label="Preview tools"
            panel={
              <DockPanel title="Appearance" density="compact">
                <div className="nx:grid nx:gap-2">
                  <PropertySlider
                    label="Radius"
                    value={radius}
                    onValueChange={setRadius}
                    min={0}
                    max={32}
                    unit="px"
                  />
                  <NxdsAppearanceColorField
                    variant="compact"
                    label="Brand"
                    value={color}
                    onChange={setColor}
                  />
                  <Button>Continue</Button>
                </div>
              </DockPanel>
            }
          >
            <DockItem value="settings" aria-label="Settings">
              <DockLabel>Settings</DockLabel>
            </DockItem>
            <DockItem value="preview" aria-label="Preview">
              <DockLabel>Preview</DockLabel>
            </DockItem>
          </Dock>
        </div>
      </main>
    </NxdsAppearanceProvider>
  );
}
createRoot(document.getElementById('root')).render(<App />);
