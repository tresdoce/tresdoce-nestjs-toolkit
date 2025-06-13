import { Snowflake, SnowFlakeOptions, SnowflakeParseResult } from '../interfaces/snowflake.interface';
export declare class SnowflakeService {
    private readonly options;
    private readonly EPOCH;
    private readonly workerId;
    private readonly processId;
    private readonly toString;
    private static lastTimestamp;
    private static sequence;
    constructor(options: SnowFlakeOptions);
    generate(date?: Date): string | bigint;
    isSnowflake(id: string | bigint): id is Snowflake;
    parse(snowflake: string | bigint): SnowflakeParseResult;
    private waitUntilNextMillis;
}
