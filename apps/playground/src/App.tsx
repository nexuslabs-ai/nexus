import { ComponentShowcase } from './components/ComponentShowcase';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="nx:bg-background nx:text-foreground nx:min-h-screen">
      <header className="nx:border-border-default nx:border-b nx:p-4">
        <h1 className="nx:text-2xl nx:font-bold">Nexus Theme Playground</h1>
        <p className="nx:text-muted-foreground nx:text-sm">
          Dynamically switch between theme combinations
        </p>
      </header>

      <ThemeSwitcher theme={theme} setTheme={setTheme} />

      <main>
        <ComponentShowcase />
      </main>
    </div>
  );
}
