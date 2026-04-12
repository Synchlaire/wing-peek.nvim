import { WebUI } from 'jsr:@webui/deno-webui';
import { parseArgs } from 'https://deno.land/std@0.217.0/cli/parse_args.ts';

const { theme, serverUrl } = parseArgs(Deno.args);

try {
  const win = new WebUI();
  win.setSize(960, 720);

  const previewUrl = `http://${serverUrl}/?theme=${encodeURIComponent(theme)}`;

  // Wrapper HTML with webui.js bridge (keeps the window alive) and
  // an iframe loading the actual preview from the peek server.
  const html = `<html>
<head>
<meta charset="utf-8">
<script src="webui.js"></script>
<style>
  * { margin: 0; padding: 0; }
  body { overflow: hidden; }
  iframe { width: 100vw; height: 100vh; border: none; display: block; }
</style>
</head>
<body>
<iframe src="${previewUrl}"></iframe>
</body>
</html>`;

  const ok = win.showWebView(html);
  if (!ok) {
    console.error('[wing-peek] showWebView failed, falling back to show()');
    await win.show(previewUrl);
  }

  await WebUI.wait();
} catch (e) {
  console.error('[wing-peek] webview error:', e);
  Deno.exit(1);
}

Deno.exit();
