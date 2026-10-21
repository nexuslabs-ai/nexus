# Working examples

Homepage gallery, separate from Hero studio. Settings, project filtering, and onboarding use local state only. The repository homepage includes it before its resource cards; the separate Vite study mounts it after HomeShowcase.

Run `node apps/docs/app/_components/home-examples/export-sources.mjs` after editing example JSX or CSS. This regenerates the exact source displayed by View code.

## Guidance and verification

Modern Web Guidance search: `responsive interactive forms layout`; retrieved `forms` and `css-layout` on 2026-10-14. Applied labeled fields, native validation, explicit step progress, semantic table, intrinsic grid sizing and container queries. Nexus policy overrides environment-query and feature-detection fallback suggestions. No backend submission.

Verified in port 4187 preview: settings save, search/filter counts, onboarding completion, source view, desktop light/dark, and 390px layout (section scroll width equals its width). Production Vite build passed. Full ESLint is blocked by installed jsx-a11y/minimatch incompatibility; other rules pass with only label-has-associated-control disabled at the command line. Visible label associations checked in browser. No lint configuration changed.
