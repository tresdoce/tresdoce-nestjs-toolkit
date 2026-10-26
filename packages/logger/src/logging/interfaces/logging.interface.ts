import { RedactOptions } from '@tresdoce-nestjs-toolkit/utils';
import { LevelWithSilent } from 'pino';

export type LoggingModuleLevel = LevelWithSilent;
export type LogType = 'DEFAULT' | 'REQUEST' | 'RESPONSE' | 'OUTGOING_REQUEST' | 'OUTGOING_RESPONSE';

export interface LoggerModuleOptions {
  level?: LoggingModuleLevel;
  redact?: RedactOptions;
  excludeContentType?: string[];
}
