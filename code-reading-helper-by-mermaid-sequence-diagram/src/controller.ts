
import { Uri, workspace,window,ViewColumn,TextDocumentShowOptions, Range} from "vscode";

/**
 * Controller class to handle navigation to function definitions in the workspace.
 */
export class Controller {

    /**
     * Constructor for the Controller class.
     */
    constructor() {
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
        const safeFuncName = this.escapeRegExp(functionName);
        console.log('🔍 Escaped function name for regex:', `"${safeFuncName}"`);

        const files = await this.findClassOrFilenameInParticipant(nearestParticipant);

        console.log('🔍 Scoped search files (thenable):', files);
        if (Array.isArray(files)) {
            console.log('🔍 Files to be searched (scoped):');
            for (const f of files) {
                console.log('   -', f.fsPath);
            }
        }

        // Search for the function definition in all target files in the workspace
        // const files = await workspace.findFiles('**/*.{py,ts,java,js}');

        // console.log('📁 Total files found:', files.length);

        if (files.length === 0) {
            window.showErrorMessage('target files not found');
            return;
        }

        const patterns = [
            //TypeScript
            // TypeScript: allow optional generics with nested angle-brackets up to depth 2
            // new RegExp(`^([ \\t]*)(?:export\\s+)?(?:(?:public|protected|private|static|async)\\s+)?(?:function\\s+)?${safeFuncName}\\s*(?:<(?:(?:[^<>]|<[^<>]*>){0,2})>)?\\s*\\(`, 'm'),
            new RegExp(`^([ \\t]*)(?:export\\s+)?((public|protected|private|static|async)\\s+)?(function\\s+)?${safeFuncName}\\s*(?:<[\\s\\S]*?>)?\\s*\\(`, 'm'),
            //JavaScript
            new RegExp(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${safeFuncName}[ \\t]*\\(`, 'm'),

            // JavaScript,exclude $,[],*  is ok Jd

            // new RegExp(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${functionName}[ \\t]*\\(`, 'm')s
            // $methodA failed, other is ok 2025/11/11
            //java
            new RegExp(`^([ \t]*)(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|protected|private|static|abstract|final|synchronized|native|strictfp)\\s+)*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:[A-Za-z_$][\\w.$<>?,\\s@\\[\\]]*?)\\s+${functionName}\\s*\\(`, 'm'),
            // Python
            new RegExp(`^([ \t]*)(?:async\\s+)?def\\s+${safeFuncName}\\s*(?:\\[[A-Za-z0-9_:=,*()\\s]*\\])?\\s*\\(`, 'm'),

        ];

        // console.log('Search patterns:');

        for (const pattern of patterns) {
            for (const file of files) {
                try {
                    const document = await workspace.openTextDocument(file);
                    const text = document.getText();
                    // console.log(`📖 File content length: ${text.length} characters`);
                    const match = pattern.exec(text);
                    if (match) {
                        // console.log('✅ MATCH FOUND!');
                        // console.log(`📍 Pattern: ${pattern.source}`);
                        // console.log(`📍 Match details:`, {
                        //   fullMatch: match[0],
                        //   index: match.index,
                        //   groups: match.slice(1)
                        // });
                        window.showInformationMessage(`✅ ${file.fsPath} find: ${match[0]}`);
                        const pos = document.positionAt(match.index);

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

                // console.log(`📖 Finished checking file: ${file.fsPath} - No matches found`);
            }
        }

        // if no function was found in any file
        console.log('❌ Function not found in any file');
        window.showInformationMessage(`❌ ${functionName} was not found`);
    }

    /**
     *  Narrow the scope of search based on nearest participant
     * @param nearestParticipant 
     * @returns failes included Participant name 
     */
    private findClassOrFilenameInParticipant(nearestParticipant: string): Thenable<Uri[]> {

        console.log('=== findClassOrFilenameInParticipant DEBUG ===');
        console.log('🔍 Nearest participant for scoping:', `"${nearestParticipant}"`);
        //filename
        const targetName = nearestParticipant;
        if (targetName.includes('.')) {
            console.log('🔍 Searching for file:', `"${targetName}"`);
            const files = workspace.findFiles(`**/${targetName}`);
            return files;
        }
        //className: search by content (files that contain the targetName)
        console.log('🔍 Searching for files that contain the participant name in content:', `"${targetName}"`);

        // Collect matched URIs by opening candidate files and checking their content.
        // This avoids depending on newer VS Code APIs that may not be available in all environments.
        const includePattern = '**/*.{py,ts,java,js}';
        return new Promise<Uri[]>(async (resolve) => {
            const matched: Uri[] = [];
            try {
                const candidates = await workspace.findFiles(includePattern);
                console.log('🔍 Candidate files count for content search:', candidates.length);
                for (const candidate of candidates) {
                    try {
                        const doc = await workspace.openTextDocument(candidate);
                        if (doc.getText().includes(targetName)) {
                            console.log('✅ Content match found in file:', candidate.fsPath);
                            matched.push(candidate);
                        }
                    } catch (e) {
                        // ignore files that can't be opened
                    }
                }
            } catch (e) {
                console.error('❌ Error while enumerating files for content search:', e);
            }
            console.log('🔍 Content-scoped results count:', matched.length);
            resolve(matched);
        });
    }

    /**
     * meta characters is escaped
     * @param aString
     * @returns escaped string
     */
    private escapeRegExp(aString: string) {
        return aString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}