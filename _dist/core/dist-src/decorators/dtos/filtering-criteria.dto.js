var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsArray, IsOptional } from '@nestjs/class-validator';
import { FilterRule } from '../filtering.decorator';
export class FilteringCriteriaDto {
}
__decorate([
    IsString(),
    ApiProperty({ example: 'name', description: 'The property to filter by.' }),
    __metadata("design:type", String)
], FilteringCriteriaDto.prototype, "property", void 0);
__decorate([
    IsEnum(FilterRule),
    ApiProperty({
        example: FilterRule.GREATER_THAN,
        enum: FilterRule,
        description: 'The filtering rule to apply.',
    }),
    __metadata("design:type", String)
], FilteringCriteriaDto.prototype, "rule", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    IsOptional(),
    ApiProperty({
        example: ['morty'],
        description: 'The value(s) for the filtering criterion.',
        type: [String],
    }),
    __metadata("design:type", Array)
], FilteringCriteriaDto.prototype, "values", void 0);
