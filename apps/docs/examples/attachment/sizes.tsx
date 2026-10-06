'use client';

import { IconFileTypePdf, IconFileTypeTxt } from '@tabler/icons-react';

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/attachment/attachment';

export default function AttachmentSizes() {
  return (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <Attachment size="default">
        <AttachmentMedia variant="icon">
          <IconFileTypePdf />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>Default · 2.4 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <IconFileTypeTxt />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>notes.txt</AttachmentTitle>
          <AttachmentDescription>Small · 8 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
