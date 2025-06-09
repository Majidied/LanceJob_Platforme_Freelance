/**
 * Logger Utility
 * 
 * Simple logging utility for the backend application.
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logDir = process.env.LOG_DIR || 'logs';
    
    // Create log directory if it doesn't exist
    if (this.logToFile) {
      const logPath = path.join(process.cwd(), this.logDir);
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
      }
    }
  }

  _getTimestamp() {
    return new Date().toISOString();
  }

  _formatMessage(level, message, extra = null) {
    const timestamp = this._getTimestamp();
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (extra) {
      if (typeof extra === 'object') {
        formatted += '\n' + JSON.stringify(extra, null, 2);
      } else {
        formatted += ` ${extra}`;
      }
    }
    
    return formatted;
  }

  _writeToFile(level, formattedMessage) {
    if (!this.logToFile) return;
    
    try {
      const logFile = path.join(process.cwd(), this.logDir, `${level}.log`);
      fs.appendFileSync(logFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  _shouldLog(level) {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    
    return levels[level] <= levels[this.logLevel];
  }

  error(message, extra = null) {
    if (!this._shouldLog('error')) return;
    
    const formatted = this._formatMessage('error', message, extra);
    console.error(formatted);
    this._writeToFile('error', formatted);
  }

  warn(message, extra = null) {
    if (!this._shouldLog('warn')) return;
    
    const formatted = this._formatMessage('warn', message, extra);
    console.warn(formatted);
    this._writeToFile('warn', formatted);
  }

  info(message, extra = null) {
    if (!this._shouldLog('info')) return;
    
    const formatted = this._formatMessage('info', message, extra);
    console.log(formatted);
    this._writeToFile('info', formatted);
  }

  debug(message, extra = null) {
    if (!this._shouldLog('debug')) return;
    
    const formatted = this._formatMessage('debug', message, extra);
    console.log(formatted);
    this._writeToFile('debug', formatted);
  }
}

module.exports = new Logger();
