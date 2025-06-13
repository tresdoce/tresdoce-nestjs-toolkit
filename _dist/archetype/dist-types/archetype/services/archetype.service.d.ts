import { Typings } from '@tresdoce-nestjs-toolkit/core';
export declare class ArchetypeService {
    private readonly configService;
    constructor(configService: Typings.AppConfig);
    readFile(pathSegment: string, filename: string): Promise<any>;
    getArchetypeVersion(): Promise<{
        archetypeVersion: any;
    }>;
    getApplicationInfo(): Promise<{
        appStage: Typings.TAppStage;
        apiPrefix: string;
        name: string;
        version: string;
        description: string;
        author: Typings.IProjectConfigAuthor;
        repository: Typings.IProjectConfigRepository;
        homepage: string;
        dependencies: Partial<any>;
        devDependencies: Partial<any>;
    }>;
    generateManifest(): Promise<{
        appStage: Typings.TAppStage;
        apiPrefix: string;
        name: string;
        version: string;
        description: string;
        author: Typings.IProjectConfigAuthor;
        repository: Typings.IProjectConfigRepository;
        homepage: string;
        dependencies: Partial<any>;
        devDependencies: Partial<any>;
        archetypeVersion: any;
    }>;
}
