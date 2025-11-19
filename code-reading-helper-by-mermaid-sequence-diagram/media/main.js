
/**
 * this script handles the rendering and interactivity of the Mermaid diagram
 */
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
        const counts = {};

        const elements = document.querySelectorAll('.messageText');
        elements.forEach(element => {
            // console.log(element);
            const raw = element.textContent;
            // const colonIndex = raw.indexOf(":");
            // let fn = raw.substring(colonIndex + 1);  // Remove leading numbers like "1:", "2.1:" etc.
            // console.log("raw:", raw);
            // console.log("colonIndex:", colonIndex);
            // console.log("fn before processing:", fn);
            let fn = raw.substring(0, raw.indexOf("("));
            fn = fn.trim();
            counts[fn] = (counts[fn] || 0) + 1;
            console.log("抽出:", raw, "→", fn, counts[fn]);
        });

        // Collect participant ROOT groups (prefer <g> groups containing actor/participant shapes)
        function collectParticipantRoots() {
            const roots = new Set();
            // Candidate selectors: any element whose class contains actor/participant, or rect/g with a name attribute
            const candidates = Array.from(document.querySelectorAll('[class*="actor"], [class*="participant"], rect[name], g[name]'));
            candidates.forEach(c => {
                // Prefer the ancestor group <g> if present
                const g = c.closest('g') || c;
                roots.add(g);
            });
            return Array.from(roots);
        }

        const participantElements = collectParticipantRoots();

        function getCenter(el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }

        function getTextName(el) {
            if (!el) return '';
            // Prefer a descendant <text> element (common in mermaid actors)
            // But if there are <tspan> children, prefer one whose content starts with ':' (user request).
            try {
                if (el.querySelector) {
                    const textEl = el.querySelector('text');
                    if (textEl) {
                        // look for tspans
                        const tspanList = Array.from(textEl.querySelectorAll('tspan'));
                        for (const t of tspanList) {
                            const s = (t.textContent || '').trim();
                            if (s.startsWith(':')) {
                                // return without leading ':' but preserve rest trimmed
                                return s.replace(/^:\s*/, '').trim();
                            }
                        }
                        // if no tspan starting with ':' found, return full textEl text
                        if (textEl.textContent && textEl.textContent.trim()) return textEl.textContent.trim();
                    }
                    // fallback to any tspan directly under el
                    const anyTspan = el.querySelector('tspan');
                    if (anyTspan && anyTspan.textContent && anyTspan.textContent.trim()) {
                        const s = anyTspan.textContent.trim();
                        if (s.startsWith(':')) return s.replace(/^:\s*/, '').trim();
                        return s;
                    }
                }
            } catch (e) {
                // ignore DOM errors and fallback
            }
            // Fallback to 'name' attribute on shapes (e.g., rect name="p3")
            if (el.getAttribute) {
                const n = el.getAttribute('name');
                if (n && n.trim()) return n.trim();
            }
            // Last resort: element's own textContent
            return (el.textContent || '').trim();
        }

        elements.forEach(element => {
            const raw = element.textContent;
            let fn = raw.substring(0, raw.indexOf("("));
            fn = fn.trim();
            if (!fn) return;
            if (counts[fn] >= 5) {
                element.style.fill = "orange";
            }
            if (counts[fn] >= 10) {
                element.style.fill = "red";
            }
            // console.log('ジャンプする前のfn: ' + fn)
            element.classList.add('clickable');
            element.addEventListener('click', () => {
                // Use message bounding rect as approximation of arrow section.
                // Compute distance from each participant center to that rect (closest point).
                const msgRect = element.getBoundingClientRect();

                function pointRectDist2(pt, rect) {
                    // distance squared from point to rectangle (0 if inside)
                    const dx = Math.max(rect.left - pt.x, 0, pt.x - (rect.left + rect.width));
                    const dy = Math.max(rect.top - pt.y, 0, pt.y - (rect.top + rect.height));
                    return dx * dx + dy * dy;
                }

                let nearest = null;
                let minDist = Infinity;
                participantElements.forEach(p => {
                    try {
                        const center = getCenter(p);
                        const d2 = pointRectDist2(center, msgRect);
                        if (d2 < minDist) {
                            minDist = d2;
                            nearest = p;
                        }
                    } catch (e) {
                        // ignore elements that throw for bounding rect
                    }
                });

                const nearestName = nearest ? getTextName(nearest) : null;
                // Diagnostics: code points of function name
                // const codePoints = Array.from(fn).map(ch => ch.charCodeAt(0));

                vscode.postMessage({
                    command: 'jumpToFunction',
                    functionName: fn,
                    nearestParticipant: nearestName,
                    // functionNameRaw: raw,
                    // functionNameCodePoints: codePoints
                });
            });
        });

        // Mermaid rendering complete, initialize Panzoom
        initializePanzoom();
        setupButtons();
    }
});
