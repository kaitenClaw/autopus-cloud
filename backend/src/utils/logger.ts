import { socketService } from '../services/socket.service';
import { randomUUID } from 'crypto';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  source?: string;
  userId?: string;
}

export const logger = {
  log: (level: LogLevel, message: string, options: LogOptions = {}) => {
    const { source = 'System', userId } = options;
    const timestamp = new Date().toISOString();
    const id = randomUUID();

    const logEntry = {
      id,
      timestamp,
      level,
      message,
      source
    };

    // Console output
    const consoleMethod = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log';
    console[consoleMethod](`[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`);

    // Emit via Socket.io
    if (userId) {
      // In the future, emit to specific user's room
      socketService.emit('log', logEntry);
    } else {
      // Global broadcast for system-wide logs
      socketService.emit('log', logEntry);
    }
  },

  info: (message: string, options?: LogOptions) => logger.log('info', message, options),
  warn: (message: string, options?: LogOptions) => logger.log('warn', message, options),
  error: (message: string, options?: LogOptions) => logger.log('error', message, options),
  debug: (message: string, options?: LogOptions) => logger.log('debug', message, options),
};
