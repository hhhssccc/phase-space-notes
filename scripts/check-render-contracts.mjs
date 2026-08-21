import { existsSync } from 'node:fs';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outputDirectory = process.env.RENDER_OUTPUT_DIR || 'dist';
const distRoot = path.resolve(root, outputDirectory);
const relativeOutputDirectory = path.relative(root, distRoot);
if (!relativeOutputDirectory
    || relativeOutputDirectory === '..'
    || relativeOutputDirectory.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeOutputDirectory)) {
  throw new Error(`RENDER_OUTPUT_DIR must name a directory inside the repository: ${outputDirectory}`);
}
const defaultSiteUrl = 'https://hhhssccc.github.io';
const configuredSiteUrl = new URL(process.env.SITE_URL || defaultSiteUrl);
const buildOrigin = configuredSiteUrl.origin;
const rawBasePath = process.env.BASE_PATH || '/';
const buildBasePath = rawBasePath === '/'
  ? '/'
  : `/${rawBasePath}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
const buildRoot = new URL(buildBasePath === '/' ? '/' : `${buildBasePath}/`, buildOrigin);
const buildRssUrl = new URL('rss.xml', buildRoot).href;
const require = createRequire(import.meta.url);
const rootKatexCss = require.resolve('katex/dist/katex.min.css');
const rehypeKatexEntry = require.resolve('rehype-katex');
const rendererRequire = createRequire(rehypeKatexEntry);
const rendererKatexCss = rendererRequire.resolve('katex/dist/katex.min.css');

if (rootKatexCss !== rendererKatexCss) {
  throw new Error(`KaTeX renderer/CSS mismatch:\nrenderer: ${rendererKatexCss}\nCSS: ${rootKatexCss}`);
}

const studyRoomSource = await readFile(path.join(root, 'src', 'components', 'study-room', 'StudyRoom.astro'), 'utf8');
if (/dataset\.pageKind\s*===\s*['"]home['"]/.test(studyRoomSource)
    || !/if\s*\(wallpaperEnabled\)\s*body\.dataset\.wallpaper\s*=/.test(studyRoomSource)
    || !studyRoomSource.includes(":global(body[data-wallpaper='grid'])")
    || !studyRoomSource.includes(":global(body[data-wallpaper='orbit'])")) {
  throw new Error('Study-room wallpaper choices must apply to every site page, not only the homepage.');
}

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function outputRelativePath(file) {
  return path.relative(distRoot, file).split(path.sep).join('/');
}

function publicUrlForHtml(file) {
  const relative = outputRelativePath(file);
  if (relative === 'index.html') return buildRoot.href;
  if (relative.endsWith('/index.html')) {
    return new URL(relative.slice(0, -'index.html'.length), buildRoot).href;
  }
  if (relative.endsWith('.html')) {
    return new URL(relative, buildRoot).href;
  }
  return new URL(relative, buildRoot).href;
}

function attribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`(?:^|\\s)${escapedName}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')`, 'i'));
  return match ? (match[1] ?? match[2]) : undefined;
}

