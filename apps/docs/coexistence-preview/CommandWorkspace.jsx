import { useEffect, useRef, useState } from 'react';

import { Button as MuiButton, createTheme, ThemeProvider } from '@mui/material';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@nxds/react';
import { Button as AntButton, ConfigProvider, theme as antTheme } from 'antd';

import { Button as ShadcnButton } from './ui/button';

const projects = [
  {
    name: 'Website redesign',
    detail: 'Refresh the marketing site and launch the new brand.',
    status: 'In progress',
    tasks: 12,
  },
  {
    name: 'Mobile app',
    detail: 'Bring the workspace to your team on the go.',
    status: 'Planning',
    tasks: 8,
  },
  {
    name: 'Design system',
    detail: 'Build shared components for every product team.',
    status: 'In progress',
    tasks: 24,
  },
];

export default function CommandWorkspace({ library, mode }) {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(projects[0]);
  const trigger = useRef(null);
  useEffect(() => {
    function shortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);
  function chooseProject(next) {
    setProject(next);
    setOpen(false);
  }
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);
  // Host buttons keep their own library's implementation and theme.
  const HostButton =
    library === 'MUI'
      ? MuiButton
      : library === 'Ant Design'
        ? AntButton
        : ShadcnButton;
  const searchProps =
    library === 'MUI'
      ? { variant: 'outlined', size: 'small' }
      : library === 'Ant Design'
        ? {}
        : { variant: 'outline' };
  const workspace = (
    <div className="preview-app command-workspace">
      <div className="preview-bar">
        <span>Acme / Workspace</span>
        <span>Projects</span>
      </div>
      <div className="workspace-content">
        <HostButton
          {...searchProps}
          ref={trigger}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          Search projects…
        </HostButton>
        <p className="workspace-hint">
          Click search, or use ⌘K / Ctrl K while inside this preview.
        </p>
        <nav className="workspace-projects" aria-label="Projects">
          {projects.map((item) => (
            <HostButton
              key={item.name}
              {...searchProps}
              aria-pressed={project.name === item.name}
              onClick={() => setProject(item)}
            >
              {item.name}
            </HostButton>
          ))}
        </nav>
        <section
          className="workspace-detail"
          aria-label="Selected project"
          aria-live="polite"
        >
          <span className="workspace-hint">{project.status}</span>
          <h3>{project.name}</h3>
          <p>{project.detail}</p>
          <span className="workspace-hint">
            {project.tasks} open tasks · Product team
          </span>
        </section>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search projects"
        description="Choose a project to open in your workspace."
        className="nx:left-4 nx:right-4 nx:w-auto nx:translate-x-0"
      >
        <CommandInput placeholder="Find a project…" />
        <CommandList>
          <CommandEmpty>No projects found.</CommandEmpty>
          <CommandGroup heading="Projects">
            {projects.map((item) => (
              <CommandItem key={item.name} onSelect={() => chooseProject(item)}>
                Open {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
  if (library === 'MUI')
    return (
      <ThemeProvider
        theme={createTheme({ palette: { mode, primary: { main: '#1976d2' } } })}
      >
        {workspace}
      </ThemeProvider>
    );
  if (library === 'Ant Design')
    return (
      <ConfigProvider
        theme={{
          algorithm:
            mode === 'dark'
              ? antTheme.darkAlgorithm
              : antTheme.defaultAlgorithm,
          token: { colorPrimary: '#1677ff' },
        }}
      >
        {workspace}
      </ConfigProvider>
    );
  return workspace;
}
