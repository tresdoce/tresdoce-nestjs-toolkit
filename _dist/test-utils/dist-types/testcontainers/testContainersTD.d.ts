import { StartedTestContainer, StopOptions } from 'testcontainers';
import { ITestContainerOptions, Env } from './types';
export default class TestContainersTD {
    private _image;
    private _options?;
    private _isSingleton;
    private static _instance?;
    private _container;
    constructor(_image?: string, _options?: ITestContainerOptions, _isSingleton?: boolean);
    /**
     * Get instance
     */
    static getInstance(_image?: string, _options?: ITestContainerOptions): TestContainersTD;
    private prepareContainer;
    /**
     * Started container
     */
    start(): Promise<void>;
    /**
     * Stop container
     * @param options optional stop options of test containers.
     */
    stop(options?: Partial<StopOptions>): Promise<void>;
    /**
     * Get envs
     */
    getEnvs(): Env;
    /**
     * Get container
     */
    getContainer(): StartedTestContainer;
    /**
     * Get host of container
     */
    getHost(): string;
    /**
     * Get container name
     */
    getName(): string;
    /**
     * Get mapped ports
     */
    getMappedPort(port: number): number;
}
