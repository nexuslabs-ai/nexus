import AddIcon from '@mui/icons-material/Add'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { type ReactNode, useState } from 'react'

import * as N from '../components/nexus-kit'

const INVOICES = [
  { id: 'INV-001', customer: 'Northwind', amount: '$1,250.00' },
  { id: 'INV-002', customer: 'Globex', amount: '$480.00' },
  { id: 'INV-003', customer: 'Initech', amount: '$2,140.00' },
]

const PLANS = ['Starter', 'Pro', 'Enterprise']

function Row({ name, host, nexus }: { name: string; host: ReactNode; nexus: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '9rem 1fr 1fr',
        gap: 3,
        alignItems: 'start',
        py: 3,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" sx={{ pt: 1 }}>
        {name}
      </Typography>
      <Box data-check="host" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        {host}
      </Box>
      <div data-check="nexus" className="nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-3">
        {nexus}
      </div>
    </Box>
  )
}

function MuiTabs() {
  const [tab, setTab] = useState(0)
  return (
    <Box sx={{ width: '100%', maxWidth: 360 }}>
      <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
        <Tab label="Overview" />
        <Tab label="Usage" />
        <Tab label="Billing" />
      </Tabs>
      <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
        Your workspace at a glance.
      </Typography>
    </Box>
  )
}

function MuiMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button variant="outlined" data-check-open onClick={(event) => setAnchor(event.currentTarget)}>
        Account
      </Button>
      <Menu data-check="host" anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => setAnchor(null)}>Profile</MenuItem>
        <MenuItem onClick={() => setAnchor(null)}>Billing</MenuItem>
        <MenuItem onClick={() => setAnchor(null)} sx={{ color: 'error.main' }}>
          Sign out
        </MenuItem>
      </Menu>
    </>
  )
}

function MuiPopover() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button variant="outlined" data-check-open onClick={(event) => setAnchor(event.currentTarget)}>
        Share
      </Button>
      <Popover
        data-check="host"
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <TextField label="Invite link" size="small" fullWidth defaultValue="acme.com/invite/8f2k" />
        </Box>
      </Popover>
    </>
  )
}