function linkHref(html, rel, file, type) {
  const matches = linkTags(html, rel, type);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${rel} link in ${file}; found ${matches.length}`);
  }
  const href = attribute(matches[0], 'href');
  if (!href) throw new Error(`Missing href on ${rel} link: ${file}`);
  return href;
}

function linkTags(html, rel, type) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => (attribute(tag, 'rel') || '').split(/\s+/).includes(rel))
    .filter((tag) => !type || attribute(tag, 'type') === type);
}

function pathnameIsWithinBuildBase(pathname) {
  return buildBasePath === '/'
    || pathname === buildBasePath
    || pathname.startsWith(`${buildBasePath}/`);
}

function assertBuildUrl(actual, expected, label) {
  let parsed;
  try {
    parsed = new URL(actual);
  } catch {
    throw new Error(`${label} must be an absolute build URL: ${actual}`);
  }
  if (parsed.href !== expected) {
    throw new Error(`${label} mismatch:\nexpected: ${expected}\nactual:   ${parsed.href}`);
  }
  if (parsed.origin !== buildRoot.origin || !pathnameIsWithinBuildBase(parsed.pathname)) {
    throw new Error(`${label} escapes the configured site/base: ${parsed.href}`);
  }
}

function articleJsonLd(html, file) {
  const articles = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attribute(match[1], 'type') !== 'application/ld+json') continue;
    let value;
    try {
      value = JSON.parse(match[2]);
    } catch (error) {
      throw new Error(`Invalid JSON-LD in ${file}: ${error.message}`);
    }
    const candidates = Array.isArray(value) ? value : [value];
    for (const candidate of candidates) {
      const types = Array.isArray(candidate?.['@type']) ? candidate['@type'] : [candidate?.['@type']];
      if (types.includes('Article')) articles.push(candidate);
    }
  }
  if (articles.length !== 1) {
    throw new Error(`Expected exactly one Article JSON-LD object in ${file}; found ${articles.length}`);
  }
  return articles[0];
}

function articleHistorySection(html, file) {
  const classPosition = html.indexOf('class="article-history print-hidden"');
  if (classPosition < 0) throw new Error(`Missing collapsible article history: ${file}`);
  const start = html.lastIndexOf('<section', classPosition);
  const end = html.indexOf('</section>', classPosition);
  if (start < 0 || end < 0) throw new Error(`Malformed article history section: ${file}`);
  return html.slice(start, end + '</section>'.length);
}

function classElementSection(html, tagName, className, file) {
  const classPosition = html.indexOf(`class="${className}`);
  if (classPosition < 0) throw new Error(`Missing ${className} section: ${file}`);
  const start = html.lastIndexOf(`<${tagName}`, classPosition);
  const end = html.indexOf(`</${tagName}>`, classPosition);
  if (start < 0 || end < 0) throw new Error(`Malformed ${className} section: ${file}`);
  return html.slice(start, end + tagName.length + 3);
}

function openingTags(html) {
  return [...html.matchAll(/<[a-z][^>]*>/gi)].map((match) => match[0]);
}

function decodedAttribute(tag, name) {
  const value = attribute(tag, name);
  return value === undefined ? undefined : decodeXmlText(value);
}

function pageIds(html, file) {
  const ids = new Set();
  for (const tag of openingTags(html)) {
    const id = decodedAttribute(tag, 'id');
    if (!id) continue;
    if (ids.has(id)) throw new Error(`Duplicate id "${id}" in ${file}`);
    ids.add(id);
  }
  return ids;
}

