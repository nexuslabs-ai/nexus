'use client';

import { Button as HostButton } from "@/components/ui/button";
import { Button } from "@/components/nexus/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/nexus/components/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/nexus/components/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/nexus/components/popover";
import { Progress } from "@/components/nexus/components/progress";

export function NexusDemo() {
  return (
    <Card data-probe="nexus-card" className="mt-6 max-w-md">
      <CardHeader>
        <CardTitle>Nexus card</CardTitle>
        <CardDescription>Client boundary until #796 adds directives.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button data-probe="nexus-button">Nexus primary</Button>
        <Progress data-probe="nexus-progress" value={null} />
      </CardContent>
      <CardFooter className="gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button data-probe="nexus-dialog-trigger" variant="secondary">
              Open dialog
            </Button>
          </DialogTrigger>
          <DialogContent data-probe="nexus-dialog">
            <DialogHeader>
              <DialogTitle>Nexus dialog</DialogTitle>
              <DialogDescription>Portalled to document.body.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p data-probe="nexus-dialog-text">Body text.</p>
            </DialogBody>
            <DialogFooter>
              <HostButton data-probe="host-button-in-nexus-dialog" variant="outline">
                Host button
              </HostButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Popover>
          <PopoverTrigger asChild>
            <Button data-probe="nexus-popover-trigger" variant="outline">
              Open popover
            </Button>
          </PopoverTrigger>
          <PopoverContent data-probe="nexus-popover">Popover content</PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
}
