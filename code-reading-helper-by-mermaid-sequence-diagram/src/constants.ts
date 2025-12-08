/**
 * Constants used across the extension
 */

export class Constants {
    public static readonly CDN = {
        MERMAID: {
            url: "https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.min.js",
            integrity: "sha384-o+g/BxPwhi0C3RK7oQBxQuNimeafQ3GE/ST4iT2BxVI4Wzt60SH4pq9iXVYujjaS"
        },
        PANZOOM: {
            url: "https://cdn.jsdelivr.net/npm/@panzoom/panzoom@4.6.0/dist/panzoom.min.js",
            integrity: "sha384-p/V9q47QHNmBI0EG7lJPLVHC5WN1mgpLtNpFykf0IX8iJ4xDCYPWEXcigFOvYW52"
        }
    } as const;
}
