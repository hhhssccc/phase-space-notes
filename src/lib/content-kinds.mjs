export const contentKinds = {
  essay: { path: 'articles', label: '文章', eyebrow: 'ESSAY' },
  note: { path: 'notes', label: '笔记', eyebrow: 'NOTE' },
  reflection: { path: 'reflections', label: '杂感', eyebrow: 'REFLECTION' },
  visualization: { path: 'lab', label: '演算室', eyebrow: 'VISUALIZATION' },
};
export function contentPath(type, id) {
  const kind = contentKinds[type];
  if (!kind) throw new Error(`Unknown content type: ${type}`);
  return `/${kind.path}/${id}/`;
}
