import * as React from 'react';

import { Button } from '../../components/button/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/dialog/dialog';

const PRIYA = {
  id: 'priya',
  values: { name: 'Priya Shah', email: 'priya@example.com', updates: false },
};
const ARJUN = {
  id: 'arjun',
  values: { name: 'Arjun Mehta', email: 'arjun@example.com', updates: true },
};

/** The record a settings form edits, with ways to refresh or replace it. */
export function useRecordSwitch() {
  const [record, setRecord] = React.useState(PRIYA);
  function loadNewerCopy() {
    setRecord({
      ...record,
      values: { ...record.values, name: `${record.values.name} (refreshed)` },
    });
  }
  function switchRecord() {
    setRecord(record.id === PRIYA.id ? ARJUN : PRIYA);
  }
  return { record, loadNewerCopy, switchRecord };
}

export function RecordSwitchControls({
  onLoadNewerCopy,
  onSwitchRecord,
}: {
  onLoadNewerCopy: () => void;
  onSwitchRecord: () => void;
}) {
  return (
    <div className="nx:mb-4 nx:flex nx:gap-2">
      <Button variant="outline" onClick={onLoadNewerCopy}>
        Load a newer copy
      </Button>
      <Button variant="outline" onClick={onSwitchRecord}>
        Switch record
      </Button>
    </div>
  );
}

export function EditProfileDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes apply when you save.</DialogDescription>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  );
}
