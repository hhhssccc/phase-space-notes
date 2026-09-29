import { cp, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const source = path.join(root, 'dist');
const target = path.resolve(root, '.pages-dist');
if (path.dirname(target) !== root || path.basename(target) !== '.pages-dist') throw new Error('Unsafe Pages output path');
// URLs are resolved during rendering. Publish the exact validated build bytes.
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
console.log(`Prepared GitHub Pages artifact at ${target}`);
