import { LoggerService } from '@nestjs/common';
type Message = {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
    category: string;
    message: string;
};
export declare class LoggerProvider {
    private readonly logger;
    constructor(logger: LoggerService);
    log(message: Message): void;
}
export {};
