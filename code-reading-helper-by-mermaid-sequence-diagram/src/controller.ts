
import { Uri, workspace, window, ViewColumn, TextDocumentShowOptions, Range } from "vscode";
import { AnalyzerFactory } from "./analyzer/analyzer-factory";
import { MermaidModel } from "./mermaid-model";
import { ICodeAnalyzer } from "./analyzer/interface/code-analyzer-interface";
/**
 * Controller class to handle navigation to function definitions in the workspace.
 */
export class Controller {

    /**
     * The MermaidModel instance associated with this controller.
     */
    private model: MermaidModel;


    /**
     * Constructor for the Controller class.
     */
    constructor() {
        this.model = null!;
    }

    /**
     * set the model
     * @param model 
     */
    public setModel(model: MermaidModel): void {
        this.model = model;
    }

    /**
     * jump to function definition in workspace
     * @param functionName 
     * @param nearestParticipant 
     * @returns 
     */
    public async jumpToFunction(functionName: string, nearestParticipant: string): Promise<void> {
        console.log('=== jumpToFunction DEBUG ===');
        console.log('🔍 Searching for function:', `"${functionName}"`);
        console.log('🔍 Nearest participant:', `"${nearestParticipant}"`);

        // Escape special regex characters in functionName

        const files = await this.findClassOrFilenameInParticipant(nearestParticipant);
        
        console.log('model programmingLanguageFileExtension:', this.model.getProgrammingLanguagefileExtension());
        // Search for the function definition in all target files in the workspace
        // const files = await workspace.findFiles('**/*.{py,ts,java,js}');

        // console.log('📁 Total files found:', files.length);

        if (files.length === 0) {
            window.showErrorMessage('target files not found');
            return;
        }
        for (const file of files) {
            try {
                const document = await workspace.openTextDocument(file);
                const text = document.getText();
                const analyzer: ICodeAnalyzer = AnalyzerFactory.getAnalyzerForFile(this.model.getProgrammingLanguagefileExtension());
                console.log(`📖 File content length: ${analyzer} characters`);
                const searchResult = analyzer.searchFunctionPosition(text, functionName);

                if (searchResult !== null) {
                    const pos = document.positionAt(searchResult.index);

                    const documentOptions: TextDocumentShowOptions = {
                        selection: new Range(pos, pos),
                        viewColumn: ViewColumn.One,
                    };
                    // Found file is opened in a mmd file
                    await window.showTextDocument(document, documentOptions);
                    console.log('✅ Jump completed successfully');
                    return;
                }
                else {
                    // console.log('❌ No match for this pattern');
                }
            } catch (error: any) {
                console.error(`❌ Error reading file ${file.fsPath}:`, error.message);
            }

            console.log(`📖 Finished checking file: ${file.fsPath} - No matches found`);
        }

        // if no function was found in any file
        console.log('❌ Function not found in any file');
        window.showInformationMessage(`❌ ${functionName} was not found`);

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
        const matched = new Set<string>(); // Use Set to avoid duplicates

        // Phase 1: Search by filename (both with and without extension)
        console.log('🔍 Phase 1 - Searching for file:', `"${targetName}"`);
        try {
            const filenameMatches = await workspace.findFiles(`**/${targetName}*`);
            console.log('✅ Phase 1 - Filename matches count:', filenameMatches.length);
            filenameMatches.forEach(uri => matched.add(uri.fsPath));
        } catch (e) {
            console.error('❌ Phase 1 - Error during filename search:', e);
        }

        // Phase 2: Search by content (files that contain the targetName)
        console.log('🔍 Phase 2 - Searching for files that contain the participant name in content:', `"${targetName}"`);
        const includePattern = '**/*.{py,ts,java,js}';
        try {
            const candidates = await workspace.findFiles(includePattern);
            console.log('🔍 Phase 2 - Candidate files count for content search:', candidates.length);
            for (const candidate of candidates) {
                try {
                    const doc = await workspace.openTextDocument(candidate);
                    if (doc.getText().includes(targetName)) {
                        console.log('✅ Phase 2 - Content match found in file:', candidate.fsPath);
                        matched.add(candidate.fsPath);
                    }
                } catch (e) {
                    // ignore files that can't be opened
                }
            }
        } catch (e) {
            console.error('❌ Phase 2 - Error while enumerating files for content search:', e);
        }

        const result = Array.from(matched).map(fsPath => Uri.file(fsPath));
        console.log('🔍 Final scoped results count:', result.length);
        return result;
    }
}