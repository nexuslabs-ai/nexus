'use client';
import type * as React from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@nexus_ds/react';

function Example0() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-full nx:max-w-md nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#automation">
                  Automation
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-full nx:max-w-md nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#about">About</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#careers">Careers</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Flyout Triggers
        </h3>
        <NavigationMenu aria-label="Flyout navigation">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nx:grid nx:w-full nx:max-w-md nx:gap-1 nx:p-2">
                  <li>
                    <NavigationMenuLink href="#analytics">
                      Analytics
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#reports">
                      Reports
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nx:grid nx:w-full nx:max-w-md nx:gap-1 nx:p-2">
                  <li>
                    <NavigationMenuLink href="#about">About</NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Simple Links (no flyout)
        </h3>
        <NavigationMenu aria-label="Simple links navigation">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#docs"
                className={navigationMenuTriggerStyle()}
              >
                Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#pricing"
                className={navigationMenuTriggerStyle()}
              >
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
function Example2() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger disabled>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="nx:grid nx:w-full nx:max-w-md nx:gap-1 nx:p-2">
              <li>
                <NavigationMenuLink href="#analytics">
                  Analytics
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
