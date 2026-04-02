import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import {
  PaginationMetaFormat,
  PaginatedResponse,
} from '../interface/paginated-response.interface';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationQueryDto,
): Promise<PaginatedResponse<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  // Apply pagination to the query
  queryBuilder.skip(skip).take(limit);

  // Execute the query
  const [items, totalItems] = await queryBuilder.getManyAndCount();
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    meta: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hashNextPage: page < totalPages,
    },
  };
}
