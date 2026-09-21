'use client';
import * as React from 'react';

import { Switch } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Switch> = {
    'aria-label': 'Toggle switch',
  };
  return <Switch {...args} />;
}
function Example1() {
  const uid = React.useId();
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          States
        </h3>
        <div className="nx:flex nx:items-center nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch aria-label="Unchecked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Unchecked
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch defaultChecked aria-label="Checked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Checked
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch disabled aria-label="Disabled unchecked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch disabled defaultChecked aria-label="Disabled checked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled Checked
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Sizes
        </h3>
        <div className="nx:flex nx:items-center nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch size="default" aria-label="Default size" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Default
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch
              size="default"
              defaultChecked
              aria-label="Default size checked"
            />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Default checked
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch size="sm" aria-label="Small size" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Small
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Switch size="sm" defaultChecked aria-label="Small size checked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Small checked
            </span>
          </div>
        </div>
        <div className="nx:mt-6 nx:flex nx:flex-col nx:gap-4">
          <div className="nx:grid nx:grid-cols-[auto_1fr] nx:items-center nx:gap-x-3 nx:gap-y-1.5">
            <Switch size="default" id={`${uid}-desc-default`} />
            <label
              htmlFor={`${uid}-desc-default`}
              className="nx:typography-label-default nx:leading-none"
            >
              Default with description
            </label>
            <p className="nx:col-start-2 nx:typography-body-default nx:text-muted-foreground">
              The control centers with the label&apos;s first line.
            </p>
          </div>
          <div className="nx:grid nx:grid-cols-[auto_1fr] nx:items-center nx:gap-x-3 nx:gap-y-1.5">
            <Switch size="sm" id={`${uid}-desc-sm`} />
            <label
              htmlFor={`${uid}-desc-sm`}
              className="nx:typography-label-default nx:leading-none"
            >
              Small with description
            </label>
            <p className="nx:col-start-2 nx:typography-body-default nx:text-muted-foreground">
              Alignment holds at the smaller size too.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Labels
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Switch id={`${uid}-label-right`} />
            <label
              htmlFor={`${uid}-label-right`}
              className="nx:typography-label-default"
            >
              Label on right
            </label>
          </div>
          <div className="nx:flex nx:items-center nx:gap-2">
            <label
              htmlFor={`${uid}-label-left`}
              className="nx:typography-label-default"
            >
              Label on left
            </label>
            <Switch id={`${uid}-label-left`} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Settings Pattern
        </h3>
        <div className="nx:w-80 nx:space-y-4">
          <div className="nx:flex nx:items-center nx:justify-between">
            <label
              htmlFor={`${uid}-setting1`}
              className="nx:typography-label-default"
            >
              Enable feature
            </label>
            <Switch id={`${uid}-setting1`} defaultChecked />
          </div>
          <div className="nx:flex nx:items-center nx:justify-between">
            <label
              htmlFor={`${uid}-setting2`}
              className="nx:typography-label-default"
            >
              Show previews
            </label>
            <Switch id={`${uid}-setting2`} />
          </div>
          <div className="nx:flex nx:items-center nx:justify-between">
            <label
              htmlFor={`${uid}-setting3`}
              className="nx:typography-label-default nx:text-muted-foreground"
            >
              Beta features (disabled)
            </label>
            <Switch id={`${uid}-setting3`} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
function Example2() {
  const args: React.ComponentProps<typeof Switch> = {
    'aria-label': 'Toggle switch',
    disabled: true,
  };
  return <Switch {...args} />;
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
