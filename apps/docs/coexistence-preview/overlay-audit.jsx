import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  createTheme,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  ThemeProvider,
} from '@mui/material';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@nxds/react';
import {
  Button as NButton,
  Checkbox as NCheckbox,
  Input as NInput,
  RadioGroup as NRadioGroup,
  RadioGroupItem as NRadioGroupItem,
  Switch as NSwitch,
  Tabs as NTabs,
  TabsContent as NTabsContent,
  TabsList as NTabsList,
  TabsTrigger as NTabsTrigger,
  Textarea as NTextarea,
} from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import { ConfigProvider, Modal, theme } from 'antd';
import { Command as CommandPrimitive } from 'cmdk';

import { Popover, PopoverContent, PopoverTrigger } from './ui/audit-popover';
import { Button } from './ui/button';
import { Checkbox as SCheckbox } from './ui/checkbox';
import { Input } from './ui/input';
import {
  RadioGroup as SRadioGroup,
  RadioGroupItem as SRadioGroupItem,
} from './ui/radio-group';
import { Switch as SSwitch } from './ui/switch';
import {
  Tabs as STabs,
  TabsContent as STabsContent,
  TabsList as STabsList,
  TabsTrigger as STabsTrigger,
} from './ui/tabs';
import { Textarea as STextarea } from './ui/textarea';
const params = new URLSearchParams(location.search);
const host = params.get('host') || 'mui';
const kit = params.get('kit') || 'shadcn';
document.documentElement.classList.add('dark');
if (host === 'ant' && params.get('reset') !== 'off')
  await import('antd/dist/reset.css');
if (kit === 'shadcn') await import('./audit-shadcn.css');
else await import('./nexus.css');
const options = ['Design team', 'Engineering', 'Marketing'];
function Selector() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('Choose team');
  function select(v) {
    setValue(v);
    setOpen(false);
  }
  if (kit === 'nexus')
    return (
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger>{value}</ComboboxTrigger>
        <ComboboxContent label="Teams">
          <ComboboxInput placeholder="Search teams" />
          <ComboboxList>
            <ComboboxEmpty>No teams</ComboboxEmpty>
            {options.map((x) => (
              <ComboboxItem key={x} value={x} onSelect={() => select(x)}>
                {x}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">{value}</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Teams">
        <CommandPrimitive>
          <CommandPrimitive.Input asChild>
            <Input placeholder="Search teams" />
          </CommandPrimitive.Input>
          <CommandPrimitive.List>
            <CommandPrimitive.Empty>No teams</CommandPrimitive.Empty>
            {options.map((x) => (
              <CommandPrimitive.Item
                key={x}
                value={x}
                onSelect={() => select(x)}
              >
                {x}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
function Audit() {
  const [open, setOpen] = useState(true);
  const content = (
    <>
      <p>Select a team for this project.</p>
      <Selector />
      <p>Selected team is shown on the trigger.</p>
    </>
  );
  return (
    <>
      <button onClick={() => setOpen(true)}>Open host dialog</button>
      {host === 'mui' ? (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Project settings</DialogTitle>
          <DialogContent>{content}</DialogContent>
        </Dialog>
      ) : (
        <Modal
          title="Project settings"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          {content}
        </Modal>
      )}
    </>
  );
}
function Controls() {
  const [B, I, C, R, RI, S, T, TL, TT, TC, TA] =
    kit === 'shadcn'
      ? [
          Button,
          Input,
          SCheckbox,
          SRadioGroup,
          SRadioGroupItem,
          SSwitch,
          STabs,
          STabsList,
          STabsTrigger,
          STabsContent,
          STextarea,
        ]
      : [
          NButton,
          NInput,
          NCheckbox,
          NRadioGroup,
          NRadioGroupItem,
          NSwitch,
          NTabs,
          NTabsList,
          NTabsTrigger,
          NTabsContent,
          NTextarea,
        ];
  return (
    <main
      style={{
        padding: 32,
        display: 'grid',
        gap: 24,
        maxWidth: 600,
        color: '#eee',
        background: '#141414',
      }}
    >
      <h1>
        {host} + {kit} controls
      </h1>
      <B>Primary action</B>
      <I aria-label="Name" defaultValue="Design team" />
      <TA aria-label="Description" defaultValue="Project description" />
      <div>
        Notifications
        <C defaultChecked aria-label="Notifications" />
      </div>
      <R defaultValue="editor">
        <RI value="editor" aria-label="Editor" />
        <RI value="viewer" aria-label="Viewer" />
      </R>
      <S defaultChecked aria-label="Enabled" />
      <T defaultValue="overview">
        <TL>
          <TT value="overview">Overview</TT>
          <TT value="settings">Settings</TT>
        </TL>
        <TC value="overview">Overview content</TC>
        <TC value="settings">Settings content</TC>
      </T>
    </main>
  );
}
let app = params.get('view') === 'controls' ? <Controls /> : <Audit />;
if (kit === 'nexus')
  app = (
    <NxdsAppearanceProvider
      state={{ ...DEFAULT_NXDS_APPEARANCE, mode: 'dark' }}
      storageKey={false}
      cookieWriteKey={false}
    >
      {app}
    </NxdsAppearanceProvider>
  );
createRoot(document.getElementById('root')).render(
  host === 'mui' ? (
    <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
      <CssBaseline />
      {app}
    </ThemeProvider>
  ) : (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      {app}
    </ConfigProvider>
  )
);
