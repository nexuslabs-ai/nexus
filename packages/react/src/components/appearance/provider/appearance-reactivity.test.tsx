import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs';

function classNames(element: Element) {
  return Array.from(element.classList);
}

function expectNoRawBorderWidth(element: Element) {
  const rawBorderWidth = classNames(element).filter((className) => {
    const parts = className.startsWith('nx:')
      ? className.slice(3).split(':')
      : [className];
    const utility = parts[parts.length - 1];
    const arbitraryBorderWidth = utility?.match(
      /^border(?:-[xytrbl])?-\[(.+)\]$/
    );
    const arbitraryBorderWidthValue = arbitraryBorderWidth?.[1];

    return (
      /^border(?:-[xytrbl])?$/.test(utility ?? '') ||
      /^border(?:-[xytrbl])?-(?:[1-9]\d*(?:\.\d+)?)$/.test(utility ?? '') ||
      (arbitraryBorderWidthValue !== undefined
        ? /(?:\d|\bcalc\(|\bclamp\(|\bmin\(|\bmax\()/i.test(
            arbitraryBorderWidthValue
          )
        : false)
    );
  });

  expect(rawBorderWidth).toEqual([]);
}

describe('Appearance reactivity component contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Button emits runtime stroke and radius utilities', () => {
    render(<Button variant="outline">Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveClass('nx:border-default');
    expect(button).toHaveClass('nx:border-border-default');
    expect(button).toHaveClass('nx:rounded-base');
    expectNoRawBorderWidth(button);
  });

  it('Button lets consumer runtime stroke overrides win through cn()', () => {
    render(<Button className="nx:border-thick">Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveClass('nx:border-thick');
    expect(button).not.toHaveClass('nx:border-default');
    expectNoRawBorderWidth(button);
  });

  it('Input emits runtime stroke and semantic invalid-state border utilities', () => {
    render(<Input aria-label="Email" aria-invalid />);

    const input = screen.getByLabelText('Email');

    expect(input).toHaveClass('nx:border-width-default');
    expect(input).toHaveClass('nx:border-color-default');
    expect(input).toHaveClass('nx:aria-invalid:border-color-error');
    expectNoRawBorderWidth(input);
  });

  it('Card emits semantic surface and runtime shadow utilities', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('[data-slot="card"]');

    expect(card).toHaveClass('nx:bg-container');
    expect(card).toHaveClass('nx:text-container-foreground');
    expect(card).toHaveClass('nx:border-width-default');
    expect(card).toHaveClass('nx:border-color-default');
    expect(card).toHaveClass('nx:shadow-sm');
    expectNoRawBorderWidth(card as Element);
  });

  it('SheetContent emits runtime side stroke and shadow utilities', () => {
    render(
      <Sheet open>
        <SheetContent side="right" aria-describedby={undefined}>
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    const sheet = document.querySelector('[data-slot="sheet-content"]');

    expect(sheet).toHaveClass('nx:border-l-default');
    expect(sheet).toHaveClass('nx:border-border-default');
    expect(sheet).toHaveClass('nx:shadow-lg');
    expectNoRawBorderWidth(sheet as Element);
  });

  it('Tabs emit runtime active indicator and trigger stroke utilities', () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByRole('tab', { name: 'One' });
    const indicator = document.querySelector('[data-slot="tabs-indicator"]');

    expect(trigger).toHaveClass('nx:border-default');
    expect(trigger).toHaveClass('nx:border-transparent');
    expectNoRawBorderWidth(trigger);
    expect(indicator).toHaveClass('nx:data-[variant=default]:border-default');
    expect(indicator).toHaveClass(
      'nx:data-[variant=default]:border-border-default'
    );
  });
});
