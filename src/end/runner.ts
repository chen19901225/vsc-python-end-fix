import { Logger } from "./logger";
import { Settings } from "./settings";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path"

export class EndRunner {

    constructor(public logger: Logger, public settings: Settings) {

    }

    public highlight(editor: vscode.TextEditor, editorEdit: vscode.TextEditorEdit | undefined = undefined): void {
        this.highlightTrailingSpaces(editor);
    }

    public delete(editor: vscode.TextEditor, editorEdit: vscode.TextEditorEdit): void {
        this.deleteTrailingSpaces(editor, editorEdit)
    }

    public deleteModifiedLinesOnly(editor: vscode.TextEditor, editorEdit: vscode.TextEditorEdit): void {
        this.deleteTrailingSpaces(editor, editorEdit, true);
    }

    /**
     * Highlights the trailing spaces in the current editor.
     *
     * @private
     * @param {vscode.TextEditor} editor The editor in which the spaces have to be highlighted
     */
    private highlightTrailingSpaces(editor: vscode.TextEditor): void {
        editor.setDecorations(this.settings.textEditorDecorationType, this.getRangesToHighlight(editor.document, editor.selection));
    }

    /**
     * Deletes the trailing spaces in the current editor.
     *
     * @private
     * @param {vscode.TextEditor} editor The editor in which the spaces have to be deleted
     * @param {vscode.TextEditorEdit} editBuilder The edit builders for apply deletions
     * @param {boolean} deleteModifiedLinesOnlyOverride Whether to only deleted modified lines regardless of the settings
     */
    private deleteTrailingSpaces(editor: vscode.TextEditor, editBuilder: vscode.TextEditorEdit, deleteModifiedLinesOnlyOverride: boolean = false): void {
        let ranges: vscode.Range[] = this.getRangesToDelete(editor.document, deleteModifiedLinesOnlyOverride);
        for (let i: number = ranges.length - 1; i >= 0; i--) {
            editBuilder.delete(ranges[i]);
        }
        this.showStatusBarMessage(editor.document, ranges.length, true)
    }

    /**
     * Returns the edits required to delete the trailings spaces from a document
     *
     * @param {vscode.TextDocument} document The document in which the trailing spaces should be found
     * @returns {vscode.TextEdit[]} An array of edits required to delete the trailings spaces from the document
     */
    public getEditsForDeletingTralingSpaces(document: vscode.TextDocument): vscode.TextEdit[] {
        let ranges: vscode.Range[] = this.getRangesToDelete(document);
        let edits: vscode.TextEdit[] = new Array<vscode.TextEdit>(ranges.length);
        for (let i: number = ranges.length - 1; i >= 0; i--) {
            edits[ranges.length - 1 - i] = vscode.TextEdit.delete(ranges[i]);
        }
        this.showStatusBarMessage(document, ranges.length);
        return edits;
    }

    private getRangesToDelete(document: vscode.TextDocument, deleteModifiedLinesOnlyOverride: boolean = false): vscode.Range[] {
        let ranges: vscode.Range[] = this.findTrailingSpaces(document);

        // If deleteModifiedLinesOnly is set, filter out the ranges contained in the non-modified lines
        // 多了一层filter,但是如果是我自己做的话，这个不需要的呀
        
        return ranges;
    }
    /**
     * Displays a status bar message containing the number of trailing space regions deleted
     *
     * @private
     * @param {vscode.TextDocument} document The document for which the message has to be shown
     * @param {number} numRegions Number of trailing space regions found
     * @param {boolean} showIfNoRegions Should the message be shown even if no regions are founds
     */
    private showStatusBarMessage(document: vscode.TextDocument, numRegions: number, showIfNoRegions: boolean = false): void {
        let message: string;
        if (numRegions > 0) {
            message = `Deleting ${numRegions} trailing space region${(numRegions > 1 ? "s" : "")}`;
        } else {
            message = "No trailing spaces to delete!";
        }
        this.logger.info(message + " - " + document.fileName);
        if (this.settings.showStatusBarMessage) {
            if (numRegions > 0 || showIfNoRegions) {
                vscode.window.setStatusBarMessage(message, 3000);
            }
        }
    }

    /**
     * Gets trailing spaces ranges which have to be highlighted.
     *
     * @private
     * @param {vscode.TextDocument} document The document in which the trailing spaces should be found
     * @param {vscode.Selection} selection The current selection inside the editor
     * @returns {vscode.Range[]} An array of ranges containing the trailing spaces
     */
    private getRangesToHighlight(document: vscode.TextDocument, selection: vscode.Selection): vscode.Range[] {

        let ranges: vscode.Range[] = this.findTrailingSpaces(document);

        // 没有看懂

        return ranges;
    }

    

    /**
     * Finds all ranges in the document which contain trailing spaces
     *
     * @private
     * @param {vscode.TextDocument} document The document in which the trailing spaces should be found
     * @returns {vscode.Range[]} An array of ranges containing the trailing spaces
     */
    private findTrailingSpaces(document: vscode.TextDocument): vscode.Range[] {
        // 判断该文件是不是应该忽略
        if (!this.isAllowedDocument(document)) {
            this.logger.info(`File with langauge '${document.languageId}' and scheme '${document.uri.scheme}' ignored - ${document.fileName}`);
            return [];
        } else {
            let offendingRanges: vscode.Range[] = [];
            let regexp: string = "(" + this.settings.regexp + ")$"; // 原来是加了()$
            let noEmptyLinesRegexp: string = "\\S" + regexp; // 不是空行的regex
            let offendingRangesRegexp: RegExp = new RegExp(this.settings.includeEmptyLines ? regexp : noEmptyLinesRegexp, "gm");
            //let offendingRangesRegexp: RegExp = new RegExp(noEmptyLinesRegexp, "gm");
            let documentText: string = document.getText();

            let match: RegExpExecArray | null;
            // Loop through all the trailing spaces in the document
            // 不分割的吗？
            while ((match = offendingRangesRegexp.exec(documentText)) !== null) {
                /**
                 * 见到match[1].length是什么意思？
                 */
                let matchStart: number = (match.index + match[0].length - match[1].length),
                    matchEnd: number = match.index + match[0].length;
                let matchRange: vscode.Range = new vscode.Range(document.positionAt(matchStart), document.positionAt(matchEnd));
                // Ignore ranges which are empty (only containing a single line ending)
                if (!matchRange.isEmpty) { // 忽略空的Range?
                    offendingRanges.push(matchRange);
                }
            }
            return offendingRanges;
        }
    }

    private isAllowedDocument(document: vscode.TextDocument): boolean {
        let document_path = document.uri.path;
        let ext = path.extname(document_path)
        return this.settings.extListAllowed.indexOf(ext) > -1;
    }
}