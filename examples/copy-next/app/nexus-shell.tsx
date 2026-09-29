"use client";

import { type ReactNode, useState } from "react";

import { DEFAULT_NEXUS_APPEARANCE } from "@nexus_ds/core";

import { NexusRoot } from "@/components/nexus/components/appearance/provider";
import { Button } from "@/components/nexus/components/button";

import { MODE_COOKIE } from "./appearance-cookie";

type Mode = "light" | "dark";

export function NexusShell({
  initialMode,
  children,
}: {
  initialMode: Mode;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  function toggleMode() {
    const next = mode === "dark" ? "light" : "dark";
    document.cookie = `${MODE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setMode(next);
  }

  return (
    <NexusRoot
      state={{ ...DEFAULT_NEXUS_APPEARANCE, mode }}
      data-probe="nexus-root"
      className="mt-6 flex max-w-md flex-col gap-4"
    >
      <Button
        data-probe="nexus-mode-toggle"
        variant="outline"
        onClick={toggleMode}
      >
        Nexus {mode === "dark" ? "light" : "dark"}
      </Button>
      {children}
    </NexusRoot>
  );
}
