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
  toast,
} from '@nexus/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  type Contact,
  type ContactStatus,
  createContact,
  updateContact,
} from '../../lib/crm-api';

const OWNERS = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
] as const;

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'churned', label: 'Churned' },
];

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  company: z.string().min(1, 'Company is required'),
  status: z.enum(['active', 'lead', 'churned']),
  owner: z.string().min(1, 'Owner is required'),
  value: z.number().min(0, 'Open value must be 0 or more'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const EMPTY_VALUES: ContactFormValues = {
  name: '',
  email: '',
  company: '',
  status: 'lead',
  owner: OWNERS[0],
  value: 0,
};

function toFormValues(contact: Contact): ContactFormValues {
  const { name, email, company, status, owner, value } = contact;
  return { name, email, company, status, owner, value };
}

interface ContactFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit that contact; absent → create a new one. */
  contact?: Contact;
}

export function ContactFormSheet({
  open,
  onOpenChange,
  contact,
}: ContactFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!contact;
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact ? toFormValues(contact) : EMPTY_VALUES,
  });

  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) =>
      contact ? updateContact(contact.id, values) : createContact(values),
    onSuccess: ({ contact: saved }) => {
      queryClient.invalidateQueries({ queryKey: ['crm'] });
      toast.success(isEdit ? 'Contact updated' : 'Contact created', {
        description: saved.name,
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
    if (open) form.reset(contact ? toFormValues(contact) : EMPTY_VALUES);
  }, [open, contact, form]);

  const onSubmit = (values: ContactFormValues) => mutation.mutate(values);
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
              <SheetTitle>{isEdit ? 'Edit contact' : 'New contact'}</SheetTitle>
              <SheetDescription>
                {isEdit
                  ? `Update ${contact.name}'s details.`
                  : 'Add a contact to your pipeline.'}
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
                        placeholder="ada@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Northwind Traders" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OWNERS.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open value (USD)</FormLabel>
                    <FormControl>
                      {/* type=number gives a string; keep the field value a
                          number so it matches the schema (empty → 0). */}
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type="submit" loading={mutation.isPending}>
                {isEdit ? 'Save changes' : 'Create contact'}
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
