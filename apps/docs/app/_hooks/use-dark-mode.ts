'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

export function useDarkMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains('dark'),
    () => false
  );
}

export function toggleDarkMode(): void {
  const next = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', next);
  localStorage.setItem('nexus-docs-theme', next ? 'dark' : 'light');
}
