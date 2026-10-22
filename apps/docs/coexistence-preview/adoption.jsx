import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { Alert, AlertDescription, AlertTitle, Button } from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

import {
  Alert as ShadcnAlert,
  AlertDescription as ShadcnDescription,
  AlertTitle as ShadcnTitle,
} from './ui/alert';
import { Button as ShadcnButton } from './ui/button';

import './audit-shadcn.css';
import './nexus.css';
import './billing-status.css';

const params = new URLSearchParams(location.search);
const nexus = params.get('integration') === 'nexus';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';
document.documentElement.classList.toggle('dark', mode === 'dark');
document.documentElement.style.colorScheme = mode;
const notices = [
  {
    variant: 'information',
    label: 'Information',
    title: 'Your invoice is ready',
    copy: 'October invoice · $240.00 · 8 seats',
  },
  {
    variant: 'warning',
    label: 'Warning',
    title: 'Your card expires soon',
    copy: 'Update your payment method before November 1.',
  },
  {
    variant: 'success',
    label: 'Success',
    title: 'Payment received',
    copy: 'Your September invoice has been paid in full.',
  },
  {
    variant: 'destructive',
    label: 'Destructive',
    title: 'Payment could not be completed',
    copy: 'Your backup card was declined. Try another method.',
  },
];
function BillingStatus() {
  const [message, setMessage] = useState('');
  function update() {
    setMessage('Demo: payment settings opened. No changes made.');
  }
  return (
    <main className="billing-status">
      <header>
        <span>BILLING / ACTIVITY</span>
        <h2>Stay on top of your billing.</h2>
        <p>Team workspace · Monthly billing</p>
      </header>
      <div className="billing-notices">
        {notices.map((item) => (
          <section key={item.variant}>
            <div className="billing-variant">
              {item.label}
              <code>
                variant=&quot;
                {nexus
                  ? item.variant
                  : item.variant === 'destructive'
                    ? 'destructive'
                    : 'default'}
                &quot;
              </code>
            </div>
            {nexus ? (
              <Alert variant={item.variant}>
                <AlertTitle>{item.title}</AlertTitle>
                <AlertDescription>{item.copy}</AlertDescription>
              </Alert>
            ) : (
              <ShadcnAlert
                variant={
                  item.variant === 'destructive' ? 'destructive' : 'default'
                }
                role="region"
                aria-label={item.label}
              >
                <ShadcnTitle>{item.title}</ShadcnTitle>
                <ShadcnDescription>{item.copy}</ShadcnDescription>
              </ShadcnAlert>
            )}
          </section>
        ))}
      </div>
      <footer>
        {nexus ? (
          <Button onClick={update}>Manage payment methods</Button>
        ) : (
          <ShadcnButton onClick={update}>Manage payment methods</ShadcnButton>
        )}
        <p role="status">{message}</p>
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')).render(
  nexus ? (
    <NxdsAppearanceProvider
      state={{ ...DEFAULT_NXDS_APPEARANCE, mode }}
      storageKey={false}
      cookieWriteKey={false}
    >
      <BillingStatus />
    </NxdsAppearanceProvider>
  ) : (
    <BillingStatus />
  )
);
