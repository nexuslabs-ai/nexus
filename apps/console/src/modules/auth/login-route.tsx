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

import { login } from '../../lib/auth-api';
import {
  RhfField,
  RhfFieldControl,
  RhfFieldItem,
  RhfFieldLabel,
  RhfFieldMessage,
} from '../../lib/rhf-field';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginRoute() {
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@atlas.dev', password: 'demo1234' },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ email }) => navigate({ to: '/verify', search: { email } }),
    onError: (error: Error) =>
      form.setError('root', { message: error.message }),
  });

  const onSubmit = (values: LoginValues) => mutation.mutate(values);
  const rootError = form.formState.errors.root?.message;

  return (
    <Card>
      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Sign in to Atlas</CardTitle>
            <CardDescription>
              Use the prefilled demo credentials, or any email with an 8+
              character password.
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
                  <div className="nx:flex nx:items-center nx:justify-between">
                    <RhfFieldLabel>Password</RhfFieldLabel>
                    <Link
                      to="/forgot"
                      className="nx:text-primary-subtle-foreground nx:typography-label-default nx:hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <RhfFieldControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
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
              Continue
            </Button>
            <p className="nx:text-muted-foreground nx:typography-body-default">
              No account?{' '}
              <Link
                to="/signup"
                className="nx:text-primary-subtle-foreground nx:hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
