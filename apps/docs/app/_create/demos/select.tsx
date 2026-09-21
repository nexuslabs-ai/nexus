'use client';
import type * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@nexus_ds/react';

function Example0() {
  return (
    <Select>
      <SelectTrigger
        className="nx:w-full nx:max-w-md"
        aria-label="Select a fruit"
      >
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
        <SelectItem value="mango">Mango</SelectItem>
      </SelectContent>
    </Select>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Bordered
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Bordered variant select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Borderless
            </span>
            <Select>
              <SelectTrigger
                variant="borderless"
                className="nx:w-full nx:max-w-md"
                aria-label="Borderless variant select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Basic States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Default
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Default select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              With value
            </span>
            <Select defaultValue="option1">
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Select with value"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Disabled
            </span>
            <Select disabled>
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Disabled select"
              >
                <SelectValue placeholder="Disabled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Groups
        </h3>
        <Select>
          <SelectTrigger
            className="nx:w-full nx:max-w-md"
            aria-label="Grouped select"
          >
            <SelectValue placeholder="Select a food" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Widths
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Small (120px)
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Small width select"
              >
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">SM</SelectItem>
                <SelectItem value="md">MD</SelectItem>
                <SelectItem value="lg">LG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Medium (180px)
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Medium width select"
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="nx:flex nx:items-center nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-24">
              Large (280px)
            </span>
            <Select>
              <SelectTrigger
                className="nx:w-full nx:max-w-md"
                aria-label="Large width select"
              >
                <SelectValue placeholder="Select a longer option here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">
                  A much longer option text
                </SelectItem>
                <SelectItem value="option2">
                  Another long option here
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
function Example2() {
  return (
    <Select disabled>
      <SelectTrigger
        className="nx:w-full nx:max-w-md"
        aria-label="Disabled select"
      >
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
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
