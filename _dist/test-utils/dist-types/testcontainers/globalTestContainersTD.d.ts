import { StartedDockerComposeEnvironment } from 'testcontainers';
import { ComposeDownOptions } from 'testcontainers/build/container-runtime';
export declare const initDockerCompose: (_services?: Array<string>, _composeFilePath?: string, _composeFile?: string, _startupTimeout?: number) => () => Promise<StartedDockerComposeEnvironment>;
export declare const closeDockerCompose: (_options?: Partial<ComposeDownOptions>) => () => Promise<void>;
