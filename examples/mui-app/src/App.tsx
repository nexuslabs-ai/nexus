import DarkModeIcon from '@mui/icons-material/DarkMode'
import LayersIcon from '@mui/icons-material/Layers'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsIcon from '@mui/icons-material/Settings'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useColorScheme } from '@mui/material/styles'
import { Link, Route, Routes, useLocation } from 'react-router'

import { useNexusAppearance } from './components/nexus/components/appearance/provider'
import { Toaster as NexusToaster } from './components/nexus/components/sonner'
import { OverlaysPage } from './pages/OverlaysPage'
import { SettingsPage } from './pages/SettingsPage'
import { SideBySidePage } from './pages/SideBySidePage'

const DRAWER_WIDTH = 240

const NAV = [
  { to: '/', label: 'Side by side', icon: <ViewColumnIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  { to: '/overlays', label: 'Overlays', icon: <LayersIcon /> },
]

function HostThemeToggle() {
  const { mode, setMode } = useColorScheme()
  const dark = mode === 'dark'

  return (
    <Button
      color="inherit"
      variant="outlined"
      size="small"
      startIcon={dark ? <LightModeIcon /> : <DarkModeIcon />}
      onClick={() => setMode(dark ? 'light' : 'dark')}
    >
      MUI theme
    </Button>
  )
}

function NexusModeToggle() {
  const { state, setState } = useNexusAppearance()

  function toggleMode() {
    setState((current) => ({ ...current, mode: current.mode === 'dark' ? 'light' : 'dark' }))
  }

  return (
    <Button color="inherit" variant="outlined" size="small" onClick={toggleMode}>
      Nexus mode: {state.mode}
    </Button>
  )
}

export default function App() {
  const { pathname } = useLocation()

  return (
    <Box data-check="host" sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Acme Console
          </Typography>
          <HostThemeToggle />
          <NexusModeToggle />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        <Toolbar />
        <List>
          {NAV.map(({ to, label, icon }) => (
            <ListItemButton key={to} component={Link} to={to} selected={pathname === to}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<SideBySidePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/overlays" element={<OverlaysPage />} />
        </Routes>
      </Box>
      <NexusToaster />
    </Box>
  )
}
