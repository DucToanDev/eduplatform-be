import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

export function getPaginationSkip({ page, limit }: PaginationQueryDto): number {
  return (page - 1) * limit;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationQueryDto,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}
