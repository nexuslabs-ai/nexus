/**
 * Card Component Fixture
 *
 * Container/composition pattern with multiple sub-components.
 * Used for testing extraction of:
 * - Multiple component exports from single file
 * - Composition patterns (Card, CardHeader, CardContent, etc.)
 * - Simple wrapper components without CVA
 */

import * as React from 'react';

interface CardProps extends React.ComponentProps<'div'> {
  /**
   * Visual emphasis level of the card.
   * @default 'default'
   */
  elevation?: 'default' | 'raised' | 'flat';
}

function Card({ className, elevation = 'default', ...props }: CardProps) {
  const elevationClasses = {
    default: 'shadow-sm',
    raised: 'shadow-lg',
    flat: 'shadow-none border',
  };

  return (
    <div
      data-slot="card"
      data-elevation={elevation}
      className={`bg-card text-card-foreground rounded-lg ${elevationClasses[elevation]} ${className}`}
      {...props}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends HTML element props without additions
interface CardHeaderProps extends React.ComponentProps<'div'> {}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends HTML element props without additions
interface CardTitleProps extends React.ComponentProps<'h3'> {}

function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={`text-2xl leading-none font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends HTML element props without additions
interface CardDescriptionProps extends React.ComponentProps<'p'> {}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={`text-muted-foreground text-sm ${className}`}
      {...props}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends HTML element props without additions
interface CardContentProps extends React.ComponentProps<'div'> {}

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={`p-6 pt-0 ${className}`}
      {...props}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Fixture intentionally extends HTML element props without additions
interface CardFooterProps extends React.ComponentProps<'div'> {}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};

export type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
};
