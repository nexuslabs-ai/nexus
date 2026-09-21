'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@nexus_ds/react';
const DIRECTIONS = ['top', 'right', 'bottom', 'left'] as const;
function Example0() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>
            Drag down or press Escape to dismiss this drawer.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Drawer content goes here. On touch devices it can be dragged to
            dismiss.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {DIRECTIONS.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="nx:capitalize">
              {direction}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="nx:capitalize">
                {direction} drawer
              </DrawerTitle>
              <DrawerDescription>
                Slides in from the {direction} edge.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