const htmlFiles = await collectHtml(distRoot);
const renderedPages = [];
const renderedArticles = [];
let articlePages = 0;
let studyRoomPages = 0;
let musicPlayerPages = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relative = outputRelativePath(file);
  const publicUrl = publicUrlForHtml(file);
  const isNotFoundPage = relative === '404.html';
  const expectedCanonical = isNotFoundPage ? undefined : publicUrl;
  if (isNotFoundPage) {
    const canonicalLinks = linkTags(html, 'canonical');
    const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
    const openGraphUrls = metaTags
      .filter((tag) => attribute(tag, 'property') === 'og:url');
    if (canonicalLinks.length !== 0 || openGraphUrls.length !== 0) {
      throw new Error(`404 page must not publish a canonical or og:url: ${file}`);
    }
    const noindex = metaTags.some((tag) => attribute(tag, 'name')?.toLowerCase() === 'robots'
      && (attribute(tag, 'content') || '').toLowerCase().split(/[\s,]+/).includes('noindex'));
    if (!noindex) {
      throw new Error(`404 page must remain noindex: ${file}`);
    }
  } else {
    assertBuildUrl(linkHref(html, 'canonical', file), expectedCanonical, `Canonical URL for ${file}`);
  }
  assertBuildUrl(
    linkHref(html, 'alternate', file, 'application/rss+xml'),
    buildRssUrl,
    `RSS alternate URL for ${file}`,
  );

  const ids = pageIds(html, file);
  for (const tag of openingTags(html)) {
    if (/^<img\b/i.test(tag) && attribute(tag, 'alt') === undefined) {
      throw new Error(`Image is missing alt text: ${file}`);
    }
    for (const name of ['href', 'src', 'action']) {
      const value = decodedAttribute(tag, name);
      if (!value || !value.startsWith('/') || value.startsWith('//')) continue;
      if (buildBasePath !== '/'
          && value !== buildBasePath
          && !value.startsWith(`${buildBasePath}/`)
          && !value.startsWith(`${buildBasePath}?`)
          && !value.startsWith(`${buildBasePath}#`)) {
        throw new Error(`Root-relative ${name} escapes ${buildBasePath} in ${file}: ${value}`);
      }
    }
  }
  renderedPages.push({ file, html, canonical: publicUrl, ids });

  const studyRoomEnabled = html.includes('data-feature-study-room="true"');
  const musicEnabled = html.includes('data-feature-music="true"');
  const hasStudyTrigger = html.includes('data-study-open');
  const hasStudyDrawer = html.includes('data-study-drawer');
  const hasMusicPlayer = html.includes('data-music-player');

  if (/<(?:audio|video)\b[^>]*\bautoplay\b/i.test(html)) {
    throw new Error(`Media autoplay is forbidden: ${file}`);
  }
  if (musicEnabled && !studyRoomEnabled) {
    throw new Error(`Music cannot be enabled without its study-room host: ${file}`);
  }
  if (studyRoomEnabled !== (hasStudyTrigger && hasStudyDrawer)) {
    throw new Error(`Study-room feature flag/render mismatch: ${file}`);
  }
  if (hasStudyTrigger !== hasStudyDrawer) {
    throw new Error(`Incomplete study-room markup: ${file}`);
  }
  if (studyRoomEnabled) {
    if (!/data-study-open[^>]*aria-expanded="false"/.test(html)) {
      throw new Error(`Study room must render closed: ${file}`);
    }
    if (!/data-study-drawer[^>]*aria-hidden="true"[^>]*\bhidden\b[^>]*\binert\b/.test(html)) {
      throw new Error(`Study drawer must be hidden and inert before interaction: ${file}`);
    }
    if (!html.includes('mascot-study-avatar.webp')) {
      throw new Error(`Study-room trigger must use the chibi avatar: ${file}`);
    }
    if (html.includes('study-room-description') || html.includes('宇佐见莲子 · 阅读中') || html.includes('把界面偏好')) {
      throw new Error(`Study-room intro must remain title-only: ${file}`);
    }
    studyRoomPages += 1;
  }

  if (musicEnabled !== hasMusicPlayer) {
    throw new Error(`Music feature flag/render mismatch: ${file}`);
  }
  if (hasMusicPlayer) {
    musicPlayerPages += 1;
    if (!/data-music-player[^>]*data-state="idle"/.test(html) || !html.includes('默认暂停')) {
      throw new Error(`Music player must begin idle with an explicit paused status: ${file}`);
    }
  }

  if (!html.includes('class="article-prose"')) continue;
  articlePages += 1;

  const route = relative.match(/^(articles|notes)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.html$/);
  if (!route) throw new Error(`Rendered article has no safe content mapping: ${file}`);
  const sourcePath = `content/${route[2]}.md`;
  try {
    await access(path.join(root, sourcePath));
  } catch {
    throw new Error(`Rendered article source is missing: ${sourcePath}`);
  }
  const sourceMarkdown = await readFile(path.join(root, sourcePath), 'utf8');
  const desktopToc = classElementSection(html, 'aside', 'article-toc print-hidden', file);
  const mobileToc = html.includes('class="mobile-toc print-hidden"')
    ? classElementSection(html, 'details', 'mobile-toc print-hidden', file)
    : '';
  const automaticNumber = /<a\b[^>]*>\s*<span\b[^>]*aria-hidden="true"[^>]*>\s*\d+(?:\.\d+)*\s*<\/span>/i;
  if (automaticNumber.test(desktopToc) || automaticNumber.test(mobileToc)) {
    throw new Error(`Article TOC must not add automatic section numbers: ${file}`);
  }
  const sourceHeadingHasMath = /^ {0,3}#{2,3}[ \t]+[^\n]*\$[^$\n]+\$/m.test(sourceMarkdown);
  if (sourceHeadingHasMath && (!desktopToc.includes('class="katex"') || !mobileToc.includes('class="katex"'))) {
    throw new Error(`Inline math in article headings must render in both TOCs: ${file}`);
  }
  if (desktopToc.includes('⇒\\Rightarrow⇒') || mobileToc.includes('⇒\\Rightarrow⇒')) {
    throw new Error(`Article TOC contains duplicated KaTeX accessibility text: ${file}`);
  }

  if (html.includes('class="margin-notes print-hidden"')) {
    const desktopSidenotes = classElementSection(html, 'aside', 'margin-notes print-hidden', file);
    const mobileSidenotes = classElementSection(html, 'details', 'mobile-sidenotes print-hidden', file);
    if (desktopSidenotes.includes('$') || mobileSidenotes.includes('$')) {
      throw new Error(`Sidenote math delimiters were emitted as plain text: ${file}`);
    }
    if (/<sup\b[^>]*>\s*<(?:ul|ol|p)\b/i.test(desktopSidenotes)
        || /<sup\b[^>]*>\s*<(?:ul|ol|p)\b/i.test(mobileSidenotes)) {
      throw new Error(`Sidenote marker was parsed as block Markdown: ${file}`);
    }
    const frontmatter = sourceMarkdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const sidenoteBlock = frontmatter.match(/(?:^|\n)sidenotes:\s*\r?\n([\s\S]*?)(?=\r?\n[A-Za-z][A-Za-z0-9_]*:\s|$)/)?.[1] ?? '';
    if (/\$[^$\n]+\$/.test(sidenoteBlock)
        && (!desktopSidenotes.includes('class="katex"') || !mobileSidenotes.includes('class="katex"'))) {
      throw new Error(`Inline math in sidenotes must render on desktop and mobile: ${file}`);
    }
  }

  if (!/class="article-prose" data-math-display="(?:plain|ruled)"/.test(html)) {
    throw new Error(`Missing resolved math display mode: ${file}`);
  }
  if (/\[![A-Za-z0-9_-]+\]/.test(html)) {
    throw new Error(`Unconverted Obsidian callout: ${file}`);
  }
  if (html.includes('![[') || html.includes('[[')) {
    throw new Error(`Unconverted Obsidian link/embed: ${file}`);
  }
  if (html.includes('\\boxed') && !html.includes('class="stretchy fbox"')) {
    throw new Error(`Boxed formula lost its KaTeX box structure: ${file}`);
  }
  const hasLatestHistoryLabel = html.includes('最新文件版本') || html.includes('最新元数据里程碑');
  if (!html.includes('首次公开') || !hasLatestHistoryLabel) {
    throw new Error(`Missing public date/version labels: ${file}`);
  }
  if (!html.includes('property="article:published_time"') || !html.includes('property="article:modified_time"')) {
    throw new Error(`Missing article publication metadata: ${file}`);
  }

  const structuredData = articleJsonLd(html, file);
  assertBuildUrl(structuredData.mainEntityOfPage, expectedCanonical, `JSON-LD mainEntityOfPage for ${file}`);
  assertBuildUrl(structuredData.isPartOf?.url, buildRoot.href, `JSON-LD WebSite URL for ${file}`);
  if (Number.isNaN(Date.parse(structuredData.datePublished))) {
    throw new Error(`JSON-LD datePublished is invalid in ${file}: ${structuredData.datePublished}`);
  }
  renderedArticles.push({
    file,
    html,
    sourcePath,
    canonical: expectedCanonical,
    description: structuredData.description,
    publishedAt: structuredData.datePublished,
  });
}

