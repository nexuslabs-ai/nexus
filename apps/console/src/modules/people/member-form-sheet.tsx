import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
} from '@nexus/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  DEPARTMENTS,
  inviteMember,
  MEMBER_ROLES,
  MEMBER_STATUSES,
  type MemberDetail,
  type MemberRole,
  type MemberStatus,
  peopleKeys,
  updateMember,
} from '../../lib/people-api';

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest' },
];

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
];

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
        <Form {...form}>
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

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ada Lovelace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ada@atlas.app"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Staff Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status is server-set to `invited` on create — only editable
                  when updating (to suspend / reactivate a member). */}
              {isEdit && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="A short blurb about this teammate…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
        </Form>
      </SheetContent>
    </Sheet>
  );
}
