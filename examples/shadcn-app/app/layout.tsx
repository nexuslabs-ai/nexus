import { DEFAULT_NXDS_APPEARANCE } from "@nxds/core"
import type { Metadata } from "next"
import { Geist } from "next/font/google"

import "./globals.css"
import "./nxds.css"

import { AppShell } from "@/components/app-shell"
import { NxdsAppearanceProvider } from "@/components/nxds/components/appearance/provider"
import { NxdsAppearanceScript } from "@/components/nxds/components/appearance/provider/server"
import { Toaster as NxdsToaster } from "@/components/nxds/components/sonner/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const APPEARANCE_STORAGE_KEY = "acme-nxds-appearance"

export const metadata: Metadata = {
  title: "shadcn app + nxds",
  description: "An existing shadcn app that copied nxds components in",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <NxdsAppearanceScript storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NXDS_APPEARANCE} />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NxdsAppearanceProvider storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NXDS_APPEARANCE}>
            <TooltipProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
              <NxdsToaster />
            </TooltipProvider>
          </NxdsAppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
