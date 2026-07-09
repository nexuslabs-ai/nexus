import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from '@nexus_ds/react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { signup } from '../../lib/auth-api';
import {
  RhfField,
  RhfFieldControl,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '../../lib/rhf-field';

const signupSchema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupRoute() {
  const navigate = useNavigate();
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: ({ email }) => navigate({ to: '/verify', search: { email } }),
    onError: (error: Error) =>
      form.setError('root', { message: error.message }),
  });

  const onSubmit = (values: SignupValues) => mutation.mutate(values);
  const rootError = form.formState.errors.root?.message;

  return (
    <Card>
      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Start your Atlas workspace. We&apos;ll send a code to confirm your
              email.
            </CardDescription>
          </CardHeader>
          <CardContent className="nx:space-y-5">
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
                    <Input
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      placeholder="Ada Lovelace"
                      required
                      {...field}
                    />
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
                      autoComplete="username"
                      enterKeyHint="next"
                      placeholder="you@example.com"
                      required
                      {...field}
                    />
                  </RhfFieldControl>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />
            <RhfField
              control={form.control}
              name="password"
              render={({ field }) => (
                <RhfFieldItem>
                  <RhfFieldLabel>Password</RhfFieldLabel>
                  <RhfFieldControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      enterKeyHint="go"
                      placeholder="••••••••"
                      required
                      {...field}
                    />
                  </RhfFieldControl>
                  <RhfFieldMessage />
                </RhfFieldItem>
              )}
            />
          </CardContent>
          <CardFooter className="nx:flex-col nx:gap-4">
            <Button
              type="submit"
              className="nx:w-full"
              loading={mutation.isPending}
            >
              Create account
            </Button>
            <p className="nx:text-muted-foreground nx:typography-body-default">
              Already have an account?{' '}
              <Link
                to="/login"
                className="nx:text-primary-subtle-foreground nx:hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
