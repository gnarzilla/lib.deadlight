// core/src/logging/logger.js

export class Logger {
  constructor(context = {}, options = {}) {
    this.context = context;
    this.options = {
      level: options.level || 'info',
      timestamp: options.timestamp !== false,
      colorize: options.colorize !== false,
      ...options
    };
  }

  child(childContext) {
    return new Logger(
      { ...this.context, ...childContext },
      this.options
    );
  }

  log(level, message, data = {}) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.options.level] || 1;

    if (levels[level] < currentLevel) return;

    const logEntry = {
      timestamp: this.options.timestamp ? new Date().toISOString() : undefined,
      level,
      message,
      ...this.context,
      ...data
    };

    Object.keys(logEntry).forEach(key => {
      if (logEntry[key] === undefined) delete logEntry[key];
    });

    if (this.options.colorize && typeof console !== 'undefined') {
      this.colorizedOutput(level, logEntry);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  colorizedOutput(level, entry) {
    const colors = {
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };

    const color = colors[level] || colors.reset;
    const timestamp = entry.timestamp ? `[${entry.timestamp}] ` : '';

    console.log(
      `${color}${timestamp}${level.toUpperCase()}${colors.reset}: ${entry.message}`,
      Object.keys(entry).length > 3 ? entry : ''
    );
  }

  debug(message, data = {}) { this.log('debug', message, data); }
  info(message, data = {}) { this.log('info', message, data); }
  warn(message, data = {}) { this.log('warn', message, data); }
  error(message, data = {}) { this.log('error', message, data); }
}