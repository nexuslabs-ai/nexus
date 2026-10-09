import { Button as HostButton } from "@/components/ui/button";

import { NexusDemo } from "./nexus-demo";

export default function Page() {
  return (
    <main data-probe="host-main" className="min-h-svh p-6">
      <h1 data-probe="host-h1" className="text-2xl font-semibold">
        Fresh Next app
      </h1>
      <HostButton data-probe="host-button" className="mt-4">
        Host primary
      </HostButton>
      <NexusDemo />
    </main>
  );
}
