import { WebUI } from 'jsr:@webui/deno-webui';
import { parseArgs } from 'https://deno.land/std@0.217.0/cli/parse_args.ts';

const { theme, serverUrl } = parseArgs(Deno.args);

try {
  const win = new WebUI();
  win.setSize(960, 720);

  // Build the HTTP URL from the server address. Pass config as query
  // params — the client's getInjectConfig() reads them when
  // window.peek isn't available.
  const previewUrl = `http://${serverUrl}/?theme=${encodeURIComponent(theme)}`;

  const ok = win.showWebView(previewUrl);
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