const pagesByCanonical = new Map(renderedPages.map((page) => [page.canonical, page]));
for (const page of renderedPages) {
  for (const tag of openingTags(page.html)) {
    const href = decodedAttribute(tag, 'href');
    if (!href || !href.includes('#')) continue;
    let destination;
    try {
      destination = new URL(href, page.canonical);
    } catch {
      throw new Error(`Invalid fragment link in ${page.file}: ${href}`);
    }
    if (destination.origin !== buildRoot.origin || !destination.hash) continue;
    destination.hash = '';
    const targetPage = pagesByCanonical.get(destination.href);
    if (!targetPage) throw new Error(`Internal fragment page is missing in ${page.file}: ${href}`);
    let targetId;
    try {
      targetId = decodeURIComponent(new URL(href, page.canonical).hash.slice(1));
    } catch {
      throw new Error(`Invalid percent-encoding in fragment link in ${page.file}: ${href}`);
    }
    if (targetId && !targetPage.ids.has(targetId)) {
      throw new Error(`Fragment target "${targetId}" is missing in ${page.file}: ${href}`);
    }
  }
}

const notePath = path.join(distRoot, 'notes', 'laurent-expansion-from-orthogonality', 'index.html');
const noteHtml = await readFile(notePath, 'utf8');
const noteChecks = {
  plainMathMode: noteHtml.includes('class="article-prose" data-math-display="plain"'),
  questionCallout: noteHtml.includes('class="callout callout-question"'),
  boxedFormula: noteHtml.includes('class="stretchy fbox"'),
  captionRemoved: !noteHtml.includes('用户提供的插图'),
};

