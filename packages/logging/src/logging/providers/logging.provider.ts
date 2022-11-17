import { Provider } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

import { LoggingService } from '../services/logging.service';
import { LoggingModuleOptions } from '../interfaces/logging.interface';
import { LOGGING_MODULE_OPTIONS, LOGGING_MODULE_PROVIDER } from '../constants/logging.constant';

export const createLogging = (): Provider => ({
  provide: LOGGING_MODULE_PROVIDER,
  useFactory: async (loggingOpts?: LoggingModuleOptions) => {
    // Formate de text
    const textFormat = format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    });

    // Formato de fecha
    const dateFormat = format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    });

    return new LoggingService(
      createLogger({
        level: 'info',
        format: format.combine(
          format.label({ label: 'right meow!' }),
          dateFormat,
          textFormat,
          format.colorize(),
        ), //format.json(), format.prettyPrint()
        transports: [new transports.Console()], //, new transports.File({ filename: 'logfile.log' })
        ...loggingOpts,
      }),
    );
  },
  inject: [LOGGING_MODULE_OPTIONS],
});
