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
  createIssue,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  type IssueDetail,
  projectKeys,
  updateIssue,
} from '../../lib/projects-api';
import {
  RhfField,
  RhfFieldControl,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '../../lib/rhf-field';

import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './issue-ui';

const ASSIGNEES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
] as const;

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.enum(ISSUE_STATUSES),
  priority: z.enum(ISSUE_PRIORITIES),
  assignee: z.string().min(1, 'Assignee is required'),
});

type IssueFormValues = z.infer<typeof issueSchema>;

const EMPTY_VALUES: IssueFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: ASSIGNEES[0],
};

function toFormValues(issue: IssueDetail): IssueFormValues {
  const { title, description, status, priority, assignee } = issue;
  return { title, description, status, priority, assignee };
}

interface IssueFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit that issue; absent → create a new one. */
  issue?: IssueDetail;
}

export function IssueFormSheet({
  open,
  onOpenChange,
  issue,
}: IssueFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!issue;
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: issue ? toFormValues(issue) : EMPTY_VALUES,
  });

  const mutation = useMutation({
    mutationFn: (values: IssueFormValues) =>
      issue ? updateIssue(issue.id, values) : createIssue(values),
    onSuccess: ({ issue: saved }) => {
      // A create dirties the list; an edit dirties the list + that one detail.
      queryClient.invalidateQueries({ queryKey: projectKeys.issues });
      if (issue) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.issue(issue.id),
        });
      }
      toast.success(isEdit ? 'Issue updated' : 'Issue created', {
        description: saved.title,
      });
      onOpenChange(false);
    },
    onError: (error: Error) =>
      form.setError('root', { message: error.message }),
  });

  // Re-sync the form each time the sheet opens — the instance is persistent, so
  // without this a cancelled create or unsaved edit would survive into the next
  // open (and a stale root error would linger). `reset` also clears errors.
  useEffect(() => {
    if (open) form.reset(issue ? toFormValues(issue) : EMPTY_VALUES);
  }, [open, issue, form]);

  const onSubmit = (values: IssueFormValues) => mutation.mutate(values);
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
              <SheetTitle>{isEdit ? 'Edit issue' : 'New issue'}</SheetTitle>
              <SheetDescription>
                {isEdit
                  ? `Update ${issue.key}.`
                  : 'Add an issue to your project.'}
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
                name="title"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Title</RhfFieldLabel>
                    <RhfFieldControl>
                      <Input
                        placeholder="Short, action-oriented summary"
                        {...field}
                      />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              <RhfField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Description</RhfFieldLabel>
                    <RhfFieldControl>
                      <Textarea
                        rows={4}
                        placeholder="Context, acceptance criteria, links…"
                        {...field}
                      />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />

              <RhfField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Status</RhfFieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <RhfField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Priority</RhfFieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <RhfFieldControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </RhfFieldControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
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
                name="assignee"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Assignee</RhfFieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <RhfFieldControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </RhfFieldControl>
                      <SelectContent>
                        {ASSIGNEES.map((assignee) => (
                          <SelectItem key={assignee} value={assignee}>
                            {assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type="submit" loading={mutation.isPending}>
                {isEdit ? 'Save changes' : 'Create issue'}
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
