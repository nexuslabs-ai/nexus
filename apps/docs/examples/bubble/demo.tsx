'use client';

import { Bubble, BubbleContent, BubbleGroup } from '@/components/bubble/bubble';

export default function BubbleDemo() {
  return (
    <BubbleGroup className="nx:w-full nx:max-w-sm">
      <Bubble align="start">
        <BubbleContent>How do I rotate the signing key?</BubbleContent>
      </Bubble>
      <Bubble variant="primary" align="end">
        <BubbleContent>Run `nexus keys rotate`, then redeploy.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}
