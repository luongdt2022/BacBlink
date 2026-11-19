import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(
  ({ level, message, timestamp: ts, context, stack }) => {
    const ctx = context ? ` [${context as string}]` : '';
    const trace = stack ? `\n${stack as string}` : '';
    return `${ts as string} ${level}${ctx}: ${message as string}${trace}`;
  },
);

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat,
      ),
      transports: [
        new transports.Console({
          format: combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat,
          ),
        }),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new transports.File({
          filename: 'logs/app.log',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, stack: trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
