// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { SequenceDiagramWebViewProvider } from './sequence-diagram-webview-provider';
import { MermaidWebviewPanel } from './mermaid-webview-panel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * Activate the extension
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext): void {

  context.subscriptions.push(
    vscode.commands.registerCommand('mermaidWebview.showPreview', () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      MermaidWebviewPanel.show(activeEditor.document);
    })
  );
}

