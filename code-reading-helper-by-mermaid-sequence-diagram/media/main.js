import { getNearestParticipantName } from './dom-util.js';
/**
 * this script handles the rendering and interactivity of the Mermaid diagram
 * @author Kazuki Nakata(KDB017)
 */
const vscode = acquireVsCodeApi();
// thresholds with defaults; can be overridden via postMessage config
const COLOR_THRESHOLDS = { orange: 5, red: 10 };
// get DOM elements
// const diagramContainer = document.getElementById('diagram-container');
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
        maxScale: 10,
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
        const elements = document.querySelectorAll('.messageText');
        const counts = buildFunctionCounts(elements);

        applyColors(elements, counts);

        elements.forEach(element => {
            const raw = element.textContent;
            let fn = raw.substring(0, raw.indexOf("("));
            fn = fn.trim();
            if (!fn) {return;}
            element.classList.add('clickable');
            element.addEventListener('click', (event) => {
                const messageTextElement = event.currentTarget;
                console.log("messageEl:", messageTextElement);

                const nearestParticipantName = getNearestParticipantName(document,messageTextElement);
                vscode.postMessage({
                    command: 'jumpToFunction',
                    functionName: fn,
                    nearestParticipant: nearestParticipantName
                });
            });
        });

        // Mermaid rendering complete, initialize Panzoom
        initializePanzoom();
        setupButtons();
    }
});

// Receive config from extension to update thresholds and re-apply colors
window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object') { return; }
    if (message.command === 'config' && message.thresholds) {
        const { orange, red } = message.thresholds;
        if (typeof orange === 'number' && orange >= 0) COLOR_THRESHOLDS.orange = orange;
        if (typeof red === 'number' && red >= 0) COLOR_THRESHOLDS.red = red;

        try {
            const elements = document.querySelectorAll('.messageText');
            const counts = buildFunctionCounts(elements);
            applyColors(elements, counts, true);
        } catch (e) {
            console.warn('Failed to apply config thresholds:', e);
        }
    }
});

/**
 * Build a count map of function names from message elements.
 */
function buildFunctionCounts(elements) {
    const counts = {};
    elements.forEach(element => {
        const raw = element.textContent || '';
        let fn = raw.substring(0, raw.indexOf("("));
        fn = fn.trim();
        if (!fn) { return; }
        counts[fn] = (counts[fn] || 0) + 1;
    });
    return counts;
}

/**
 * Apply color styles based on counts and thresholds.
 * @param {NodeListOf<Element>} elements 
 * @param {Record<string, number>} counts 
 * @param {boolean} resetStyle whether to clear existing style before applying
 */
function applyColors(elements, counts, resetStyle = false) {
    elements.forEach(element => {
        const raw = element.textContent || '';
        let fn = raw.substring(0, raw.indexOf("("));
        fn = fn.trim();
        if (!fn) { return; }
        if (resetStyle) {
            element.style.fill = '';
        }
        if (counts[fn] >= COLOR_THRESHOLDS.orange) {
            element.style.fill = 'orange';
        }
        if (counts[fn] >= COLOR_THRESHOLDS.red) {
            element.style.fill = 'red';
        }
    });
}
