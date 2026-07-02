import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus_ds/react';
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

import { DataPager } from './data-pager';
import { FilterInput } from './filter-input';

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
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  /** Column id to wire the toolbar search box to (omit to hide the box). */
  filterColumn?: string;
  filterPlaceholder?: string;
  /** Rows per page (default 10). */
  pageSize?: number;
}

export function DataTable<TData>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  pageSize = 10,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
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
  // The select column is opt-in (domain-supplied), so only summarise selection
  // when a consumer actually wires one — otherwise show a plain row count.
  const enableSelection = columns.some((column) => column.id === 'select');

  return (
    <div className="nx:space-y-4">
      {filterControl && (
        <FilterInput
          value={(filterControl.getFilterValue() as string) ?? ''}
          onChange={(value) => filterControl.setFilterValue(value)}
          placeholder={filterPlaceholder}
        />
      )}

      <div className="nx:border-border-default nx:overflow-hidden nx:rounded-md nx:border-default">
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

      <DataPager
        page={pageIndex}
        pageCount={Math.max(table.getPageCount(), 1)}
        total={totalCount}
        summary={
          enableSelection
            ? `${selectedCount} of ${totalCount} row(s) selected.`
            : undefined
        }
        onPrev={() => table.previousPage()}
        onNext={() => table.nextPage()}
      />
    </div>
  );
}
