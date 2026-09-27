'use client';

import { useState } from 'react';

import { Button } from '@/components/button/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';

const POSITIONS = ['Top', 'Bottom', 'Right'];

export default function DropdownMenuRadioItems() {
  const [position, setPosition] = useState('Bottom');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Panel: {position}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="nx:w-56">
        <DropdownMenuLabel>Panel position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          {POSITIONS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
