import { WebviewPanel, Uri } from 'vscode';
import { Constants } from './constants';
/**
 * html for displaying webView.
 * this code is include App.svelte in Mermaid Chart
 * to do separate script and style
 * 
 */
export function getHtmlForWebview(panel: WebviewPanel, code: string, extensionUri: Uri): string {

  // Get the URI for the Mermaid CSS file
  const styleResetPath = Uri.joinPath(extensionUri, 'media', 'mermaid.css');
  const stylesResetUri = panel.webview.asWebviewUri(styleResetPath);

  let scriptPathOnDisk = Uri.joinPath(extensionUri, 'media', 'main.js');
  const mainScriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

  scriptPathOnDisk = Uri.joinPath(extensionUri, 'media', 'dom-util.js');
  const domUtilScriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

  const nonce = getNonce();


  // And the uri we use to load this script in the webview
  // const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);
  // const orangeThreshold = workspace.getConfiguration().get<number>('function.color.orange.Thresholds: Thresholds for Orange') ?? 3; // 閾値1
  // const redThreshold = workspace.getConfiguration().get<number>('function.color.red.Thresholds: Thresholds for Red') ?? 10; // 閾値10
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
  <meta charset="UTF-8">
  <!-- Allow inline styles because Mermaid injects inline style attributes / <style> elements at runtime -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource} 'unsafe-inline'; img-src ${panel.webview.cspSource} https:; script-src 'nonce-${nonce}';">
  <title>Mermaid Preview</title>
  <!-- Add nonce to external scripts so they are allowed by the CSP above -->
  <script nonce="${nonce}" 
          src="${Constants.CDN.MERMAID.url}" 
          integrity="${Constants.CDN.MERMAID.integrity}"
          crossorigin="anonymous"></script>
  <script nonce="${nonce}" 
          src="${Constants.CDN.PANZOOM.url}" 
          integrity="${Constants.CDN.PANZOOM.integrity}"
          crossorigin="anonymous"></script>
      <link href="${stylesResetUri}" rel="stylesheet">
    </head>
    <body>
    <div class="container">
        <!-- tool -->
        <div class="toolbar">
          <button class="btn" id="zoom-in" tabindex="0" accesskey="a">🔍+</button>
          <button class="btn" id="zoom-out" tabindex="1" accesskey="s">🔍-</button>
          <button class="btn" id="reset-zoom" tabindex="2" accesskey="d">⚡ Reset</button>
          <button class="btn" id="toggle-pan" tabindex="3" accesskey="f">✋ Pan</button>
          <div class="zoom-info">
            Zoom: <span id="zoom-level">100%</span>
          </div>
        </div>
    <!-- diagram container -->
        <div class="diagram-container" id="diagram-container">
          <div class="mermaid" id="mermaid-diagram">${code}</div>
        </div>
      </div>
      <script type="module" nonce="${nonce}" src="${domUtilScriptUri}"></script>
      <script type="module" nonce="${nonce}" src="${mainScriptUri}"></script>
    </body>
    </html>`;
}

/**
 * 
 * @returns string
 */
function getNonce(): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}