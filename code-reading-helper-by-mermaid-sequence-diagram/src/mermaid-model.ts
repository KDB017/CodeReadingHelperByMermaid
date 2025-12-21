import { TextDocument } from "vscode";
import { MermaidWebviewPanel } from "./mermaid-webview-panel";

/**
 * Model for Mermaid Diagram
 */
export class MermaidModel extends Object {

    /**
     * The text document containing the Mermaid code.
     */
    private document: TextDocument;

    /**
     * The dependent view (MermaidWebviewPanel) that displays the diagram.
     */
    private dependent: MermaidWebviewPanel;

    /**
     * The programming language extracted from the sequence title.
     */
    private programmingLanguageFileExtension: string;

    /**
     * Marker indicating the sequence diagram title line.
     */
    private readonly SEQUENCE_DIAGRAM_MARKER = "Title Sequence diagram of";

    /**
     * Constructor for MermaidModel
     */
    constructor(textDocument: TextDocument, view: MermaidWebviewPanel) {
        super();
        this.document = textDocument;
        this.dependent = view;
        this.programmingLanguageFileExtension = "";
        this.update(textDocument);
    }


    /**
     * Notify the dependent view that the model has changed.
     */
    public notifyChanged(): void {
        this.dependent.update();
    }

    /**
     * set the text document
     * @param document The text document containing the Mermaid code.
     */
    public setDocument(document: TextDocument): void {
        this.document = document;
    }

    /**
     * update the model with a new document
     * @param document The text document containing the Mermaid code.
     */
    public update(document: TextDocument): void {
        this.setDocument(document);
        const fileExtension = this.extractProgrammingLanguageFileExtensionFromTitle();
        if (fileExtension !== this.programmingLanguageFileExtension) {
            this.programmingLanguageFileExtension = fileExtension;
        }

        // this.notifyChanged();
    }

    /**
     * get the text document
     * @returns The text document containing the Mermaid code.
     */
    public getDocument(): TextDocument {
        return this.document;
    }

    /**
     * get the text content of the document
     * @returns The text content of the document.
     */
    public getDocumentText(): string {
        return this.document.getText();
    }


    /**
     * 
     * @returns Programming language extracted from the sequence title.
     */
    public getProgrammingLanguagefileExtension(): string {
        return this.programmingLanguageFileExtension;
    }

    /**
     * extract the programming language file extension from the sequence title
     * Format: "Title Sequence diagram of Example.py"
     * @returns Programming language file extension, or empty string if not found.
     */
    private extractProgrammingLanguageFileExtensionFromTitle(): string {
        const text = this.getDocumentText();

        for (const line of text.split('\n')) {
            if (line.includes(this.SEQUENCE_DIAGRAM_MARKER)) {
                // Extract extension after last dot
                const lastDotIndex = line.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    // Get characters after the dot until whitespace or end
                    const afterDot = line.substring(lastDotIndex + 1);
                    const fileExtension = afterDot.trim().toLowerCase();

                    if (fileExtension.length > 0) {
                        console.log("extractProgrammingLanguageFileExtensionFromTitle:", fileExtension);
                        return fileExtension;
                    }
                }
            }
        }
        this.dependent.showErrorMessage(
            'can\'t extract programming language from Mermaid title. ' +
            `Expected format: "${this.SEQUENCE_DIAGRAM_MARKER} Example.py"`
        );
        return '';
    }
}