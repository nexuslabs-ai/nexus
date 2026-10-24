import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';

import '../../../apps/docs/coexistence-preview/nexus.css';

export function Addition({ role, onRoleChange, mode }) {
  return (
    <NxdsAppearanceProvider
      defaultState={{ ...DEFAULT_NXDS_APPEARANCE, mode }}
      storageKey={false}
      cookieWriteKey={false}
    >
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger aria-label="Default member role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </NxdsAppearanceProvider>
  );
}
