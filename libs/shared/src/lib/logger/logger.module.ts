import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerService } from './logger.service';
import { LogLevel } from './logger.constants';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: () => {
        const nodeEnv = process.env['NODE_ENV'] ?? 'development';
        const logLevel = (process.env['LOG_LEVEL'] as LogLevel) ?? LogLevel.Info;
        const isDevelopment = nodeEnv !== 'production';

        return {
          pinoHttp: {
            level: logLevel,
            transport: isDevelopment
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                    messageFormat: '[{context}] {msg}',
                  },
                }
              : undefined,
            formatters: {
              level(label: string) {
                return { level: label };
              },
            },
            timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
            base: undefined,
          },
        };
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
