import KeyIcon from '@mui/icons-material/Key'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import * as N from '../components/nxds-kit'

const API_KEYS = [
  { name: 'Production', key: 'sk_live_…4f2a', created: '2 Sep 2026', status: 'Active' },
  { name: 'Staging', key: 'sk_test_…91bc', created: '18 Aug 2026', status: 'Active' },
  { name: 'Legacy import', key: 'sk_live_…07de', created: '3 Mar 2026', status: 'Revoked' },
]

const NOTIFICATIONS = [
  { id: 'deploys', label: 'Deploys', description: 'A deploy finishes or fails.', on: true },
  { id: 'billing', label: 'Billing', description: 'An invoice is issued or a payment fails.', on: true },
  { id: 'digest', label: 'Weekly digest', description: 'A summary of workspace activity.', on: false },
]

export function SettingsPage() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 896, mx: 'auto' }}>
      <Box>
        <Typography variant="h5" component="h1">
          Settings
        </Typography>
        <Typography color="text.secondary">
          An existing MUI page. The Notifications and API keys sections are nxds.
        </Typography>
      </Box>

      <Card data-check="host" variant="outlined">
        <CardHeader title="Profile" subheader="How your teammates see you." />
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Name" defaultValue="Prasad Patewar" size="small" />
            <TextField label="Email" type="email" defaultValue="prasad@acme.com" size="small" />
            <FormControl size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select labelId="role-label" label="Role" defaultValue="admin">
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Bio"
              multiline
              rows={2}
              defaultValue="Design systems and developer tooling."
              sx={{ gridColumn: { sm: 'span 2' } }}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button>Cancel</Button>
          <Button variant="contained">Save profile</Button>
        </CardActions>
      </Card>

      <div data-check="nxds">
        <N.Card>
          <N.CardHeader>
            <N.CardTitle>Notifications</N.CardTitle>
            <N.CardDescription>Choose what we email you about.</N.CardDescription>
          </N.CardHeader>
          <N.CardContent className="nx:grid nx:gap-4">
            {NOTIFICATIONS.map((item) => (
              <div key={item.id} className="nx:flex nx:items-center nx:justify-between nx:gap-4">
                <div>
                  <N.Label htmlFor={`notify-${item.id}`}>{item.label}</N.Label>
                  <p className="nx:typography-body-small nx:text-muted-foreground">{item.description}</p>
                </div>
                <N.Switch id={`notify-${item.id}`} defaultChecked={item.on} />
              </div>
            ))}
            <N.Separator />
            <N.RadioGroup defaultValue="instant" className="nx:flex nx:gap-6">
              <div className="nx:flex nx:items-center nx:gap-2">
                <N.RadioGroupItem value="instant" id="cadence-instant" />
                <N.Label htmlFor="cadence-instant">Instantly</N.Label>
              </div>
              <div className="nx:flex nx:items-center nx:gap-2">
                <N.RadioGroupItem value="hourly" id="cadence-hourly" />
                <N.Label htmlFor="cadence-hourly">Hourly batch</N.Label>
              </div>
            </N.RadioGroup>
          </N.CardContent>
        </N.Card>
      </div>

      <Card data-check="host" variant="outlined">
        <CardHeader
          avatar={<KeyIcon fontSize="small" />}
          title="API keys"
          subheader="An MUI card holding an nxds table."
        />
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
                    <N.Badge variant={row.status === 'Active' ? 'success' : 'secondary'} fill="light">
                      {row.status}
                    </N.Badge>
                  </N.TableCell>
                </N.TableRow>
              ))}
            </N.TableBody>
          </N.Table>
        </CardContent>
        <CardActions>
          <Button size="small" variant="outlined">
            Create key
          </Button>
        </CardActions>
      </Card>

      <Divider />

      <Stack data-check="host" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Alert severity="error" sx={{ alignSelf: 'stretch' }}>
          <AlertTitle>Delete workspace</AlertTitle>
          This removes every project, key and member. It cannot be undone.
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
                <TextField size="small" fullWidth placeholder="Acme Console" />
              </N.DialogBody>
              <N.DialogFooter>
                <N.DialogClose asChild>
                  <Button>Cancel</Button>
                </N.DialogClose>
                <N.Button variant="destructive">Delete</N.Button>
              </N.DialogFooter>
            </N.DialogContent>
          </N.Dialog>
        </div>
      </Stack>
    </Stack>
  )
}
