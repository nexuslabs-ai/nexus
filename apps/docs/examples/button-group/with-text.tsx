'use client';

import { Button } from '@/components/button/button';
import {
  ButtonGroup,
  ButtonGroupText,
} from '@/components/button-group/button-group';

export default function ButtonGroupWithText() {
  return (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="outline">nexus.dev</Button>
    </ButtonGroup>
  );
}
