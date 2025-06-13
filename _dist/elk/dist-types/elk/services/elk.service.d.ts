import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatService, RedactService } from '@tresdoce-nestjs-toolkit/utils';
import { Client } from '@elastic/elasticsearch';
import { Request } from 'express';
import { ElasticsearchOptions } from '../interfaces/elk.interface';
export declare class ElkService {
    private readonly configService;
    private readonly formatService;
    private readonly redactService;
    private readonly options;
    private readonly elkClient;
    constructor(configService: ConfigService, formatService: FormatService, redactService: RedactService, options: ElasticsearchOptions, elkClient: Client);
    get clientRef(): Client;
    private generateIndexDocument;
    createIndexDocument(elkDocument: any, _suffix?: string): Promise<void>;
    serializeResponseInterceptor(_timeRequest: number, _context: ExecutionContext, _response: any, _isException: any): Promise<void>;
    responseException(_request: Request, _exception: any): {
        error: {
            status: number;
            instance: string;
            code: string;
            message: any;
            detail: any;
        };
    };
    private redactElkDocument;
}
