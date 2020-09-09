'use strict';

import { window, OutputChannel } from 'vscode';

// LogLevel的值是多少呢？
export enum LogLevel {
    none,
    error,
    warn,
    info,
    log
}

/**
 * 为什么要独立搞一个logger呢？
 */
export interface ILogger {
    setLogLevel(level: LogLevel): void;
    setPrefix(prefix: string): void;
    error(message: string): void;
    warn(message: string): void;
    log(message: string): void;
    info(message: string): void;
}


/**
 * 就是一个非常简单的logger
 */
export class Logger implements ILogger {

    // 静态变量？
    private level!: LogLevel; // !是什么语法？
    private prefix!: string;
    private channel: OutputChannel;

    public constructor(prefix?: string, level?: LogLevel) {
        this.prefix = prefix || 'LOGGER';
        this.level = level || LogLevel.error;
        this.channel = window.createOutputChannel(prefix);
    }



    public setPrefix(prefix: string): void {
        this.prefix = prefix;
    }

    public setLogLevel(level: LogLevel): void {
        this.level = level;
    }

    public log(message: string): void {
        if (this.level >= LogLevel.log) {
            console.log(`${this.prefix} - ${LogLevel[LogLevel.log]} - ${message}`);
            this.channel.appendLine(`${this.prefix} - ${LogLevel[LogLevel.log]} - ${message}`);
        }
    }

    public info(message: string): void {
        if (this.level >= LogLevel.info) {
            console.info(`${this.prefix} - ${LogLevel[LogLevel.info]} - ${message}`);
            this.channel.appendLine(`${this.prefix} - ${LogLevel[LogLevel.log]} - ${message}`);
        }
    }

    public warn(message: string): void {
        if (this.level >= LogLevel.warn) {
            console.warn(`${this.prefix} - ${LogLevel[LogLevel.warn]} - ${message}`);
            this.channel.appendLine(`${this.prefix} - ${LogLevel[LogLevel.log]} - ${message}`);
        }
    }

    public error(message: string): void {
        if (this.level >= LogLevel.error) {
            console.error(`${this.prefix} - ${LogLevel[LogLevel.error]} - ${message}`);
            this.channel.appendLine(`${this.prefix} - ${LogLevel[LogLevel.log]} - ${message}`);
            window.showErrorMessage(message);
        }
    }
}
