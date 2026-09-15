import { defineHastPlugin } from 'satteri';

export const hastExternalLinks = defineHastPlugin({
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, context) {
      const href = node.properties.href;

      if (typeof href === 'string' && /^https?:\/\//.test(href)) {
        context.setProperty(node, 'target', '_blank');
        context.setProperty(node, 'rel', ['noopener', 'noreferrer']);
      }
    },
  },
});
