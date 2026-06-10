# Atlas — multi-module B2B SaaS demo on Nexus

> **Status:** Living plan. Phase 0 in progress.
> **What:** A navigable, production-grade B2B SaaS demo app ("Atlas", a fictional company-OS) that dogfoods every `@nexus/react` component in real flows, with a global theme control that re-themes **every** screen across the 8 axes. The current playground folds in as the **Design System** module.

## Locked decisions

| Decision     | Choice                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| App location | Evolve `apps/playground` → **`apps/console`** (`@nexus/console`)                                                             |
| Router       | **TanStack Router** (typed routes + zod-validated URL search-params for filters/views/pagination)                            |
| Data         | **TanStack Query + MSW** (mock API; real loading/error/empty states, no backend)                                             |
| UI/app state | **Zustand** (sidebar, ⌘K palette, saved views)                                                                               |
| Theme        | Lift `useTheme` → root **`ThemeProvider`** (persist to localStorage); Design System module + a topbar quick-control drive it |
| Forms        | react-hook-form + zod                                                                                                        |
| References   | Tier-A patterns (Linear, Stripe, Notion, Attio, Vercel, Intercom). Connect Mobbin/Refero MCP later to cite exact screens     |
| Product name | "Atlas" (placeholder)                                                                                                        |

## Why

A real app is the strongest proof of a design system: every component composed into production flows, and one theme engine re-theming all of it. It is also a **forcing function** — building real screens surfaces exactly which components Nexus still lacks (see Gaps), feeding the component roadmap.

## Modules (hosted in the app shell: sidebar + workspace switcher + topbar ⌘K/search/notifications/user-menu)

| Module              | Tier-A ref              | Covers                                                                               |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| Home / Dashboard    | Linear, Vercel          | KPI cards, charts, activity, quick actions, onboarding checklist                     |
| CRM                 | Attio, HubSpot          | Contacts/Companies/Deals; table + kanban pipeline; record pages w/ activity timeline |
| Projects / Work     | Linear, Asana           | Issues; board + list + table + calendar; item detail; cycles                         |
| Inbox / Support     | Intercom, Front         | Conversation list + thread, assignment, canned replies, status                       |
| Billing             | Stripe                  | Plan, invoices, payment methods, usage, transactions table                           |
| Analytics / Reports | Amplitude, Stripe Sigma | Dashboards, chart library, date-range, drill-down, export                            |
| Directory / People  | Rippling, Workday       | Members, roles, profiles, departments                                                |
| Settings / Admin    | Linear, Stripe          | Profile, security, team & roles, integrations, API keys/webhooks, audit log          |
| **Design System** ★ | _(the old playground)_  | Reference showcase + Scenes + the live 8-axis **Appearance** controls                |

## Cross-cutting flows (the "every flow" coverage)

- **Auth:** login · signup · SSO/OAuth · forgot/reset · magic-link · **2FA OTP** (`InputOtp`) · accept-invite · session-expired
- **Onboarding:** create workspace · invite team · choose plan · setup checklist · first-run empty states
- **Shell:** collapsible sidebar + workspace switcher · ⌘K command palette · global search · notifications center · help · user menu · breadcrumbs · mobile drawer
- **Data views:** table (sort/filter/paginate/bulk-select/column-config) · kanban (drag-drop) · list · calendar · cards · timeline
- **Record/detail:** action header · tabbed sections · activity/comments · attachments · related records · inline edit · slide-over (`Sheet`)
- **Create/edit:** modal form · multi-step wizard · slide-over create · validation · unsaved-changes guard
- **States:** empty · loading (`Skeleton`) · error · 404 · 403/permission · success/confirmation · toasts (`Sonner`)
- **Comms:** notifications · in-app announcement banner · confirm dialogs (`AlertDialog`)

## Component coverage → gaps that feed the Nexus roadmap

