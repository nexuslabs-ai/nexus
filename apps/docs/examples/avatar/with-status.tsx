'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarStatus,
} from '@/components/avatar/avatar';

const people = [
  {
    name: 'Ada Lovelace',
    initials: 'AL',
    src: '/avatars/ada.svg',
    status: 'online',
  },
  {
    name: 'Grace Hopper',
    initials: 'GH',
    src: '/avatars/grace.svg',
    status: 'away',
  },
  {
    name: 'Katherine Johnson',
    initials: 'KJ',
    src: '/avatars/katherine.svg',
    status: 'busy',
  },
  {
    name: 'Mary Jackson',
    initials: 'MJ',
    src: '/avatars/mary.svg',
    status: 'offline',
  },
] as const;

export default function AvatarWithStatus() {
  return (
    <div className="nx:flex nx:items-center nx:gap-4">
      {people.map((person) => (
        <Avatar key={person.name} size="lg">
          <AvatarImage src={person.src} alt={person.name} />
          <AvatarFallback>{person.initials}</AvatarFallback>
          <AvatarStatus status={person.status} />
        </Avatar>
      ))}
    </div>
  );
}
