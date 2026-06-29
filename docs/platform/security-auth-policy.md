# Platform Security And Demo Auth Policy

This policy records the production-readiness boundary for the Nexus docs app,
demo console, and package appearance runtime. It covers the Track B hardening
work for #394 and #398.

## Source-Owned Docs Headers

`apps/docs/next.config.ts` is the source default for the Next docs app. Hosts
that do not honor Next `headers()` must mirror these headers in their CDN or
platform config.

| Header                                | Source default                                            | Rationale                                                                       |
| ------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Content-Security-Policy-Report-Only` | Report-only CSP with the docs theme bootstrap hash        | Existing app rollout should collect compatibility evidence before enforcement.  |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`                         | Avoids leaking full URLs cross-origin while preserving useful origin referrers. |
| `X-Content-Type-Options`              | `nosniff`                                                 | Requires browsers to trust declared content types.                              |
| `X-Frame-Options`                     | `SAMEORIGIN`                                              | Blocks cross-origin clickjacking while preserving same-origin docs previews.    |
| `Permissions-Policy`                  | Disable camera, geolocation, microphone, payment, and usb | The docs app does not need these powerful browser capabilities.                 |

The report-only CSP intentionally allows the hashed inline docs theme bootstrap
and inline styles while the app is audited. `apps/docs/scripts/audit-csp-inventory.mjs`
must be used after a docs build to inspect the actual inline script inventory,
including the `/appearance-ssr` fixture added for package first-paint proof.

## Deployment-Owned Security Policy

These controls depend on the production host, reporting service, HTTPS
ownership, or cross-origin integration inventory, so they are not enforced from
source in this PR.

| Control                | Deployment decision                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSP enforcement        | Move from report-only only after violations are understood and framework inline behavior is accounted for.                                         |
| CSP reporting endpoint | Add `Reporting-Endpoints` / `report-to` only when a real endpoint exists and report payloads are scrubbed for PII or secrets.                      |
| HSTS                   | Start with `Strict-Transport-Security: max-age=300`; expand to one year, `includeSubDomains`, and `preload` only after HTTPS and subdomain audits. |
| COOP / CORP / COEP     | Evaluate popup, embed, package fixture, and cross-origin asset compatibility before enforcement.                                                   |
| Vite console headers   | Configure at the static host; the console appearance bootstrap is inline and needs its own hash or nonce before CSP enforcement.                   |

## Demo Console Session Policy

The console auth flow is MSW-backed demo behavior. It is useful for showing the
Atlas shell, but it is not a production auth boundary and must not be copied as
a production session pattern.

- `apps/console/src/app/session.ts` may persist the demo `User` object in
  `localStorage` only for the mock console.
- Demo logout must clear the script-readable `nexus-console-session` key.
- Production auth/session state must be server-issued cookie state, for example
  `__Host-session=...; Secure; HttpOnly; SameSite=Lax; Path=/`.
- Do not set a `Domain` attribute unless a deliberate cross-subdomain auth
  design requires it.
- Production state-changing requests need server-side CSRF and origin checks in
  addition to cookie attributes.
- A production logout endpoint should expire the server session cookie and can
  use `Clear-Site-Data` for `"cookies"`, `"storage"`, and `"cache"` when the
  product accepts that non-sensitive preferences may be cleared too.

## Non-Sensitive Preference Storage

Script-readable storage remains allowed for non-sensitive preferences. These
values must not contain auth tokens, session identifiers, credentials, or PII.

- Docs and package appearance preferences may use the sanitized appearance
  cookie/local snapshot model. CSS is derived fresh from sanitized state.
- The docs `/appearance-ssr` fixture may read the appearance state cookie on the
  server and emit a first-paint package script with `storageKey={false}`.
- Console appearance and shell preferences, such as `nexus-console-sidebar`,
  may use `localStorage`.
- The shared `sidebar_state` cookie is a client-set UI preference only. It uses
  `SameSite=Lax`; it cannot be `HttpOnly` because the client owns the write.
