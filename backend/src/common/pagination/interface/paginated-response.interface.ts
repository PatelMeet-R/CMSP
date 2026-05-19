export interface PaginationMetaFormat {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hashNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMetaFormat;
}
