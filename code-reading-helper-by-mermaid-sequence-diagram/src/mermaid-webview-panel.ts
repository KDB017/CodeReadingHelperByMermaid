import {WebviewPanel,TextDocument,Disposable,window,ViewColumn,workspace,TextDocumentShowOptions,Range}  from 'vscode';

import { getHtmlForWebview } from './template-html';
import { debounce } from './debounce';

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

  /**
   * The text document being displayed in the webview panel
   */
  private document: TextDocument;

  /**
   * The last content of the document
   */
  // private lastContent: string

  /**
   * Disposables to clean up resources
   */
  private readonly disposables: Disposable[] = [];




  /**
   * webview panel constructor
   * @param panel webview panel
   * @param document vscode text document
   */
  private constructor(panel: WebviewPanel, document: TextDocument) {
    this.panel = panel;
    this.document = document;

    this.update();
    this.setupListeners();
  }

  /**
   * Shows the Mermaid webview panel.
   * @param document vscode text document
   */

  //todo if mermaid code is changed,  update the webview content
  public static show(document: TextDocument): void {

    if (MermaidWebviewPanel.currentPanel) {
      MermaidWebviewPanel.currentPanel.panel.reveal();
      return;
    }

    const panel = window.createWebviewPanel(
      'mermaidPreview',
      'Mermaid Preview',
      ViewColumn.Beside,
      { enableScripts: true }
    );

    MermaidWebviewPanel.currentPanel = new MermaidWebviewPanel(panel, document);

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
  private update(): void {
    //Fetch the configuration from VSCode workspace
    // const config = workspace.getConfiguration();
    // const maxZoom = config.get<number>(Constants.MAX_ZOOM, 5);
    // this.lastContent = this.document.getText() || " ";

    // realtime update
    this.panel.webview.html = getHtmlForWebview(this.panel, this.document.getText());
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
      if (event.document === this.document) {
        debouncedUpdate();
      }
    }, this.disposables);

    // Listen for active editor changes to update the document if needed
    window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document?.languageId.startsWith('mermaid')) {
        if (editor.document.uri.toString() !== this.document?.uri.toString()) {
          this.document = editor.document;
          debouncedUpdate();
        }
      }
    }, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        
        switch (message.command) {
          case "jumpToFunction":
            const functionName = message.functionName;
            this.jumpToFunction(functionName);
            break;
        }
      }, this.disposables);

    this.panel.onDidDispose(() => {
      this.dispose();
    }, null, this.disposables);
  }



  /**
    * Jumps to the specified function in the codebase.
    * @param functionName - The name of the function to jump to.
    */
  private async jumpToFunction(functionName: string): Promise<void> {
    console.log('=== jumpToFunction DEBUG ===');
    console.log('🔍 Searching for function:', `"${functionName}"`);
    console.log('🔍 Function name length:', functionName.length);
    console.log('🔍 Function name char codes:', functionName.split('').map(c => c.charCodeAt(0)));
    
    // Search for the function definition in all target files in the workspace
    const files = await workspace.findFiles('**/*.{py,ts,java,js}');
    
    console.log('📁 Total files found:', files.length);
    
    if (files.length === 0) {
      window.showErrorMessage('target files not found');
      return;
    }

    // from limited area to wide area
    const patterns = [
      // More specific patterns first
        new RegExp(`\\b(public|private|protected)\\s+(static\\s+)?${functionName}\\s*(<[a-zA-Z, ]*>)?\\s*\\(`), // TypeScript methods with generics
        new RegExp(`\\b(public|private|protected)\\s+(static\\s+)?[a-zA-Z]*\\s*(<[a-zA-Z, ]*>)?\\s*${functionName}\\s*\\(`), // java methods with generics
        new RegExp(`\\b(const|var|let)?\\s+${functionName}\\s*=\\s*function\\s*\\(`),       // JavaScript function expression
        new RegExp(`\\b(?:async\\s+)?def\\s+${functionName}\\s*(?:\\[[A-Za-z0-9_:=,*()\\s]*\\])?\\s*\\(`),               // Python failed lambda

      // new RegExp(`\\b(?:const|let|var)\\s+${functionName}\\s*=\\s*(?:<[^>]+>\\s*)?(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>`),
      // new RegExp(`\\b(const|let|var)\\s+${functionName}\\s*=\\s*((([a-zA-Z]*\\s)?)|[a-zA-Z]*)\\s*=>\\s*\\(\\()?`),      // JavaScript method
      new RegExp(`\\b(export\\s+)?function\\s+${functionName}[\\s\\S]*?\\(`),    // TypeScript/JavaScript normal function with generics
      new RegExp(`\\b${functionName}\\s*\\(`),      // JavaScript method

    ];
    
    console.log('Search patterns:');
    patterns.forEach((pattern, index) => {
      console.log(`  ${index + 1}. ${pattern.source}`);
    });

    for (const pattern of patterns) {
      for (const file of files) {
        try {
        const document = await workspace.openTextDocument(file);
        const text = document.getText();
        console.log(`📖 File content length: ${text.length} characters`);
        const match = pattern.exec(text);
          if (match) {
            console.log('✅ MATCH FOUND!');
            console.log(`📍 Pattern: ${pattern.source}`);
            console.log(`📍 Match details:`, {
              fullMatch: match[0],
              index: match.index,
              groups: match.slice(1)
            });
            window.showInformationMessage(`✅ ${file.fsPath} find: ${match[0]}`);
            const pos = document.positionAt(match.index);

            const documentOptions:TextDocumentShowOptions={
              selection: new Range(pos, pos),
              viewColumn: ViewColumn.One,
            };
            // Found file is opened in a mmd file
            await window.showTextDocument(document, documentOptions);
            console.log('✅ Jump completed successfully');
            return;
          }
          else {
            console.log('❌ No match for this pattern');
          }
        } catch (error: any) {
          console.error(`❌ Error reading file ${file.fsPath}:`, error.message);
          }

          console.log(`📖 Finished checking file: ${file.fsPath} - No matches found`);
        }
    }

    // if no function was found in any file
    console.log('❌ Function not found in any file');
    window.showInformationMessage(`❌ ${functionName} was not found`);
  }

  /**
              // escape functionName for safe regex interpolation
              const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   * this method is for test
   * Gets the current MermaidWebviewPanel instance.
   * @returns MermaidWebviewPanel current panel instance
   */
  public static getCurrentPanel():MermaidWebviewPanel | undefined {
    return MermaidWebviewPanel.currentPanel;
  }

  /**
   * this method is for test
                new RegExp(`\\b(export\\s+)?function\\s+${escapedName}[\\s\\S]*?\\(`),    // TypeScript/JavaScript normal function with generics
                new RegExp(`\\b${escapedName}\\s*\\(`),      // JavaScript method
   */
  public static getDocument():TextDocument | undefined {
    return MermaidWebviewPanel.currentPanel?.document;
  }

  /**
   * this method is for test
   * Gets the current document.
   * @returns current document
   */
  public testUpdate():void {
    MermaidWebviewPanel.currentPanel?.update();
  }
}