for (const [name, passed] of Object.entries(noteChecks)) {
  if (!passed) throw new Error(`Laurent note render contract failed: ${name}`);
}

const essayPath = path.join(distRoot, 'articles', 'information-entropy-and-everything', 'index.html');
const essayHtml = await readFile(essayPath, 'utf8');
if (!essayHtml.includes('class="article-prose" data-math-display="ruled"')) {
  throw new Error('Prose-heavy essay should retain ruled display math');
}

function currentGitHistory(contentFile) {
  if (!existsSync(path.join(root, '.git'))) {
    return { source: 'fallback', reason: 'not-a-repository' };
  }

  try {
    const common = ['-c', `safe.directory=${root}`];
    const inside = execFileSync('git', [...common, 'rev-parse', '--is-inside-work-tree'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (inside !== 'true') return { source: 'fallback', reason: 'not-a-repository' };

    const shallow = execFileSync('git', [...common, 'rev-parse', '--is-shallow-repository'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (shallow === 'true') return { source: 'fallback', reason: 'shallow-repository' };
    if (shallow !== 'false') return { source: 'fallback', reason: 'invalid-history' };

    const output = execFileSync('git', [
      ...common,
      'log',
      '--follow',
      '--reverse',
      '--topo-order',
      '--format=%H',
      '--',
      contentFile,
    ], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 2 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const commits = output ? output.split(/\r?\n/) : [];
    if (commits.length === 0) return { source: 'fallback', reason: 'untracked-file' };
    if (!commits.every((sha) => /^[0-9a-f]{40}$/i.test(sha))) {
      return { source: 'fallback', reason: 'invalid-history' };
    }
    return { source: 'git', commits };
  } catch {
    return { source: 'fallback', reason: 'git-unavailable' };
  }
}

const fallbackPhrases = {
  'git-unavailable': '无法读取 Git 历史',
  'not-a-repository': '不包含可读取的 Git 仓库',
  'shallow-repository': '浅层 Git 历史',
  'untracked-file': '未找到该文章的已跟踪历史',
  'invalid-history': 'Git 历史输出无法可靠解析',
};

for (const article of renderedArticles) {
  const history = currentGitHistory(article.sourcePath);
  const section = articleHistorySection(article.html, article.file);
  if (history.source === 'git') {
    const timeline = section.match(/<ol\b[^>]*class="history-timeline"[^>]*>([\s\S]*?)<\/ol>/i)?.[1];
    if (!timeline) throw new Error(`Missing Git-backed history timeline: ${article.file}`);
    const items = [...timeline.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => match[1]);
    const expected = history.commits.map((sha, index) => ({ sha, version: index + 1 })).reverse();
    if (items.length !== expected.length) {
      throw new Error(`Git history length mismatch for ${article.file}: expected ${expected.length}, found ${items.length}`);
    }
    for (let index = 0; index < expected.length; index += 1) {
      const sha = items[index].match(/\/commit\/([0-9a-f]{40})/i)?.[1];
      const version = Number(items[index].match(/class="version-number"[^>]*>v(\d+)<\/span>/i)?.[1]);
      if (sha !== expected[index].sha || version !== expected[index].version) {
        throw new Error(
          `Git topology/version order mismatch for ${article.file} at displayed row ${index + 1}: `
          + `expected v${expected[index].version} ${expected[index].sha}, found v${version || '?'} ${sha || '?'}`,
        );
      }
    }
  } else {
    if (!section.includes('class="history-notice" role="note"')
        || !section.includes('不是完整 Git 历史')
        || !section.includes(fallbackPhrases[history.reason])) {
      throw new Error(`History fallback (${history.reason}) must be explicit: ${article.file}`);
    }
    if (/\/commit\/[0-9a-f]{40}/i.test(section)) {
      throw new Error(`History fallback must not expose a partial commit list: ${article.file}`);
    }
  }
}

function decodeXmlText(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 16)))
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 10)))
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&');
}

