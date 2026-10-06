'use client';

import { Button } from '@/components/button/button';
import { ButtonGroup } from '@/components/button-group/button-group';

export default function ButtonGroupDemo() {
  return (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  );
}
