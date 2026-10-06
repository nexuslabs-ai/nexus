'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from '@/components/avatar/avatar';

const team = [
  { name: 'Ada Lovelace', initials: 'AL', src: '/avatars/ada.svg' },
  { name: 'Grace Hopper', initials: 'GH', src: '/avatars/grace.svg' },
  { name: 'Katherine Johnson', initials: 'KJ', src: '/avatars/katherine.svg' },
  { name: 'Mary Jackson', initials: 'MJ', src: '/avatars/mary.svg' },
  { name: 'Dorothy Vaughan', initials: 'DV', src: '/avatars/dorothy.svg' },
];

export default function AvatarGroupDemo() {
  return (
    <AvatarGroup max={3} role="group" aria-label="Project team">
      {team.map((person) => (
        <Avatar key={person.name}>
          <AvatarImage src={person.src} alt={person.name} />
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
