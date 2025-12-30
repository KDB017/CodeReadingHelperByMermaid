import { Uri, workspace } from "vscode";
import { AnalyzerFactory } from "./analyzer/analyzer-factory";
import { MermaidModel } from "./mermaid-model";
import { ICodeAnalyzer } from "./analyzer/interface/code-analyzer-interface";
import { MermaidWebviewPanel } from "./mermaid-webview-panel";
/**
 * Controller class to handle navigation to function definitions in the workspace.
 */
export class Controller extends Object {

    /**
     * The MermaidModel instance associated with this controller.
     */
    private model: MermaidModel;

    /**
     * The MermaidWebviewPanel instance associated with this controller.
     */
    private view: MermaidWebviewPanel;


    /**
     * Constructor for the Controller class.
     */
    constructor(model: MermaidModel, view: MermaidWebviewPanel) {
        super();
        this.model = model;
        this.view = view;
    }

    /**
     * jump to function definition in workspace
     * @param functionName 
     * @param nearestParticipant 
     * @returns 
     */
    public async jumpToFunction(functionName: string, nearestParticipant: string): Promise<void> {
        try {

            // Validate inputs
            if (!functionName || functionName.trim() === '') {
                this.view.showErrorMessage('Function name is empty');
                return;
            }

            if (!nearestParticipant || nearestParticipant.trim() === '') {
                this.view.showErrorMessage('Participant name is empty');
                return;
            }

            // Validate file extension
            const fileExtension = this.model.getProgrammingLanguagefileExtension();

            if (!fileExtension || fileExtension.trim() === '') {
                this.view.showErrorMessage(
                    'Programming language not detected from Mermaid title. ' +
                    'Ensure format: "Title Sequence diagram of Example.py"'
                );
                return;
            }

            // Get analyzer for the file extension
            let analyzer: ICodeAnalyzer;
            try {
                analyzer = AnalyzerFactory.getAnalyzerForFile(fileExtension);
            } catch (error) {
                this.view.showErrorMessage(
                    error +
                    `Unsupported file extension: ${fileExtension}. ` +
                    'Supported languages: Python (py), Java (java), JavaScript (js, jsx), TypeScript (ts, tsx)'
                );
                return;
            }

            const files = await this.findClassOrFilenameInParticipant(nearestParticipant);

            if (files.length === 0) {
                this.view.showInformationMessage(`No files found for: ${nearestParticipant}`);
                return;
            }

            // Search function in files
            for (const file of files) {
                try {
                    const document = await workspace.openTextDocument(file);
                    const text = document.getText();
                    const searchResult = analyzer.searchFunctionPosition(text, functionName);

                    if (searchResult !== null) {
                        const position = document.positionAt(searchResult.index);
                        this.view.showFunctionLocation(document, position);
                        this.view.showInformationMessage('✅ Jump completed successfully');
                        return;
                    }
                } catch (fileError: any) {
                    this.view.showErrorMessage(`Failed to open file: ${file.fsPath}. Error: ${fileError.message}`);
                }
            }

            // Function not found in any file
            this.view.showInformationMessage(`Function "${functionName}" was not found in ${nearestParticipant}`);

        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.view.showErrorMessage(`Failed to navigate: ${errorMsg}`);
        }
    }

    /**
     *  Narrow the scope of search based on nearest participant
     * @param nearestParticipant 
     * @returns files included Participant name 
     */
    private async findClassOrFilenameInParticipant(nearestParticipant: string): Promise<Uri[]> {


        const targetName = nearestParticipant;

        // Get the programming language extension from model
        const fileExtension = this.model.getProgrammingLanguagefileExtension();

        // Phase 1: Search by filename (both with and without extension)

        const filenameMatches = await this.findFilesByName(targetName, fileExtension);
        if (filenameMatches.length > 0) {
            return filenameMatches;
        }

        // Phase 2: Search by content (files that contain the targetName)
        const contentMatches = await this.findFilesByFileContent(targetName, fileExtension);

        return contentMatches;
    }

    private async findFilesByName(targetName: string, fileExtension: string): Promise<Uri[]> {
        const matched = new Set<string>(); // Use Set to avoid duplicates
        try {
            const filenameMatches = await workspace.findFiles(`**/${targetName}.${fileExtension}`, null, 10);
            // Filter by language extension
            const languageSpecificMatches = filenameMatches.filter(uri =>
                uri.fsPath.endsWith(`.${fileExtension}`)
            );

            languageSpecificMatches.forEach(uri => matched.add(uri.fsPath));
        } catch (error: any) {
            this.view.showErrorMessage(`Error searching files by name: ${error.message}`);
        }
        return Promise.resolve(Array.from(matched).map(fsPath => Uri.file(fsPath)));
    }

    private async findFilesByFileContent(targetName: string, fileExtension: string): Promise<Uri[]> {
        const includePattern = `**/*.${fileExtension}`;
        try {
            // max 200 files
            const candidates = await workspace.findFiles(includePattern, null, 200);
            if (candidates.length < 1) { return []; }
            const results = await Promise.allSettled(candidates.map(uri => workspace.openTextDocument(uri)));
            const matched: Uri[] = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.getText().includes(targetName)) {
                    if (candidates[index]) {
                        matched.push(candidates[index]);

                    }
                }
            });
            return matched;
        } catch (error: any) {
            this.view.showErrorMessage(`Error searching files by content: ${error.message}`);
            return [];
        }
    }
}