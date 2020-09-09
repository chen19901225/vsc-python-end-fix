
import * as vscode from "vscode";
import { Logger, LogLevel } from "./logger";
import { APPNAME } from "./consts";

export class Settings {

    logLevel!: LogLevel;
    regexp!: string; // [ \t]+ 这个怎么匹配最后的东西呢？
    liveMatching!: boolean;
    deleteModifiedLinesOnly!: boolean;
    extListAllowed: string[];
    trimOnSave!: boolean;
    showStatusBarMessage!: boolean;
    textEditorDecorationType!: vscode.TextEditorDecorationType;

    constructor(public logger: Logger) {


        this.refreshSettings();
    }

    

    public refreshSettings(): void {
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(APPNAME);
        this.logLevel = LogLevel[config.get<keyof typeof LogLevel>('logLevel')]; // keyof typeof LogLevel?
        this.regexp = config.get<string>('regexp');
        this.liveMatching = config.get<boolean>('liveMatching');
        this.trimOnSave = config.get<boolean>('trimOnSave');
        this.extListAllowed = config.get<string[]>("extListAllowed") || [];
        this.showStatusBarMessage = config.get<boolean>('showStatusBarMessage');
        this.textEditorDecorationType = this.getTextEditorDecorationType(config.get<string>('backgroundColor'), config.get<string>('borderColor'));
        this.logger.setLogLevel(this.logLevel);
        this.logger.setPrefix('Trailing Spaces');
        this.logger.log('Configuration loaded');
    }

    public resetToDefaults(): void {
        // resetToDefaults应该不需要的把
        let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('trailing-spaces');
        config.update('logLevel', undefined, true);
        config.update('includeEmptyLines', undefined, true);
        config.update('highlightCurrentLine', undefined, true);
        config.update('regexp', undefined, true);
        config.update('liveMatching', undefined, true);
        config.update('deleteModifiedLinesOnly', undefined, true);
        config.update('syntaxIgnore', undefined, true);
        config.update('schemeIgnore', undefined, true);
        config.update('trimOnSave', undefined, true);
        config.update('showStatusBarMessage', undefined, true);
        config.update('backgroundColor', undefined, true);
        config.update('borderColor', undefined, true);
        this.refreshSettings();
    }

    private getMapFromStringArray(array: string[]): { [id: string]: boolean; } {
        let map: { [id: string]: boolean; } = {};
        // 好吧
        array.forEach((element: string) => {
            map[element] = true;
        });
        return map;
    }

    private getTextEditorDecorationType(backgroundColor: string, borderColor: string): vscode.TextEditorDecorationType {
        // 获取高亮
        return vscode.window.createTextEditorDecorationType({
            borderRadius: "3px",
            borderWidth: "1px",
            borderStyle: "solid",
            backgroundColor: backgroundColor,
            borderColor: borderColor
        });
    }
}
