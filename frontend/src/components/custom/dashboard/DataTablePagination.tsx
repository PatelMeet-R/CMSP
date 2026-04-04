import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hashNextPage: boolean;
}

interface DataTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataTablePagination({
  meta,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm text-muted-foreground">
      {/* Left Side: Rows per page and Total count */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={meta.itemsPerPage.toString()}
            onValueChange={(val) => onLimitChange(parseInt(val, 10))}
          >
            <SelectTrigger className="w-17.5 h-8 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:block">
          Showing
          <span className="font-medium text-foreground">{meta.totalItems}</span>
          total records
        </div>
      </div>

      {/* Right Side: Page navigation */}
      <div className="flex items-center gap-4">
        <div>
          Page
          <span className="font-medium text-foreground">
            {meta.currentPage}
          </span>
          of {meta.totalPages}
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(meta.currentPage - 1)}
                disabled={!meta.hasPreviousPage}
              >
                <PaginationPrevious className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(meta.currentPage + 1)}
                disabled={!meta.hashNextPage}
              >
                <PaginationNext className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
