import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../apps/docs/coexistence-preview/ui/select';

import '../../../apps/docs/coexistence-preview/audit-shadcn.css';

export function Addition({ role, onRoleChange }) {
  return (
    <Select value={role} onValueChange={onRoleChange}>
      <SelectTrigger aria-label="Default member role" style={{ width: '100%' }}>
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
  );
}
