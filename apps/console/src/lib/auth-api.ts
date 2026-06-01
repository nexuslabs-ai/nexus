/**
 * Auth API client. Thin typed wrappers over the mock endpoints served by MSW
 * (`src/mocks/handlers.ts`) — there is no real backend. Screens call these
 * through TanStack Query mutations; the resolved user is written into the
 * session store (`app/session.ts`), which is the single source of session truth.
 */

export type User = {
  id: string;
  name: string;
  email: string;
};

type ApiError = { message?: string };

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(data.message ?? 'Something went wrong. Please try again.');
  }
  return res.json() as Promise<T>;
}

export type Credentials = { email: string; password: string };
export type SignupInput = { name: string; email: string; password: string };
export type VerifyInput = { email: string; code: string };

/** Credentials check succeeds → the email proceeds to the OTP step. */
export const login = (creds: Credentials) =>
  post<{ email: string }>('/api/auth/login', creds);

export const signup = (input: SignupInput) =>
  post<{ email: string }>('/api/auth/signup', input);

/** OTP check succeeds → the authenticated user is returned. */
export const verifyOtp = (input: VerifyInput) =>
  post<{ user: User }>('/api/auth/verify-otp', input);

export const requestPasswordReset = (input: { email: string }) =>
  post<{ ok: true }>('/api/auth/forgot', input);
