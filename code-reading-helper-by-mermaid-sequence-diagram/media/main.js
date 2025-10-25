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
            if (counts[fn] >= 5) {
            element.style.fill = "orange";
        }
        if (counts[fn] >= 10) {
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