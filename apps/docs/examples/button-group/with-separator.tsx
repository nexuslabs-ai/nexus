'use client';

import {
  IconBold,
  IconItalic,
  IconLink,
  IconUnderline,
} from '@tabler/icons-react';

import { Button } from '@/components/button/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@/components/button-group/button-group';

export default function ButtonGroupWithSeparator() {
  return (
    <ButtonGroup>
      <Button variant="ghost" size="icon" aria-label="Bold">
        <IconBold />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Italic">
        <IconItalic />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Underline">
        <IconUnderline />
      </Button>
      <ButtonGroupSeparator />
      <Button variant="ghost" size="icon" aria-label="Add link">
        <IconLink />
      </Button>
    </ButtonGroup>
  );
}
