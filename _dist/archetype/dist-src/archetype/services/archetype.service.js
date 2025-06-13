var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from '@nestjs/common';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import { CONFIG_OPTIONS } from '../constants/archetype.constants';
let ArchetypeService = class ArchetypeService {
    constructor(configService) {
        this.configService = configService;
    }
    async readFile(pathSegment, filename) {
        const file = path.resolve(pathSegment, filename);
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    async getArchetypeVersion() {
        const { version } = await this.readFile(__dirname, '../package.json');
        return {
            archetypeVersion: version,
        };
    }
    async getApplicationInfo() {
        const { project: { apiPrefix, name, version, description, author, repository, homepage }, server: { appStage }, } = this.configService;
        const { dependencies, devDependencies } = await this.readFile(process.cwd(), './package.json');
        const dependenciesList = _.pickBy(dependencies, (_value, _key) => _key.startsWith('@tresdoce-nestjs-toolkit') || _key.startsWith('@nestjs'));
        const devDependenciesList = _.pickBy(devDependencies, (_value, _key) => _key.startsWith('@tresdoce-nestjs-toolkit') || _key.startsWith('@nestjs'));
        return {
            appStage,
            apiPrefix,
            name,
            version,
            description,
            author,
            repository,
            homepage,
            dependencies: dependenciesList,
            devDependencies: devDependenciesList,
        };
    }
    async generateManifest() {
        return {
            ...(await this.getArchetypeVersion()),
            ...(await this.getApplicationInfo()),
        };
    }
};
ArchetypeService = __decorate([
    Injectable(),
    __param(0, Inject(CONFIG_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], ArchetypeService);
export { ArchetypeService };
