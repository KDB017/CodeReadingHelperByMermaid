import { WebviewPanel, TextDocument, Disposable, window, ViewColumn, workspace, Uri, TextDocumentShowOptions, Position, Range, TextEditorRevealType } from 'vscode';

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

  /**
   * The extension URI
   */
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
    this.mermaidModel = new MermaidModel(document, this);
    this.controller = new Controller(this.mermaidModel, this);
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

  public async showFunctionLocation(document: TextDocument, pos: Position): Promise<void> {
    const range = new Range(pos, pos);
    const documentOptions: TextDocumentShowOptions = {
      selection: range,
      viewColumn: ViewColumn.One,
      preserveFocus: false,
    };
    const editor = await window.showTextDocument(document, documentOptions);

    editor.revealRange(range,TextEditorRevealType.AtTop);
  }

  public showInformationMessage(message: string): void {
    window.showInformationMessage(message);
  }

  public showErrorMessage(message: string): void {
    window.showErrorMessage(message);
  }


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