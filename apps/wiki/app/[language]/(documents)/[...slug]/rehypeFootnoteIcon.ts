import type { Element, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to replace footnote return arrow emoji (↩) with Lucide Undo2 icon
 * This plugin searches for footnote back-reference links and replaces the emoji with JSX
 */
export default function rehypeFootnoteIcon() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      // Look for links that are footnote back-references
      // These typically have href starting with "#user-content-fnref" and contain the return arrow
      if (
        node.tagName === 'a' &&
        node.properties &&
        typeof node.properties.href === 'string' &&
        node.properties.href.includes('#user-content-fnref')
      ) {
        // Check if any child text nodes contain the return arrow emoji
        visit(node, 'text', (textNode: Text) => {
          if (textNode.value?.includes('↩')) {
            // Replace the text node with JSX for the Lucide Undo2 icon
            // Create a proper HAST element for the Undo2 icon
            const iconElement: Element = {
              type: 'element',
              tagName: 'Undo2',
              properties: {
                className: ['w-3', 'h-3', 'inline'],
                'aria-label': '返回',
              },
              children: [],
            };

            // If the text has content besides the emoji, preserve it
            const cleanText = textNode.value.replace(/↩/g, '').trim();

            // Find the parent and replace the text node
            const parent = node;
            const childIndex = parent.children.findIndex(
              (child) => child === textNode,
            );

            if (childIndex !== -1) {
              if (cleanText) {
                // If there's other text, create a text node for it and add the icon
                const newTextNode: Text = {
                  type: 'text',
                  value: `${cleanText} `,
                };
                parent.children.splice(childIndex, 1, newTextNode, iconElement);
              } else {
                // If it's just the emoji, replace with just the icon
                parent.children.splice(childIndex, 1, iconElement);
              }
            }
          }
        });
      }
    });
  };
}
