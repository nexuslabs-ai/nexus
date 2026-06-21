import { useState } from 'react';

import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  toast,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus/react';
import {
  IconBookmark,
  IconFilter,
  IconLayoutKanban,
  IconPlus,
  IconTable,
  IconTrash,
} from '@tabler/icons-react';

import type { ContactStatus } from '../../lib/crm-api';

import type { ContactsView } from './contacts-search';
import { useSavedViews } from './saved-views';

const STATUS_FILTERS: { value: ContactStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'lead', label: 'Lead' },
  { value: 'churned', label: 'Churned' },
];

interface ContactsToolbarProps {
  view: ContactsView['view'];
  status: ContactStatus[];
  setSearch: (patch: Partial<ContactsView>) => void;
}

export function ContactsToolbar({
  view,
  status,
  setSearch,
}: ContactsToolbarProps) {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
      <ViewSwitcher view={view} setSearch={setSearch} />
      {view === 'table' && (
        <StatusFilter status={status} setSearch={setSearch} />
      )}
      <div className="nx:ml-auto">
        <SavedViewsMenu current={{ view, status }} setSearch={setSearch} />
      </div>
    </div>
  );
}

function ViewSwitcher({
  view,
  setSearch,
}: Pick<ContactsToolbarProps, 'view' | 'setSearch'>) {
  // Radix single-select emits '' when the active item is re-clicked; ignore it
  // so the view can never wipe to blank.
  const onViewChange = (value: string) => {
    if (value) {
      setSearch({ view: value as ContactsView['view'] });
    }
  };

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={view}
      onValueChange={onViewChange}
      aria-label="Contacts view"
    >
      <ToggleGroupItem value="table">
        <IconTable />
        Table
      </ToggleGroupItem>
      <ToggleGroupItem value="board">
        <IconLayoutKanban />
        Board
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function StatusFilter({
  status,
  setSearch,
}: Pick<ContactsToolbarProps, 'status' | 'setSearch'>) {
  const toggle = (value: ContactStatus, on: boolean) =>
    setSearch({
      status: on ? [...status, value] : status.filter((s) => s !== value),
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <IconFilter />
          Status
          {status.length > 0 && (
            <Badge variant="secondary">{status.length}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUS_FILTERS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={status.includes(option.value)}
            onCheckedChange={(checked) => toggle(option.value, !!checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {status.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setSearch({ status: [] })}>
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SavedViewsMenu({
  current,
  setSearch,
}: {
  current: ContactsView;
  setSearch: (patch: Partial<ContactsView>) => void;
}) {
  const views = useSavedViews((s) => s.views);
  const save = useSavedViews((s) => s.save);
  const remove = useSavedViews((s) => s.remove);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    save(trimmed, current);
    toast.success(`View "${trimmed}" saved`);
    setName('');
    setDialogOpen(false);
  };

  const applyView = (view: ContactsView) => {
    setSearch(view);
    setOpen(false);
  };

  // A Popover (not a DropdownMenu) so each row carries two sibling buttons —
  // apply + delete — both keyboard-reachable. A menu's roving focus only lands on
  // `role="menuitem"` rows, which would strand a nested delete control (and trip
  // axe's `nested-interactive`).
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <IconBookmark />
            Views
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="nx:w-64 nx:p-0">
          <p className="nx:typography-label-small nx:text-muted-foreground nx:px-3 nx:pt-3 nx:pb-2">
            Saved views
          </p>
          {views.length === 0 ? (
            <p className="nx:text-muted-foreground nx:px-3 nx:pb-3 nx:text-sm">
              No saved views yet.
            </p>
          ) : (
            <ul className="nx:px-1 nx:pb-1">
              {views.map((saved) => (
                <li key={saved.id} className="nx:flex nx:items-center nx:gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyView(saved.view)}
                    className="nx:min-w-0 nx:flex-1 nx:justify-start"
                  >
                    <span className="nx:truncate">{saved.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete view ${saved.name}`}
                    onClick={() => remove(saved.id)}
                    className="nx:text-muted-foreground nx:hover:text-error-foreground nx:shrink-0"
                  >
                    <IconTrash className="nx:size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Separator />
          <div className="nx:p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setDialogOpen(true);
              }}
              className="nx:w-full nx:justify-start"
            >
              <IconPlus />
              Save current view…
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
            <DialogDescription>
              Name this view and filter combination to reuse it later.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Active deals"
            aria-label="View name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Save view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
