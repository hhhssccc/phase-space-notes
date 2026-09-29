import { createHash } from 'node:crypto';

export function equationId(tex) {
  return `eq-${createHash('sha256').update(tex.replace(/\r\n?/g, '\n').trim()).digest('hex').slice(0, 12)}`;
}

// Content-derived anchors survive insertion of unrelated equations above them.
export function rehypeEquationLinks({ tools = true } = {}) {
  return tree => {
    const counts = new Map();
    function visit(node) {
      if (node.type === 'element' && node.properties?.className?.includes('katex-display')) {
        let source = '';
        function annotation(child) {
          if (child.tagName === 'annotation' && child.properties?.encoding === 'application/x-tex') source = child.children?.map(c => c.value || '').join('') || '';
          else child.children?.forEach(annotation);
        }
        annotation(node);
        const base = equationId(source);
        const count = (counts.get(base) || 0) + 1; counts.set(base, count);
        node.properties.id = count === 1 ? base : `${base}-${count}`;
        node.properties['data-equation'] = '';
        const id = node.properties.id;
        if (tools) {
          // Keep tools outside KaTeX's horizontal scroller and performance transform.
          const equation = { ...node };
          node.tagName = 'span';
          node.properties = { className: ['equation-block'], 'data-equation-block': '' };
          node.children = [equation, {
            type: 'element', tagName: 'button',
            properties: { type: 'button', className: ['equation-trigger', 'print-hidden'], disabled: true,
              'data-formula-toggle': id, ariaLabel: '打开公式工具', ariaExpanded: 'false', ariaControls: 'formula-menu', ariaHasPopup: 'dialog' },
            children: [{ type: 'text', value: '⋯' }],
          }];
        }
        return;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
