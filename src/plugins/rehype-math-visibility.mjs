// Keep all math in the HTML (including accessible MathML), but let the browser
// skip offscreen display-math layout. Estimate its height at build time from
// KaTeX's struts, so matrices and multi-line derivations get suitable placeholders.
const hasClass = (node, name) => node.properties?.className?.includes(name);
const childWithClass = (node, name) => node.children?.find(child => hasClass(child, name));

export function rehypeMathVisibility() {
  return function transform(tree) {
    function visit(node) {
      if (hasClass(node, 'katex-display')) {
        const html = childWithClass(childWithClass(node, 'katex') || {}, 'katex-html');
        const bases = html?.children?.filter(child => hasClass(child, 'base')) || [];
        // Explicit line breaks and tagged equations need different sizing rules.
        if (bases.length && html.children.every(child => hasClass(child, 'base'))) {
          let ascent = 0;
          let descent = 0;
          let valid = true;
          for (const base of bases) {
            const style = childWithClass(base, 'strut')?.properties?.style || '';
            const height = style.match(/(?:^|;)height:([\d.]+)em/);
            const depth = style.match(/vertical-align:([\d.-]+)em/);
            if (!height) { valid = false; break; }
            const below = depth ? -Number(depth[1]) : 0;
            ascent = Math.max(ascent, Number(height[1]) - below);
            descent = Math.max(descent, below);
          }
          if (valid) {
            node.properties.className.push('math-deferred');
            // Match global.css's 1.05em KaTeX font size; allow for its line box.
            const height = (Math.max(1.3, ascent + descent) * 1.05).toFixed(4);
            const existing = node.properties.style ? `${node.properties.style};` : '';
            node.properties.style = `${existing}--math-height:${height}em`;
          }
        }
        return;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