function MuiDialog() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outlined" data-check-open onClick={() => setOpen(true)}>
        Rename project
      </Button>
      <Dialog data-check="host" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Rename project</DialogTitle>
        <DialogContent>
          <DialogContentText>Everyone with access sees the new name.</DialogContentText>
          <TextField autoFocus fullWidth margin="dense" defaultValue="Acme Console" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export function SideBySidePage() {
  return (
    <Box sx={{ maxWidth: 1152, mx: 'auto' }}>
      <Typography variant="h5" component="h1">
        Side by side
      </Typography>
      <Typography color="text.secondary">The same component from the app&apos;s MUI kit and from Nexus.</Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '9rem 1fr 1fr',
          gap: 3,
          mt: 3,
          typography: 'overline',
          color: 'text.secondary',
        }}
      >
        <span />
        <span>MUI (host)</span>
        <span>Nexus</span>
      </Box>

      <Row
        name="Button"
        host={
          <>
            <Button variant="contained">Save</Button>
            <Button variant="outlined">Cancel</Button>
            <Button>Skip</Button>
            <Button variant="contained" color="error">
              Delete
            </Button>
          </>
        }
        nexus={
          <>
            <N.Button>Save</N.Button>
            <N.Button variant="outline">Cancel</N.Button>
            <N.Button variant="ghost">Skip</N.Button>
            <N.Button variant="destructive">Delete</N.Button>
          </>
        }
      />
      <Row
        name="Button sizes"
        host={
          <>
            <Button variant="contained" size="small">
              Small
            </Button>
            <Button variant="contained">Default</Button>
            <Button variant="contained" size="large">
              Large
            </Button>
            <IconButton aria-label="Add">
              <AddIcon />
            </IconButton>
            <Button variant="contained" disabled>
              Disabled
            </Button>
            <Button variant="contained" loading>
              Saving
            </Button>
          </>
        }
        nexus={
          <>
            <N.Button size="sm">Small</N.Button>
            <N.Button>Default</N.Button>
            <N.Button size="lg">Large</N.Button>
            <N.Button size="icon" variant="ghost" aria-label="Add">
              <AddIcon />
            </N.Button>
            <N.Button disabled>Disabled</N.Button>
            <N.Button loading>Saving</N.Button>
          </>
        }
      />
      <Row
        name="Chip / Badge"
        host={
          <>
            <Chip label="Active" color="primary" size="small" />
            <Chip label="Paid" color="success" size="small" />
            <Chip label="Pending" color="warning" size="small" variant="outlined" />
            <Chip label="Overdue" color="error" size="small" variant="outlined" />
          </>
        }
        nexus={
          <>
            <N.Badge>Active</N.Badge>
            <N.Badge variant="success">Paid</N.Badge>
            <N.Badge variant="warning" fill="outline">
              Pending
            </N.Badge>
            <N.Badge variant="error" fill="outline">
              Overdue
            </N.Badge>
          </>
        }
      />
      <Row
        name="Text field"
        host={
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
            <TextField label="Email" type="email" placeholder="you@acme.com" size="small" />
            <TextField label="Disabled" size="small" disabled />
            <TextField label="Invalid" size="small" error helperText="Enter a valid email" />
          </Stack>
        }
        nexus={
          <div className="nx:grid nx:w-full nx:max-w-xs nx:gap-2">
            <N.Label htmlFor="nexus-email">Email</N.Label>
            <N.Input id="nexus-email" type="email" placeholder="you@acme.com" />
            <N.Input placeholder="Disabled" disabled />
            <N.Input placeholder="Invalid" aria-invalid />
          </div>
        }
      />
      <Row
        name="Textarea"
        host={<TextField label="About your team" multiline rows={3} sx={{ width: '100%', maxWidth: 320 }} />}
        nexus={<N.Textarea className="nx:max-w-xs" placeholder="Tell us about your team" />}
      />
      <Row
        name="Select"
        host={
          <FormControl size="small" sx={{ width: 192 }}>
            <InputLabel id="mui-plan-label">Plan</InputLabel>
            <Select labelId="mui-plan-label" label="Plan" defaultValue="Pro">
              {PLANS.map((plan) => (
                <MenuItem key={plan} value={plan}>
                  {plan}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            <FormControlLabel control={<Checkbox defaultChecked />} label="Accept terms" />
            <FormControlLabel control={<Checkbox />} label="Newsletter" />
          </>
        }
        nexus={
          <>
            <div className="nx:flex nx:items-center nx:gap-2">
              <N.Checkbox id="nexus-terms" defaultChecked />
              <N.Label htmlFor="nexus-terms">Accept terms</N.Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <N.Checkbox id="nexus-news" />
              <N.Label htmlFor="nexus-news">Newsletter</N.Label>
            </div>
          </>
        }
      />
      <Row
        name="Switch"
        host={<FormControlLabel control={<Switch defaultChecked />} label="Email alerts" />}
        nexus={
          <div className="nx:flex nx:items-center nx:gap-2">
            <N.Switch id="nexus-alerts" defaultChecked />
            <N.Label htmlFor="nexus-alerts">Email alerts</N.Label>
          </div>
        }
      />
      <Row
        name="Radio group"
        host={
          <RadioGroup row defaultValue="monthly">
            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
            <FormControlLabel value="yearly" control={<Radio />} label="Yearly" />
          </RadioGroup>
        }
        nexus={
          <N.RadioGroup defaultValue="monthly" className="nx:flex nx:gap-4">
            <div className="nx:flex nx:items-center nx:gap-2">
              <N.RadioGroupItem value="monthly" id="nexus-monthly" />
              <N.Label htmlFor="nexus-monthly">Monthly</N.Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <N.RadioGroupItem value="yearly" id="nexus-yearly" />
              <N.Label htmlFor="nexus-yearly">Yearly</N.Label>
            </div>
          </N.RadioGroup>
        }
      />
      <Row
        name="Tabs"
        host={<MuiTabs />}
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
          <Card variant="outlined" sx={{ width: '100%', maxWidth: 384 }}>
            <CardHeader title="Team plan" subheader="8 of 10 seats used." />
            <CardContent>
              <Typography variant="body2">Renews on 12 November.</Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained">
                Add seats
              </Button>
            </CardActions>
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
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Alert severity="success">
              <AlertTitle>Payment received</AlertTitle>
              Invoice INV-001 is paid.
            </Alert>
            <Alert severity="error">
              <AlertTitle>Card declined</AlertTitle>
              Update your billing details.
            </Alert>
          </Stack>
        }
        nexus={
          <div className="nx:grid nx:w-full nx:gap-3">
            <N.Alert variant="success">
              <N.AlertIcon>
                <CheckCircleOutlineIcon />
              </N.AlertIcon>
              <N.AlertContent>
                <N.AlertTitle>Payment received</N.AlertTitle>
                <N.AlertDescription>Invoice INV-001 is paid.</N.AlertDescription>
              </N.AlertContent>
            </N.Alert>
            <N.Alert variant="destructive">
              <N.AlertIcon>
                <ErrorOutlineIcon />
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
            <Avatar>PP</Avatar>
            <Avatar variant="rounded">AG</Avatar>
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
        host={
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
            <LinearProgress variant="determinate" value={64} />
            <LinearProgress />
          </Stack>
        }
        nexus={
          <div className="nx:grid nx:w-full nx:max-w-xs nx:gap-3">
            <N.Progress value={64} />
            <N.Progress value={null} />
          </div>
        }
      />
      <Row
        name="Table"
        host={
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {INVOICES.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell align="right">{invoice.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          <Tooltip title="Copied to clipboard">
            <Button variant="outlined">Hover me</Button>
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
        name="Menu"
        host={<MuiMenu />}
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
        host={<MuiPopover />}
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
        host={<MuiDialog />}
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
    </Box>
  )
}
