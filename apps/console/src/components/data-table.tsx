import { useState } from 'react';

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';

/**
 * Generic, app-level data table — the canonical recipe of headless
 * `@tanstack/react-table` wired over the Nexus `Table` primitives, with
 * client-side sorting, single-column filtering, row selection, and paging.
 * Domain modules supply the column definitions (where the cell/header JSX,
 * sort triggers, and selection checkboxes live); this stays data-agnostic so
 * every workspace module reuses it.
 *
 * Sort/filter/select/paginate only — column reorder/visibility/virtualization
 * stay out until a consumer actually needs them.
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Column id to wire the toolbar search box to (omit to hide the box). */
  filterColumn?: string;
  filterPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const filterControl = filterColumn
    ? table.getColumn(filterColumn)
    : undefined;

  return (
    <div className="nx:space-y-4">
      {filterControl && (
        <Input
          placeholder={filterPlaceholder ?? 'Filter…'}
          value={(filterControl.getFilterValue() as string) ?? ''}
          onChange={(e) => filterControl.setFilterValue(e.target.value)}
          aria-label={filterPlaceholder ?? 'Filter'}
          className="nx:max-w-xs"
        />
      )}

      <div className="nx:border-border-default nx:overflow-hidden nx:rounded-md nx:border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="nx:text-muted-foreground nx:h-24 nx:text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* App-local pager — the polished @nexus/react Pagination is tracked in #281. */}
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
        <p className="nx:text-muted-foreground nx:text-sm">
          {selectedCount} of {totalCount} row(s) selected.
        </p>
        <div className="nx:flex nx:items-center nx:gap-3">
          <span className="nx:text-muted-foreground nx:text-sm">
            Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
