// NO '@acme/react' imports — this page is built entirely from the app's OWN
// (unprefixed) Tailwind v4 utilities, hand-rolled markup, and inline SVGs. It
// proves the app's native Tailwind works fully and independently, right beside
// the design system used on every other screen. It's a plain Server Component.

function CheckIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const STATS = [
  { label: 'Requests', value: '128.4k', delta: '+8.2%', good: true },
  { label: 'Errors', value: '0.42%', delta: '-0.1%', good: true },
  { label: 'p95 latency', value: '212ms', delta: '+14ms', good: false },
];

const ROWS = [
  { svc: 'api-gateway', region: 'us-east', status: 'Healthy' },
  { svc: 'auth', region: 'us-west', status: 'Healthy' },
  { svc: 'billing', region: 'eu-west', status: 'Degraded' },
  { svc: 'search', region: 'ap-south', status: 'Down' },
];

const STATUS_STYLES: Record<string, string> = {
  Healthy: 'bg-emerald-100 text-emerald-700',
  Degraded: 'bg-amber-100 text-amber-700',
  Down: 'bg-rose-100 text-rose-700',
};

export default function RawTailwindPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
          <IconTailwind /> Raw Tailwind
        </span>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">
          No design-system components on this page
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Everything below is hand-built from the app&apos;s own unprefixed Tailwind
          utilities — <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">bg-violet-600</code>,{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">rounded-lg</code>,{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">hover:*</code>,{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">focus:ring-*</code>. Zero{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">@acme/react</code> imports.
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Buttons</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 active:bg-violet-800"
          >
            Primary
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Secondary
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Outline
          </button>
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Ghost
          </button>
          <button
            type="button"
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            Destructive
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Disabled
          </button>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{s.value}</p>
            <span
              className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                s.good ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {s.delta}
            </span>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Form controls</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="rt-name" className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="rt-name"
                placeholder="Ada Lovelace"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
            <div>
              <label htmlFor="rt-role" className="mb-1 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                id="rt-role"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <option>Owner</option>
                <option>Admin</option>
                <option>Viewer</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              Email me about activity
            </label>
          </div>
        </section>

        {/* Alerts + progress */}
        <section className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <CheckIcon className="mt-0.5 size-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Deploy succeeded</p>
              <p className="text-sm text-emerald-700">All 4 services are healthy.</p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800">Heads up</p>
            <p className="text-sm text-amber-700">p95 latency rose 14ms in the last hour.</p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {[
              { label: 'CPU', pct: 62, color: 'bg-violet-600' },
              { label: 'Memory', pct: 38, color: 'bg-emerald-500' },
              { label: 'Disk', pct: 84, color: 'bg-rose-500' },
            ].map((m) => (
              <div key={m.label} className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{m.label}</span>
                  <span>{m.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Service</th>
              <th className="px-4 py-2.5 font-medium">Region</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ROWS.map((r) => (
              <tr key={r.svc} className="transition hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-900">{r.svc}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.region}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function IconTailwind() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden>
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C13.38 10.79 14.47 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.62 7.21 14.53 6 12 6ZM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C8.38 16.79 9.47 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.62 13.21 9.53 12 7 12Z" />
    </svg>
  );
}
