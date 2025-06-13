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
import { IsString, IsIn } from '@nestjs/class-validator';
import { DEFAULT_SORT_DIRECTION } from '../constants/sorting.constant';
export class SortCriteriaDto {
    constructor() {
        this.order = DEFAULT_SORT_DIRECTION;
    }
}
__decorate([
    IsString(),
    ApiProperty({ description: 'The field name to sort by.' }),
    __metadata("design:type", String)
], SortCriteriaDto.prototype, "field", void 0);
__decorate([
    IsIn(['asc', 'desc']),
    ApiProperty({
        description: `The order of sorting, either 'asc' or 'desc'.`,
        enum: ['asc', 'desc'],
        default: DEFAULT_SORT_DIRECTION,
    }),
    __metadata("design:type", String)
], SortCriteriaDto.prototype, "order", void 0);
