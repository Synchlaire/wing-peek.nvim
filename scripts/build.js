// wing-peek build script.
//
// Diverges from upstream peek in three ways:
//   1. No mermaid download (mermaid support is removed entirely).
//   2. No KaTeX download (LaTeX math support is removed entirely).
//   3. No github-markdown.min.css fetch from CDN — we ship our own
//      hand-written `wing-markdown.css` (already in public/) using
//      wing-os design tokens. Builds are fully offline-capable.
//
// What's left to bundle: the three TS entry points (main, webview,
// client script) and nothing else fetched from the network.

import { bundle } from 'https://deno.land/x/emit@0.38.1/mod.ts';

const DEBUG = Deno.env.get('DEBUG');
const { compilerOptions, imports } = JSON.parse(Deno.readTextFileSync('deno.json'));
const bundleOptions = { compilerOptions, importMap: { imports } };

function logPublicContent() {
  console.table(
    Array.from(Deno.readDirSync('public')).reduce((table, entry) => {
      const { size, mtime } = Deno.statSync('public/' + entry.name);

      table[entry.name] = {
        size,
        modified: new Date(mtime).toLocaleTimeString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
          fractionalSecondDigits: 3,
        }),
      };

      return table;
    }, {}),
  );
}

async function emit(src, out) {
  return Deno.writeTextFile(out, (await bundle(src, bundleOptions)).code);
}

if (DEBUG) {
  logPublicContent();

  new Deno.Command('git', {
    args: ['branch', '--all'],
  }).spawn();
}

const result = await Promise.allSettled([
  emit('app/src/main.ts', 'public/main.bundle.js'),
  emit('app/src/webview.ts', 'public/webview.js'),
  emit('client/src/script.ts', 'public/script.bundle.js'),
]);

result.forEach((res) => {
  if (res.status === 'rejected') console.error(res.reason);
});

if (DEBUG) {
  logPublicContent();
}
