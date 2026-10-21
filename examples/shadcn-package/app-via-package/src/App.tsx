import { Columns2Icon, LayersIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react"
import { Link, Route, Routes, useLocation } from "react-router"
import { useTheme } from "next-themes"

import {
  Button,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Toaster,
} from "@acme/ui"
import { Toaster as NxdsToaster } from "@acme/ui/nxds"

import { useNxdsAppearance } from "./appearance"
import { OverlaysPage } from "./pages/OverlaysPage"
import { SettingsPage } from "./pages/SettingsPage"
import { SideBySidePage } from "./pages/SideBySidePage"


const NAV = [
  { href: "/", label: "Side by side", icon: Columns2Icon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/overlays", label: "Overlays", icon: LayersIcon },
]

// One switch drives both theme systems, so they never disagree about the
// shared .dark class on <html>.
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { setState } = useNxdsAppearance()
  const dark = resolvedTheme === "dark"

  function toggleTheme() {
    const mode = dark ? "light" : "dark"
    setTheme(mode)
    setState((current) => ({ ...current, mode }))
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      {dark ? <SunIcon /> : <MoonIcon />}
      {dark ? "Light" : "Dark"}
    </Button>
  )
}

export default function App() {
  const { pathname } = useLocation()

  return (
    <SidebarProvider data-check="host">
      <Sidebar>
        <SidebarHeader className="px-4 py-3 font-semibold">Acme Console</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>nxds adoption</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={pathname === href}>
                      <Link to={href}>
                        <Icon />
                        {label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">App using @acme/ui, nxds included</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<SideBySidePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/overlays" element={<OverlaysPage />} />
          </Routes>
        </main>
      </SidebarInset>
      <Toaster />
      <NxdsToaster />
    </SidebarProvider>
  )
}
