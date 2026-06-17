/**
 * Logger — Structured console logger with levels and timestamps
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
declare class Logger {
    private minLevel;
    constructor(minLevel?: LogLevel);
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, data?: Record<string, unknown>): void;
    private log;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map