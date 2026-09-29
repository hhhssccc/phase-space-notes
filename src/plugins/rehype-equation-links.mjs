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
        const button = (label, properties) => ({ type: 'element', tagName: 'button', properties: { type: 'button', disabled: true, ...properties }, children: [{ type: 'text', value: label }] });
        if (tools) node.children.push({ type: 'element', tagName: 'span', properties: { className: ['equation-actions', 'print-hidden'] }, children: [
          button('公式工具', { 'data-formula-toggle': '', ariaLabel: '展开公式工具', ariaExpanded: 'false', ariaControls: `${id}-tools` }),
          { type: 'element', tagName: 'span', properties: { hidden: true, id: `${id}-tools` }, children: [
            button('复制 LaTeX', { 'data-formula-copy': 'tex' }), button('复制公式链接', { 'data-formula-copy': 'link' }),
          ] },
        ] });
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
