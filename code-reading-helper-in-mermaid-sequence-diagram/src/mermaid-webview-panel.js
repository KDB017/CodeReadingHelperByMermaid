"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MermaidWebviewPanel = void 0;
const vscode = require("vscode");
const template_html_1 = require("./template-html");
const debounce_1 = require("./debounce");
const constants_1 = require("./constants");
/**
 * Manages the Mermaid Webview panel
 * using Mermaid Chart code
 */
class MermaidWebviewPanel {
    /**
     * webview panel constructor
     * @param panel webview panel
     * @param document vscode text document
     */
    constructor(panel, document) {
        this.panel = panel;
        this.document = document;
        this.lastContent = "";
        this.update();
        this.setupListeners();
    }
    /**
     * Shows the Mermaid webview panel.
     * @param document vscode text document
     */
    //todo if mermaid code is changed,  update the webview content
    static show(document) {
        // if already opened → update
        if (MermaidWebviewPanel.currentPanel) {
            MermaidWebviewPanel.currentPanel.panel.reveal();
            return;
        }
        // else open a new one
        const panel = vscode.window.createWebviewPanel('mermaidPreview', 'Mermaid Preview', vscode.ViewColumn.Beside, { enableScripts: true });
        MermaidWebviewPanel.currentPanel = new MermaidWebviewPanel(panel, document);
    }
    /**
     * Dispose of resources.
     */
    dispose() {
        MermaidWebviewPanel.currentPanel = undefined;
        this.panel.dispose();
    }
    /**
     * Update the webview content.
     */
    update() {
        //Fetch the configuration from VSCode workspace
        const config = vscode.workspace.getConfiguration();
        const maxZoom = config.get(constants_1.Constants.MAX_ZOOM, 5);
        this.lastContent = this.document.getText() || " ";
        if (!this.panel.webview.html) {
            this.panel.webview.html = (0, template_html_1.getHtmlForWebview)(this.panel, this.document.getText());
        }
        this.panel.webview.postMessage({
            type: "update",
            content: this.lastContent,
            maxZoom: maxZoom,
        });
    }
    /**
     * Set up listeners for document changes and messages from the webview.
     */
    setupListeners() {
        const debouncedUpdate = (0, debounce_1.debounce)(() => this.update(), 300);
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
        this.panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "jumpToFunction":
                    const functionName = message.functionName;
                    this.jumpToFunction(functionName);
                    break;
            }
        });
    }
    /**
       * Jumps to the specified function in the codebase.
       * @param functionName - The name of the function to jump to.
       */
    async jumpToFunction(functionName) {
        // Search for the function definition in all target files in the workspace
        const files = await vscode.workspace.findFiles('**/*.{py,ts,java,js}');
        if (files.length === 0) {
            vscode.window.showErrorMessage('target files not found');
            return;
        }
        const patterns = [
            // def functionName() :python
            new RegExp(`\\bdef\\s+${functionName}\\s*\\(`),
            new RegExp(`\\bfunction\\s+${functionName}\\s*\\(`),
            new RegExp(`\\b${functionName}\\s*:\\s*function`), // JavaScript method
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
            }
            catch (error) {
                console.error(`Error reading file ${file.fsPath}:`, error);
            }
        }
        // if no function was found in any file
        vscode.window.showInformationMessage(`❌ ${functionName} was not found`);
    }
}
exports.MermaidWebviewPanel = MermaidWebviewPanel;
//# sourceMappingURL=mermaid-webview-panel.js.map