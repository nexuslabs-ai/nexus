import { useState } from 'react'

import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core'

import { NexusRoot } from '~/components/nexus/components/appearance/provider'
import { Button as HostButton } from '~/components/ui/button'
import { Button } from '~/components/nexus/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/nexus/components/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/nexus/components/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/nexus/components/popover'
import { Progress } from '~/components/nexus/components/progress'

export function NexusPanel() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  return (
    <NexusRoot
      state={{ ...DEFAULT_NEXUS_APPEARANCE, mode }}
      data-probe="nexus-panel"
      className="mt-6 grid gap-4 sm:grid-cols-2"
    >
      <Card data-probe="nexus-card">
        <CardHeader>
          <CardTitle>Nexus card</CardTitle>
          <CardDescription>Copied Nexus source beside the host.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button data-probe="nexus-button">Nexus primary</Button>
            <Button data-probe="nexus-button-outline" variant="outline">
              Nexus outline
            </Button>
          </div>
          <Progress data-probe="nexus-progress" value={null} />
          <div data-probe="host-in-nexus-card" className="flex gap-2">
            <HostButton data-probe="host-button-in-nexus-card">Host inside Nexus</HostButton>
            <span data-probe="host-success-in-nexus-card" className="text-success-foreground">
              Saved
            </span>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            data-probe="nexus-mode-toggle"
            variant="ghost"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          >
            Nexus {mode === 'dark' ? 'light' : 'dark'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button data-probe="nexus-dialog-trigger" variant="secondary">
                Open dialog
              </Button>
            </DialogTrigger>
            <DialogContent data-probe="nexus-dialog">
              <DialogHeader>
                <DialogTitle>Nexus dialog</DialogTitle>
                <DialogDescription>Portalled to document.body.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p data-probe="nexus-dialog-text">Body text inherits from the dialog.</p>
              </DialogBody>
              <DialogFooter>
                <HostButton data-probe="host-button-in-nexus-dialog" variant="outline">
                  Host button
                </HostButton>
                <Button data-probe="nexus-button-in-dialog">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Popover>
            <PopoverTrigger asChild>
              <Button data-probe="nexus-popover-trigger" variant="outline">
                Open popover
              </Button>
            </PopoverTrigger>
            <PopoverContent data-probe="nexus-popover">
              <p data-probe="nexus-popover-text">Popover content</p>
              <HostButton data-probe="host-button-in-nexus-popover" size="sm">
                Host
              </HostButton>
            </PopoverContent>
          </Popover>
        </CardFooter>
      </Card>
    </NexusRoot>
  )
}
