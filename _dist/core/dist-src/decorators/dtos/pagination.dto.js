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
import { Type } from '@nestjs/class-transformer';
import { IsOptional, IsPositive, Max, IsInt } from '@nestjs/class-validator';
import { DEFAULT_PAGE, DEFAULT_SIZE, MAX_SIZE } from '../constants/pagination.constant';
export class PaginationParamsDto {
    constructor() {
        this.page = DEFAULT_PAGE;
        this.size = DEFAULT_SIZE;
    }
}
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'The page parameter is invalid. It must be an integer' }),
    IsPositive({ message: 'The page parameter is invalid. It must be a positive' }),
    ApiProperty({
        name: 'page',
        description: 'The current page number',
        default: DEFAULT_PAGE,
        minimum: 1,
        example: 1,
        required: false,
        type: Number,
    }),
    __metadata("design:type", Number)
], PaginationParamsDto.prototype, "page", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'The size parameter is invalid. It must be an integer' }),
    IsPositive({ message: 'The size parameter is invalid. It must be a positive' }),
    Max(MAX_SIZE, {
        message: `The size parameter is invalid. It must be a positive integer and cannot be more than ${MAX_SIZE}`,
    }),
    ApiProperty({
        name: 'size',
        description: 'The number of items per page',
        default: DEFAULT_SIZE,
        maximum: MAX_SIZE,
        example: 10,
        required: false,
        type: Number,
    }),
    __metadata("design:type", Number)
], PaginationParamsDto.prototype, "size", void 0);
