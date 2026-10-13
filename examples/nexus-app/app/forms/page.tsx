'use client';

import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Input } from '@/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Switch } from '@/components/switch';
import { Textarea } from '@/components/textarea';
import { toast } from '@/components/sonner';
import { FormProvider, useForm } from 'react-hook-form';

import {
  RhfField,
  RhfFieldControl,
  RhfFieldDescription,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '@/app/lib/rhf-field';

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
    <Card className="nx:mx-auto nx:max-w-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          A validated form built with Nexus components and react-hook-form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="nx:space-y-5">
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
                <RhfFieldItem className="nx:rounded-md nx:border nx:border-border-default nx:p-4">
                  <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
                    <RhfFieldLabel>Notifications</RhfFieldLabel>
                    <RhfFieldControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </RhfFieldControl>
                  </div>
                  <RhfFieldDescription>Email me about account activity.</RhfFieldDescription>
                </RhfFieldItem>
              )}
            />

            <div className="nx:flex nx:justify-end nx:gap-3">
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
