import { IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class PaginationQueryDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Expose()
    @Transform(({ value }) => value ? parseInt(value) : 1)
    page: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Expose()
    @Transform(({ value }) => value ? parseInt(value) : 10)
    limit: number = 10;

    @IsOptional()
    @IsString()
    @Expose()
    search?: string;

    @IsOptional()
    @IsString()
    @Expose()
    @Transform(({ value }) => value?.toLowerCase())
    sortOrder?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsString()
    @Expose()
    sortBy?: string;

    @IsOptional()
    @Expose()
    @Transform(({ value }) => {
        if (!value) return undefined;
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
            return undefined;
        }
    })
    filters?: Record<string, any>;
}

export class PaginatedResponseDto<T> {
    data: T[];    meta: {
        total: number;
        page: number;
        lastPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
