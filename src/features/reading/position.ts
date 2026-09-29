import type { Position } from './store';
export function articlePosition(article: HTMLElement | null) {
  const headings = article ? [...article.querySelectorAll<HTMLElement>('.article-prose h2[id], .article-prose h3[id]')] : [];
  const position = (): Position | null => {
    if (!article) return null;
    const y = window.scrollY + 110;
    let target: HTMLElement = article;
    let end = article.getBoundingClientRect().bottom + scrollY;
    for (const h of headings) {
      const top = h.getBoundingClientRect().top + scrollY;
      if (top <= y) target = h; else { end = top; break; }
    }
    const top = target.getBoundingClientRect().top + scrollY;
    return {
      path: location.pathname, title: article.dataset.readingTitle || '', section: target.id,
      label: target === article ? '文章开头' : target.textContent?.trim() || '正文',
      offset: Math.min(1, Math.max(0, (y - top) / Math.max(1, end - top))), updated: Date.now()
    };
  };
  const restore = (section: string, offset: number) => {
    const target = document.getElementById(section); if (!target || !article?.contains(target) && target !== article) return;
    const index = headings.indexOf(target);
    const end = (index < 0 ? headings[0] : headings[index + 1]) || article;
    const top = target.getBoundingClientRect().top + scrollY;
    const bottom = end === article ? article.getBoundingClientRect().bottom + scrollY : end.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: Math.max(0, top + offset * (bottom - top) - 110), behavior: 'instant' });
  };

  return { position, restore };
}
