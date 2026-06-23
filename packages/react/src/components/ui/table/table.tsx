import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * TableProps
 *
 * Props for the Table component.
 */
interface TableProps extends React.ComponentProps<'table'> {}

/**
 * Table
 *
 * A semantic data table — header, body, optional footer, and rows of cells.
 * Renders inside a horizontally-scrollable wrapper so wide tables stay usable
 * on narrow viewports without forcing a page-level scrollbar. Compose with the
 * sub-components: `TableHeader` / `TableBody` / `TableFooter` wrap `TableRow`s,
 * which hold `TableHead` (column header) or `TableCell` (data) cells.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Invoice</TableHead>
 *       <TableHead>Amount</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>INV001</TableCell>
 *       <TableCell>$250.00</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
function Table({ className, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="nx:w-full nx:overflow-x-auto">
      <table
        data-slot="table"
        className={cn(
          'nx:w-full nx:caption-bottom nx:typography-body-default',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * TableHeaderProps
 *
 * Props for the TableHeader component.
 */
interface TableHeaderProps extends React.ComponentProps<'thead'> {}

/**
 * TableHeader
 *
 * The `<thead>` grouping for column-header rows.
 */
function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn('nx:[&_tr]:border-b', className)}
      {...props}
    />
  );
}

/**
 * TableBodyProps
 *
 * Props for the TableBody component.
 */
interface TableBodyProps extends React.ComponentProps<'tbody'> {}

/**
 * TableBody
 *
 * The `<tbody>` grouping for data rows. The last row drops its bottom border so
 * the body doesn't draw a rule against a following footer or the table edge.
 */
function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('nx:[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

/**
 * TableFooterProps
 *
 * Props for the TableFooter component.
 */
interface TableFooterProps extends React.ComponentProps<'tfoot'> {}

/**
 * TableFooter
 *
 * The `<tfoot>` grouping for a summary/totals row — a muted fill and medium
 * weight set it apart from the data rows above.
 */
function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'nx:border-t nx:border-border-default nx:bg-muted nx:typography-label-default nx:[&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * TableRowProps
 *
 * Props for the TableRow component.
 */
interface TableRowProps extends React.ComponentProps<'tr'> {}

/**
 * TableRow
 *
 * A table row. Highlights on hover and when selected — set
 * `data-state="selected"` to mark a row as part of the current selection.
 */
function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'nx:border-b nx:border-border-default nx:transition-colors nx:hover:bg-background-hover nx:data-[state=selected]:bg-control-background nx:data-[state=selected]:hover:bg-control-background-hover',
        className
      )}
      {...props}
    />
  );
}

/**
 * TableHeadProps
 *
 * Props for the TableHead component.
 */
interface TableHeadProps extends React.ComponentProps<'th'> {}

/**
 * TableHead
 *
 * A column-header cell (`<th>`). Rendered in muted foreground to sit quietly
 * above the data it labels.
 */
function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'nx:px-2 nx:py-2.5 nx:text-left nx:align-middle nx:typography-label-default nx:whitespace-nowrap nx:text-muted-foreground nx:has-[[role=checkbox]]:pr-0 nx:*:[[role=checkbox]]:translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}

/**
 * TableCellProps
 *
 * Props for the TableCell component.
 */
interface TableCellProps extends React.ComponentProps<'td'> {}

/**
 * TableCell
 *
 * A data cell (`<td>`).
 */
function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'nx:p-2 nx:align-middle nx:whitespace-nowrap nx:has-[[role=checkbox]]:pr-0 nx:*:[[role=checkbox]]:translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}

/**
 * TableCaptionProps
 *
 * Props for the TableCaption component.
 */
interface TableCaptionProps extends React.ComponentProps<'caption'> {}

/**
 * TableCaption
 *
 * A caption describing the table. Rendered below the table (`caption-bottom`).
 */
function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        'nx:mt-4 nx:typography-body-small nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  type TableBodyProps,
  TableCaption,
  type TableCaptionProps,
  TableCell,
  type TableCellProps,
  TableFooter,
  type TableFooterProps,
  TableHead,
  TableHeader,
  type TableHeaderProps,
  type TableHeadProps,
  type TableProps,
  TableRow,
  type TableRowProps,
};
