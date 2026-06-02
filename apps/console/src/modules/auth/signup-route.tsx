import { useForm } from 'react-hook-form';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@nexus/react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { signup } from '../../lib/auth-api';

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
      <Form {...form}>
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
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
            <p className="nx:text-muted-foreground nx:text-sm">
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
      </Form>
    </Card>
  );
}
