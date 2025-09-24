import * as vscode from 'vscode';

import { getHtmlForWebview } from './template-html';
import { debounce } from './debounce';

/**
 * Manages the Mermaid Webview panel
 */
export class MermaidWebviewPanel {

  /**
   * webview panel instance. this is used to ensure only one panel is open at a time.
   */
  public static currentPanel: MermaidWebviewPanel | undefined;

  /**
   * The webview panel instance
   */
  private readonly _panel: vscode.WebviewPanel;
  // private readonly _extensionUri: vscode.Uri;

  /**
   * The text document being displayed in the webview panel
   */
  private _document: vscode.TextDocument;
  // private _isFileChange : boolean;



  /**
   * webview panel constructor
   * @param panel webview panel
   * @param document vscode text document
   */
  private constructor(panel: vscode.WebviewPanel, document:vscode.TextDocument) {
    this._panel = panel;
    // this._isFileChange = false;
    // this._extensionUri = extensionUri;
    this._document=  document;

    this._update();
    this._setupListeners();
    


    // When the panel is closed, dispose of resources
    this._panel.onDidDispose(() => this.dispose(), null);
  }

  /**
   * Shows the Mermaid webview panel.
   * @param document vscode text document
   */
  public static show( document:vscode.TextDocument): void{
    // if already opened → update
    if (MermaidWebviewPanel.currentPanel) {
      MermaidWebviewPanel.currentPanel._panel.reveal();
      return;
    }

    // else open a new one
    const panel = vscode.window.createWebviewPanel(
      'mermaidPreview',
      'Mermaid Preview',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    MermaidWebviewPanel.currentPanel = new MermaidWebviewPanel(panel, document);
  }

  /**
   * Dispose of resources.
   */
  public dispose(): void {
    MermaidWebviewPanel.currentPanel = undefined;
    this._panel.dispose();
  }

  /**
   * Update the webview content.
   */
  private _update(): void {

    if(!this._panel.webview.html){
      this._panel.webview.html = getHtmlForWebview(this._panel, this._document.getText());
    }
  
  }

  /**
   * Set up listeners for document changes and messages from the webview.
   */
  private _setupListeners(): void {
    const debouncedUpdate = debounce(() => this._update(), 300);
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === this._document) {
        debouncedUpdate();
      }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document?.languageId.startsWith('mermaid')) {
        if (editor.document.uri.toString() !== this._document?.uri.toString()) {
          this._document = editor.document;
          // this._isFileChange = true;
          debouncedUpdate();
        }
      } 
    });

    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "jumpToFunction":
            const functionName = message.functionName;
            this.jumpToFunction(functionName);
            break;
        }
      },
      null,
      []
    );
  }



  /**
     * Jumps to the specified function in the codebase.
     * @param functionName - The name of the function to jump to.
     */
  private async jumpToFunction(functionName: string): Promise<void> {

    // vscode.window.showInformationMessage(`Jumping to function: ${functionName}`);

    // Search for the function definition in all Python files in the workspace
    const files = await vscode.workspace.findFiles('**/*.{py,ts,java,js}');

    if (files.length === 0) {
      vscode.window.showErrorMessage('target files not found');
      return;
    }

    // Open each file and search for the function definition
    files.forEach(file => {
      vscode.workspace.openTextDocument(file).then(document => {

        const text = document.getText();

      const patterns = [
        new RegExp(`\\bdef\\s+${functionName}\\s*\\(`),               // Python
  new RegExp(`\\bfunction\\s+${functionName}\\s*\\(`),          // 普通のJS/TS
  new RegExp(`\\bexport\\s+function\\s+${functionName}\\s*\\(`),// export付き
  new RegExp(`\\bconst\\s+${functionName}\\s*=\\s*\\(`),        // const fn = (
  new RegExp(`\\bconst\\s+${functionName}\\s*=\\s*async\\s*\\(`),
  new RegExp(`\\b${functionName}\\s*\\([^)]*\\)\\s*{`),         // Java/TS シグネチャ
  new RegExp(`\\bfunction\\s+${functionName}(?:<[^>]+>)?\\s*\\(`)
      ];
        for (const regex of patterns) {
      const match = regex.exec(text);
          if (match) {
          vscode.window.showInformationMessage(`✅ ${file.fsPath} で見つかった: ${match[0]}`);
          const pos = document.positionAt(match.index);
          vscode.window.showTextDocument(document, { selection: new vscode.Range(pos, pos) });
        return; // 最初に見つけた関数で終了
      }else{
        vscode.window.showInformationMessage(`❌ ${file.fsPath} には ${functionName} が見つからなかった`);
      }
    }
  });



});
  }
}
