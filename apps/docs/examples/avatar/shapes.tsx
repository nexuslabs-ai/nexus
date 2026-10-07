'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/avatar/avatar';

export default function AvatarShapes() {
  return (
    <div className="nx:flex nx:items-center nx:gap-4">
      <Avatar size="lg" shape="circle">
        <AvatarImage src="/avatars/grace.svg" alt="Grace Hopper" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar size="lg" shape="rounded">
        <AvatarImage src="/avatars/grace.svg" alt="Grace Hopper" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
    </div>
  );
}
