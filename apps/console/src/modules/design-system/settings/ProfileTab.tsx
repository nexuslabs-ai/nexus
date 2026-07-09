import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  toast,
} from '@nexus_ds/react';
import { z } from 'zod';

import {
  RhfField,
  RhfFieldControl,
  RhfFieldDescription,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '../../../lib/rhf-field';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Enter a valid email address'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
  bio: z.string().max(160, 'Bio must be 160 characters or less'),
});

type ProfileValues = z.infer<typeof profileSchema>;

const DEFAULT_VALUES: ProfileValues = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  username: 'ada',
  bio: 'Mathematician and writer, known for work on the Analytical Engine.',
};

export function ProfileTab() {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = (values: ProfileValues) => {
    toast.success('Profile saved', {
      description: `Saved changes for @${values.username}.`,
    });
  };

  return (
    <Card>
      <FormProvider {...form}>
        {/* noValidate: let zod + RhfFieldMessage own validation, not the native bubble */}
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information. Validated with zod.
            </CardDescription>
          </CardHeader>
          <CardContent className="nx:space-y-5">
            <div className="nx:grid nx:gap-5 nx:sm:grid-cols-2">
              <RhfField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>First name</RhfFieldLabel>
                    <RhfFieldControl>
                      <Input placeholder="Ada" {...field} />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />
              <RhfField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <RhfFieldItem>
                    <RhfFieldLabel>Last name</RhfFieldLabel>
                    <RhfFieldControl>
                      <Input placeholder="Lovelace" {...field} />
                    </RhfFieldControl>
                    <RhfFieldMessage />
                  </RhfFieldItem>
                )}
              />
            </div>

            <RhfField
              control={form.control}
              name="email"
              render={({ field }) => (
                <RhfFieldItem>
                  <RhfFieldLabel>Email</RhfFieldLabel>
                  <RhfFieldControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </RhfFieldControl>
                  <RhfFieldDescription>
                    We&apos;ll use this for account notifications.
                  </RhfFieldDescription>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />

            <RhfField
              control={form.control}
              name="username"
              render={({ field }) => (
                <RhfFieldItem>
                  <RhfFieldLabel>Username</RhfFieldLabel>
                  <RhfFieldControl>
                    <Input placeholder="ada" {...field} />
                  </RhfFieldControl>
                  <RhfFieldDescription>
                    Your public display name.
                  </RhfFieldDescription>
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
                    <Textarea
                      placeholder="Tell us a little about yourself"
                      {...field}
                    />
                  </RhfFieldControl>
                  <RhfFieldDescription>
                    Maximum 160 characters.
                  </RhfFieldDescription>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />
          </CardContent>
          <CardFooter className="nx:justify-end nx:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit">Save profile</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
