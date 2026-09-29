import { useState } from 'react'

import { Button as NexusButton } from '~/components/nexus/components/button'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { NexusPanel } from '~/NexusPanel'

export default function App({ withNexus }: { withNexus: boolean }) {
  const [dark, setDark] = useState(false)

  return (
    <div className={dark ? 'dark' : undefined}>
      <main
        data-probe="host-main"
        className="bg-background text-foreground min-h-svh p-gutter"
      >
        <header className="flex items-center justify-between gap-4">
          <h1 data-probe="host-h1" className="text-2xl font-semibold">
            Host app
          </h1>
          <Button
            data-probe="host-theme-toggle"
            variant="outline"
            onClick={() => setDark(!dark)}
          >
            {dark ? 'Light' : 'Dark'}
          </Button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card data-probe="host-card" className="rounded-panel">
            <CardHeader>
              <CardTitle>Existing card</CardTitle>
              <CardDescription>Built with the host's shadcn tokens.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button data-probe="host-button">Host primary</Button>
              <span data-probe="host-brand" className="bg-brand rounded-md px-2 text-white">
                Brand
              </span>
              <span data-probe="host-success" className="text-success-foreground">
                Saved
              </span>
            </CardContent>
          </Card>

          <article data-probe="host-prose">
            <h2 data-probe="host-h2">Unstyled content</h2>
            <p>
              A paragraph with a{' '}
              <a data-probe="host-link" href="#top">
                link
              </a>
              .
            </p>
            <ul data-probe="host-ul">
              <li>First</li>
              <li>Second</li>
            </ul>
            <button data-probe="host-native-button" type="button">
              Native button
            </button>
            <img
              data-probe="host-img"
              alt=""
              width={40}
              height={40}
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'/%3E"
            />
          </article>
        </section>

        {withNexus && (
          <>
            <NexusPanel />
            <div
              data-nexus-root=""
              data-nx-mode="dark"
              data-probe="nexus-bare-dark-root"
              className="mt-6 p-4"
            >
              <NexusButton data-probe="nexus-bare-dark-button">
                Static dark defaults
              </NexusButton>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
