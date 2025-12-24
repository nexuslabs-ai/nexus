import { ComponentShowcase } from './components/ComponentShowcase';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border-default p-4">
        <h1 className="text-2xl font-bold">Nexus Theme Playground</h1>
        <p className="text-sm text-muted-foreground">
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
