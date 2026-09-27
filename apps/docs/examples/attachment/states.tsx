'use client';

import {
  IconAlertCircle,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconRefresh,
  IconUpload,
  IconX,
} from '@tabler/icons-react';

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentTitle,
} from '@/components/attachment/attachment';
import { Button } from '@/components/button/button';
import { Spinner } from '@/components/spinner/spinner';

export default function AttachmentStates() {
  return (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-3">
      <Attachment state="idle">
        <AttachmentMedia variant="icon">
          <IconUpload />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Drop a file here</AttachmentTitle>
          <AttachmentDescription>PDF or PNG, up to 10 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia variant="icon">
          <IconFileTypePdf />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>62% of 2.4 MB</AttachmentDescription>
          <AttachmentProgress value={62} aria-label="Uploading report.pdf" />
        </AttachmentContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel upload of report.pdf"
          >
            <IconX />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment state="processing">
        <AttachmentMedia variant="icon">
          <Spinner aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>scan.png</AttachmentTitle>
          <AttachmentDescription>Processing…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia variant="icon">
          <IconAlertCircle />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>archive.zip</AttachmentTitle>
          <AttachmentDescription>Upload failed</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Retry upload of archive.zip"
          >
            <IconRefresh />
          </Button>
        </AttachmentActions>
      </Attachment>
      <Attachment state="done">
        <AttachmentMedia variant="icon">
          <IconFileTypeTxt />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>notes.txt</AttachmentTitle>
          <AttachmentDescription>8 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
