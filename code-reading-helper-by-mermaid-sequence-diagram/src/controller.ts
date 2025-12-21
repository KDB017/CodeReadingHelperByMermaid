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
            console.log('=== jumpToFunction DEBUG ===');
            console.log('🔍 Searching for function:', `"${functionName}"`);
            console.log('🔍 Nearest participant:', `"${nearestParticipant}"`);

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
            console.log('model programmingLanguageFileExtension:', fileExtension);

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
                    error+
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
                    console.log(`📖 File: ${file.fsPath}`);
                    const searchResult = analyzer.searchFunctionPosition(text, functionName);

                    if (searchResult !== null) {
                        const pos = document.positionAt(searchResult.index);
                        this.view.showFunctionLocation(document, pos);
                        console.log('✅ Jump completed successfully');
                        return;
                    }
                } catch (fileError: any) {
                    console.error(`❌ Error processing file ${file.fsPath}:`, fileError.message);
                    // Continue to next file
                }
            }

            // Function not found in any file
            console.log('❌ Function not found in any file');
            this.view.showInformationMessage(`Function "${functionName}" was not found in ${nearestParticipant}`);

        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ Fatal error in jumpToFunction:', errorMsg);
            this.view.showErrorMessage(`Failed to navigate: ${errorMsg}`);
        }
    }

    /**
     *  Narrow the scope of search based on nearest participant
     * @param nearestParticipant 
     * @returns files included Participant name 
     */
    private async findClassOrFilenameInParticipant(nearestParticipant: string): Promise<Uri[]> {

        console.log('=== findClassOrFilenameInParticipant DEBUG ===');
        console.log('🔍 Nearest participant for scoping:', `"${nearestParticipant}"`);

        const targetName = nearestParticipant;

        // Get the programming language extension from model
        const fileExtension = this.model.getProgrammingLanguagefileExtension();
        console.log('🔍 Target file extension:', `"${fileExtension}"`);

        // Phase 1: Search by filename (both with and without extension)
        console.log('🔍 Phase 1 - Searching for file:', `"${targetName}"`);

        const filenameMatches = await this.findEqualFileNameInWorkspace(targetName, fileExtension);
        if (filenameMatches.length > 0) {
            console.log('✅ Phase 1 - Filename match found:', filenameMatches.map(uri => uri.fsPath));
            return filenameMatches;
        }

        // Phase 2: Search by content (files that contain the targetName)
        console.log('🔍 Phase 2 - Searching for files that contain the participant name in content:', `"${targetName}"`);
        const contentMatches = await this.findFilesByFileContent(targetName, fileExtension);

        return contentMatches;
    }

    private async findEqualFileNameInWorkspace(targetName: string, fileExtension: string): Promise<Uri[]> {
        const matched = new Set<string>(); // Use Set to avoid duplicates
        try {
            const filenameMatches = await workspace.findFiles(`**/${targetName}*`);
            // Filter by language extension
            const languageSpecificMatches = filenameMatches.filter(uri =>
                uri.fsPath.endsWith(`.${fileExtension}`)
            );
            console.log('✅ Phase 1 - Filename matches count (after language filter):', languageSpecificMatches.length);
            languageSpecificMatches.forEach(uri => matched.add(uri.fsPath));
        } catch (e) {
            console.error('❌ Phase 1 - Error during filename search:', e);
        }
        return Promise.resolve(Array.from(matched).map(fsPath => Uri.file(fsPath)));
    }

    private async findFilesByFileContent(targetName: string, fileExtension: string): Promise<Uri[]> {
        const includePattern = `**/*.${fileExtension}`;
        try {
            // max 200 files
            const candidates = await workspace.findFiles(includePattern,null,200); 
            const results = await Promise.allSettled(candidates.map(uri => workspace.openTextDocument(uri)));
            const matched = results.map((result, i) =>
                    result.status === 'fulfilled' && result.value.getText().includes(targetName)
                        ? candidates[i]
                        : null
                )
                .filter((uri): uri is Uri => uri !== null);
            console.log('🔍 Phase 2 - Candidate files count for content search:', candidates.length);
            return matched;
        } catch (e) {
            console.error('❌ Phase 2 - Error while enumerating files for content search:', e);
            return [];
        }
    }
}