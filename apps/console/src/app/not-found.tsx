import { Button } from '@nexus_ds/react';
import { Link } from '@tanstack/react-router';

import { PageHeading } from '../components/page-heading';

export function NotFound() {
  return (
    <div className="nx:space-y-4 nx:py-12">
      <p className="nx:typography-label-small nx:text-muted-foreground">404</p>
      <PageHeading title="Page not found">Page not found</PageHeading>
      <p className="nx:text-muted-foreground">
        This page isn’t part of Nexus Console. Return to the token explorer.
      </p>
      <Button asChild>
        <Link to="/explore">Back to tokens</Link>
      </Button>
    </div>
  );
}
