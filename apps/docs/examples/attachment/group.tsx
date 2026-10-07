'use client';

import {
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileTypeTxt,
  IconFileTypeZip,
} from '@tabler/icons-react';

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/attachment/attachment';

const files = [
  { name: 'cover.png', size: '412 KB', icon: <IconFileTypePng /> },
  { name: 'report.pdf', size: '2.4 MB', icon: <IconFileTypePdf /> },
  { name: 'notes.txt', size: '8 KB', icon: <IconFileTypeTxt /> },
  { name: 'archive.zip', size: '18 MB', icon: <IconFileTypeZip /> },
  { name: 'brief.docx', size: '96 KB', icon: <IconFileTypeDocx /> },
];

export default function AttachmentGroupDemo() {
  return (
    <AttachmentGroup aria-label="Attached files" className="nx:w-80">
      {files.map((file) => (
        <Attachment key={file.name} orientation="vertical">
          <AttachmentMedia variant="icon">{file.icon}</AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>{file.size}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
