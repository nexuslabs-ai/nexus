'use client';

import { IconFileTypePdf, IconX } from '@tabler/icons-react';

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/attachment/attachment';
import { Button } from '@/components/button/button';

export default function AttachmentDemo() {
  return (
    <Attachment className="nx:w-80">
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
