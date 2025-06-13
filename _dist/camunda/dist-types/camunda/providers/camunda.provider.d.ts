import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { ClientConfig } from 'camunda-external-task-client-js';
export declare class CamundaTaskConnector extends Server implements CustomTransportStrategy {
    private readonly clientConfig;
    private readonly client;
    constructor(clientConfig: ClientConfig);
    listen(callback: () => void): Promise<void>;
    close(): void;
    protected init(): void;
    on<EventKey extends string = string, EventCallback extends Function = Function>(event: EventKey, callback: EventCallback): any;
    unwrap<T>(): T;
}
