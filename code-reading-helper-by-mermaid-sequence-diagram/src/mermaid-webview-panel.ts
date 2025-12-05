import { WebviewPanel, TextDocument, Disposable, window, ViewColumn, workspace, Uri } from 'vscode';

import { getHtmlForWebview } from './template-html';
import { debounce } from './debounce';
import { Controller } from './controller';
import { MermaidModel } from './mermaid-model';
/**
 * Mermaid webview panel
 * it is based on previewPanel in Mermaid preview 
 * to do if webview is closed,can open a new one : resolve 2025/9/25
 */
export class MermaidWebviewPanel {

  /**
   * webview panel instance. this is used to ensure only one panel is open at a time.
   */
  public static currentPanel: MermaidWebviewPanel | undefined;

  /**
   * The webview panel instance
   */
  private readonly panel: WebviewPanel;


  private readonly extensionUri: Uri;

  /**
   * Disposables to clean up resources
   */
  private readonly disposables: Disposable[] = [];

  /**
   * Mermaid model
   */
  private mermaidModel: MermaidModel;

  /**
   * Controller for handling function jumps
   */
  private controller: Controller;




  /**
   * webview panel constructor
   * @param panel webview panel
   * @param document vscode text document
   */
  private constructor(panel: WebviewPanel, document: TextDocument, extensionUri: Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.mermaidModel = new MermaidModel();
    this.mermaidModel.setDocument(document);
    this.mermaidModel.setView(this);
    this.controller = new Controller();
    this.update();
    this.setupListeners();
  }

  /**
   * Shows the Mermaid webview panel.
   * @param document vscode text document
   */

  //todo if mermaid code is changed,  update the webview content
  public static show(document: TextDocument, extensionUri: Uri): void {

    if (MermaidWebviewPanel.currentPanel) {
      MermaidWebviewPanel.currentPanel.panel.reveal();
      return;
    }

    const panel = window.createWebviewPanel(
      'mermaidPreview',
      'Mermaid Preview',
      ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [Uri.joinPath(extensionUri, 'media')]
      }
    );

