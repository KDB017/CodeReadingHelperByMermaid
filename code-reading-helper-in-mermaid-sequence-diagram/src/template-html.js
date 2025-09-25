"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlForWebview = void 0;
/**
 * html for displaying webView.
 * this code is include App.svelte in Mermaid Chart
 */
function getHtmlForWebview(panel, code) {
    //it is linted that panel is unused, but we need it to set webview options like enabling scripts.
    console.log(panel);
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Mermaid Preview</title>
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
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@panzoom/panzoom@4.6.0/dist/panzoom.min.js"></script>
    </head>
    <body>
    <div class="container">
        <!-- ツールバー -->
        <div class="toolbar">
          <button class="btn" id="zoom-in">🔍+</button>
          <button class="btn" id="zoom-out">🔍-</button>
          <button class="btn" id="reset-zoom">⚡ Reset</button>
          <button class="btn" id="toggle-pan">✋ Pan</button>
          <div class="zoom-info">
            Zoom: <span id="zoom-level">100%</span>
          </div>
        </div>
    <!-- ダイアグラムコンテナ -->
        <div class="diagram-container" id="diagram-container">
          <div class="mermaid" id="mermaid-diagram">${code}</div>
        </div>
      </div>
      <script>
        let maxZoomLevel=5
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

        window.addEventListener("message", async (event) => {
          if (event.data.type === "update") {
            console.log("Message received in webview:", event.data);
            const { content, maxZoom } = event.data;
            mermaidDiagram.innerHTML = content;
            
            if (content) {
              maxZoomLevel = maxZoom;
            }
            if (panzoomInstance) {
              panzoomInstance.setOptions({ maxScale: maxZoomLevel });
            }
          }
        });

        // Mermaid rendering 
        mermaid.run({
          querySelector: '.mermaid',
          postRenderCallback: (id) => {
            const counts = {};
            
            const elements = document.querySelectorAll('.messageText');
            elements.forEach(element => {
              const raw = element.textContent;
              const colonIndex = raw.indexOf(":");
              let fn = raw.substring(colonIndex + 1);  // Remove leading numbers like "1:", "2.1:" etc.
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
              if (counts[fn] >= 1) {
                element.style.fill = "orange";
              }
              if (counts[fn] >= 3) {
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
exports.getHtmlForWebview = getHtmlForWebview;
//# sourceMappingURL=template-html.js.map