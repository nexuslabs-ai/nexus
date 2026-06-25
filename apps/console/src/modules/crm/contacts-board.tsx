import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarFallback } from '@nexus/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type Contact,
  type ContactStatus,
  crmKeys,
  updateContact,
} from '../../lib/crm-api';
import { formatCurrency, initials } from '../../lib/format';

const COLUMNS: { status: ContactStatus; label: string }[] = [
  { status: 'lead', label: 'Lead' },
  { status: 'active', label: 'Active' },
  { status: 'churned', label: 'Churned' },
];

type ContactsCache = { contacts: Contact[] };

/**
 * Kanban view of the contacts: three status columns, draggable cards. Dropping a
 * card in another column changes that contact's status (optimistically, so the
 * card moves immediately; the PATCH + refetch reconcile in the background).
 */
export function ContactsBoard({ contacts }: { contacts: Contact[] }) {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const mutation = useMutation({
    mutationFn: ({
      contact,
      status,
    }: {
      contact: Contact;
      status: ContactStatus;
    }) =>
      updateContact(contact.id, {
        name: contact.name,
        email: contact.email,
        company: contact.company,
        status,
        owner: contact.owner,
        value: contact.value,
      }),
    onMutate: async ({ contact, status }) => {
      await queryClient.cancelQueries({ queryKey: crmKeys.contacts });
      const previous = queryClient.getQueryData<ContactsCache>(
        crmKeys.contacts
      );
      queryClient.setQueryData<ContactsCache>(crmKeys.contacts, (old) =>
        old
          ? {
              contacts: old.contacts.map((c) =>
                c.id === contact.id ? { ...c, status } : c
              ),
            }
          : old
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(crmKeys.contacts, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: crmKeys.all }),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const target = COLUMNS.find((col) => col.status === over.id);
    const contact = contacts.find((c) => c.id === active.id);
    if (!target || !contact || contact.status === target.status) return;
    mutation.mutate({ contact, status: target.status });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="nx:grid nx:gap-4 nx:sm:grid-cols-3">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            contacts={contacts.filter((c) => c.status === col.status)}
          />
        ))}
      </div>
    </DndContext>
  );
}

function BoardColumn({
  status,
  label,
  contacts,
}: {
  status: ContactStatus;
  label: string;
  contacts: Contact[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      data-status={status}
      className={`nx:flex nx:min-h-40 nx:flex-col nx:gap-3 nx:rounded-lg nx:p-3 nx:transition-colors ${
        isOver ? 'nx:bg-background-hover' : 'nx:bg-muted'
      }`}
    >
      <div className="nx:flex nx:items-center nx:justify-between nx:px-1">
        <span className="nx:typography-label-default nx:text-foreground">
          {label}
        </span>
        <span className="nx:text-muted-foreground nx:typography-label-small">
          {contacts.length}
        </span>
      </div>
      {contacts.map((contact) => (
        <BoardCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}

function BoardCard({ contact }: { contact: Contact }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: contact.id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`nx:bg-container nx:border-border-default nx:cursor-grab nx:space-y-2 nx:rounded-md nx:border nx:p-3 nx:active:cursor-grabbing ${
        isDragging ? 'nx:opacity-50' : ''
      }`}
    >
      <div className="nx:text-foreground nx:font-medium">{contact.name}</div>
      <div className="nx:text-muted-foreground nx:typography-label-default">
        {contact.company}
      </div>
      <div className="nx:flex nx:items-center nx:justify-between">
        <div className="nx:flex nx:items-center nx:gap-2">
          <Avatar className="nx:size-6">
            <AvatarFallback className="nx:typography-label-small">
              {initials(contact.owner)}
            </AvatarFallback>
          </Avatar>
          <span className="nx:text-muted-foreground nx:typography-label-small">
            {contact.owner}
          </span>
        </div>
        <span className="nx:typography-label-small nx:tabular-nums">
          {formatCurrency(contact.value)}
        </span>
      </div>
    </div>
  );
}
