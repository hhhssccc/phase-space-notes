import {
  readFile,
  readdir,
  realpath,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

const CORPUS_EXTENSIONS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.cjs',
  '.xml',
  '.json',
  '.svg',
  '.txt',
]);
const TEXT_EXTENSIONS = new Set([...CORPUS_EXTENSIONS, '.css']);
const TARGET_FAMILIES = new Set([
  'Noto Sans SC Variable',
  'Noto Serif SC Variable',
]);
const TARGET_FONT_FILE = /^noto-(?:sans|serif)-sc-.*\.woff2$/i;
const LOCAL_FONT_FILE = /\.(?:woff2?|ttf|otf)(?:[?#].*)?$/i;

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function findClosingBrace(css, openingBrace) {
  let depth = 1;
  let quote = '';
  let inComment = false;

  for (let index = openingBrace + 1; index < css.length; index += 1) {
    const character = css[index];
    const next = css[index + 1];

    if (inComment) {
      if (character === '*' && next === '/') {
        inComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (character === '\\') {
        index += 1;
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }

    if (character === '/' && next === '*') {
      inComment = true;
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function findFontFaceBlocks(css) {
  const blocks = [];
  const token = '@font-face';
  let searchFrom = 0;

  while (searchFrom < css.length) {
    const start = css.indexOf(token, searchFrom);
    if (start === -1) break;

    let openingBrace = start + token.length;
    while (/\s/.test(css[openingBrace] ?? '')) openingBrace += 1;
    if (css[openingBrace] !== '{') {
      return { blocks: [], safe: false };
    }

    const closingBrace = findClosingBrace(css, openingBrace);
    if (closingBrace === -1) return { blocks: [], safe: false };

    blocks.push({ start, end: closingBrace + 1, text: css.slice(start, closingBrace + 1) });
    searchFrom = closingBrace + 1;
  }

  return { blocks, safe: true };
}

function declaration(block, property) {
  const expression = new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*([^;}]+)`, 'i');
  return expression.exec(block)?.[1]?.trim() ?? null;
}

function normalizeFamily(value) {
  if (value === null) return null;
  const trimmed = value.trim();
  const unquoted = (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) ? trimmed.slice(1, -1) : trimmed;
  return unquoted.replace(/\\(["'])/g, '$1').replace(/\s+/g, ' ').trim();
}

function parseUnicodeRanges(value) {
  if (value === null) return null;
  const ranges = [];

  for (const rawPart of value.split(',')) {
    const part = rawPart.trim();
    const wildcard = /^U\+([0-9a-f]*)(\?+)$/i.exec(part);
    const explicit = /^U\+([0-9a-f]{1,6})(?:-([0-9a-f]{1,6}))?$/i.exec(part);

    let start;
    let end;
    if (wildcard && wildcard[1].length + wildcard[2].length <= 6) {
      start = Number.parseInt(`${wildcard[1]}${'0'.repeat(wildcard[2].length)}`, 16);
      end = Number.parseInt(`${wildcard[1]}${'f'.repeat(wildcard[2].length)}`, 16);
    } else if (explicit) {
      start = Number.parseInt(explicit[1], 16);
      end = Number.parseInt(explicit[2] ?? explicit[1], 16);
    } else {
      return null;
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 0x10ffff || start > end) {
      return null;
    }
    ranges.push([start, end]);
  }

  return ranges.length > 0 ? ranges : null;
}

function rangesContain(ranges, codePoint) {
  return ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function rangesHitCorpus(ranges, codePoints) {
  for (const codePoint of codePoints) {
    if (rangesContain(ranges, codePoint)) return true;
  }
  return false;
}

function addCorpusCodePoints(contents, codePoints) {
  for (const character of contents) codePoints.add(character.codePointAt(0));

  for (const match of contents.matchAll(/\\u(?:\{([0-9a-f]{1,6})\}|([0-9a-f]{4}))/gi)) {
    const codePoint = Number.parseInt(match[1] ?? match[2], 16);
    if (codePoint <= 0x10ffff) codePoints.add(codePoint);
  }
  for (const match of contents.matchAll(/&#(?:x([0-9a-f]{1,6})|([0-9]{1,7}));/gi)) {
    const codePoint = Number.parseInt(match[1] ?? match[2], match[1] ? 16 : 10);
    if (codePoint <= 0x10ffff) codePoints.add(codePoint);
  }
}

function consumeCssString(css, start, codePoints = null) {
  const quote = css[start];
  let index = start + 1;

  while (index < css.length) {
    const character = css[index];
    if (character === quote) return { end: index + 1, safe: true };

    if (character !== '\\') {
      if (codePoints) codePoints.add(css.codePointAt(index));
      index += css.codePointAt(index) > 0xffff ? 2 : 1;
      continue;
    }

    index += 1;
    if (index >= css.length) return { end: css.length, safe: false };
    if (css[index] === '\r' && css[index + 1] === '\n') {
      index += 2;
      continue;
    }
    if (css[index] === '\r' || css[index] === '\n' || css[index] === '\f') {
      index += 1;
      continue;
    }

    const hex = /^[0-9a-f]{1,6}/i.exec(css.slice(index))?.[0] ?? '';
    if (hex) {
      const codePoint = Number.parseInt(hex, 16);
      if (codePoints) codePoints.add(codePoint === 0 || codePoint > 0x10ffff ? 0xfffd : codePoint);
      index += hex.length;
      if (/\s/.test(css[index] ?? '')) index += css[index] === '\r' && css[index + 1] === '\n' ? 2 : 1;
    } else {
      if (codePoints) codePoints.add(css.codePointAt(index));
      index += css.codePointAt(index) > 0xffff ? 2 : 1;
    }
  }

  return { end: css.length, safe: false };
}

function addCssContentCodePoints(css, codePoints) {
  let index = 0;

  while (index < css.length) {
    if (css[index] === '/' && css[index + 1] === '*') {
      const commentEnd = css.indexOf('*/', index + 2);
      if (commentEnd === -1) return false;
      index = commentEnd + 2;
      continue;
    }
    if (css[index] === '"' || css[index] === "'") {
      const string = consumeCssString(css, index);
      if (!string.safe) return false;
      index = string.end;
      continue;
    }

    if (css.slice(index, index + 7).toLowerCase() !== 'content') {
      index += 1;
      continue;
    }
    const before = css[index - 1] ?? '';
    const after = css[index + 7] ?? '';
    if (/[-_a-z0-9]/i.test(before) || /[-_a-z0-9]/i.test(after)) {
      index += 7;
      continue;
    }

    let previous = index - 1;
    while (/\s/.test(css[previous] ?? '')) previous -= 1;
    if (css[previous] !== '{' && css[previous] !== ';') {
      index += 7;
      continue;
    }

    let cursor = index + 7;
    while (/\s/.test(css[cursor] ?? '')) cursor += 1;
    if (css[cursor] !== ':') {
      index += 7;
      continue;
    }
    cursor += 1;

    let declarationClosed = false;
    while (cursor < css.length) {
      if (css[cursor] === ';' || css[cursor] === '}') {
        declarationClosed = true;
        break;
      }
      if (css[cursor] === '/' && css[cursor + 1] === '*') {
        const commentEnd = css.indexOf('*/', cursor + 2);
        if (commentEnd === -1) return false;
        cursor = commentEnd + 2;
        continue;
      }
      if (css[cursor] === '"' || css[cursor] === "'") {
        const string = consumeCssString(css, cursor, codePoints);
        if (!string.safe) return false;
        cursor = string.end;
        continue;
      }
      cursor += 1;
    }
    if (!declarationClosed) return false;
    index = cursor + 1;
  }

  return true;
}

function fontUrls(css) {
  const urls = [];
  const expression = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/gi;
  for (const match of css.matchAll(expression)) {
    const url = match[1] ?? match[2] ?? match[3];
    if (url && !url.startsWith('data:') && !url.startsWith('http:') && !url.startsWith('https:') && !url.startsWith('//') && LOCAL_FONT_FILE.test(url)) {
      urls.push(url);
    }
  }
  return urls;
}

function urlBasename(url) {
  const withoutSuffix = url.split(/[?#]/, 1)[0];
  try {
    return path.posix.basename(decodeURIComponent(withoutSuffix.replaceAll('\\', '/')));
  } catch {
    return null;
  }
}

function indexFilesByBasename(files) {
  const index = new Map();
  for (const file of files) {
    const basename = path.basename(file);
    const matches = index.get(basename) ?? [];
    matches.push(file);
    index.set(basename, matches);
  }
  return index;
}

function verifyFontUrls(textFiles, allFiles) {
  const fileIndex = indexFilesByBasename(allFiles);
  const missing = [];

  for (const [file, contents] of textFiles) {
    if (path.extname(file).toLowerCase() !== '.css') continue;
    for (const url of fontUrls(contents)) {
      const basename = urlBasename(url);
      if (basename === null || (fileIndex.get(basename)?.length ?? 0) !== 1) {
        missing.push(`${path.relative(process.cwd(), file)} -> ${url}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing or ambiguous local font assets:\n${missing.join('\n')}`);
  }
}

async function byteTotal(files) {
  let total = 0;
  for (const file of files) total += (await stat(file)).size;
  return total;
}

const projectRoot = await realpath(process.cwd());
const requestedOutput = path.resolve(projectRoot, process.env.RENDER_OUTPUT_DIR || 'dist');
const outputRoot = await realpath(requestedOutput);
if (!isWithin(projectRoot, outputRoot)) {
  throw new Error(`Refusing to optimize outside a build subdirectory: ${outputRoot}`);
}
if (!(await stat(outputRoot)).isDirectory()) {
  throw new Error(`Build output is not a directory: ${outputRoot}`);
}

const filesBefore = await collectFiles(outputRoot);
const textFiles = new Map();
const codePoints = new Set();
const cssContentCodePoints = new Set();
let corpusUncertain = false;

for (const file of filesBefore) {
  const extension = path.extname(file).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) continue;
  const contents = await readFile(file, 'utf8');
  textFiles.set(file, contents);
  if (CORPUS_EXTENSIONS.has(extension)) addCorpusCodePoints(contents, codePoints);
  if (extension === '.css' && !addCssContentCodePoints(contents, cssContentCodePoints)) corpusUncertain = true;
}
for (const codePoint of cssContentCodePoints) codePoints.add(codePoint);
for (const glyph of ['＋', '−']) {
  if ([...textFiles.entries()].some(([file, contents]) => path.extname(file).toLowerCase() === '.css' && contents.includes(glyph)) && !cssContentCodePoints.has(glyph.codePointAt(0))) {
    throw new Error(`CSS generated-content glyph was not extracted: ${glyph}`);
  }
}

const knownBefore = new Map([...TARGET_FAMILIES].map((family) => [family, []]));
const knownAfter = new Map([...TARGET_FAMILIES].map((family) => [family, []]));
const rewrittenCss = new Map();
let targetFacesBefore = 0;
let targetFacesAfter = 0;
let removedFaces = 0;
let uncertainFacesKept = 0;
let unsafeCssFilesKept = 0;
let cssBytesBefore = 0;
let cssBytesAfter = 0;

for (const [file, contents] of textFiles) {
  if (path.extname(file).toLowerCase() !== '.css') continue;
  cssBytesBefore += Buffer.byteLength(contents);
  const parsed = findFontFaceBlocks(contents);
  if (!parsed.safe) {
    unsafeCssFilesKept += 1;
    rewrittenCss.set(file, contents);
    cssBytesAfter += Buffer.byteLength(contents);
    continue;
  }

  const removals = [];
  for (const block of parsed.blocks) {
    const family = normalizeFamily(declaration(block.text, 'font-family'));
    if (!TARGET_FAMILIES.has(family)) continue;

    targetFacesBefore += 1;
    const ranges = parseUnicodeRanges(declaration(block.text, 'unicode-range'));
    if (ranges === null) {
      uncertainFacesKept += 1;
      targetFacesAfter += 1;
      continue;
    }

    knownBefore.get(family).push(...ranges);
    if (corpusUncertain || rangesHitCorpus(ranges, codePoints)) {
      knownAfter.get(family).push(...ranges);
      targetFacesAfter += 1;
    } else {
      removals.push(block);
      removedFaces += 1;
    }
  }

  let rewritten = contents;
  for (const block of removals.sort((a, b) => b.start - a.start)) {
    rewritten = `${rewritten.slice(0, block.start)}${rewritten.slice(block.end)}`;
  }
  rewrittenCss.set(file, rewritten);
  cssBytesAfter += Buffer.byteLength(rewritten);
}

for (const family of TARGET_FAMILIES) {
  const beforeRanges = knownBefore.get(family);
  const afterRanges = knownAfter.get(family);
  for (const codePoint of codePoints) {
    if (rangesContain(beforeRanges, codePoint) && !rangesContain(afterRanges, codePoint)) {
      throw new Error(`Glyph coverage regression for ${family}: U+${codePoint.toString(16).toUpperCase()}`);
    }
  }
}

const coverageBefore = new Set();
const coverageAfter = new Set();
for (const codePoint of codePoints) {
  if ([...TARGET_FAMILIES].some((family) => rangesContain(knownBefore.get(family), codePoint))) {
    coverageBefore.add(codePoint);
  }
  if ([...TARGET_FAMILIES].some((family) => rangesContain(knownAfter.get(family), codePoint))) {
    coverageAfter.add(codePoint);
  }
}

for (const [file, rewritten] of rewrittenCss) {
  if (rewritten !== textFiles.get(file)) await writeFile(file, rewritten, 'utf8');
  textFiles.set(file, rewritten);
}

verifyFontUrls(textFiles, filesBefore);

const targetFontFilesBefore = filesBefore.filter((file) => TARGET_FONT_FILE.test(path.basename(file)));
const fontBytesBefore = await byteTotal(targetFontFilesBefore);
const referencedOutputText = [...textFiles.values()];
const deletedFontFiles = [];

for (const file of targetFontFilesBefore) {
  const basename = path.basename(file);
  if (!referencedOutputText.some((contents) => contents.includes(basename))) {
    await unlink(file);
    deletedFontFiles.push(file);
  }
}

const filesAfter = await collectFiles(outputRoot);
const targetFontFilesAfter = filesAfter.filter((file) => TARGET_FONT_FILE.test(path.basename(file)));
const fontBytesAfter = await byteTotal(targetFontFilesAfter);
verifyFontUrls(textFiles, filesAfter);

for (const deletedFile of deletedFontFiles) {
  const basename = path.basename(deletedFile);
  if (referencedOutputText.some((contents) => contents.includes(basename))) {
    throw new Error(`Deleted font asset remains referenced: ${basename}`);
  }
}

console.log([
  'FONT_OPTIMIZE_PASS',
  `output=${path.relative(projectRoot, outputRoot)}`,
  `corpusCodePoints=${codePoints.size}`,
  `cssContentCodePoints=${cssContentCodePoints.size}`,
  `corpusUncertain=${corpusUncertain}`,
  `coveredCodePoints=${coverageBefore.size}->${coverageAfter.size}`,
  `faces=${targetFacesBefore}->${targetFacesAfter}`,
  `facesRemoved=${removedFaces}`,
  `uncertainFacesKept=${uncertainFacesKept}`,
  `unsafeCssFilesKept=${unsafeCssFilesKept}`,
  `cssBytes=${cssBytesBefore}->${cssBytesAfter}`,
  `fontFiles=${targetFontFilesBefore.length}->${targetFontFilesAfter.length}`,
  `fontBytes=${fontBytesBefore}->${fontBytesAfter}`,
].join(' '));
