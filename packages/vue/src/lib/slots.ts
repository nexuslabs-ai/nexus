import { Comment, Text, type VNode } from 'vue';

/** The nodes a slot renders, without comments and whitespace-only text. */
export function renderedNodes(nodes: VNode[] | undefined) {
  return (nodes ?? []).filter(
    (node) =>
      node.type !== Comment &&
      !(node.type === Text && !String(node.children).trim())
  );
}
