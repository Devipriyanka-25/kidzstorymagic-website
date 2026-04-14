// Backend Logging Utility
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const LOG_DIR = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const getTimestamp = () => new Date().toISOString();

const getLogFile = (level) => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `${level.toLowerCase()}-${date}.log`);
};

const formatLogMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
};

class Logger {
  static log(level, message, data = null) {
    const logMessage = formatLogMessage(level, message, data);
    const logFile = getLogFile(level);

    // Write to file in production
    if (config.app.environment === 'production') {
      fs.appendFileSync(logFile, logMessage + '\n');
    }

    // Always log to console in development
    if (config.app.environment === 'development') {
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(logMessage);
          break;
        case LOG_LEVELS.WARN:
          console.warn(logMessage);
          break;
        case LOG_LEVELS.DEBUG:
          console.debug(logMessage);
          break;
        default:
          console.log(logMessage);
      }
    }
  }

  static error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  static warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  static info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  static debug(message, data = null) {
    if (config.app.environment === 'development') {
      this.log(LOG_LEVELS.DEBUG, message, data);
    }
  }
}

module.exports = Logger;
