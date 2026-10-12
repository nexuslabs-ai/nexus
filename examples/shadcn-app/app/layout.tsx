import { DEFAULT_NEXUS_APPEARANCE } from "@nexus_ds/core"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"

import "./globals.css"
import "./nexus.css"

import { AppShell } from "@/components/app-shell"
import { NexusAppearanceProvider } from "@/components/nexus/components/appearance/provider"
import { NexusAppearanceScript } from "@/components/nexus/components/appearance/provider/server"
import { Toaster as NexusToaster } from "@/components/nexus/components/sonner"
import { TooltipProvider as NexusTooltipProvider } from "@/components/nexus/components/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const APPEARANCE_STORAGE_KEY = "acme-nexus-appearance"

export const metadata: Metadata = {
  title: "shadcn app + Nexus",
  description: "An existing shadcn app that copied Nexus components in",
}

export const viewport: Viewport = { colorScheme: "light dark" }

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <NexusAppearanceScript storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NEXUS_APPEARANCE} />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NexusAppearanceProvider storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NEXUS_APPEARANCE}>
            <TooltipProvider>
              <NexusTooltipProvider>
                <AppShell>{children}</AppShell>
                <Toaster />
                <NexusToaster />
              </NexusTooltipProvider>
            </TooltipProvider>
          </NexusAppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
