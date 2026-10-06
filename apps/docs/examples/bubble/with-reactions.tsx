'use client';

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from '@/components/bubble/bubble';

export default function BubbleWithReactions() {
  return (
    <BubbleGroup className="nx:w-full nx:max-w-sm">
      <Bubble align="start">
        <BubbleContent>Landed the marker primitive.</BubbleContent>
        <BubbleReactions>🎉 3</BubbleReactions>
      </Bubble>
      <Bubble variant="primary" align="end">
        <BubbleContent>Reviewing it now.</BubbleContent>
        <BubbleReactions align="start">👀 1</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  );
}
