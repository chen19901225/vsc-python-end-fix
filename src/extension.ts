'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function newEndAction(
    textEditor: vscode.TextEditor,
    edit: vscode.TextEditorEdit,
    args: any[]
) {
    const position = textEditor.selection.active;
    console.log("python-end-fix", "position:", position, '[end');
    const origin_line = textEditor.document.lineAt(position.line);
    console.log("python-end-fix","origin_line:", origin_line.text, '[end');
    const prefix = origin_line.text.substring(0, position.character);
    const suffix = ('1'+origin_line.text.substring(position.character)).trim().substr(1);
    const formated_line = prefix + suffix;
    var new_position = new vscode.Position(position.line, origin_line.text.length);

    if (formated_line === origin_line.text) {
        
    }else {
        //edit: vscode.TextEditorEdit,
        const range = new vscode.Range(new vscode.Position(position.line, 0),
        new_position);
        edit.replace(range, formated_line);
        new_position = new vscode.Position(position.line, formated_line.length);
    }
    var newSelection = new vscode.Selection(new_position, new_position);
    textEditor.selection = newSelection;


}

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log("python-end-fix",'Congratulations, your extension "python-end-fix" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerTextEditorCommand('python-end-fix.new-end', newEndAction);
    let selectCurrentLineDiposable = vscode.commands.registerTextEditorCommand("python-end-fix.select-current-line", (textEditor, edit) => {
        const editor = vscode.window.activeTextEditor;
        const position = editor.selection.active;
        const currentLine = editor.document.lineAt(position.line);


        // var newPosition = position.with(position.line, currentLine.firstNonWhitespaceCharacterIndex);
        let newPosition= new vscode.Position(position.line, currentLine.firstNonWhitespaceCharacterIndex)
        var newSelection = new vscode.Selection(newPosition, new vscode.Position(position.line, currentLine.range.end.character));
        editor.selection = newSelection;
    })
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}