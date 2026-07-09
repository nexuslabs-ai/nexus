import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  toast,
} from '@nexus_ds/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  DEPARTMENTS,
  inviteMember,
  MEMBER_ROLES,
  MEMBER_STATUSES,
  type MemberDetail,
  peopleKeys,
  updateMember,
} from '../../lib/people-api';
import {
  RhfField,
  RhfFieldControl,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '../../lib/rhf-field';

import { DEPARTMENT_OPTIONS, ROLE_OPTIONS, STATUS_OPTIONS } from './people-ui';

const memberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  title: z.string().min(1, 'Title is required'),
  role: z.enum(MEMBER_ROLES),
  department: z.enum(DEPARTMENTS),
  status: z.enum(MEMBER_STATUSES),
  bio: z.string(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const EMPTY_VALUES: MemberFormValues = {
  name: '',
  email: '',
  title: '',
  role: 'member',
  department: 'Engineering',
  // A new member is always invited — the field is hidden on create, and the
  // server forces this regardless of what the form sends.
  status: 'invited',
  bio: '',
};

function toFormValues(member: MemberDetail): MemberFormValues {
  const { name, email, title, role, department, status, bio } = member;
  return { name, email, title, role, department, status, bio };
}

interface MemberFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit that member; absent → invite a new one. */
  member?: MemberDetail;
}

export function MemberFormSheet({
  open,
  onOpenChange,
  member,
}: MemberFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!member;
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: member ? toFormValues(member) : EMPTY_VALUES,
  });

  const mutation = useMutation({
    mutationFn: (values: MemberFormValues) =>
      member ? updateMember(member.id, values) : inviteMember(values),
    onSuccess: ({ member: saved }) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
      toast.success(isEdit ? 'Member updated' : 'Invitation sent', {
        description: isEdit
          ? saved.name
          : `${saved.name} was invited to the workspace.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) =>
      form.setError('root', { message: error.message }),
  });

  // Re-sync the form each time the sheet opens — the instance is persistent, so
  // without this a cancelled invite or unsaved edit would survive into the next
  // open (and a stale root error would linger). `reset` also clears errors.
  useEffect(() => {
    if (open) form.reset(member ? toFormValues(member) : EMPTY_VALUES);
  }, [open, member, form]);

  const onSubmit = (values: MemberFormValues) => mutation.mutate(values);
  const rootError = form.formState.errors.root?.message;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="nx:flex nx:w-full nx:flex-col nx:sm:max-w-md"
      >
        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="nx:flex nx:min-h-0 nx:flex-1 nx:flex-col"
          >
            <SheetHeader>
              <SheetTitle>
                {isEdit ? 'Edit member' : 'Invite member'}
              </SheetTitle>
              <SheetDescription>
                {isEdit
                  ? `Update ${member.name}'s details.`
                  : 'Invite a teammate to your workspace.'}
              </SheetDescription>
            </SheetHeader>

            <div className="nx:min-h-0 nx:flex-1 nx:space-y-5 nx:overflow-y-auto nx:px-4">
              {rootError && (
                <Alert variant="destructive">
                  <AlertDescription>{rootError}</AlertDescription>
                </Alert>
              )}

              <RhfField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Name</RhfFieldLabel>
                    <RhfFieldControl>
                      <Input placeholder="Ada Lovelace" {...field} />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              <RhfField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Email</RhfFieldLabel>
                    <RhfFieldControl>
                      <Input
                        type="email"
                        placeholder="ada@atlas.app"
                        {...field}
                      />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              <RhfField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Title</RhfFieldLabel>
                    <RhfFieldControl>
                      <Input placeholder="Staff Engineer" {...field} />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              <RhfField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Role</RhfFieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <RhfFieldControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </RhfFieldControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              <RhfField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Department</RhfFieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <RhfFieldControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </RhfFieldControl>
                      <SelectContent>
                        {DEPARTMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              {/* Status is server-set to `invited` on create — only editable
                  when updating (to suspend / reactivate a member). */}
              {isEdit && (
                <RhfField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <RhfFieldItem>
                      <RhfFieldLabel>Status</RhfFieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <RhfFieldControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </RhfFieldControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <RhfFieldMessage />
                    </RhfFieldItem>
                  )}
                />
              )}

              <RhfField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Bio</RhfFieldLabel>
                    <RhfFieldControl>
                      <Textarea
                        rows={3}
                        placeholder="A short blurb about this teammate…"
                        {...field}
                      />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type="submit" loading={mutation.isPending}>
                {isEdit ? 'Save changes' : 'Send invitation'}
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
