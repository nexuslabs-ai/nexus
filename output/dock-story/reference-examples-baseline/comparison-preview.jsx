import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { sanitizeNxdsAppearance } from '@nxds/core';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

import { initialPreviewAppearance } from './appearance-model';
import {
  AntWorkspace,
  initialMembers,
  MuiWorkspace,
  ShadcnWorkspace,
} from './LibraryWorkspace';
import { NexusInvite } from './NexusInvite';

import './comparison-shadcn.css';
import './comparison-nexus.css';
import './comparison-workspace.css';
import './source-audit.css';

const query = new URLSearchParams(window.location.search);
const library = query.get('library');
const addition = query.get('addition') === 'true';
const initialMode = query.get('mode') === 'light' ? 'light' : 'dark';

function Preview() {
  const [appearance, setAppearance] = useState(() =>
    initialPreviewAppearance(initialMode)
  );
  const [members, setMembers] = useState(initialMembers);
  useEffect(() => {
    function receive(event) {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        event.data?.channel !== 'nexus-coexistence-v1' ||
        event.data.type !== 'appearance'
      )
        return;
      setAppearance(sanitizeNxdsAppearance(event.data.appearance));
      if (!event.data.interactive)
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.addEventListener('message', receive);
    window.parent.postMessage(
      { channel: 'nexus-coexistence-v1', type: 'ready' },
      window.location.origin
    );
    return () => window.removeEventListener('message', receive);
  }, []);
  function invite(member) {
    setMembers((current) => [
      ...current.filter((item) => item.email !== member.email),
      member,
    ]);
  }
  const nexus = addition ? <NexusInvite onInvite={invite} /> : null;
  return (
    <NxdsAppearanceProvider
      state={appearance}
      storageKey={false}
      cookieWriteKey={false}
    >
      <main className="comparison-demo-root" data-mode={appearance.mode}>
        {library === 'MUI' ? (
          <MuiWorkspace members={members} mode={appearance.mode}>
            {nexus}
          </MuiWorkspace>
        ) : library === 'Ant Design' ? (
          <AntWorkspace members={members} mode={appearance.mode}>
            {nexus}
          </AntWorkspace>
        ) : (
          <ShadcnWorkspace members={members}>{nexus}</ShadcnWorkspace>
        )}
      </main>
    </NxdsAppearanceProvider>
  );
}
createRoot(document.getElementById('root')).render(<Preview />);
