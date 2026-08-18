import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const rootKatexCss = require.resolve('katex/dist/katex.min.css');
const rehypeKatexEntry = require.resolve('rehype-katex');
const rendererRequire = createRequire(rehypeKatexEntry);
const rendererKatexCss = rendererRequire.resolve('katex/dist/katex.min.css');

if (rootKatexCss !== rendererKatexCss) {
  throw new Error(`KaTeX renderer/CSS mismatch:\nrenderer: ${rendererKatexCss}\nCSS: ${rootKatexCss}`);
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

const htmlFiles = await collectHtml(path.join(root, 'dist'));
let articlePages = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (!html.includes('class="article-prose"')) continue;
  articlePages += 1;

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
}

const notePath = path.join(root, 'dist', 'notes', 'laurent-expansion-from-orthogonality', 'index.html');
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

const essayPath = path.join(root, 'dist', 'articles', 'information-entropy-and-everything', 'index.html');
const essayHtml = await readFile(essayPath, 'utf8');
if (!essayHtml.includes('class="article-prose" data-math-display="ruled"')) {
  throw new Error('Prose-heavy essay should retain ruled display math');
}

console.log(`RENDER_CONTRACT_PASS: ${articlePages} article pages; KaTeX CSS matches renderer; adaptive math and callouts verified.`);
