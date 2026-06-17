/**
 * Logger — Structured console logger with levels and timestamps
 */
const LEVEL_ORDER = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const LEVEL_COLORS = {
    debug: '\x1b[90m', // gray
    info: '\x1b[36m', // cyan
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';
class Logger {
    minLevel;
    constructor(minLevel) {
        const envLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
        this.minLevel = minLevel ?? (LEVEL_ORDER[envLevel] !== undefined ? envLevel : 'info');
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    error(message, data) {
        this.log('error', message, data);
    }
    log(level, message, data) {
        if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel])
            return;
        const ts = new Date().toISOString();
        const color = LEVEL_COLORS[level];
        const tag = level.toUpperCase().padEnd(5);
        const dataStr = data && Object.keys(data).length > 0
            ? ' ' + JSON.stringify(data)
            : '';
        const output = `${color}[${ts}] ${tag}${RESET} ${message}${dataStr}`;
        if (level === 'error') {
            console.error(output);
        }
        else if (level === 'warn') {
            console.warn(output);
        }
        else {
            console.log(output);
        }
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map