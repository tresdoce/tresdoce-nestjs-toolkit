export declare class PaginationMetaData {
    page: number;
    size: number;
    total: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
}
export declare class PaginationResponse<TData> {
    data: TData[];
    meta: PaginationMetaData;
}
