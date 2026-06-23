import * as React from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

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
 * TableProps
 *
 * Props for the Table component.
 */
interface TableProps extends React.ComponentProps<'table'> {
  /**
   * Border treatment for the table's internal lines.
   *
   * - `default` — softened horizontal row rules + a header underline.
   * - `borderless` — no internal lines; rows separate by hover + spacing.
   * - `grid` — row **and** column rules (a full cell grid).
   *
   * @default 'default'
   * @example
   * ```tsx
   * <Table variant="borderless">…</Table>
   * ```
   */
  variant?: TableVariant;
  /**
   * Row density.
   *
   * - `comfortable` — roomier ~44px rows (the default).
   * - `compact` — tighter ~36px rows for dense data.
   *
   * @default 'comfortable'
   */
  density?: TableDensity;
  /**
   * Pin the header row while the body scrolls vertically.
   *
   * Requires a height-bounded scroll container — set one via `containerClassName`
   * (e.g. `"nx:max-h-96"`), or there is nothing to scroll. The header paints on
   * `background`; on a `Card` / `container` surface, override the cells with
   * `<TableHeader className="nx:[&_th]:bg-container">`.
   *
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * Classes for the scroll container (the element that owns horizontal — and,
   * with `stickyHeader`, vertical — overflow). Use it to bound the height
   * (`"nx:max-h-96"`) or set the surface. `className` still targets the `<table>`.
   */
  containerClassName?: string;
}

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
function Table({
  className,
  variant = 'default',
  density = 'comfortable',
  stickyHeader = false,
  containerClassName,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ variant, density, stickyHeader }}>
      <div
        data-slot="table-container"
        // A wide table overflows horizontally and holds no focusable children, so
        // the container itself must be keyboard-focusable to scroll into view
        // (axe scrollable-region-focusable / WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
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
          data-density={density}
          data-sticky-header={stickyHeader || undefined}
          className={cn(
            'nx:w-full nx:caption-bottom nx:typography-body-default',
            className
          )}
          {...props}
        />
      </div>
    </TableContext.Provider>
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
 * The `<thead>` grouping for column-header rows. The underline beneath the
 * header comes from its `TableRow`'s bottom border, so it tracks the `variant`.
 */
function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead data-slot="table-header" className={className} {...props} />;
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

const tableFooterVariants = cva(
  'nx:bg-muted nx:typography-label-default nx:[&>tr]:last:border-b-0',
  {
    variants: {
      variant: {
        default: 'nx:border-t nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-t nx:border-border-default-alpha',
      } satisfies Record<TableVariant, string>,
    },
    defaultVariants: { variant: 'default' },
  }
);

/**
 * TableFooter
 *
 * The `<tfoot>` grouping for a summary/totals row — a muted fill and medium
 * weight set it apart from the data rows above.
 */
function TableFooter({ className, ...props }: TableFooterProps) {
  const { variant } = useTableContext();
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(tableFooterVariants({ variant }), className)}
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

const tableRowVariants = cva(
  'nx:transition-colors nx:hover:bg-background-hover nx:data-[state=selected]:bg-control-background nx:data-[state=selected]:hover:bg-control-background-hover',
  {
    variants: {
      variant: {
        default: 'nx:border-b nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-b nx:border-border-default-alpha',
      } satisfies Record<TableVariant, string>,
    },
    defaultVariants: { variant: 'default' },
  }
);

/**
 * TableRow
 *
 * A table row. Highlights on hover and when selected — set
 * `data-state="selected"` to mark a row as part of the current selection.
 */
function TableRow({ className, ...props }: TableRowProps) {
  const { variant } = useTableContext();
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ variant }), className)}
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

const tableHeadVariants = cva(
  'nx:px-2 nx:text-left nx:align-middle nx:typography-label-default nx:whitespace-nowrap nx:text-muted-foreground nx:has-[[role=checkbox]]:pr-0 nx:*:[[role=checkbox]]:translate-y-0.5',
  {
    variants: {
      variant: {
        default: '',
        borderless: '',
        grid: 'nx:border-r nx:border-border-default-alpha nx:[&:last-child]:border-r-0',
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
 * TableHead
 *
 * A column-header cell (`<th>`). Rendered in muted foreground to sit quietly
 * above the data it labels.
 */
function TableHead({ className, ...props }: TableHeadProps) {
  const { variant, density, stickyHeader } = useTableContext();
  return (
    <th
      scope="col"
      data-slot="table-head"
      className={cn(
        tableHeadVariants({ variant, density }),
        stickyHeader && 'nx:sticky nx:top-0 nx:z-sticky nx:bg-background',
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

const tableCellVariants = cva(
  'nx:px-2 nx:align-middle nx:whitespace-nowrap nx:has-[[role=checkbox]]:pr-0 nx:*:[[role=checkbox]]:translate-y-0.5',
  {
    variants: {
      variant: {
        default: '',
        borderless: '',
        grid: 'nx:border-r nx:border-border-default-alpha nx:[&:last-child]:border-r-0',
      } satisfies Record<TableVariant, string>,
      density: {
        comfortable: 'nx:py-3',
        compact: 'nx:py-2',
      } satisfies Record<TableDensity, string>,
    },
    defaultVariants: { variant: 'default', density: 'comfortable' },
  }
);

/**
 * TableCell
 *
 * A data cell (`<td>`).
 */
function TableCell({ className, ...props }: TableCellProps) {
  const { variant, density } = useTableContext();
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ variant, density }), className)}
      {...props}
    />
  );
}

/**
 * TableRowHeaderProps
 *
 * Props for the TableRowHeader component.
 */
interface TableRowHeaderProps extends React.ComponentProps<'th'> {}

/**
 * TableRowHeader
 *
 * The identifying header cell of a row (`<th scope="row">`) — an invoice number,
 * a person's name. Scoping it to the row gives every row an accessible name, so
 * a screen reader announces which row a data cell belongs to. Styled like a data
 * cell but with medium weight.
 */
function TableRowHeader({ className, ...props }: TableRowHeaderProps) {
  const { variant, density } = useTableContext();
  return (
    <th
      scope="row"
      data-slot="table-row-header"
      className={cn(
        tableCellVariants({ variant, density }),
        'nx:font-medium',
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
  TableRowHeader,
  type TableRowHeaderProps,
  type TableRowProps,
};
