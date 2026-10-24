import { invitationAppearance } from './coexistence-appearance.mjs';

const fields = {
  MUI: [
    "import { TextField, MenuItem } from '@mui/material';",
    `      <TextField name="email" label="Email" type="email" required />
      <TextField select label="Role" defaultValue="Member">
        <MenuItem value="Member">Member</MenuItem>
        <MenuItem value="Admin">Admin</MenuItem>
      </TextField>`,
  ],
  'Ant Design': [
    "import { Input, Select } from 'antd';",
    `      <label>Email<Input name="email" type="email" required /></label>
      <Select aria-label="Role" defaultValue="Member"
        options={['Member', 'Admin'].map(value => ({ value }))}
      />`,
  ],
  'shadcn/ui': [
    `import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue,
  SelectContent, SelectGroup, SelectItem
} from '@/components/ui/select';`,
    `      <label>Email<Input name="email" type="email" required /></label>
      <Select defaultValue="Member">
        <SelectTrigger aria-label="Role"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>
          <SelectItem value="Member">Member</SelectItem>
          <SelectItem value="Admin">Admin</SelectItem>
        </SelectGroup></SelectContent>
      </Select>`,
  ],
};
export const integrationSamples = Object.fromEntries(
  Object.entries(fields).flatMap(([name, [hostImport, controls]]) => [
    [
      `${name}:component`,
      `${hostImport}
import { Button } from '@/components/nexus-kit';

export function InviteForm({ onInvite }) {
  return (
    <form onSubmit={onInvite}>
${controls}
      <Button type="submit" size="sm">
        Send invitation
      </Button>
    </form>
  );
}`,
    ],
    ...['light', 'dark'].map((mode) => [
      `${name}:appearance:${mode}`,
      `import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

const preset = ${JSON.stringify(invitationAppearance(name, mode), null, 2)};
const appearance = {
  ...DEFAULT_NXDS_APPEARANCE,
  ...preset,
  prefs: { ...DEFAULT_NXDS_APPEARANCE.prefs, ...preset.prefs },
};

// Inside the isolated preview document.
// Keep your existing library's theme provider too.
<NxdsAppearanceProvider state={appearance}
  storageKey={false} cookieWriteKey={false}>
  <InviteForm />
</NxdsAppearanceProvider>`,
    ]),
  ])
);

for (const name of Object.keys(fields)) {
  const hostImport =
    name === 'MUI'
      ? "import { Button } from '@mui/material';"
      : name === 'Ant Design'
        ? "import { Button } from 'antd';"
        : "import { Button } from '@/components/ui/button';";
  integrationSamples[`${name}:command`] = `import { useState } from 'react';
${hostImport}
import { CommandDialog, CommandInput, CommandList,
  CommandEmpty, CommandGroup, CommandItem
} from '@/components/nexus-kit';

export function ProjectSearch({ projects, onOpenProject }) {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>Search projects…</Button>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a project…" />
      <CommandList>
        <CommandEmpty>No projects found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects.map(project => (
            <CommandItem key={project.name} onSelect={() => {
              onOpenProject(project);
              setOpen(false);
            }}>Open {project.name}</CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </>;
}`;
  for (const mode of ['light', 'dark']) {
    integrationSamples[`${name}:command-appearance:${mode}`] =
      integrationSamples[`${name}:appearance:${mode}`].replace(
        '<InviteForm />',
        '<CommandWorkspace />'
      );
  }
}

integrationSamples['css-comparison'] = `// SAME BASELINE IN BOTH PREVIEWS
// MUI: ThemeProvider + CssBaseline
// Ant Design: ConfigProvider + antd/dist/reset.css
// Settings controls + a native HTML help block.

// LEFT: the copied shadcn global stylesheet
@import "tailwindcss"; // includes Preflight
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
}
// Preflight includes:
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
ol, ul, menu { list-style: none; }
*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; }

// RIGHT: Nexus styles, without Preflight
@import "@nxds/tailwind";
// Use NxdsAppearanceProvider in the isolated document.
// It writes --nx-* tokens and appearance settings.
// Existing host globals and component themes stay in place.

// The table compares computed styles of existing elements.
// The newly added Invite button is excluded from measurement.`;
