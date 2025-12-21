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
        PANZOOM: {
            url: "https://cdn.jsdelivr.net/npm/@panzoom/panzoom@4.6.0/dist/panzoom.min.js",
            integrity: "sha512-F0eeagkVr5DGhAzTPdcJg/e3M4sGyeuqHnOFe9FsXxsuK8EYM84ZfV+IUROyvByDtI21BYuT8LQgGHLhR25Txg=="
        }
    };
}
