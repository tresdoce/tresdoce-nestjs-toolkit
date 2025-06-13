export declare const manifest: {
    appStage: string;
    archetypeVersion: string;
    apiPrefix: string;
    name: string;
    version: string;
    description: string;
    author: import("@tresdoce-nestjs-toolkit/core/src/typings").IProjectConfigAuthor;
    repository: import("@tresdoce-nestjs-toolkit/core/src/typings").IProjectConfigRepository;
    homepage: string;
    dependencies: {
        '@tresdoce-nestjs-toolkit/archetype': string;
        '@tresdoce-nestjs-toolkit/health': string;
        '@tresdoce-nestjs-toolkit/http-client': string;
        '@nestjs/class-transformer': string;
        '@nestjs/class-validator': string;
        '@nestjs/common': string;
        '@nestjs/config': string;
        '@nestjs/core': string;
        '@nestjs/platform-express': string;
        '@nestjs/swagger': string;
        'cross-env': string;
        'swagger-ui-express': string;
    };
    devDependencies: {
        '@tresdoce-nestjs-toolkit/commons': string;
        '@nestjs/cli': string;
        '@nestjs/schematics': string;
        '@nestjs/testing': string;
        husky: string;
        jest: string;
    };
};
