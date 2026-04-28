import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly pino: PinoLogger) {}

  log(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.pino.assign({ context, ...meta });
    this.pino.info(message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.pino.assign({ context, trace });
    this.pino.error(message);
  }

  warn(message: string, context?: string): void {
    this.pino.assign({ context });
    this.pino.warn(message);
  }

  debug(message: string, context?: string): void {
    this.pino.assign({ context });
    this.pino.debug(message);
  }

  verbose(message: string, context?: string): void {
    this.pino.assign({ context });
    this.pino.trace(message);
  }
}
