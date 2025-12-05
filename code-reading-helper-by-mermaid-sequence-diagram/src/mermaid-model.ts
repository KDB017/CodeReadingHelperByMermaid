import { TextDocument } from "vscode";
import { MermaidWebviewPanel } from "./mermaid-webview-panel";

/**
 * Model for Mermaid Diagram
 */
export class MermaidModel {

    /**
     * The text document containing the Mermaid code.
     */
    private document: TextDocument

    /**
     * The dependent view (MermaidWebviewPanel) that displays the diagram.
     */
    private dependent: MermaidWebviewPanel

    /**
     * The programming language extracted from the sequence title.
     */
    private programmingLanguageFileExtension: string

    /**
     * Constructor for MermaidModel
     */
    constructor() {
        this.document = null!;
        this.dependent = null!;
        this.programmingLanguageFileExtension = "";
    }

    /**
     * set the dependent view
     * @param view The dependent view (MermaidWebviewPanel) that displays the diagram.
     */
    public setView(view: MermaidWebviewPanel): void {
        this.dependent = view;
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
     * @returns Programming language file extension.
     */
    private extractProgrammingLanguageFileExtensionFromTitle(): string {
        const text = this.getDocumentText();
        const lines = text.split('\n');
        let programmingLanguageFileExtension = '';
        lines.forEach(line => {
            if (line.includes('Title Sequence diagram of')) {
                let sequenceTitle = line.trim();
                const lastDotIndex = sequenceTitle.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    programmingLanguageFileExtension = sequenceTitle.substring(lastDotIndex + 1).trim();
                    console.log("extractProgrammingLanguageFileExtensionFromTitle:", programmingLanguageFileExtension);

                }
            }
        });

        return programmingLanguageFileExtension;
    }
}