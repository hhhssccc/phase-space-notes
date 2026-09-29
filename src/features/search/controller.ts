import { registerPageFeature } from '../../lib/browser/lifecycle';
import { searchEntries, excerpt, type SearchEntry } from '../../lib/section-search';
registerPageFeature('search', signal => {
  const input = document.querySelector('#site-search');
  if (!(input instanceof HTMLInputElement)) return;
  const status = document.querySelector('[data-search-status]');
  const clear = document.querySelector<HTMLButtonElement>('.search-clear');
  const heading = document.querySelector('[data-results-heading]');
  const empty = document.querySelector('[data-search-empty]');
  const raw = document.querySelector('#search-index')?.textContent || '[]';
  const entries = JSON.parse(raw) as SearchEntry[];
  const list = document.querySelector('[data-search-results]');
  const update = () => {
    const query = input.value.trim();
    const matches = searchEntries(entries, query);
    list?.replaceChildren();
    matches.forEach(({ entry, section }) => {
      const li = document.createElement('li'); li.className = 'search-result';
      const meta = document.createElement('span'); meta.className = 'entry-meta'; meta.textContent = entry.category;
      const body = document.createElement('div'); const title = document.createElement('h2');
      const link = document.createElement('a'); link.textContent = entry.title;
      link.href = entry.url + (query && section?.slug ? `#${encodeURIComponent(section.slug)}` : '');
      title.append(link);
      const context = document.createElement('p');
      context.textContent = query && section ? excerpt(section.prose || section.title, query) : entry.description;
      const label = document.createElement('span'); label.className = 'entry-meta';
      label.textContent = query && section ? `定位到：${section.title}` : entry.tags.join(' · ');
      body.append(title, context, label); li.append(meta, body); list?.append(li);
    });
    if (status) status.textContent = query ? `找到 ${matches.length} 条结果` : entries.length ? '先从这些文章与笔记开始。' : '还没有公开的文章与笔记。';
    if (heading) heading.textContent = query ? '搜索结果' : '最近发布';
    if (clear) clear.hidden = !input.value.length;
    empty?.toggleAttribute('hidden', !query || matches.length > 0);
  };
  input?.addEventListener('input', (event) => {
    if (!(event instanceof InputEvent) || !event.isComposing) update();
  }, { signal });
  input?.addEventListener('compositionend', update, { signal });
  document.querySelector('.search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    update();
  }, { signal });
  clear?.addEventListener('click', () => {
    if (!(input instanceof HTMLInputElement)) return;
    input.value = '';
    update();
    input.focus();
  }, { signal });
  document.querySelectorAll<HTMLButtonElement>('[data-search-topic]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!(input instanceof HTMLInputElement)) return;
      input.value = button.dataset.searchTopic || '';
      update();
      input.focus();
    }, { signal });
  });
  update();
});
