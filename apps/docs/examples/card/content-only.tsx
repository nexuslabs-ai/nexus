'use client';

import { Card, CardContent } from '@/components/card/card';

export default function CardContentOnly() {
  return (
    <Card className="nx:w-full nx:max-w-sm">
      <CardContent className="nx:pt-6">
        <p className="nx:typography-body-default">
          A card with only content works as a plain surface for a note, a quote,
          or a single metric.
        </p>
      </CardContent>
    </Card>
  );
}
