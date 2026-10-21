import { KeyRoundIcon, TriangleAlertIcon } from "lucide-react"

import * as N from "@/components/nxds-kit"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const API_KEYS = [
  { name: "Production", key: "sk_live_…4f2a", created: "2 Sep 2026", status: "Active" },
  { name: "Staging", key: "sk_test_…91bc", created: "18 Aug 2026", status: "Active" },
  { name: "Legacy import", key: "sk_live_…07de", created: "3 Mar 2026", status: "Revoked" },
]

const NOTIFICATIONS = [
  { id: "deploys", label: "Deploys", description: "A deploy finishes or fails.", on: true },
  { id: "billing", label: "Billing", description: "An invoice is issued or a payment fails.", on: true },
  { id: "digest", label: "Weekly digest", description: "A summary of workspace activity.", on: false },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">An existing shadcn page. The Notifications and API keys sections are nxds.</p>
      </div>

      <Card data-check="host">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How your teammates see you.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Prasad Patewar" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="prasad@acme.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select defaultValue="admin">
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-check="host">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" defaultValue="Design systems and developer tooling." />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save profile</Button>
        </CardFooter>
      </Card>

      <div data-check="nxds">
        <N.Card>
          <N.CardHeader>
            <N.CardTitle>Notifications</N.CardTitle>
            <N.CardDescription>Choose what we email you about.</N.CardDescription>
          </N.CardHeader>
          <N.CardContent className="nx:grid nx:gap-4">
            {NOTIFICATIONS.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <N.Label htmlFor={`notify-${item.id}`}>{item.label}</N.Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <N.Switch id={`notify-${item.id}`} defaultChecked={item.on} />
              </div>
            ))}
            <N.Separator />
            <N.RadioGroup defaultValue="instant" className="nx:flex nx:gap-6">
              <div className="flex items-center gap-2">
                <N.RadioGroupItem value="instant" id="cadence-instant" />
                <N.Label htmlFor="cadence-instant">Instantly</N.Label>
              </div>
              <div className="flex items-center gap-2">
                <N.RadioGroupItem value="hourly" id="cadence-hourly" />
                <N.Label htmlFor="cadence-hourly">Hourly batch</N.Label>
              </div>
            </N.RadioGroup>
          </N.CardContent>
        </N.Card>
      </div>

      <Card data-check="host">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4" />
            API keys
          </CardTitle>
          <CardDescription>A shadcn card holding an nxds table.</CardDescription>
        </CardHeader>
        <CardContent data-check="nxds">
          <N.Table density="compact">
            <N.TableHeader>
              <N.TableRow>
                <N.TableHead>Name</N.TableHead>
                <N.TableHead>Key</N.TableHead>
                <N.TableHead>Created</N.TableHead>
                <N.TableHead>Status</N.TableHead>
              </N.TableRow>
            </N.TableHeader>
            <N.TableBody>
              {API_KEYS.map((row) => (
                <N.TableRow key={row.name}>
                  <N.TableCell>{row.name}</N.TableCell>
                  <N.TableCell className="nx:font-mono">{row.key}</N.TableCell>
                  <N.TableCell>{row.created}</N.TableCell>
                  <N.TableCell>
                    <N.Badge variant={row.status === "Active" ? "success" : "secondary"} fill="light">
                      {row.status}
                    </N.Badge>
                  </N.TableCell>
                </N.TableRow>
              ))}
            </N.TableBody>
          </N.Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">
            Create key
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      <div data-check="host" className="grid gap-4">
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Delete workspace</AlertTitle>
          <AlertDescription>This removes every project, key and member. It cannot be undone.</AlertDescription>
        </Alert>
        <div data-check="nxds">
          <N.Dialog>
            <N.DialogTrigger asChild>
              <N.Button variant="destructive" data-check-open>
                Delete workspace
              </N.Button>
            </N.DialogTrigger>
            <N.DialogContent data-check="nxds">
              <N.DialogHeader>
                <N.DialogTitle>Delete Acme Console?</N.DialogTitle>
                <N.DialogDescription>Type the workspace name to confirm.</N.DialogDescription>
              </N.DialogHeader>
              <N.DialogBody data-check="host">
                <Input placeholder="Acme Console" />
              </N.DialogBody>
              <N.DialogFooter>
                <N.DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </N.DialogClose>
                <N.Button variant="destructive">Delete</N.Button>
              </N.DialogFooter>
            </N.DialogContent>
          </N.Dialog>
        </div>
      </div>
    </div>
  )
}
