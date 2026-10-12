"use client"

import { Columns2Icon, LayersIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { useNexusAppearance } from "@/components/nexus/components/appearance/provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
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
} from "@/components/ui/sidebar"

const NAV = [
  { href: "/", label: "Side by side", icon: Columns2Icon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/overlays", label: "Overlays", icon: LayersIcon },
]

function HostThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  return (
    <Button variant="outline" size="sm" onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <SunIcon /> : <MoonIcon />}
      Host theme
    </Button>
  )
}

function NexusModeToggle() {
  const { state, setState } = useNexusAppearance()

  function toggleMode() {
    setState((current) => ({ ...current, mode: current.mode === "dark" ? "light" : "dark" }))
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleMode}>
      Nexus mode: {state.mode}
    </Button>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider data-check="host">
      <Sidebar>
        <SidebarHeader className="px-4 py-3 font-semibold">Acme Console</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Nexus adoption</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={pathname === href}>
                      <Link href={href}>
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
          <span className="text-sm text-muted-foreground">shadcn app with Nexus added</span>
          <div className="ml-auto flex gap-2">
            <HostThemeToggle />
            <NexusModeToggle />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
