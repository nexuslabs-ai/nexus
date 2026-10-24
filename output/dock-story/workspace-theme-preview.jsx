import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { createTheme } from '@mui/material/styles';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

import {
  appearanceFromMui,
  muiAdapterVariables,
} from './workspace-theme-model';
import { MuiSettings, NexusSettings } from './WorkspaceThemeForms';

import './workspace-theme-nexus.css';
import './workspace-theme-preview.css';
import './workspace-theme-adapter.css';
import './source-audit.css';

const themes = {
  light: createTheme({ palette: { mode: 'light' } }),
  dark: createTheme({ palette: { mode: 'dark' } }),
};
const stageLabels = {
  defaults: 'Nexus defaults',
  appearance: 'Appearance settings only',
  adapter: 'Appearance + custom code',
};

const query = new URLSearchParams(window.location.search);
const initialConfig = {
  mode: query.get('mode') === 'dark' ? 'dark' : 'light',
  stage: Object.hasOwn(stageLabels, query.get('stage'))
    ? query.get('stage')
    : 'appearance',
  state: ['invalid', 'disabled'].includes(query.get('state'))
    ? query.get('state')
    : 'normal',
};

function Preview() {
  const [config, setConfig] = useState(initialConfig);
  const [values, setValues] = useState({
    name: 'Design team',
    email: 'team@acme.design',
    digest: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    function receive(event) {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        event.data?.channel !== 'nexus-workspace-theme-v1' ||
        event.data.type !== 'configuration'
      )
        return;
      const { mode, stage, state } = event.data;
      if (
        !['light', 'dark'].includes(mode) ||
        !Object.hasOwn(stageLabels, stage) ||
        !['normal', 'invalid', 'disabled'].includes(state)
      )
        return;
      setConfig({ mode, stage, state });
    }
    window.addEventListener('message', receive);
    window.parent.postMessage(
      { channel: 'nexus-workspace-theme-v1', type: 'ready' },
      window.location.origin
    );
    return () => window.removeEventListener('message', receive);
  }, []);
  const theme = themes[config.mode];
  const appearance =
    config.stage === 'defaults'
      ? { ...DEFAULT_NXDS_APPEARANCE, mode: config.mode }
      : appearanceFromMui(theme);
  const invalid =
    config.state === 'invalid' || (submitted && !values.name.trim());
  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }
  function save(event) {
    event.preventDefault();
    setSubmitted(true);
    setSaved(Boolean(values.name.trim()) && config.state !== 'invalid');
  }
  const form = {
    values: { ...values, name: config.state === 'invalid' ? '' : values.name },
    onChange: change,
    invalid,
    disabled: config.state === 'disabled',
    onSave: save,
    saved,
  };
  return (
    <NxdsAppearanceProvider
      state={appearance}
      storageKey={false}
      cookieWriteKey={false}
    >
      <main
        className="workspace-theme-frame"
        data-mode={config.mode}
        data-stage={config.stage}
      >
        <div className="workspace-theme-pair">
          <section className="workspace-theme-specimen" aria-label="MUI target">
            <header>
              <strong>MUI</strong>
              <span>Unmodified default theme</span>
            </header>
            <MuiSettings theme={theme} {...form} />
          </section>
          <section
            className="workspace-theme-specimen"
            aria-label="Nexus candidate"
          >
            <header>
              <strong>Nexus</strong>
              <span>{stageLabels[config.stage]}</span>
            </header>
            <div
              className={
                config.stage === 'adapter'
                  ? 'workspace-match-adapter'
                  : undefined
              }
              style={
                config.stage === 'adapter'
                  ? muiAdapterVariables(theme)
                  : undefined
              }
            >
              <NexusSettings {...form} />
            </div>
          </section>
        </div>
      </main>
    </NxdsAppearanceProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Preview />);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
