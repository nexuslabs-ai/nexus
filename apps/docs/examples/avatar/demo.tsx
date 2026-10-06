'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/avatar/avatar';

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  );
}
