import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
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
import { Link } from '@tanstack/react-router';
import { z } from 'zod';

import { requestPasswordReset } from '../../lib/auth-api';

const forgotSchema = z.object({
  email: z.email('Enter a valid email address'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotRoute() {
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({ mutationFn: requestPasswordReset });
  const onSubmit = (values: ForgotValues) => mutation.mutate(values);

  if (mutation.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for {form.getValues('email')}, we&apos;ve sent
            a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            to="/login"
            className="nx:text-primary-subtle-foreground nx:text-sm nx:hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send a link to reset it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="username"
                      enterKeyHint="send"
                      placeholder="you@example.com"
                      required
                      {...field}
                    />
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
              Send reset link
            </Button>
            <Link
              to="/login"
              className="nx:text-muted-foreground nx:text-sm nx:hover:underline"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
