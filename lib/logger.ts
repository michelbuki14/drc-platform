/**
 * Minimal structured logger.
 *
 * Logs to stdout as JSON when NODE_ENV=production (for log aggregation), and as
 * a readable line otherwise. No external deps. Use `logger.info({event:'x', ...})`.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const current = LEVELS[(process.env.LOG_LEVEL as Level) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')];

export const logger = {
  _emit(level: Level, msg: string, meta?: Record<string, any>) {
    if (LEVELS[level] < current) return;
    const entry = { ts: new Date().toISOString(), level, msg, ...(meta || {}) };
    const line = process.env.NODE_ENV === 'production' ? JSON.stringify(entry) : `${entry.ts} ${level.toUpperCase()} ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`;
    (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
  },
  debug(msg: string, meta?: Record<string, any>) { this._emit('debug', msg, meta); },
  info(msg: string, meta?: Record<string, any>) { this._emit('info', msg, meta); },
  warn(msg: string, meta?: Record<string, any>) { this._emit('warn', msg, meta); },
  error(msg: string, meta?: Record<string, any>) { this._emit('error', msg, meta); },
};
