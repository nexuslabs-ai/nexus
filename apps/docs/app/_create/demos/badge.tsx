'use client';
import type * as React from 'react';

import { Spinner } from '@nexus_ds/react';
import { Badge } from '@nexus_ds/react';
import { IconCheck, IconX } from '@tabler/icons-react';

function Example0() {
  const args: React.ComponentProps<typeof Badge> = { children: 'Badge' };
  return <Badge {...args} />;
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {/* Solid Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Solid Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default">Label</Badge>
          <Badge variant="secondary">Label</Badge>
          <Badge variant="error">Label</Badge>
          <Badge variant="warning">Label</Badge>
          <Badge variant="success">Label</Badge>
          <Badge variant="information">Label</Badge>
        </div>
      </div>

      {/* Solid Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Solid Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" isCaps={false}>
            Label
          </Badge>
          <Badge variant="error" isCaps={false}>
            Label
          </Badge>
          <Badge variant="warning" isCaps={false}>
            Label
          </Badge>
          <Badge variant="success" isCaps={false}>
            Label
          </Badge>
          <Badge variant="information" isCaps={false}>
            Label
          </Badge>
        </div>
      </div>

      {/* Light Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Light Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light">
            Label
          </Badge>
          <Badge variant="secondary" fill="light">
            Label
          </Badge>
          <Badge variant="error" fill="light">
            Label
          </Badge>
          <Badge variant="warning" fill="light">
            Label
          </Badge>
          <Badge variant="success" fill="light">
            Label
          </Badge>
          <Badge variant="information" fill="light">
            Label
          </Badge>
        </div>
      </div>

      {/* Light Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Light Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="secondary" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="error" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="warning" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="success" fill="light" isCaps={false}>
            Label
          </Badge>
          <Badge variant="information" fill="light" isCaps={false}>
            Label
          </Badge>
        </div>
      </div>

      {/* Outline Fill - Caps */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Outline Fill (Caps)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="outline">
            Default
          </Badge>
          <Badge variant="secondary" fill="outline">
            Secondary
          </Badge>
          <Badge variant="error" fill="outline">
            Error
          </Badge>
          <Badge variant="warning" fill="outline">
            Warning
          </Badge>
          <Badge variant="success" fill="outline">
            Success
          </Badge>
          <Badge variant="information" fill="outline">
            Info
          </Badge>
        </div>
      </div>

      {/* Outline Fill - Sentence */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Outline Fill (Sentence)
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" fill="outline" isCaps={false}>
            Default
          </Badge>
          <Badge variant="secondary" fill="outline" isCaps={false}>
            Secondary
          </Badge>
          <Badge variant="error" fill="outline" isCaps={false}>
            Error
          </Badge>
          <Badge variant="warning" fill="outline" isCaps={false}>
            Warning
          </Badge>
          <Badge variant="success" fill="outline" isCaps={false}>
            Success
          </Badge>
          <Badge variant="information" fill="outline" isCaps={false}>
            Info
          </Badge>
        </div>
      </div>

      {/* Number Badges */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Number Badges
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isNumber>
            8
          </Badge>
          <Badge variant="secondary" isNumber>
            8
          </Badge>
          <Badge variant="error" isNumber>
            8
          </Badge>
          <Badge variant="warning" isNumber>
            8
          </Badge>
          <Badge variant="success" isNumber>
            8
          </Badge>
          <Badge variant="information" isNumber>
            8
          </Badge>
        </div>
      </div>

      {/* Icon Only */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          Icon Only
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge
            variant="success"
            fill="light"
            leftIcon={<IconCheck />}
            aria-label="Approved"
          />
          <Badge
            variant="default"
            fill="solid"
            leftIcon={<IconCheck />}
            aria-label="Verified"
          />
          <Badge
            variant="error"
            fill="outline"
            rightIcon={<IconX />}
            aria-label="Error"
          />
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          With Icons
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge variant="default" isCaps={false} leftIcon={<IconCheck />}>
            Label
          </Badge>
          <Badge variant="success" isCaps={false} leftIcon={<IconCheck />}>
            Label
          </Badge>
          <Badge variant="error" isCaps={false} rightIcon={<IconX />}>
            Label
          </Badge>
        </div>
      </div>

      {/* With SVG Loader */}
      <div>
        <h3 className="nx:text-foreground nx:mb-3 nx:typography-label-default">
          With SVG Loader
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Badge
            variant="information"
            fill="outline"
            isCaps={false}
            leftIcon={
              <Spinner
                role="presentation"
                aria-hidden="true"
                aria-label={undefined}
              />
            }
          >
            Loading
          </Badge>
          <Badge
            variant="information"
            fill="light"
            isCaps={false}
            leftIcon={
              <Spinner
                role="presentation"
                aria-hidden="true"
                aria-label={undefined}
              />
            }
          >
            Syncing
          </Badge>
        </div>
      </div>
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
