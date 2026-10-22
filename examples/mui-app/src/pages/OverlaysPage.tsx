import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import * as N from '../components/nxds-kit'

const REGIONS = ['Frankfurt', 'Virginia', 'Singapore']

function MuiDialogWithNxdsInside() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="contained" data-check-open onClick={() => setOpen(true)}>
        MUI dialog → nxds inside
      </Button>
      <Dialog data-check="host" open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Deploy settings</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>An MUI dialog. Every control below is nxds.</DialogContentText>
          <div data-check="nxds" className="nx:grid nx:gap-4">
            <div className="nx:grid nx:gap-2">
              <N.Label htmlFor="deploy-region">Region</N.Label>
              <N.Select defaultValue="Frankfurt">
                <N.SelectTrigger id="deploy-region">
                  <N.SelectValue />
                </N.SelectTrigger>
                <N.SelectContent data-check="nxds">
                  {REGIONS.map((region) => (
                    <N.SelectItem key={region} value={region}>
                      {region}
                    </N.SelectItem>
                  ))}
                </N.SelectContent>
              </N.Select>
            </div>
            <div className="nx:flex nx:flex-wrap nx:gap-2">
              <N.Popover>
                <N.PopoverTrigger asChild>
                  <N.Button variant="outline">nxds popover</N.Button>
                </N.PopoverTrigger>
                <N.PopoverContent data-check="nxds">Rolls out to 10% of traffic first.</N.PopoverContent>
              </N.Popover>
              <N.DropdownMenu>
                <N.DropdownMenuTrigger asChild>
                  <N.Button variant="outline">nxds menu</N.Button>
                </N.DropdownMenuTrigger>
                <N.DropdownMenuContent data-check="nxds">
                  <N.DropdownMenuItem>Redeploy</N.DropdownMenuItem>
                  <N.DropdownMenuItem>Roll back</N.DropdownMenuItem>
                </N.DropdownMenuContent>
              </N.DropdownMenu>
              <N.Tooltip>
                <N.TooltipTrigger asChild>
                  <N.Button variant="ghost">nxds tooltip</N.Button>
                </N.TooltipTrigger>
                <N.TooltipContent data-check="nxds">Last deploy 4 minutes ago</N.TooltipContent>
              </N.Tooltip>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setOpen(false)}>
            Deploy
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// An nxds dialog blocks pointer events outside itself, so MUI popups opened
// from inside it render in place instead of portalling to <body>.
function MuiControlsForNxdsDialog() {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)

  return (
    <Stack data-check="host" spacing={2} sx={{ pt: 1 }}>
      <FormControl size="small" fullWidth>
        <InputLabel id="invite-role-label">Role</InputLabel>
        <Select labelId="invite-role-label" label="Role" defaultValue="member" MenuProps={{ disablePortal: true }}>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="member">Member</MenuItem>
          <MenuItem value="viewer">Viewer</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={(event) => setPopoverAnchor(event.currentTarget)}>
          MUI popover
        </Button>
        <Popover
          disablePortal
          anchorEl={popoverAnchor}
          open={popoverAnchor !== null}
          onClose={() => setPopoverAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Typography sx={{ p: 2 }}>Invites expire after 7 days.</Typography>
        </Popover>
        <Button variant="outlined" onClick={(event) => setMenuAnchor(event.currentTarget)}>
          MUI menu
        </Button>
        <Menu disablePortal anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => setMenuAnchor(null)}>Copy invite link</MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>Resend email</MenuItem>
        </Menu>
        <Tooltip title="3 seats left on your plan" slotProps={{ popper: { disablePortal: true } }}>
          <Button>MUI tooltip</Button>
        </Tooltip>
      </Stack>
    </Stack>
  )
}

function NxdsDialogWithMuiInside() {
  return (
    <N.Dialog>
      <N.DialogTrigger asChild>
        <N.Button data-check-open>nxds dialog → MUI inside</N.Button>
      </N.DialogTrigger>
      <N.DialogContent data-check="nxds">
        <N.DialogHeader>
          <N.DialogTitle>Invite teammate</N.DialogTitle>
          <N.DialogDescription>An nxds dialog. Every control below is MUI.</N.DialogDescription>
        </N.DialogHeader>
        <N.DialogBody>
          <MuiControlsForNxdsDialog />
        </N.DialogBody>
        <N.DialogFooter>
          <N.Button>Send invite</N.Button>
        </N.DialogFooter>
      </N.DialogContent>
    </N.Dialog>
  )
}

export function OverlaysPage() {
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  return (
    <Stack spacing={4} sx={{ maxWidth: 896, mx: 'auto' }}>
      <Box>
        <Typography variant="h5" component="h1">
          Overlays
        </Typography>
        <Typography color="text.secondary">
          Each system&apos;s dialog holding the other&apos;s select, popover, menu and tooltip. Check focus, stacking
          and dismissal.
        </Typography>
      </Box>

      <Stack data-check="host" direction="row" spacing={1.5}>
        <MuiDialogWithNxdsInside />
        <NxdsDialogWithMuiInside />
      </Stack>

      <Stack data-check="host" spacing={1.5}>
        <Typography variant="h6">Notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          MUI uses a Snackbar; nxds uses its sonner-based Toaster, mounted in the shell.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
            MUI snackbar
          </Button>
          <N.Button variant="outline" onClick={() => N.toast.success('Saved with the nxds toast')}>
            nxds toast
          </N.Button>
        </Stack>
      </Stack>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSnackbarOpen(false)}>
          Saved with the MUI snackbar
        </Alert>
      </Snackbar>
    </Stack>
  )
}
