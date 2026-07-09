'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  toast,
} from '@acme/react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  RhfField,
  RhfFieldControl,
  RhfFieldDescription,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '../lib/rhf-field';

type Values = {
  name: string;
  email: string;
  role: string;
  bio: string;
  notifications: boolean;
};

export default function FormsPage() {
  const form = useForm<Values>({
    defaultValues: { name: '', email: '', role: '', bio: '', notifications: true },
  });

  const onSubmit = (values: Values) => {
    toast.success('Profile saved', {
      description: `${values.name || 'Someone'} · ${values.role || 'no role'}`,
    });
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          A validated form built with @acme/react + react-hook-form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <RhfField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
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
              rules={{
                required: 'Email is required',
                pattern: { value: /^[^@\s]+@[^@\s]+$/, message: 'Enter a valid email' },
              }}
              render={({ field }) => (
                <RhfFieldItem>
                  <RhfFieldLabel>Email</RhfFieldLabel>
                  <RhfFieldControl>
                    <Input type="email" placeholder="ada@example.com" {...field} />
                  </RhfFieldControl>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />

            <RhfField
              control={form.control}
              name="role"
              rules={{ required: 'Pick a role' }}
              render={({ field }) => (
                <RhfFieldItem>
                  <RhfFieldLabel>Role</RhfFieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <RhfFieldControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </RhfFieldControl>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />

            <RhfField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <RhfFieldItem>
                  <RhfFieldLabel>Bio</RhfFieldLabel>
                  <RhfFieldControl>
                    <Textarea rows={3} placeholder="A short bio…" {...field} />
                  </RhfFieldControl>
                  <RhfFieldDescription>Shown on your public profile.</RhfFieldDescription>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />

            <RhfField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <RhfFieldItem className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <RhfFieldLabel>Notifications</RhfFieldLabel>
                    <RhfFieldControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </RhfFieldControl>
                  </div>
                  <RhfFieldDescription>Email me about account activity.</RhfFieldDescription>
                </RhfFieldItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
