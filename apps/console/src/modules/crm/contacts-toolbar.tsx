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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  toast,
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

import { type ContactsView, useSavedViews } from './saved-views';

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
  return (
    <div className="nx:inline-flex nx:gap-1">
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSearch({ view: 'table' })}
      >
        <IconTable />
        Table
      </Button>
      <Button
        variant={view === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSearch({ view: 'board' })}
      >
        <IconLayoutKanban />
        Board
      </Button>
    </div>
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <IconBookmark />
            Views
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="nx:w-56">
          <DropdownMenuLabel>Saved views</DropdownMenuLabel>
          {views.length === 0 ? (
            <DropdownMenuItem disabled>No saved views yet</DropdownMenuItem>
          ) : (
            views.map((saved) => (
              <DropdownMenuItem
                key={saved.id}
                onSelect={() => setSearch(saved.view)}
                className="nx:flex nx:items-center nx:justify-between nx:gap-2"
              >
                <span className="nx:truncate">{saved.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete view ${saved.name}`}
                  className="nx:text-muted-foreground nx:hover:text-error-foreground nx:shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(saved.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <IconTrash className="nx:size-4" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
          >
            <IconPlus />
            Save current view…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
