export function mountFootnotes() {
  document.querySelectorAll<HTMLAnchorElement>('.article-prose a[data-footnote-ref]').forEach((reference, index) => {
    const href = reference.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target || reference.closest('.citation-wrap')) return;
    const previewText = target.textContent?.replace(/↩|Back to reference/gi, '').replace(/\s+/g, ' ').trim();
    if (!previewText) return;
    const wrap = document.createElement('span');
    wrap.className = 'citation-wrap';
    reference.before(wrap);
    wrap.append(reference);
    const preview = document.createElement('span');
    preview.className = 'citation-popover';
    preview.id = `citation-preview-${index + 1}`;
    preview.setAttribute('role', 'tooltip');
    preview.textContent = previewText;
    reference.setAttribute('aria-describedby', preview.id);
    wrap.append(preview);
  });


}
