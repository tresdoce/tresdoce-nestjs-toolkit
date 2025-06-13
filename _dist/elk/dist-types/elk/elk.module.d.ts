import { DynamicModule, OnModuleDestroy } from '@nestjs/common';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { ElasticsearchOptions } from './interfaces/elk.interface';
export declare class ElkModule implements OnModuleDestroy {
    private readonly options;
    private readonly elkClient;
    constructor(options: ClientOptions, elkClient: Client);
    static register(options: ElasticsearchOptions): DynamicModule;
    onModuleDestroy(): Promise<void>;
}
