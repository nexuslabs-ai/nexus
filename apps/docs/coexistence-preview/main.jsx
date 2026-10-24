import React, { useId, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { createTheme, MenuItem, TextField, ThemeProvider } from '@mui/material';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { Button } from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import {
  ConfigProvider,
  Input as AntInput,
  Select as AntSelect,
  theme as antTheme,
} from 'antd';

import { invitationAppearance } from '../app/_components/home-page/coexistence-appearance.mjs';

import CommandWorkspace from './CommandWorkspace';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import './preview.css';
import './nexus.css';

const query = new URLSearchParams(location.search);
const library = ['MUI', 'Ant Design', 'shadcn/ui'].includes(
  query.get('library')
)
  ? query.get('library')
  : 'MUI';
const mode = query.get('mode') === 'light' ? 'light' : 'dark';
const preset = invitationAppearance(library, mode);
const appearance = {
  ...DEFAULT_NXDS_APPEARANCE,
  ...preset,
  prefs: { ...DEFAULT_NXDS_APPEARANCE.prefs, ...preset.prefs },
};

function InviteForm() {
  const id = useId();
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('Member');
  const muiTheme = useMemo(
    () => createTheme({ palette: { mode, primary: { main: '#1976d2' } } }),
    []
  );
  function invite(event) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    setMessage(
      `Demo invitation prepared for ${email} as ${role.toLowerCase()}. Nothing was sent.`
    );
  }
  return (
    <div className="preview-app">
      <div className="preview-bar">
        <span>Acme / Workspace</span>
        <span>Members</span>
      </div>
      <form className="preview-form" onSubmit={invite}>
        <h3>Invite a teammate</h3>
        {library === 'MUI' && (
          <ThemeProvider theme={muiTheme}>
            <TextField
              name="email"
              label="Email"
              type="email"
              required
              defaultValue="alex@example.com"
              size="small"
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              size="small"
              fullWidth
            >
              {['Member', 'Admin'].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </ThemeProvider>
        )}
        {library === 'Ant Design' && (
          <ConfigProvider
            theme={{
              algorithm:
                mode === 'dark'
                  ? antTheme.darkAlgorithm
                  : antTheme.defaultAlgorithm,
              token: { colorPrimary: '#1677ff' },
            }}
          >
            <div className="preview-field">
              <label htmlFor={`${id}-email`}>Email</label>
              <AntInput
                id={`${id}-email`}
                name="email"
                type="email"
                required
                defaultValue="alex@example.com"
              />
            </div>
            <div className="preview-field">
              <label htmlFor={`${id}-role`}>Role</label>
              <AntSelect
                id={`${id}-role`}
                value={role}
                onChange={setRole}
                options={['Member', 'Admin'].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </div>
          </ConfigProvider>
        )}
        {library === 'shadcn/ui' && (
          <>
            <div className="preview-field">
              <label htmlFor={`${id}-email`}>Email</label>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                required
                defaultValue="alex@example.com"
              />
            </div>
            <div className="preview-field">
              <label htmlFor={`${id}-role`}>Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id={`${id}-role`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div>
          <Button type="submit" size="sm">
            Send invitation
          </Button>
        </div>
      </form>
      <p className="preview-status" role="status">
        {message || 'Interactive preview · no invitations are sent'}
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <NxdsAppearanceProvider
    state={appearance}
    storageKey={false}
    cookieWriteKey={false}
  >
    {query.get('example') === 'command' ? (
      <CommandWorkspace library={library} mode={mode} />
    ) : (
      <InviteForm />
    )}
  </NxdsAppearanceProvider>
);
