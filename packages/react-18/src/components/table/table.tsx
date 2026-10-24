'use client';

import * as React from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

type TableVariant = 'default' | 'borderless' | 'grid';
type TableDensity = 'comfortable' | 'compact';

interface TableContextValue {
  variant: TableVariant;
  density: TableDensity;
  stickyHeader: boolean;
}

const TableContext = React.createContext<TableContextValue>({
  variant: 'default',
  density: 'comfortable',
  stickyHeader: false,
});

function useTableContext() {
  return React.useContext(TableContext);
}

/**
 * Props for Table.
 */
interface TableProps extends React.ComponentProps<'table'> {
  /**
   * Lines inside the table.
   *
   * - `default`: row lines and a header underline.
   * - `borderless`: no lines.
   * - `grid`: row and column lines.
   */
  variant?: TableVariant;
  /**
   * Row height.
   *
   * - `comfortable`: about 44px rows.
   * - `compact`: about 36px rows, for dense data.
   */
  density?: TableDensity;
  /**
   * Keeps the header row in view while the body scrolls. Set a max height with
   * `containerClassName`, such as `"nx:max-h-96"`.
   */
  stickyHeader?: boolean;
  /**
   * Tints every other body row. Hover and selection colors win over the stripe.
   */
  striped?: boolean;
  /**
   * Classes for the scroll container, such as a max height. `className` goes on
   * the `<table>`.
   */
  containerClassName?: string;
}

/**
 * Data table with a header, body and optional footer. Wide tables scroll
 * sideways inside their own container. `TableRow`s hold `TableHead` or
 * `TableCell` cells.
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.PropsWithoutRef<TableProps>
>(function Table(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    density = 'comfortable',
    stickyHeader = false,
    striped = false,
    containerClassName,
    ...props
  }: React.PropsWithoutRef<TableProps> & {
    ref?: React.ForwardedRef<HTMLTableElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <TableContext.Provider value={{ variant, density, stickyHeader }}>
      <div
        data-slot="table-container"
        // A wide table overflows horizontally and holds no focusable children, so
        // the container itself must be keyboard-focusable to scroll into view
        // (axe scrollable-region-focusable / WCAG 2.1.1).
        tabIndex={0}
        className={cn(
          'nx:w-full nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:[outline-offset:-2px]',
          stickyHeader && 'nx:overflow-y-auto',
          containerClassName
        )}
      >
        <table
          data-slot="table"
          data-variant={variant}
          data-table-density={density}
          data-sticky-header={stickyHeader || undefined}
          data-striped={striped || undefined}
          className={cn(
            'nx:w-full nx:caption-bottom nx:border-collapse nx:typography-body-default nx:[&[data-striped]_tbody_tr:nth-child(even):not(:hover):not([data-state=selected])]:bg-muted nx:[&[data-striped]_tfoot]:border-t-default nx:[&[data-striped]_tfoot]:border-border-default-alpha',
            className
          )}
          {...props}
        />
      </div>
    </TableContext.Provider>
  );
});

/**
 * Props for TableHeader.
 */
type TableHeaderProps = React.ComponentProps<'thead'>;

/**
 * `<thead>` that holds the column-header rows.
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.PropsWithoutRef<TableHeaderProps>
>(function TableHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableHeaderProps> & {
    ref?: React.ForwardedRef<HTMLTableSectionElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return <thead data-slot="table-header" className={className} {...props} />;
});

/**
 * Props for TableBody.
 */
type TableBodyProps = React.ComponentProps<'tbody'>;

/**
 * `<tbody>` that holds the data rows.
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.PropsWithoutRef<TableBodyProps>
>(function TableBody(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableBodyProps> & {
    ref?: React.ForwardedRef<HTMLTableSectionElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <tbody
      data-slot="table-body"
      className={cn('nx:[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
});

/**
 * Props for TableFooter.
 */
type TableFooterProps = React.ComponentProps<'tfoot'>;

const tableFooterVariants = cva(
  'nx:bg-muted nx:typography-label-default nx:[&>tr]:last:border-b-0',
  {
    variants: {
      variant: {
        default: 'nx:border-t-default nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-t-default nx:border-border-default-alpha',
      } satisfies Record<TableVariant, string>,
    },
    defaultVariants: { variant: 'default' },
  }
);

/**
 * `<tfoot>` for a summary or totals row, on a muted fill.
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.PropsWithoutRef<TableFooterProps>
>(function TableFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableFooterProps> & {
    ref?: React.ForwardedRef<HTMLTableSectionElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { variant } = useTableContext();
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(tableFooterVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * Props for TableRow.
 */
type TableRowProps = React.ComponentProps<'tr'>;

const tableRowVariants = cva(
  'nx:transition-colors nx:hover:bg-background-hover nx:data-[state=selected]:bg-control-background nx:data-[state=selected]:hover:bg-control-background-hover',
  {
    variants: {
      variant: {
        default: 'nx:border-b-default nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-b-default nx:border-border-default-alpha',
      } satisfies Record<TableVariant, string>,
    },
    defaultVariants: { variant: 'default' },
  }
);

