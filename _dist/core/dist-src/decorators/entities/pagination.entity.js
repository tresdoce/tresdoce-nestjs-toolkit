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
export class PaginationMetaData {
}
__decorate([
    ApiProperty({
        required: true,
        description: 'The current page number in the pagination.',
        example: 1,
    }),
    __metadata("design:type", Number)
], PaginationMetaData.prototype, "page", void 0);
__decorate([
    ApiProperty({
        required: true,
        description: 'The number of items per page in the pagination.',
        example: 10,
    }),
    __metadata("design:type", Number)
], PaginationMetaData.prototype, "size", void 0);
__decorate([
    ApiProperty({
        required: true,
        description: 'The total number of items available.',
        example: 30,
    }),
    __metadata("design:type", Number)
], PaginationMetaData.prototype, "total", void 0);
__decorate([
    ApiProperty({
        required: false,
        description: 'The total number of pages in the pagination.',
        example: 3,
    }),
    __metadata("design:type", Number)
], PaginationMetaData.prototype, "totalPages", void 0);
__decorate([
    ApiProperty({
        required: false,
        description: 'Indicates whether there is a next page available.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PaginationMetaData.prototype, "hasNext", void 0);
__decorate([
    ApiProperty({
        required: false,
        description: 'Indicates whether there is a previous page available.',
        example: false,
    }),
    __metadata("design:type", Boolean)
], PaginationMetaData.prototype, "hasPrevious", void 0);
export class PaginationResponse {
}
__decorate([
    ApiProperty({
        description: 'Data containing the response.',
        required: true,
    }),
    __metadata("design:type", Array)
], PaginationResponse.prototype, "data", void 0);
__decorate([
    ApiProperty({
        description: 'Metadata for the response, including pagination information.',
        required: true,
    }),
    __metadata("design:type", PaginationMetaData)
], PaginationResponse.prototype, "meta", void 0);