    MermaidWebviewPanel.currentPanel = new MermaidWebviewPanel(panel, document, extensionUri);

  }

  /**
   * Dispose of resources.
   */
  public dispose(): void {

    MermaidWebviewPanel.currentPanel = undefined;
    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Update the webview content.
   */
  public update(): void {
    //Fetch the configuration from VSCode workspace
    // const config = workspace.getConfiguration();
    // const maxZoom = config.get<number>(Constants.MAX_ZOOM, 5);
    // this.lastContent = this.document.getText() || " ";

    // realtime update
    this.panel.webview.html = getHtmlForWebview(this.panel, this.mermaidModel.getDocumentText(), this.extensionUri);
  }



  /**
   * Set up listeners for document changes and messages from the webview.
   */
  private setupListeners(): void {

    // Debounce the update to avoid excessive updates
    const debouncedUpdate = debounce(() => {
      this.update();
    }, 300);

    // Listen for document changes to update the webview
    workspace.onDidChangeTextDocument((event) => {
      if (event.document === this.mermaidModel.getDocument()) {
        this.mermaidModel.update(event.document);
        debouncedUpdate();
      }
    }, this.disposables);

    // Listen for active editor changes to update the document if needed
    window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document?.languageId.startsWith('mermaid')) {
        if (editor.document.uri.toString() !== this.mermaidModel.getDocument().uri.toString()) {
          this.mermaidModel.update(editor.document);
          // this.document = editor.document;
          debouncedUpdate();
        }
      }
    }, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => {

        switch (message.command) {
          case "jumpToFunction":
            const functionName = message.functionName;
            const nearestParticipant = message.nearestParticipant;
            this.controller.jumpToFunction(functionName, nearestParticipant);
            break;
        }
      }, this.disposables);

    this.panel.onDidDispose(() => {
      this.dispose();
    }, null, this.disposables);
  }

  // private async jumpToFunction(functionName: string, nearestParticipant: string): Promise<void> {
  //   console.log('=== jumpToFunction DEBUG ===');
  //   console.log('🔍 Searching for function:', `"${functionName}"`);
  //   console.log('🔍 Nearest participant:', `"${nearestParticipant}"`);

  //   // Escape special regex characters in functionName
  //   const safeFuncName = this.escapeRegExp(functionName);
  //   console.log('🔍 Escaped function name for regex:', `"${safeFuncName}"`);

  //   const files = await this.findClassOrFilenameInParticipant(nearestParticipant);

  //   console.log('🔍 Scoped search files (thenable):', files);
  //   if (Array.isArray(files)) {
  //     console.log('🔍 Files to be searched (scoped):');
  //     for (const f of files) {
  //       console.log('   -', f.fsPath);
  //     }
  //   }

  //   // Search for the function definition in all target files in the workspace
  //   // const files = await workspace.findFiles('**/*.{py,ts,java,js}');

  //   // console.log('📁 Total files found:', files.length);

  //   if (files.length === 0) {
  //     window.showErrorMessage('target files not found');
  //     return;
  //   }

  //   const patterns = [
  //     //TypeScript
  //     // new RegExp(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${safeFuncName}[ \\t]*\\(`, 'm') //JavaScript

  //     // JavaScript,exclude $,[],*  is ok Jd

  //     // new RegExp(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${functionName}[ \\t]*\\(`, 'm')s
  //     // $methodA failed, other is ok 2025/11/11
  //     new RegExp(`^([ \t]*)(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|protected|private|static|abstract|final|synchronized|native|strictfp)\\s+)*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:[A-Za-z_$][\\w.$<>?,\\s@\\[\\]]*?)\\s+${functionName}\\s*\\(`, 'm'), //java
  //     new RegExp(`^([ \t]*)(?:async\\s+)?def\\s+${safeFuncName}\\s*(?:\\[[A-Za-z0-9_:=,*()\\s]*\\])?\\s*\\(`, 'm'),               // Python
  //     // new RegExp(`^\\s*(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|private|protected|abstract|static|final|synchronized|native|strictfp)\\s+)*(?:[<>,A-Za-z0-9_\\[\\].<>\\?@,\\s]+\\s+)?${functionName}\\s*\\(`, 'm'), // java methods with generics
  //     // new RegExp(`\\b^\\s*(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:(?:@[A-Za-z_1-9?$][\\w\\.]*?(?:\\([^)]*\\))?)|(?:public|private|protected|abstract|static|final|synchronized|native|strictfp))\\s+)*[A-Z]([A-Za-z<> ,.@_1-9?$])${functionName}\\s*\\(`), // java methods with generics
  //     //   new RegExp(`\\b(public|private|protected)\\s+(static\\s+)?${functionName}\\s*(<[a-zA-Z, ]*>)?\\s*\\(`), // TypeScript methods with generics
  //     //   new RegExp(`\\b(const|var|let)?\\s+${functionName}\\s*=\\s*function\\s*\\(`),       // JavaScript function expression
  //     // new RegExp(`\\b(export\\s+)?function\\s+${functionName}[\\s\\S]*?\\(`),    // TypeScript/JavaScript normal function with generics
  //     // new RegExp(`\\b${functionName}\\s*\\(`),      // JavaScript method

  //   ];

  //   // console.log('Search patterns:');

  //   for (const pattern of patterns) {
  //     for (const file of files) {
  //       try {
  //         const document = await workspace.openTextDocument(file);
  //         const text = document.getText();
  //         // console.log(`📖 File content length: ${text.length} characters`);
  //         const match = pattern.exec(text);
  //         if (match) {
  //           // console.log('✅ MATCH FOUND!');
  //           // console.log(`📍 Pattern: ${pattern.source}`);
  //           // console.log(`📍 Match details:`, {
  //           //   fullMatch: match[0],
  //           //   index: match.index,
  //           //   groups: match.slice(1)
  //           // });
  //           window.showInformationMessage(`✅ ${file.fsPath} find: ${match[0]}`);
  //           const pos = document.positionAt(match.index);

  //           const documentOptions: TextDocumentShowOptions = {
  //             selection: new Range(pos, pos),
  //             viewColumn: ViewColumn.One,
  //           };
  //           // Found file is opened in a mmd file
  //           await window.showTextDocument(document, documentOptions);
  //           console.log('✅ Jump completed successfully');
  //           return;
  //         }
  //         else {
  //           // console.log('❌ No match for this pattern');
  //         }
  //       } catch (error: any) {
  //         console.error(`❌ Error reading file ${file.fsPath}:`, error.message);
  //       }

  //       // console.log(`📖 Finished checking file: ${file.fsPath} - No matches found`);
  //     }
  //   }

  //   // if no function was found in any file
  //   console.log('❌ Function not found in any file');
  //   window.showInformationMessage(`❌ ${functionName} was not found`);


  /**
    * Jumps to the specified function in the codebase.
    * @param functionName - The name of the function to jump to.
    */
  // private async jumpToFunction(functionName: string, nearestParticipant: string): Promise<void> {
  //   console.log('=== jumpToFunction DEBUG ===');
  //   console.log('🔍 Searching for function:', `"${functionName}"`);
  //   console.log('🔍 Nearest participant:', `"${nearestParticipant}"`);

  //   // Escape special regex characters in functionName
  //   const safeFuncName = this.escapeRegExp(functionName);
  //   console.log('🔍 Escaped function name for regex:', `"${safeFuncName}"`);


  //   // const scopedFilesThenable = await this.findClassOrFilenameInParticipant(nearestParticipant);

  //   // console.log('🔍 Scoped search files (thenable):', scopedFilesThenable);
  //   // Determine which files to search: prefer scoped files when available
  //   // if (Array.isArray(scopedFilesThenable)) {
  //   //   console.log('🔍 Files to be searched (scoped):');
  //   //   for (const f of scopedFilesThenable) {
  //   //     console.log('   -', f.fsPath);
  //   //   }
  //   // }
  //   const files = await workspace.findFiles('**/*.{py,ts,java,js}');
  //   if (files.length === 0) {
  //     window.showErrorMessage('target files not found');
  //     return;
  //   }

  //   const patterns = [
  //     new RegExp(`^([ \t]*)(?:async\\s+)?def\\s+${safeFuncName}\\s*(?:\\[[A-Za-z0-9_:=,*()\\s]*\\])?\\s*\\(`),               // Python
  //     // new RegExp(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${safeFuncName}[ \\t]*\\(`, 'm'),//JavaScript

  //     // JavaScript,exclude $,[],*  is ok Jd

  //     // new RegExp(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${functionName}[ \\t]*\\(`, 'm')s
  //     // $methodA failed, other is ok 2025/11/11
  //     // new RegExp(`^([ \t]*)(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|protected|private|static|abstract|final|synchronized|native|strictfp)\\s+)*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:[A-Za-z_$][\\w.$<>?,\\s@\\[\\]]*?)\\s+${functionName}\\s*\\(`, 'm'), //java
  //     // new RegExp(`^\\s*(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|private|protected|abstract|static|final|synchronized|native|strictfp)\\s+)*(?:[<>,A-Za-z0-9_\\[\\].<>\\?@,\\s]+\\s+)?${functionName}\\s*\\(`, 'm'), // java methods with generics
  //     // new RegExp(`\\b^\\s*(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:(?:@[A-Za-z_1-9?$][\\w\\.]*?(?:\\([^)]*\\))?)|(?:public|private|protected|abstract|static|final|synchronized|native|strictfp))\\s+)*[A-Z]([A-Za-z<> ,.@_1-9?$])${functionName}\\s*\\(`), // java methods with generics
  //     //   new RegExp(`\\b(public|private|protected)\\s+(static\\s+)?${functionName}\\s*(<[a-zA-Z, ]*>)?\\s*\\(`), // TypeScript methods with generics
  //     //   new RegExp(`\\b(const|var|let)?\\s+${functionName}\\s*=\\s*function\\s*\\(`),       // JavaScript function expression
  //     // new RegExp(`\\b(export\\s+)?function\\s+${functionName}[\\s\\S]*?\\(`),    // TypeScript/JavaScript normal function with generics
  //     // new RegExp(`\\b${functionName}\\s*\\(`),      // JavaScript method

  //   ];


  //   // console.log('Search patterns:');

  //   for (const pattern of patterns) {
  //     for (const file of files) {
  //       try {
  //         // console.log('file:' , file)
  //         const document = await workspace.openTextDocument(file);

  //         const text = document.getText();
  //         // console.log(`📖 File content length: ${text.length} characters`);
  //         // Quick preview and literal containment check (debug)

  //         const match = pattern.exec(text);
  //         if (match) {
  //           // console.log('✅ MATCH FOUND!');
  //           // console.log(`📍 Pattern: ${pattern.source}`);
  //           // console.log(`📍 Match details:`, {
  //           //   fullMatch: match[0],
  //           //   index: match.index,
  //           //   groups: match.slice(1)
  //           // });
  //           window.showInformationMessage(`✅ ${file.fsPath} find: ${match[0]}`);
  //           const pos = document.positionAt(match.index);

  //           const documentOptions: TextDocumentShowOptions = {
  //             selection: new Range(pos, pos),
  //             viewColumn: ViewColumn.One,
  //           };
  //           // Found file is opened in a mmd file
  //           await window.showTextDocument(document, documentOptions);
  //           console.log('✅ Jump completed successfully');
  //           return;
  //         }
  //       } catch (error: any) {
  //         console.error(`❌ Error reading file ${file.fsPath}:`, error.message);
  //       }

  //       // console.log(`📖 Finished checking file: ${file.fsPath} - No matches found`);
  //     }
  //   }

  //   // if no function was found in any file
  //   console.log('❌ Function not found in any file');
  //   window.showInformationMessage(`❌ ${functionName} was not found`);
  // }

  /**
   *  Narrow the scope of search based on nearest participant
   * @param nearestPar icipant 
   * @returns failes included Participant name 
   */
  // private findClassOrFilenameInParticipant(nearestParticipant: string): Thenable<Uri[]> {

  //   console.log('=== findClassOrFilenameInParticipant DEBUG ===');
  //   console.log('🔍 Nearest participant for scoping:', `"${nearestParticipant}"`);
  //   //filename
  //   const targetName = nearestParticipant;
  //   if (targetName.includes('.')) {
  //     console.log('🔍 Searching for file:', `"${targetName}"`);
  //     const files = workspace.findFiles(`**/${targetName}`);
  //     return files;
  //   }
  //   //className: search by content (files that contain the targetName)
  //   console.log('🔍 Searching for files that contain the participant name in content:', `"${targetName}"`);

  //   // Collect matched URIs by opening candidate files and checking their content.
  //   // This avoids depending on newer VS Code APIs that may not be available in all environments.
  //   const includePattern = '**/*.{py,ts,java,js}';
  //   return new Promise<Uri[]>(async (resolve) => {
  //     const matched: Uri[] = [];
  //     try {
  //       const candidates = await workspace.findFiles(includePattern);
  //       console.log('🔍 Candidate files count for content search:', candidates.length);
  //       for (const candidate of candidates) {
  //         try {
  //           const doc = await workspace.openTextDocument(candidate);
  //           if (doc.getText().includes(targetName)) {
  //             console.log('✅ Content match found in file:', candidate.fsPath);
  //             matched.push(candidate);
  //           }
  //         } catch (e) {
  //           // ignore files that can't be opened
  //         }
  //       }
  //     } catch (e) {
  //       console.error('❌ Error while enumerating files for content search:', e);
  //     }
  //     console.log('🔍 Content-scoped results count:', matched.length);
  //     resolve(matched);
  //   });
  // }

  /**
   * meta characters is escaped
   * @param aString
   * @returns escaped string
   */
  // private escapeRegExp(aString: string) {
  //   return aString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // }


  /**
   * this method is for test
   * Gets the current MermaidWebviewPanel instance.
   * @returns MermaidWebviewPanel current panel instance
   */
  public static getCurrentPanel(): MermaidWebviewPanel | undefined {
    return MermaidWebviewPanel.currentPanel;
  }



  /**
   * this method is for test
   * Gets the current document.
   * @returns current document
   */
  public testUpdate(): void {
    MermaidWebviewPanel.currentPanel?.update();
  }

  /**
   * this method is for test
   * view disposables after event. 
   */
  public testsSetupListener(): void {
    console.log(this.disposables);
  }
  /**
  * this method is for test
  * view disposables after event. 
  */
  public testGetWebview(): WebviewPanel {
    return this.panel;
  }


}