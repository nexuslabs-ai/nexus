# react18-app

A Vite app on React 18.3 that set nxds up with `nxds-cli init`. The CLI read
React 18 from `package.json`, recorded `"react": 18` in `nxds.json`, and copied
the React 18 files: each component that takes a `ref` is wrapped in
`forwardRef`.

| Path | What it is |
| ---- | ---------- |
| `src/components/nxds/` | nxds's React 18 files, installed from this repository by `npm run nxds:add`. Committed |
| `src/App.tsx` | One settings page that uses each pattern React 18 needs `forwardRef` for |
| `src/nxds.css` | The nxds Tailwind entry |
| `nxds.vite.ts` | The first-paint appearance script, which `init` added to `vite.config.ts` |
| `nxds.json` | The `nxds` CLI config: the React major and which items the app has |

## What the page covers

| Pattern | Where |
| ------- | ----- |
| A Button as an `asChild` trigger, so its ref anchors the overlay and takes focus back | Popover, DropdownMenu, Tooltip, Sheet and Dialog |
| A `ref` you pass to Button | Invite, which the footer's Invite someone focuses |
| A trigger an nxds component renders for you | Select, Combobox and MultiSelect |
| Day buttons that take focus from the keyboard | DatePicker, on the Schedule tab |

## Run it

```bash
cd examples/react18-app
npm ci
npm run build
npx vite preview
```

After changing nxds source, run `pnpm --filter @nxds/react-18 generate` at the
repository root, then `npm run nxds:add` here.
