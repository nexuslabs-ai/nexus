# copy-vite

An existing Vite app that adopts Nexus by copying its source: shadcn
`radix-nova` with its own Button, Card and `cn`, a `~/` alias, and host
`@theme` tokens. See [`../registry/README.md`](../registry/README.md) for the
contract, how to run it and the findings.

Probe modes on `npm run preview`: `?no-nexus` (host only), `?nexus-first`
(Nexus CSS before the host's), `?nexus-only` (no host CSS) and `?provider`
(mounts `NexusAppearanceProvider`).