function xmlText(xml, tagName, label) {
  const escapedName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = xml.match(new RegExp(`<${escapedName}\\b[^>]*>([\\s\\S]*?)<\\/${escapedName}>`, 'i'));
  if (!match) throw new Error(`Missing ${label}`);
  return decodeXmlText(match[1].trim());
}

const rssPath = path.join(distRoot, 'rss.xml');
const rssXml = await readFile(rssPath, 'utf8');
if (/<content:encoded\b/i.test(rssXml)) {
  throw new Error('RSS must not publish unrendered Markdown as full content');
}
const channel = rssXml.match(/<channel\b[^>]*>([\s\S]*?)<\/channel>/i)?.[1];
if (!channel) throw new Error('RSS channel is missing');
const firstItem = channel.search(/<item\b/i);
const channelMetadata = firstItem >= 0 ? channel.slice(0, firstItem) : channel;
assertBuildUrl(xmlText(channelMetadata, 'link', 'RSS channel link'), buildRoot.href, 'RSS channel link');

const rssItems = [...channel.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
if (rssItems.length !== renderedArticles.length) {
  throw new Error(`RSS/public article count mismatch: ${rssItems.length} items for ${renderedArticles.length} pages`);
}
const expectedArticlesByUrl = new Map(renderedArticles.map((article) => [article.canonical, article]));
const seenArticleUrls = new Set();
for (const [index, item] of rssItems.entries()) {
  const itemLink = xmlText(item, 'link', `RSS item ${index + 1} link`);
  const guid = xmlText(item, 'guid', `RSS item ${index + 1} guid`);
  const description = xmlText(item, 'description', `RSS item ${index + 1} description`);
  const pubDate = xmlText(item, 'pubDate', `RSS item ${index + 1} pubDate`);
  assertBuildUrl(itemLink, itemLink, `RSS item ${index + 1} link`);
  assertBuildUrl(guid, itemLink, `RSS item ${index + 1} guid`);
  const expectedArticle = expectedArticlesByUrl.get(itemLink);
  if (!expectedArticle) throw new Error(`RSS item has no rendered public article: ${itemLink}`);
  if (seenArticleUrls.has(itemLink)) throw new Error(`Duplicate RSS item link: ${itemLink}`);
  if (description !== expectedArticle.description) {
    throw new Error(`RSS item description differs from public metadata: ${itemLink}`);
  }
  if (Number.isNaN(Date.parse(pubDate))) throw new Error(`RSS item ${index + 1} pubDate is invalid: ${pubDate}`);
  if (Date.parse(pubDate) !== Date.parse(expectedArticle.publishedAt)) {
    throw new Error(`RSS item pubDate differs from article date: ${itemLink}`);
  }
  seenArticleUrls.add(itemLink);
}
for (const expectedUrl of expectedArticlesByUrl.keys()) {
  if (!seenArticleUrls.has(expectedUrl)) throw new Error(`Rendered public article is missing from RSS: ${expectedUrl}`);
}

console.log(
  `RENDER_CONTRACT_PASS: ${articlePages} public article pages; `
  + `${studyRoomPages} study rooms; ${musicPlayerPages} music players; `
  + 'build-base URLs, summary-only RSS, Git topology/fallbacks, metadata, no-autoplay, adaptive math and callouts verified.',
);
