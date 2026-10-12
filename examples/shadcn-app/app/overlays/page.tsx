"use client"

import { toast } from "sonner"

import * as N from "@/components/nexus-kit"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const REGIONS = ["Frankfurt", "Virginia", "Singapore"]

function ShadcnDialogWithNexusInside() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-check-open>shadcn dialog → Nexus inside</Button>
      </DialogTrigger>
      <DialogContent data-check="host">
        <DialogHeader>
          <DialogTitle>Deploy settings</DialogTitle>
          <DialogDescription>A shadcn dialog. Every control below is Nexus.</DialogDescription>
        </DialogHeader>
        <div data-check="nexus" className="grid gap-4">
          <div className="grid gap-2">
            <N.Label htmlFor="deploy-region">Region</N.Label>
            <N.Select defaultValue="Frankfurt">
              <N.SelectTrigger id="deploy-region">
                <N.SelectValue />
              </N.SelectTrigger>
              <N.SelectContent data-check="nexus">
                {REGIONS.map((region) => (
                  <N.SelectItem key={region} value={region}>
                    {region}
                  </N.SelectItem>
                ))}
              </N.SelectContent>
            </N.Select>
          </div>
          <div className="flex gap-2">
            <N.Popover>
              <N.PopoverTrigger asChild>
                <N.Button variant="outline">Nexus popover</N.Button>
              </N.PopoverTrigger>
              <N.PopoverContent data-check="nexus">Rolls out to 10% of traffic first.</N.PopoverContent>
            </N.Popover>
            <N.DropdownMenu>
              <N.DropdownMenuTrigger asChild>
                <N.Button variant="outline">Nexus menu</N.Button>
              </N.DropdownMenuTrigger>
              <N.DropdownMenuContent data-check="nexus">
                <N.DropdownMenuItem>Redeploy</N.DropdownMenuItem>
                <N.DropdownMenuItem>Roll back</N.DropdownMenuItem>
              </N.DropdownMenuContent>
            </N.DropdownMenu>
            <N.Tooltip>
              <N.TooltipTrigger asChild>
                <N.Button variant="ghost">Nexus tooltip</N.Button>
              </N.TooltipTrigger>
              <N.TooltipContent data-check="nexus">Last deploy 4 minutes ago</N.TooltipContent>
            </N.Tooltip>
          </div>
        </div>
        <DialogFooter>
          <Button>Deploy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NexusDialogWithShadcnInside() {
  return (
    <N.Dialog>
      <N.DialogTrigger asChild>
        <N.Button data-check-open>Nexus dialog → shadcn inside</N.Button>
      </N.DialogTrigger>
      <N.DialogContent data-check="nexus">
        <N.DialogHeader>
          <N.DialogTitle>Invite teammate</N.DialogTitle>
          <N.DialogDescription>A Nexus dialog. Every control below is shadcn.</N.DialogDescription>
        </N.DialogHeader>
        <N.DialogBody>
          <div data-check="host" className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select defaultValue="member">
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent data-check="host">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">shadcn popover</Button>
                </PopoverTrigger>
                <PopoverContent data-check="host">Invites expire after 7 days.</PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">shadcn menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent data-check="host">
                  <DropdownMenuItem>Copy invite link</DropdownMenuItem>
                  <DropdownMenuItem>Resend email</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost">shadcn tooltip</Button>
                </TooltipTrigger>
                <TooltipContent data-check="host">3 seats left on your plan</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </N.DialogBody>
        <N.DialogFooter>
          <N.Button>Send invite</N.Button>
        </N.DialogFooter>
      </N.DialogContent>
    </N.Dialog>
  )
}

export default function OverlaysPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Overlays</h1>
        <p className="mt-1 text-muted-foreground">
          Each system&apos;s dialog holding the other&apos;s select, popover, menu and tooltip. Check focus, stacking
          and dismissal.
        </p>
      </div>

      <section data-check="host" className="flex flex-wrap gap-3">
        <ShadcnDialogWithNexusInside />
        <NexusDialogWithShadcnInside />
      </section>

      <section data-check="host" className="grid gap-3">
        <h2 className="text-lg font-medium">Toasts</h2>
        <p className="text-sm text-muted-foreground">
          The app mounts both Toasters. Each shows only its own system&apos;s toasts.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast.success("Saved with the shadcn toast")}>
            shadcn toast
          </Button>
          <N.Button variant="outline" onClick={() => N.toast.success("Saved with the Nexus toast")}>
            Nexus toast
          </N.Button>
        </div>
      </section>
    </div>
  )
}
