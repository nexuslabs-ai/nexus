import { useState } from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';
import {
  IconAddressBook,
  IconBriefcase,
  IconColorSwatch,
  IconInbox,
  IconMoon,
  IconPalette,
  IconSun,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { crmKeys, fetchContacts } from '../lib/crm-api';
import { fetchConversations, inboxKeys } from '../lib/inbox-api';
import { fetchMembers, peopleKeys } from '../lib/people-api';
import { fetchIssues, projectKeys } from '../lib/projects-api';

import { MODULE_ITEMS } from './modules';
import { nextMode } from './next-mode';

interface CommandPaletteProps {
  /** Whether the palette is open — lifted to the app shell (⌘K toggles it). */
  open: boolean;
  /** Open-state setter; also fires on Escape / click-outside / item select. */
  onOpenChange: (open: boolean) => void;
}

/**
 * The ⌘K command palette: a single search box over the whole console. With an
 * empty query it's a launcher (jump to a module, run a quick action); once you
 * type, it searches contacts, issues, conversations, and people by name in one
 * list. cmdk owns the fuzzy filtering and keyboard nav; we feed it the records
 * via the same TanStack Query keys the modules use, so an open after visiting a
 * module is an instant cache hit.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { resolvedMode, setState } = useNexusAppearance();
  const [query, setQuery] = useState('');
  const dark = resolvedMode === 'dark';

  // Prefetch the four record sets the moment the palette opens (not on type) so
  // the lists are warm before the first keystroke — no empty-state flash.
  const contacts = useQuery({
    queryKey: crmKeys.contacts,
    queryFn: fetchContacts,
    enabled: open,
  });
  const issues = useQuery({
    queryKey: projectKeys.issues,
    queryFn: fetchIssues,
    enabled: open,
  });
  const conversations = useQuery({
    queryKey: inboxKeys.conversations,
    queryFn: fetchConversations,
    enabled: open,
  });
  const members = useQuery({
    queryKey: peopleKeys.members,
    queryFn: fetchMembers,
    enabled: open,
  });

  // Reset the search when the palette closes so it reopens blank. ⌘K closes by
  // flipping `open` externally, which Radix does not report through onOpenChange —
  // so we reset on the open→closed prop edge to catch every close path (Escape,
  // click-outside, item select, and ⌘K alike), not just Radix's own gestures.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setQuery('');
  }

  const anyError =
    contacts.isError ||
    issues.isError ||
    conversations.isError ||
    members.isError;

  // Close first, then act — the palette never lingers behind a navigation.
  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  // Mirrors the sidebar: built modules carry a static `route`; the rest fall
  // through to the `/m/$module` "coming soon" placeholder.
  const goToModule = (item: (typeof MODULE_ITEMS)[number]) => {
    if ('route' in item) {
      navigate({ to: item.route });
      return;
    }
    navigate({ to: '/m/$module', params: { module: item.module } });
  };

  const toggleAppearance = () => {
    setState((state) => ({
      ...state,
      mode: nextMode(state.mode, resolvedMode),
    }));
  };

  const hasQuery = query.trim().length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search or jump to…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {anyError
            ? 'Couldn’t load results. Please try again.'
            : 'No results found.'}
        </CommandEmpty>

        <CommandGroup heading="Go to">
          {MODULE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.module}
                value={`go-${item.module}`}
                keywords={[item.label]}
                onSelect={() => runCommand(() => goToModule(item))}
              >
                <Icon />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {hasQuery && (
          <>
            <CommandGroup heading="Contacts">
              {(contacts.data?.contacts ?? []).map((contact) => (
                <CommandItem
                  key={contact.id}
                  value={`contact-${contact.id}`}
                  keywords={[contact.name, contact.email, contact.company]}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({ to: '/m/crm/$id', params: { id: contact.id } })
                    )
                  }
                >
                  <IconUsers />
                  <span>{contact.name}</span>
                  <span className="nx:text-muted-foreground nx:ml-auto nx:typography-label-small">
                    {contact.company}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Issues">
              {(issues.data?.issues ?? []).map((issue) => (
                <CommandItem
                  key={issue.id}
                  value={`issue-${issue.id}`}
                  keywords={[issue.key, issue.title]}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({
                        to: '/m/projects/$id',
                        params: { id: issue.id },
                      })
                    )
                  }
                >
                  <IconBriefcase />
                  <span>{issue.title}</span>
                  <span className="nx:text-muted-foreground nx:ml-auto nx:typography-label-small">
                    {issue.key}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Conversations">
              {(conversations.data?.conversations ?? []).map((conversation) => (
                <CommandItem
                  key={conversation.id}
                  value={`conversation-${conversation.id}`}
                  keywords={[conversation.subject, conversation.customer]}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({
                        to: '/m/inbox',
                        search: { c: conversation.id },
                      })
                    )
                  }
                >
                  <IconInbox />
                  <span>{conversation.subject}</span>
                  <span className="nx:text-muted-foreground nx:ml-auto nx:typography-label-small">
                    {conversation.customer}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="People">
              {(members.data?.members ?? []).map((member) => (
                <CommandItem
                  key={member.id}
                  value={`member-${member.id}`}
                  keywords={[member.name, member.email, member.title]}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({
                        to: '/m/people/$id',
                        params: { id: member.id },
                      })
                    )
                  }
                >
                  <IconAddressBook />
                  <span>{member.name}</span>
                  <span className="nx:text-muted-foreground nx:ml-auto nx:typography-label-small">
                    {member.title}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandGroup heading="Actions">
          <CommandItem
            value="color-token-atlas"
            keywords={['color', 'token', 'atlas', 'draft', 'swatch']}
            onSelect={() =>
              runCommand(() => navigate({ to: '/design/color-atlas' }))
            }
          >
            <IconColorSwatch />
            <span>Color Token Atlas</span>
          </CommandItem>
          <CommandItem
            value="toggle-theme"
            keywords={['theme', 'dark', 'light', 'mode']}
            onSelect={() => runCommand(toggleAppearance)}
          >
            {dark ? <IconSun /> : <IconMoon />}
            <span>Toggle theme</span>
          </CommandItem>
          <CommandItem
            value="appearance-settings"
            keywords={['appearance', 'theme', 'customize', 'settings']}
            onSelect={() =>
              runCommand(() => navigate({ to: '/design/appearance' }))
            }
          >
            <IconPalette />
            <span>Appearance settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
