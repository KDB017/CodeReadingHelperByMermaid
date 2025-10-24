import { workspace, WebviewPanel, Uri } from 'vscode';
import { Constants } from './constants';
/**
 * html for displaying webView.
 * this code is include App.svelte in Mermaid Chart
 * to do separate script and style
 * 
 */
export function getHtmlForWebview(panel: WebviewPanel, code: string, extensionUri: Uri): string {
  // it is linted that panel is unused, but we need to move inline text to other file later.
  ((panel: WebviewPanel): WebviewPanel => panel)(panel);
  console.log(extensionUri)
  // Local path to main script run in the webview
  // const scriptPathOnDisk = Uri.joinPath(extensionUri, 'media', 'main.js');

  // And the uri we use to load this script in the webview
  // const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);
  const orangeThreshold = workspace.getConfiguration().get<number>('function.color.orange.Thresholds: Thresholds for Orange') ?? 3; // 閾値1
  const redThreshold = workspace.getConfiguration().get<number>('function.color.red.Thresholds: Thresholds for Red') ?? 10; // 閾値10
  // console.log(`Orange Threshold: ${orangeThreshold}, Red Threshold: ${redThreshold}`);
  // console.log(panel);
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Mermaid Preview</title>
      <script src=${Constants.MERMAID}></script>
      <script src=${Constants.PANZOOM}></script>
      <style>
              .mermaid {
            background: #fff;
            padding: 10px;
            border-radius: 8px;
        }

        .clickable {
            cursor: pointer;
            color: blue;
            text-decoration: underline;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        .toolbar {
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn {
            padding: 5px 10px;
            border: 1px solid #ccc;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .btn:hover {
            background: #e9e9e9;
        }

        .zoom-info {
            margin-left: auto;
            font-size: 12px;
            color: #666;
        }

        .diagram-container {
            flex: 1;
            overflow: hidden;
            background: #f9f9f9;
        }
      </style>
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
      <script>
        const vscode = acquireVsCodeApi();
        // get DOM elements
        const diagramContainer = document.getElementById('diagram-container');
        const mermaidDiagram = document.getElementById('mermaid-diagram');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetZoomBtn = document.getElementById('reset-zoom');
        const togglePanBtn = document.getElementById('toggle-pan');
        const zoomLevelSpan = document.getElementById('zoom-level');
        // Panzoom instance
        let panzoomInstance = null;
        let isPanEnabled = false;

        // Mermaid initialization
        mermaid.initialize({ startOnLoad: false, theme: "forest" });

        // Panzoom initialization
        function initializePanzoom() {
          if (panzoomInstance) {
            panzoomInstance.destroy();
          }
          
          panzoomInstance = Panzoom(mermaidDiagram, {
            maxScale: 5,
            minScale: 0.1,
            contain: 'outside',
            disablePan: !isPanEnabled,
            disableZoom: false
          });
          
          // Zoom level update event listener
          mermaidDiagram.addEventListener('panzoomchange', (event) => {
            const scale = Math.round(panzoomInstance.getScale() * 100);
            zoomLevelSpan.textContent = scale + '%';
          });
        }

        console.log(mermaidDiagram);
        // Button event setup
        function setupButtons() {
          zoomInBtn.addEventListener('click', () => {
            if (panzoomInstance) {
              panzoomInstance.zoomIn();
            }
          });

          zoomOutBtn.addEventListener('click', () => {
            if (panzoomInstance) {
              panzoomInstance.zoomOut();
            }
          });

          resetZoomBtn.addEventListener('click', () => {
            if (panzoomInstance) {
              panzoomInstance.reset();
            }
          });

          togglePanBtn.addEventListener('click', () => {
            isPanEnabled = !isPanEnabled;
            togglePanBtn.textContent = isPanEnabled ? '🔒 Lock' : '✋ Pan';
            if (panzoomInstance) {
              panzoomInstance.setOptions({ disablePan: !isPanEnabled });
            }
          });
        }

        // Mermaid rendering 
        mermaid.run({
          querySelector: '.mermaid',
          postRenderCallback: (id) => {
            const counts = {};
            
            const elements = document.querySelectorAll('.messageText');
            elements.forEach(element => {
              // console.log(element);
              const raw = element.textContent;
              const colonIndex = raw.indexOf(":");
              let fn = raw.substring(colonIndex + 1);  // Remove leading numbers like "1:", "2.1:" etc.
              console.log("raw:", raw);
              console.log("colonIndex:", colonIndex);
              console.log("fn before processing:", fn);
              fn = fn.substring(0, fn.indexOf("("));
              fn = fn.trim();
              counts[fn] = (counts[fn] || 0) + 1;
              console.log("抽出:", raw, "→", fn, counts[fn]);
            });

            elements.forEach(element => {
              const raw = element.textContent;
              const colonIndex = raw.indexOf(":");
              let fn = raw.substring(colonIndex + 1);
              fn = fn.substring(0, fn.indexOf("("));
              fn = fn.trim();
              if (!fn) return;
              if (fn === "") {
                return;
              }
              if (counts[fn] >= ${orangeThreshold}) {
                element.style.fill = "orange";
              }
              if (counts[fn] >= ${redThreshold}) {
                element.style.fill = "red";
              }
              element.classList.add('clickable');
              element.addEventListener('click', () => {
                vscode.postMessage({
                  command: 'jumpToFunction',
                  functionName: fn
                });
              });
            });

            // Mermaid rendering complete, initialize Panzoom
            initializePanzoom();
            setupButtons();
          }
        });
      </script>
    </body>
    </html>`;
}