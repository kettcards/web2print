
export interface Pageable<T> {
  content: T[];
  page: Page;
}

export interface PageRequest {
  currentPage: number;
  pageSize: number;
}

export interface Page extends PageRequest{
  totalPages: number;
  maxPageSize: number;
  totalElements: number;
}
