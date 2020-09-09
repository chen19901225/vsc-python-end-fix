import { Logger } from "./logger";
import { Settings } from "./settings";
import * as vscode from "vscode";
import { EndRunner } from "./runner";
import { APPNAME } from "./consts";

export class EndLoader {
    private listenerDisposables: vscode.Disposable[] | undefined;
    private endRunner: EndRunner;

    constructor(public logger: Logger, public settings: Settings) {
        this.endRunner = new EndRunner(logger, settings);
    }
    public activate(subscriptions: vscode.Disposable[]): void {
        subscriptions.push(this);
        this.initialize(subscriptions);
        this.logger.log("python-end-fix activated.");
    }

    
    private initialize(subscriptions: vscode.Disposable[]): void {
        // 配置修改
        vscode.workspace.onDidChangeConfiguration(this.reinitialize, this, subscriptions);
        this.registerCommands(subscriptions);
        this.registerEventListeners();
        this.highlightActiveEditors()
    }

    private reinitialize(): void {
        // dispose?
        this.dispose();
        // 强指刷新？
        this.settings.refreshSettings();

        // 为什么要registerEventListeners?
        this.registerEventListeners();

        // Highlight?
        this.highlightActiveEditors()
    }

    private registerCommands(subscriptions: vscode.Disposable[]): void {
        // 第三个应该是this把
        subscriptions.push(
            vscode.commands.registerTextEditorCommand(`${APPNAME}.delete`, this.endRunner.delete, this.endRunner),
            vscode.commands.registerTextEditorCommand('${APPNAME}.highlight', this.endRunner.highlight, this.endRunner)
        )
    }

    private registerEventListeners(): void {
        let disposables: vscode.Disposable[] = []
        if (this.settings.liveMatching) {
            disposables.push(
                // 切换ActiveTextEditor
                vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
                    if (editor !== undefined) {
                        this.logger.log(`onDidChangeActiveTextEditor event called - ${editor.document.fileName}`);
                        this.endRunner.highlight(editor);
                    }
                }),
                // 修改TextDocument
                vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
                    // 这个什么意思？
                    if (vscode.window.activeTextEditor !== undefined && vscode.window.activeTextEditor.document == event.document) {
                        this.logger.log(`onDidChangeTextDocument event called - ${event.document.fileName}`);
                        this.endRunner.highlight(vscode.window.activeTextEditor);
                    }
                }),
                // 打开Document
                vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
                    // 这个if是什么意思？
                    if (vscode.window.activeTextEditor !== undefined && vscode.window.activeTextEditor.document == document) {
                        this.logger.log(`onDidOpenTextDocument event called - ${document.fileName}`);
                        this.endRunner.highlight(vscode.window.activeTextEditor);
                    }
                })
            );

            disposables.push(
                vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {
                    let editor: vscode.TextEditor = event.textEditor;
                    this.logger.log(`onDidChangeTextEditorSelection event called - ${editor.document.fileName}`);
                    this.endRunner.highlight(editor);
                })
            );

            
        }

        if (this.settings.trimOnSave) {
            disposables.push(
                // 保存TextDocument
                vscode.workspace.onWillSaveTextDocument((event: vscode.TextDocumentWillSaveEvent) => {
                    this.logger.log(`onWillSaveTextDocument event called - ${event.document.fileName}`);
                    vscode.window.visibleTextEditors.forEach((editor: vscode.TextEditor) => {
                        if (event.document.uri === editor.document.uri) {
                            // 这个什么意思？
                            // 为什么要Promise.resolve?
                            event.waitUntil(Promise.resolve(this.endRunner.getEditsForDeletingTralingSpaces(editor.document)));
                        }
                    });
                })
            );
        }
        this.listenerDisposables = disposables;
    }

    private highlightActiveEditors(): void {
        if (this.settings.liveMatching) {
            vscode.window.visibleTextEditors.forEach((editor: vscode.TextEditor) => {
                this.endRunner.highlight(editor);
            });
            this.logger.info("All visible text editors highlighted");
        }
    }
    public dispose(): void {
        if (this.listenerDisposables !== undefined) {
            this.listenerDisposables.forEach(disposable => {
                disposable.dispose();
            })
        }
    }
}