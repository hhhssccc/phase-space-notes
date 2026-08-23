const defaultTitles = {
  abstract: '摘要',
  attention: '注意',
  bug: '问题',
  caution: '注意',
  check: '完成',
  danger: '危险',
  error: '错误',
  example: '示例',
  failure: '失败',
  faq: '问答',
  help: '帮助',
  important: '重要',
  info: '信息',
  missing: '缺失',
  note: '注',
  question: '问题',
  quote: '引用',
  success: '成功',
  summary: '小结',
  tip: '提示',
  todo: '待办',
  warning: '警告',
};

function transformCallout(node) {
  if (node.type !== 'blockquote' || !Array.isArray(node.children) || node.children.length === 0) return;

  const firstParagraph = node.children[0];
  if (firstParagraph?.type !== 'paragraph' || !Array.isArray(firstParagraph.children)) return;

  const firstText = firstParagraph.children.find((child) => child.type === 'text');
  if (!firstText) return;

  const match = firstText.value.match(/^\[!([A-Za-z0-9_-]+)\]([+-])?(?:[ \t]+([^\r\n]+))?(?:\r?\n|$)/);
  if (!match) return;

  const type = match[1].toLowerCase();
  const title = match[3]?.trim() || defaultTitles[type] || type;
  firstText.value = firstText.value.slice(match[0].length);

  const bodyChildren = [...node.children];
  if (firstParagraph.children.every((child) => child.type === 'text' && child.value.length === 0)) {
    bodyChildren.shift();
  }

  node.data = {
    ...(node.data || {}),
    hName: 'aside',
    hProperties: {
      className: ['callout', `callout-${type}`],
      'data-callout': type,
    },
  };

  node.children = [
    {
      type: 'paragraph',
      data: { hProperties: { className: ['callout-title'] } },
      children: [{ type: 'strong', children: [{ type: 'text', value: title }] }],
    },
    ...bodyChildren,
  ];
}

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) {
    transformCallout(child);
    walk(child);
  }
}

export function remarkObsidianCallouts() {
  return (tree) => walk(tree);
}
