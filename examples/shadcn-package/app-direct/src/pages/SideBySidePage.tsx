import { AlertCircleIcon, CheckCircle2Icon, PlusIcon } from "lucide-react"

import * as N from "../components/nexus-kit"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui"

const INVOICES = [
  { id: "INV-001", customer: "Northwind", status: "Paid", amount: "$1,250.00" },
  { id: "INV-002", customer: "Globex", status: "Pending", amount: "$480.00" },
  { id: "INV-003", customer: "Initech", status: "Overdue", amount: "$2,140.00" },
]

const PLANS = ["Starter", "Pro", "Enterprise"]

function Row({ name, host, nexus }: { name: string; host: React.ReactNode; nexus: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr_1fr] items-start gap-6 border-b py-6 last:border-b-0">
      <div className="pt-1 text-sm font-medium">{name}</div>
      <div data-check="host" className="flex min-w-0 flex-wrap items-center gap-3">
        {host}
      </div>
      <div data-check="nexus" className="flex min-w-0 flex-wrap items-center gap-3">
        {nexus}
      </div>
    </div>
  )
}

export function SideBySidePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Side by side</h1>
      <p className="mt-1 text-muted-foreground">The same component from the app&apos;s shadcn kit and from Nexus.</p>

      <div className="mt-6 grid grid-cols-[9rem_1fr_1fr] gap-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span />
        <span>shadcn (host)</span>
        <span>Nexus</span>
      </div>

      <Row
        name="Button"
        host={
          <>
            <Button>Save</Button>
            <Button variant="secondary">Draft</Button>
            <Button variant="outline">Cancel</Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Learn more</Button>
          </>
        }
        nexus={
          <>
            <N.Button>Save</N.Button>
            <N.Button variant="secondary">Draft</N.Button>
            <N.Button variant="outline">Cancel</N.Button>
            <N.Button variant="ghost">Skip</N.Button>
            <N.Button variant="destructive">Delete</N.Button>
            <N.Button variant="link">Learn more</N.Button>
          </>
        }
      />
      <Row
        name="Button sizes"
        host={
          <>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
            <Button disabled>Disabled</Button>
          </>
        }
        nexus={
          <>
            <N.Button size="sm">Small</N.Button>
            <N.Button>Default</N.Button>
            <N.Button size="lg">Large</N.Button>
            <N.Button size="icon" aria-label="Add">
              <PlusIcon />
            </N.Button>
            <N.Button disabled>Disabled</N.Button>
            <N.Button loading>Saving</N.Button>
          </>
        }
      />
      <Row
        name="Badge"
        host={
          <>
            <Badge>Active</Badge>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">Archived</Badge>
            <Badge variant="destructive">Failed</Badge>
          </>
        }
        nexus={
          <>
            <N.Badge>Active</N.Badge>
            <N.Badge variant="secondary">Draft</N.Badge>
            <N.Badge variant="success">Paid</N.Badge>
            <N.Badge variant="warning" fill="light">
              Pending
            </N.Badge>
            <N.Badge variant="error" fill="outline">
              Overdue
            </N.Badge>
          </>
        }
      />
      <Row
        name="Input"
        host={
          <div className="grid w-full max-w-xs gap-2">
            <Label htmlFor="host-email">Email</Label>
            <Input id="host-email" type="email" placeholder="you@acme.com" />
            <Input placeholder="Disabled" disabled />
          </div>
        }
        nexus={
          <div className="grid w-full max-w-xs gap-2">
            <N.Label htmlFor="nexus-email">Email</N.Label>
            <N.Input id="nexus-email" type="email" placeholder="you@acme.com" />
            <N.Input placeholder="Disabled" disabled />
            <N.Input placeholder="Invalid" aria-invalid />
          </div>
        }
      />
      <Row
        name="Textarea"
        host={<Textarea className="max-w-xs" placeholder="Tell us about your team" />}
        nexus={<N.Textarea className="nx:max-w-xs" placeholder="Tell us about your team" />}
      />
      <Row
        name="Select"
        host={
          <Select defaultValue="Pro">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent data-check="host">
              {PLANS.map((plan) => (
                <SelectItem key={plan} value={plan}>
                  {plan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        nexus={
          <N.Select defaultValue="Pro">
            <N.SelectTrigger className="nx:w-48">
              <N.SelectValue placeholder="Plan" />
            </N.SelectTrigger>
            <N.SelectContent data-check="nexus">
              {PLANS.map((plan) => (
                <N.SelectItem key={plan} value={plan}>
                  {plan}
                </N.SelectItem>
              ))}
            </N.SelectContent>
          </N.Select>
        }
      />
      <Row
        name="Checkbox"
        host={
          <>
            <div className="flex items-center gap-2">
              <Checkbox id="host-terms" defaultChecked />
              <Label htmlFor="host-terms">Accept terms</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="host-news" />
              <Label htmlFor="host-news">Newsletter</Label>
            </div>
          </>
        }
        nexus={
          <>
            <div className="flex items-center gap-2">
              <N.Checkbox id="nexus-terms" defaultChecked />
              <N.Label htmlFor="nexus-terms">Accept terms</N.Label>
            </div>
            <div className="flex items-center gap-2">
              <N.Checkbox id="nexus-news" />
              <N.Label htmlFor="nexus-news">Newsletter</N.Label>
            </div>
          </>
        }
      />
      <Row
        name="Switch"
        host={
          <div className="flex items-center gap-2">
            <Switch id="host-alerts" defaultChecked />
            <Label htmlFor="host-alerts">Email alerts</Label>
          </div>
        }
        nexus={
          <div className="flex items-center gap-2">
            <N.Switch id="nexus-alerts" defaultChecked />
            <N.Label htmlFor="nexus-alerts">Email alerts</N.Label>
          </div>
        }
      />
      <Row
        name="Radio group"
        host={
          <RadioGroup defaultValue="monthly" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="monthly" id="host-monthly" />
              <Label htmlFor="host-monthly">Monthly</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yearly" id="host-yearly" />
              <Label htmlFor="host-yearly">Yearly</Label>
            </div>
          </RadioGroup>
        }
        nexus={
          <N.RadioGroup defaultValue="monthly" className="nx:flex nx:gap-4">
            <div className="flex items-center gap-2">
              <N.RadioGroupItem value="monthly" id="nexus-monthly" />
              <N.Label htmlFor="nexus-monthly">Monthly</N.Label>
            </div>
            <div className="flex items-center gap-2">
              <N.RadioGroupItem value="yearly" id="nexus-yearly" />
              <N.Label htmlFor="nexus-yearly">Yearly</N.Label>
            </div>
          </N.RadioGroup>
        }
      />
      <Row
        name="Tabs"
        host={
          <Tabs defaultValue="overview" className="w-full max-w-sm">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-muted-foreground">
              Your workspace at a glance.
            </TabsContent>
          </Tabs>
        }
        nexus={
          <N.Tabs defaultValue="overview" className="nx:w-full nx:max-w-sm">
            <N.TabsList>
              <N.TabsTrigger value="overview">Overview</N.TabsTrigger>
              <N.TabsTrigger value="usage">Usage</N.TabsTrigger>
              <N.TabsTrigger value="billing">Billing</N.TabsTrigger>
            </N.TabsList>
            <N.TabsContent value="overview">Your workspace at a glance.</N.TabsContent>
          </N.Tabs>
        }
      />
      <Row
        name="Card"
        host={
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Team plan</CardTitle>
              <CardDescription>8 of 10 seats used.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">Renews on 12 November.</CardContent>
            <CardFooter>
              <Button size="sm">Add seats</Button>
            </CardFooter>
          </Card>
        }
        nexus={
          <N.Card className="nx:w-full nx:max-w-sm">
            <N.CardHeader>
              <N.CardTitle>Team plan</N.CardTitle>
              <N.CardDescription>8 of 10 seats used.</N.CardDescription>
            </N.CardHeader>
            <N.CardContent>Renews on 12 November.</N.CardContent>
            <N.CardFooter>
              <N.Button size="sm">Add seats</N.Button>
            </N.CardFooter>
          </N.Card>
        }
      />
      <Row
        name="Alert"
        host={
          <div className="grid w-full gap-3">
            <Alert>
              <CheckCircle2Icon />
              <AlertTitle>Payment received</AlertTitle>
              <AlertDescription>Invoice INV-001 is paid.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Card declined</AlertTitle>
              <AlertDescription>Update your billing details.</AlertDescription>
            </Alert>
          </div>
        }
        nexus={
          <div className="grid w-full gap-3">
            <N.Alert variant="success">
              <N.AlertIcon>
                <CheckCircle2Icon />
              </N.AlertIcon>
              <N.AlertContent>
                <N.AlertTitle>Payment received</N.AlertTitle>
                <N.AlertDescription>Invoice INV-001 is paid.</N.AlertDescription>
              </N.AlertContent>
            </N.Alert>
            <N.Alert variant="destructive">
              <N.AlertIcon>
                <AlertCircleIcon />
              </N.AlertIcon>
              <N.AlertContent>
                <N.AlertTitle>Card declined</N.AlertTitle>
                <N.AlertDescription>Update your billing details.</N.AlertDescription>
              </N.AlertContent>
            </N.Alert>
          </div>
        }
      />
      <Row
        name="Avatar"
        host={
          <>
            <Avatar>
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
          </>
        }
        nexus={
          <>
            <N.Avatar>
              <N.AvatarFallback>PP</N.AvatarFallback>
            </N.Avatar>
            <N.Avatar shape="rounded">
              <N.AvatarFallback>AG</N.AvatarFallback>
            </N.Avatar>
          </>
        }
      />
      <Row
        name="Progress"
        host={<Progress value={64} className="max-w-xs" />}
        nexus={
          <div className="grid w-full max-w-xs gap-3">
            <N.Progress value={64} />
            <N.Progress value={null} />
          </div>
        }
      />
      <Row
        name="Table"
        host={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        nexus={
          <N.Table>
            <N.TableHeader>
              <N.TableRow>
                <N.TableHead>Invoice</N.TableHead>
                <N.TableHead>Customer</N.TableHead>
                <N.TableHead className="nx:text-right">Amount</N.TableHead>
              </N.TableRow>
            </N.TableHeader>
            <N.TableBody>
              {INVOICES.map((invoice) => (
                <N.TableRow key={invoice.id}>
                  <N.TableCell>{invoice.id}</N.TableCell>
                  <N.TableCell>{invoice.customer}</N.TableCell>
                  <N.TableCell className="nx:text-right">{invoice.amount}</N.TableCell>
                </N.TableRow>
              ))}
            </N.TableBody>
          </N.Table>
        }
      />
      <Row
        name="Tooltip"
        host={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent data-check="host">Copied to clipboard</TooltipContent>
          </Tooltip>
        }
        nexus={
          <N.Tooltip>
            <N.TooltipTrigger asChild>
              <N.Button variant="outline">Hover me</N.Button>
            </N.TooltipTrigger>
            <N.TooltipContent data-check="nexus">Copied to clipboard</N.TooltipContent>
          </N.Tooltip>
        }
      />
      <Row
        name="Dropdown menu"
        host={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" data-check-open>
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent data-check="host">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        nexus={
          <N.DropdownMenu>
            <N.DropdownMenuTrigger asChild>
              <N.Button variant="outline" data-check-open>
                Account
              </N.Button>
            </N.DropdownMenuTrigger>
            <N.DropdownMenuContent data-check="nexus">
              <N.DropdownMenuLabel>My account</N.DropdownMenuLabel>
              <N.DropdownMenuSeparator />
              <N.DropdownMenuItem>Profile</N.DropdownMenuItem>
              <N.DropdownMenuItem>Billing</N.DropdownMenuItem>
              <N.DropdownMenuItem variant="destructive">Sign out</N.DropdownMenuItem>
            </N.DropdownMenuContent>
          </N.DropdownMenu>
        }
      />
      <Row
        name="Popover"
        host={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-check-open>
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent data-check="host" className="grid gap-2">
              <Label htmlFor="host-share">Invite link</Label>
              <Input id="host-share" defaultValue="acme.com/invite/8f2k" readOnly />
            </PopoverContent>
          </Popover>
        }
        nexus={
          <N.Popover>
            <N.PopoverTrigger asChild>
              <N.Button variant="outline" data-check-open>
                Share
              </N.Button>
            </N.PopoverTrigger>
            <N.PopoverContent data-check="nexus" className="nx:grid nx:gap-2">
              <N.Label htmlFor="nexus-share">Invite link</N.Label>
              <N.Input id="nexus-share" defaultValue="acme.com/invite/8f2k" readOnly />
            </N.PopoverContent>
          </N.Popover>
        }
      />
      <Row
        name="Dialog"
        host={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" data-check-open>
                Rename project
              </Button>
            </DialogTrigger>
            <DialogContent data-check="host">
              <DialogHeader>
                <DialogTitle>Rename project</DialogTitle>
                <DialogDescription>Everyone with access sees the new name.</DialogDescription>
              </DialogHeader>
              <Input defaultValue="Acme Console" />
              <DialogFooter>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
        nexus={
          <N.Dialog>
            <N.DialogTrigger asChild>
              <N.Button variant="outline" data-check-open>
                Rename project
              </N.Button>
            </N.DialogTrigger>
            <N.DialogContent data-check="nexus">
              <N.DialogHeader>
                <N.DialogTitle>Rename project</N.DialogTitle>
                <N.DialogDescription>Everyone with access sees the new name.</N.DialogDescription>
              </N.DialogHeader>
              <N.DialogBody>
                <N.Input defaultValue="Acme Console" />
              </N.DialogBody>
              <N.DialogFooter>
                <N.Button>Save</N.Button>
              </N.DialogFooter>
            </N.DialogContent>
          </N.Dialog>
        }
      />
    </div>
  )
}
