import { ComponentShowcase } from './components/ComponentShowcase';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border-default border-b p-4">
        <h1 className="text-2xl font-bold">Nexus Theme Playground</h1>
        <p className="text-muted-foreground text-sm">
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
