'use client';

import { Avatar, AvatarFallback } from '@/components/avatar/avatar';

const sizes = [
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
] as const;

export default function AvatarSizes() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-end nx:gap-3">
      {sizes.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