/**
 * Table row that highlights on hover. Set `data-state="selected"` to mark it
 * as selected.
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.PropsWithoutRef<TableRowProps>
>(function TableRow(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableRowProps> & {
    ref?: React.ForwardedRef<HTMLTableRowElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { variant } = useTableContext();
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * Props for TableHead.
 */
type TableHeadProps = React.ComponentProps<'th'>;

const tableHeadVariants = cva(
  'nx:px-2 nx:text-start nx:align-middle nx:typography-label-default nx:whitespace-nowrap nx:text-muted-foreground nx:[&[aria-sort=ascending]]:text-foreground nx:[&[aria-sort=descending]]:text-foreground',
  {
    variants: {
      variant: {
        default: '',
        borderless: '',
        grid: 'nx:border-e-default nx:border-border-default-alpha nx:last:border-e-0',
      } satisfies Record<TableVariant, string>,
      density: {
        comfortable: 'nx:py-3',
        compact: 'nx:py-2.5',
      } satisfies Record<TableDensity, string>,
    },
    defaultVariants: {
      variant: 'default',
      density: 'comfortable',
    },
  }
);

/**
 * Column-header cell (`<th>`) in muted text.
 */
const TableHead = React.forwardRef<
  HTMLTableHeaderCellElement,
  React.PropsWithoutRef<TableHeadProps>
>(function TableHead(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableHeadProps> & {
    ref?: React.ForwardedRef<HTMLTableHeaderCellElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { variant, density, stickyHeader } = useTableContext();
  return (
    <th
      scope="col"
      data-slot="table-head"
      className={cn(
        tableHeadVariants({ variant, density }),
        stickyHeader && 'nx:sticky nx:top-0 nx:z-sticky nx:bg-container',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for TableCell.
 */
type TableCellProps = React.ComponentProps<'td'>;

const tableCellVariants = cva('nx:px-2 nx:align-middle nx:whitespace-nowrap', {
  variants: {
    variant: {
      default: '',
      borderless: '',
      grid: 'nx:border-e-default nx:border-border-default-alpha nx:last:border-e-0',
    } satisfies Record<TableVariant, string>,
    density: {
      comfortable: 'nx:py-3',
      compact: 'nx:py-2',
    } satisfies Record<TableDensity, string>,
  },
  defaultVariants: { variant: 'default', density: 'comfortable' },
});

/**
 * Data cell (`<td>`).
 */
const TableCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.PropsWithoutRef<TableCellProps>
>(function TableCell(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableCellProps> & {
    ref?: React.ForwardedRef<HTMLTableDataCellElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { variant, density } = useTableContext();
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ variant, density }), className)}
      {...props}
    />
  );
});

const tableSelectionCellClassName =
  'nx:w-0 nx:pe-0 nx:*:[[role=checkbox]]:translate-y-0.5';

/**
 * Props for TableSelectionHead.
 */
type TableSelectionHeadProps = TableHeadProps;

/**
 * First header cell, for your select-all Checkbox. Pair it with a
 * `TableSelectionCell` in each body row.
 */
const TableSelectionHead = React.forwardRef<
  HTMLTableHeaderCellElement,
  React.PropsWithoutRef<TableSelectionHeadProps>
>(function TableSelectionHead(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableSelectionHeadProps> & {
    ref?: React.ForwardedRef<HTMLTableHeaderCellElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <TableHead
      data-slot="table-selection-head"
      {...props}
      className={cn(tableSelectionCellClassName, className)}
    />
  );
});

/**
 * Props for TableSelectionCell.
 */
type TableSelectionCellProps = TableCellProps;

/**
 * Cell for your row Checkbox. Set the row's `data-state="selected"` from the
 * same selection state.
 */
const TableSelectionCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.PropsWithoutRef<TableSelectionCellProps>
>(function TableSelectionCell(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableSelectionCellProps> & {
    ref?: React.ForwardedRef<HTMLTableDataCellElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <TableCell
      data-slot="table-selection-cell"
      {...props}
      className={cn(tableSelectionCellClassName, className)}
    />
  );
});

/**
 * Props for TableRowHeader.
 */
type TableRowHeaderProps = React.ComponentProps<'th'>;

/**
 * Cell that names its row, such as an invoice number (`<th scope="row">`).
 * Screen readers use it to announce which row a cell belongs to.
 */
const TableRowHeader = React.forwardRef<
  HTMLTableHeaderCellElement,
  React.PropsWithoutRef<TableRowHeaderProps>
>(function TableRowHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableRowHeaderProps> & {
    ref?: React.ForwardedRef<HTMLTableHeaderCellElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { variant, density } = useTableContext();
  return (
    <th
      scope="row"
      data-slot="table-row-header"
      className={cn(
        tableCellVariants({ variant, density }),
        'nx:typography-label-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for TableCaption.
 */
type TableCaptionProps = React.ComponentProps<'caption'>;

/**
 * Caption that describes the table, shown below it.
 */
const TableCaption = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<TableCaptionProps>
>(function TableCaption(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TableCaptionProps> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
  TableRowHeader,
  type TableRowHeaderProps,
  type TableRowProps,
  TableSelectionCell,
  type TableSelectionCellProps,
  TableSelectionHead,
  type TableSelectionHeadProps,
};
