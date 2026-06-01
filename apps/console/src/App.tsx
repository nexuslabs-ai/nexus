import { useState } from 'react';

import { Button, Toaster } from '@nexus/react';

import { ComponentShowcase } from './components/ComponentShowcase';
import { SettingsScene } from './components/settings/SettingsScene';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { useTheme } from './hooks/useTheme';

type View = 'reference' | 'scenes';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState<View>('reference');

  return (
    <div className="nx:bg-background nx:text-foreground nx:min-h-screen">
      <div className="nx:flex">
        {/* Main Content */}
        <main className="nx:flex-1 nx:min-w-0">
          {/* Header */}
          <header className="nx:sticky nx:top-0 nx:z-10 nx:bg-background/95 nx:backdrop-blur nx:border-b nx:border-border-default">
            <div className="nx:px-6 nx:py-4">
              <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
                <div className="nx:flex nx:items-center nx:gap-3">
                  <div className="nx:w-8 nx:h-8 nx:rounded-lg nx:bg-primary-background nx:flex nx:items-center nx:justify-center">
                    <span className="nx:text-primary-foreground nx:font-bold nx:text-sm">
                      N
                    </span>
                  </div>
                  <div>
                    <h1 className="nx:text-lg nx:font-semibold nx:text-foreground">
                      Nexus Theme Playground
                    </h1>
                    <p className="nx:text-xs nx:text-muted-foreground">
                      Preview and customize your design system
                    </p>
                  </div>
                </div>

                {/* View switch — Reference (token showcase) ↔ Scenes (composed) */}
                <div className="nx:inline-flex nx:gap-0.5 nx:rounded-lg nx:border nx:border-border-default nx:bg-muted nx:p-0.5">
                  <Button
                    variant={view === 'reference' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('reference')}
                  >
                    Reference
                  </Button>
                  <Button
                    variant={view === 'scenes' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('scenes')}
                  >
                    Scenes
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          {view === 'reference' ? (
            <ComponentShowcase />
          ) : (
            <SettingsScene theme={theme} setTheme={setTheme} />
          )}
        </main>

        {/* Sidebar */}
        <aside className="nx:border-border-default nx:w-80 nx:shrink-0 nx:border-l">
          <div className="nx:sticky nx:top-0 nx:h-screen nx:overflow-hidden">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
          </div>
        </aside>
      </div>

      <Toaster />
    </div>
  );
}
