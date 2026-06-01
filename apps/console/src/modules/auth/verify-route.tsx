import { useState } from 'react';

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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@nexus/react';
import { useMutation } from '@tanstack/react-query';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';

import { useSession } from '../../app/session';
import { verifyOtp } from '../../lib/auth-api';

// The route owns the `email` search schema; getRouteApi reads it back typed
// without importing the route object (which would create a router ↔ screen
// import cycle). The route's beforeLoad redirects when email is absent, so the
// guard in the component body is belt-and-braces.
const verifyApi = getRouteApi('/auth/verify');

export function VerifyRoute() {
  const navigate = useNavigate();
  const { email } = verifyApi.useSearch();
  const signIn = useSession((s) => s.signIn);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: ({ user }) => {
      signIn(user);
      navigate({ to: '/' });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (!email) return null;

  const submit = (value: string) => {
    setError(null);
    mutation.mutate({ email, code: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to {email}. Demo code:{' '}
          <span className="nx:text-foreground nx:font-medium">123456</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="nx:flex nx:flex-col nx:items-center nx:gap-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          onComplete={submit}
          disabled={mutation.isPending}
          aria-label="One-time code"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardFooter className="nx:flex-col nx:gap-4">
        <Button
          className="nx:w-full"
          loading={mutation.isPending}
          disabled={code.length < 6}
          onClick={() => submit(code)}
        >
          Verify
        </Button>
        <Link
          to="/login"
          className="nx:text-muted-foreground nx:text-sm nx:hover:underline"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
