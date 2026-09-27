'use client';

import { Button } from '@/components/button/button';
import { ButtonGroup } from '@/components/button-group/button-group';

export default function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation="vertical" size="sm">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  );
}
