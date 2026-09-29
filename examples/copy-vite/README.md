# copy-vite

An existing Vite app that adopts Nexus by copying its source: shadcn
`radix-nova` with its own Button, Card and `cn`, a `~/` alias, and host
`@theme` tokens. See [`../registry/README.md`](../registry/README.md) for the
contract, how to run it and the findings.

The Nexus panel sits in a `NexusRoot` with runtime mode and density
controls; a bare static dark root below it shows the generated defaults.
Probe modes on `npm run preview`: `?no-nexus` (host only), `?nexus-first`
(Nexus CSS before the host's), `?nexus-only` (no host CSS) and
`?data-theme` (the host marks `<html data-theme="dark">`).
