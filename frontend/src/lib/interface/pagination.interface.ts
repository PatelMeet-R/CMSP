export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface StandardResponse<T> {
  message?: string;
  data: T;
}

export interface SearchParams {
  limit: number;
  search?: string;
  semesterId?: string;
  branchId?: string;
  academicYearId?: string;
  page?: number;
}
