'use client';

import { Bubble, BubbleContent, BubbleGroup } from '@/components/bubble/bubble';

export default function BubbleVariants() {
  return (
    <BubbleGroup className="nx:w-full nx:max-w-sm">
      <Bubble variant="muted">
        <BubbleContent>Muted is the default incoming surface.</BubbleContent>
      </Bubble>
      <Bubble variant="primary" align="end">
        <BubbleContent>Primary marks your own messages.</BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>Outline keeps the turn quiet.</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>Ghost drops the surface entirely.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>Destructive flags a failed turn.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}
