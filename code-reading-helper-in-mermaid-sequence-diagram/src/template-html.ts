import * as vscode from 'vscode';

// ################################################################################################################################
/**
 * html for displaying webView.
 */

export function getHtmlForWebview(webview: vscode.WebviewPanel, code: string): string {
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
      </style>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    </head>
    <body>
      <div class="mermaid">${code}</div>
      <script>
        const vscode = acquireVsCodeApi();

        mermaid.initialize({ startOnLoad: false, theme: "forest" });

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
          }
        });
      </script>
    </body>
    </html>`;
}