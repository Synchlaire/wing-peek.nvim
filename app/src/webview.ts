import { WebUI } from 'jsr:@webui/deno-webui';
import { parseArgs } from 'https://deno.land/std@0.217.0/cli/parse_args.ts';

const { url, theme, serverUrl } = parseArgs(Deno.args);

try {
  const win = new WebUI();
  win.setSize(960, 720);

  const html = `<html>
<head><meta charset="utf-8"><script src="webui.js"></script></head>
<body><script>
  window.peek = {};
  window.peek.theme = "${theme}";
  window.peek.serverUrl = "${serverUrl}";
  window.location.href = "${url}";
</script></body>
</html>`;

  const ok = win.showWebView(html);
  if (!ok) {
    console.error('[wing-peek] showWebView failed, falling back to show()');
    await win.show(html);
  }

  await WebUI.wait();
} catch (e) {
  console.error('[wing-peek] webview error:', e);
  Deno.exit(1);
}

Deno.exit();