**Shipped & exercised:** Accordion, Alert, AlertDialog, Avatar, Badge, Button, Card, Checkbox, Command, Dialog, DropdownMenu, Form, Input, InputOtp, Label, Popover, Progress, RadioGroup, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Sonner, Switch, Table, Tabs, Textarea, Tooltip, Show/Hide.

**Likely-missing (extract as their own Nexus component issues when first hit — do NOT hand-roll in the app):** `DataTable` (sort/filter/paginate/select over Table) · `Combobox`/Autocomplete · `DateRangePicker` (range input over the shipped `DatePicker` grid) · `Pagination` · `Breadcrumb` · **Charts** (recharts + chart tokens exist, no exported components) · `AvatarGroup` · `TagInput`/multi-select · `Stepper` · `EmptyState` · `Spinner` · `Banner` · `KBD`.

## How the playground folds in

- `ComponentShowcase` (Reference) + the Settings `Scenes` → routes under the **Design System** module (`/design/reference`, `/design/scenes`).
- The 8-axis `ThemeSwitcher` → the **Appearance** settings page **and** a compact ⌘K / topbar quick-toggle; both drive the root `ThemeProvider` so the whole app re-themes.
- `useTheme` engine, `/public/themes/*.css`, and the `data-style` mechanism carry over unchanged.

## Rename coupling (discovered during planning)

The token generator `packages/core/scripts/generate-modular.js` writes to `packages/core/dist/modular` (decoupled from the app path — only its comments say "playground"). The actual `apps/playground` path coupling is centralized:

- `scripts/sync-playground-themes.js` — `PLAYGROUND_DIR` + the `vite.config.ts` sentinel (rename file → `sync-console-themes.js`).
- root `package.json` — the `playground` script + the `tokens:modular` reference to the sync script.
- `apps/playground/package.json` — package name `@nexus/playground` → `@nexus/console`.
- Cosmetic: comments in `generate-modular.js` / its test, and `README.md`.

After the rename, run the sync once to confirm it regenerates theme CSS into `apps/console` (avoid the full `pnpm tokens:modular`, which also rewrites `packages/core/package.json`'s brand flag — a known drift).

## Folder shape (target)

```
apps/console/src/
├── app/            router tree, ThemeProvider, providers, shell layout
├── shell/          Sidebar, Topbar, CommandPalette, Notifications
├── modules/
│   ├── dashboard/ crm/ projects/ inbox/ billing/ analytics/ people/ settings/
│   └── design-system/   ← old playground (reference + scenes + appearance)
├── components/     app-level composites (DataTable, EmptyState, PageHeader…)
├── mocks/          MSW handlers + fixtures + deterministic seed
└── lib/            query client, router helpers, formatters
```

## Phased roadmap (each phase = a PR)

| Phase                              | Deliverable                                                                                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 · Foundation**                 | Rename → `apps/console`; TanStack Router + app shell (sidebar/topbar) + `ThemeProvider` + TanStack Query + MSW skeleton; fold playground into the Design System module                          |
| **1a · Core auth**                 | login · signup · 2FA OTP (`InputOtp`) · forgot-password — MSW-backed, Zustand session, route guards (pathless `_app` / `_auth` layouts), sidebar sign-out                                       |
| **1b · Auth breadth + onboarding** | SSO/OAuth · magic-link · accept-invite · session-expired · reset-password completion **+** onboarding (create workspace · invite team · choose plan · setup checklist · first-run empty states) |
| **2 · Flagship module (CRM)**      | end-to-end: table + kanban + record page + create/edit + filters/saved views (proves the deep patterns once)                                                                                    |
| **3 · Breadth**                    | Projects, Inbox, Billing, Analytics, People — reusing Phase-2 patterns                                                                                                                          |
| **4 · Cross-cutting**              | ⌘K palette, global search, notifications center, all states (empty/error/404/403), responsive                                                                                                   |
| **5 · Polish + theme proof**       | Appearance quick-control, "flip a theme axis → whole app re-themes" demo, a11y/contrast sweep                                                                                                   |

Missing components are extracted as their own Nexus component issues as they're hit — never hand-rolled in the app.
