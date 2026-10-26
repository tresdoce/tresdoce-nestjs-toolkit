import type { LoggerService } from '@nestjs/common';

export type DynamooseLogMessage = {
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  category?: string;
  message: string;
};

export class LoggerProvider {
  constructor(private readonly logger: LoggerService) {}

  log(message: DynamooseLogMessage): void {
    const text = message.category ? `${message.category} - ${message.message}` : message.message;

    switch (message.level) {
      case 'fatal':
        return this.logger.fatal ? this.logger.fatal(text) : this.logger.error(text);
      case 'error':
        return this.logger.error(text);
      case 'warn':
        return this.logger.warn(text);
      case 'debug':
        return this.logger.debug ? this.logger.debug(text) : this.logger.log(text);
      case 'trace':
        return this.logger.verbose ? this.logger.verbose(text) : this.logger.log(text);
      default:
        return this.logger.log(text);
    }
  }
}
