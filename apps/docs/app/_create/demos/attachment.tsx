'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@nexus_ds/react';
import { IconFile, IconFileTypePdf, IconX } from '@tabler/icons-react';
const THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='currentColor'/%3E%3C/svg%3E";
function Example0() {
  return (
    <Attachment className="nx:w-full nx:max-w-md">
      <AttachmentMedia variant="icon">
        <IconFileTypePdf />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
        <AttachmentDescription>2.4 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <Button variant="ghost" size="icon-sm" aria-label="Remove report.pdf">
          <IconX />
        </Button>
      </AttachmentActions>
    </Attachment>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        {(['idle', 'uploading', 'processing', 'error', 'done'] as const).map(
          (state) => (
            <Attachment key={state} state={state}>
              <AttachmentMedia variant="icon">
                <IconFile />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{state}</AttachmentTitle>
                <AttachmentDescription>2.4 MB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          )
        )}
      </div>
      <AttachmentGroup
        aria-label="Attached files"
        className="nx:w-full nx:max-w-md"
      >
        {['one.png', 'two.png', 'three.png'].map((name) => (
          <Attachment key={name} orientation="vertical">
            <AttachmentMedia variant="image">
              <img src={THUMB} alt="" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{name}</AttachmentTitle>
            </AttachmentContent>
          </Attachment>
        ))}
      </AttachmentGroup>
    </div>
  );
}
function Example2() {
  return (
    <Attachment state="uploading" className="nx:w-full nx:max-w-md">
      <AttachmentContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
        <AttachmentDescription>Uploading…</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Remove report.pdf"
          disabled
        >
          <IconX />
        </Button>
      </AttachmentActions>
    </Attachment>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
