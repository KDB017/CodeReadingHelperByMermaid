// TODO: Investigate and implement a way to bundle npm packages for use in the VS Code WebView.
// Currently, only the CDN approach works reliably. Document and resolve issues with the bundled approach.
/**
 * Constants used across the extension
 */

// use CDN links for mermaid and panzoom with integrity hashes for security
export class Constants extends Object {
    public static readonly CDN = {
        MERMAID: {
            url: "https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.min.js",
            integrity: "sha512-5TKaYvhenABhlGIKSxAWLFJBZCSQw7HTV7aL1dJcBokM/+3PNtfgJFlv8E6Us/B1VMlQ4u8sPzjudL9TEQ06ww=="
        },
        // todo use latest version of panzoom but now can\'t work correctly 2025/12/2
        PANZOOM: {
            url: "https://cdn.jsdelivr.net/npm/@panzoom/panzoom@4.6.1/dist/panzoom.min.js",
            integrity: "sha512-BznDR3LSF3hwZvpJGs2ahvTfA1v6D2OwM/eeoMIIf+MEFPvfzxbPzXPeo8UK9k7jFFZoGkqGX0QQR+wTeTUP8Q=="
        }
        // PANZOOM: {
        //     url: "https://cdn.jsdelivr.net/npm/panzoom@9.4.3/dist/panzoom.min.js",
        //     integrity: "sha512-YyYG40hqIaVxGCBnnmcMWcJjgJ7809Kv7Q2et0wuEbWRBbT/gCny+ifAfTkr+IN0Us/O6PwPMr6+O8Bs+esO0A=="
        // }
    };
}
