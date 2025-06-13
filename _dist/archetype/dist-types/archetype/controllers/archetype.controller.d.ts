import { ArchetypeService } from '../services/archetype.service';
export declare class ArchetypeController {
    private readonly archetypeService;
    constructor(archetypeService: ArchetypeService);
    getArchetypeInfo(): Promise<{
        appStage: import("@tresdoce-nestjs-toolkit/core/src/typings").TAppStage;
        apiPrefix: string;
        name: string;
        version: string;
        description: string;
        author: import("@tresdoce-nestjs-toolkit/core/src/typings").IProjectConfigAuthor;
        repository: import("@tresdoce-nestjs-toolkit/core/src/typings").IProjectConfigRepository;
        homepage: string;
        dependencies: Partial<any>;
        devDependencies: Partial<any>;
        archetypeVersion: any;
    }>;
}
