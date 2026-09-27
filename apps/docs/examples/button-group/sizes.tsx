'use client';

import { Button } from '@/components/button/button';
import {
  ButtonGroup,
  ButtonGroupText,
} from '@/components/button-group/button-group';

export default function ButtonGroupSizes() {
  return (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-4">
      <ButtonGroup size="sm">
        <ButtonGroupText>Small</ButtonGroupText>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
      <ButtonGroup size="default">
        <ButtonGroupText>Default</ButtonGroupText>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
      <ButtonGroup size="lg">
        <ButtonGroupText>Large</ButtonGroupText>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
    </div>
  );
}
