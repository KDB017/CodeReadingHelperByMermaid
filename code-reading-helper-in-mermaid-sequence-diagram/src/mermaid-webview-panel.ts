import * as vscode from 'vscode';

import { getHtmlForWebview } from './template-html';
import { debounce } from './debounce';
// import { Constants } from './constants';

/**
 * Manages the Mermaid Webview panel
 * using Mermaid Chart code
 */
export class MermaidWebviewPanel {

  /**
   * webview panel instance. this is used to ensure only one panel is open at a time.
   */
  public static currentPanel: MermaidWebviewPanel | undefined;

  /**
   * The webview panel instance
   */
  private readonly panel: vscode.WebviewPanel;

  /**
   * The text document being displayed in the webview panel
   */
  private document: vscode.TextDocument;

  /**
   * The last content of the document
   */
  // private lastContent: string



  /**
   * webview panel constructor
   * @param panel webview panel
   * @param document vscode text document
   */
  private constructor(panel: vscode.WebviewPanel, document: vscode.TextDocument) {
    this.panel = panel;
    this.document = document;
    // this.lastContent = "";

    this.update();
    this.setupListeners();
  }

  /**
   * Shows the Mermaid webview panel.
   * @param document vscode text document
   */

  //todo if mermaid code is changed,  update the webview content
  public static show(document: vscode.TextDocument): void {
    // if already opened → update
    if (MermaidWebviewPanel.currentPanel) {
      MermaidWebviewPanel.currentPanel.panel.reveal();
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
    this.panel.dispose();
  }

  /**
   * Update the webview content.
   */
  private update(): void {

    //Fetch the configuration from VSCode workspace
    // const config = vscode.workspace.getConfiguration();
    // const maxZoom = config.get<number>(Constants.MAX_ZOOM, 5);
    // this.lastContent = this.document.getText() || " ";

    if (!this.panel.webview.html) {
      this.panel.webview.html = getHtmlForWebview(this.panel, this.document.getText());
    }
    // this.panel.webview.postMessage({
    //   type: "update",
    //   content: this.lastContent,
    //   maxZoom: maxZoom,
    // });

  }

  /**
   * Set up listeners for document changes and messages from the webview.
   */
  private setupListeners(): void {
    const debouncedUpdate = debounce(() => this.update(), 300);
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === this.document) {
        debouncedUpdate();
      }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document?.languageId.startsWith('mermaid')) {
        if (editor.document.uri.toString() !== this.document?.uri.toString()) {
          this.document = editor.document;
          debouncedUpdate();
        }
      }
    });

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "jumpToFunction":
            const functionName = message.functionName;
            this.jumpToFunction(functionName);
            break;
        }
      }
    );
  }



  /**
     * Jumps to the specified function in the codebase.
     * @param functionName - The name of the function to jump to.
     */
  private async jumpToFunction(functionName: string): Promise<void> {
    // Search for the function definition in all target files in the workspace
    const files = await vscode.workspace.findFiles('**/*.{py,ts,java,js}');

    if (files.length === 0) {
      vscode.window.showErrorMessage('target files not found');
      return;
    }

    const patterns = [
      // def functionName() :python
      new RegExp(`\\bdef\\s+${functionName}\\s*\\(`),               // Python
      new RegExp(`\\bfunction\\s+${functionName}\\s*\\(`),          // JavaScript
      new RegExp(`\\b${functionName}\\s*:\\s*function`),        // JavaScript method
    ];

    // Search for the function definition in all target files,and open the first one found
    for (const file of files) {
      try {
        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();

        for (const regex of patterns) {
          const match = regex.exec(text);
          if (match) {
            vscode.window.showInformationMessage(`✅ ${file.fsPath} find: ${match[0]}`);
            const pos = document.positionAt(match.index);

            // Found file is opened in a mmd file
            await vscode.window.showTextDocument(document, {
              selection: new vscode.Range(pos, pos),
              viewColumn: vscode.ViewColumn.One,
            });

            return;
          }
        }
      } catch (error) {
        console.error(`Error reading file ${file.fsPath}:`, error);
      }
    }

    // if no function was found in any file
    vscode.window.showInformationMessage(`❌ ${functionName} was not found`);
  }
}
