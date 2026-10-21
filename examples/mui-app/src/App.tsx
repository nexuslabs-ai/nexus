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

import { useNxdsAppearance } from './components/nxds/components/appearance/provider'
import { Toaster as NxdsToaster } from './components/nxds/components/sonner/sonner'
import { OverlaysPage } from './pages/OverlaysPage'
import { SettingsPage } from './pages/SettingsPage'
import { SideBySidePage } from './pages/SideBySidePage'

const DRAWER_WIDTH = 240

const NAV = [
  { to: '/', label: 'Side by side', icon: <ViewColumnIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  { to: '/overlays', label: 'Overlays', icon: <LayersIcon /> },
]

// One switch drives both theme systems, so they never disagree about the
// shared .dark class on <html>.
function ThemeToggle() {
  const { mode, setMode } = useColorScheme()
  const { setState } = useNxdsAppearance()
  const dark = mode === 'dark'

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    setMode(next)
    setState((current) => ({ ...current, mode: next }))
  }

  return (
    <Button
      color="inherit"
      variant="outlined"
      size="small"
      startIcon={dark ? <LightModeIcon /> : <DarkModeIcon />}
      onClick={toggleTheme}
    >
      {dark ? 'Light' : 'Dark'}
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
          <ThemeToggle />
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
      <NxdsToaster />
    </Box>
  )
}
