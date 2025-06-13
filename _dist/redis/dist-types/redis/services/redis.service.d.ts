import { RedisClientType } from 'redis';
export declare class RedisService {
    private readonly redisClient;
    constructor(redisClient: RedisClientType);
    get clientRef(): RedisClientType;
    /**
     * @Descripción: Return echo message
     * @Param msg {string}
     * @return: String
     */
    echo(msg: string): Promise<string>;
    /**
     * @Descripción: Return if exist key in Redis
     * @Param key {string}
     * @return: true | false
     */
    exists(key: string): Promise<boolean>;
    /**
     * @Descripción: Save value in Redis
     * @Param key {string}
     * @Param value {any}
     * @Param seconds {number} expire data
     * @return: OK
     */
    set(key: string, value: any, seconds?: number): Promise<any>;
    /**
     * @Descripción: Get value of Redis by key
     * @param key {string}
     * @return:
     */
    get(key: string): Promise<any>;
    /**
     * @Descripción: Delete data of Redis by key
     * @param key {string}
     * @return: true | false
     */
    del(key: string): Promise<boolean>;
    /**
     * @Descripción: Copy value in new key
     * @param source {string}
     * @param destination {string}
     * @return: true | false
     */
    copy(source: string, destination: string): Promise<boolean>;
    /**
     * @Descripción: Rename key
     * @param key {string}
     * @param newKey {string}
     * @return: OK
     */
    rename(key: string, newKey: string): Promise<string>;
    /**
     * @Descripción: Delete all Redis
     * @return: OK
     */
    flushAll(): Promise<string>;
}
