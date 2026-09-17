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
   * (e.g. `"nx:max-h-96"`), or there is nothing to scroll. The sticky header
   * paints on the component `container` surface so it stays raised above the page
   * canvas in Model 2.
   *
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * Zebra striping — tint alternating body rows so the eye tracks across a wide
   * row. Selection and hover take precedence over the stripe.
   *
   * @default false
   */
  striped?: boolean;
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
 * Selection helpers stay in-flow by default. A `nx:@container/table-selection`
 * ancestor enables an internally reserved leading gutter at 48rem; engines
 * without container queries or `:has()` retain the visible in-flow column.
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
  striped = false,
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
          'nx:[--table-selection-gutter:0px] nx:[--table-selection-position:static] nx:ps-(--table-selection-gutter)',
          'nx:supports-[selector(:has(*))]:@min-[48rem]/table-selection:has-[>table>*>tr>[data-table-selection-part]]:[--table-selection-gutter:max(var(--nx-spacing-6),calc(var(--nx-spacing-4)+var(--focus-offset,2px)+var(--focus-offset,2px)+4px))]',
          'nx:supports-[selector(:has(*))]:@min-[48rem]/table-selection:has-[>table>*>tr>[data-table-selection-part]]:[--table-selection-position:absolute]',
          'nx:supports-[selector(:has(*))]:@min-[48rem]/table-selection:has-[>table>*>tr>[data-table-selection-part]]:[@media(any-pointer:coarse)]:[--table-selection-gutter:max(var(--nx-spacing-11),44px)]',
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
            'nx:w-full nx:caption-bottom nx:typography-body-default nx:[&[data-striped]_tbody_tr:nth-child(even):not(:hover):not([data-state=selected])]:bg-muted nx:[&[data-striped]_tfoot]:border-t-default nx:[&[data-striped]_tfoot]:border-border-default-alpha',
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
        default: 'nx:border-t-default nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-t-default nx:border-border-default-alpha',
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
  'nx:group/table-row nx:transition-colors nx:hover:bg-background-hover nx:data-[state=selected]:bg-control-background nx:data-[state=selected]:hover:bg-control-background-hover',
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
  'nx:px-2 nx:text-left nx:align-middle nx:typography-label-default nx:whitespace-nowrap nx:text-muted-foreground nx:has-[[role=checkbox]]:pr-0 nx:*:[[role=checkbox]]:translate-y-0.5 nx:[&[aria-sort=ascending]]:text-foreground nx:[&[aria-sort=descending]]:text-foreground',
  {
    variants: {
      variant: {
        default: '',
        borderless: '',
        grid: 'nx:border-r-default nx:border-border-default-alpha nx:[&:last-child]:border-r-0',
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
        stickyHeader && 'nx:sticky nx:top-0 nx:z-sticky nx:bg-container',
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
        grid: 'nx:border-r-default nx:border-border-default-alpha nx:[&:last-child]:border-r-0',
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

// Collapsed borders consume fractional row space; keep the touch overlay clear
// of the adjacent row even when the appearance stroke changes.
const tableSelectionCellClassName =
  'nx:w-0 nx:relative nx:px-[max(0px,calc(var(--nx-spacing-2)-var(--table-selection-gutter,0px)))] nx:has-[[role=checkbox]]:pr-[max(0px,calc(var(--nx-spacing-2)-var(--table-selection-gutter,0px)))] nx:border-r-0 nx:border-e-[max(0px,calc(var(--table-selection-column-border,0px)-var(--table-selection-gutter,0px)))] nx:[@media(any-pointer:coarse)]:h-[calc(max(var(--nx-spacing-11),44px)+var(--nx-borderwidth-default))]';

// Derive the overlay from the reserved target, not a sum of spacing tokens:
// appearance modes can use non-linear spacing scales.
const tableSelectionControlClassName =
  'nx:inline-flex nx:items-center nx:justify-center nx:align-middle nx:[position:var(--table-selection-position,static)] nx:inset-y-0 nx:start-[calc(0px-var(--table-selection-gutter,0px))] nx:w-[max(var(--table-selection-gutter,0px),var(--nx-spacing-4))] nx:[@media(any-pointer:coarse)]:min-w-[max(var(--nx-spacing-11),44px)] nx:[@media(any-pointer:coarse)]:[&>[role=checkbox]]:after:absolute nx:[@media(any-pointer:coarse)]:[&>[role=checkbox]]:after:inset-[calc((var(--nx-spacing-4)-max(var(--nx-spacing-11),44px))/2)]';

interface TableSelectionHeadProps extends TableHeadProps {}

/**
 * A semantic header cell for a consumer-owned select-all Checkbox. Compose
 * inside the first column, paired with TableSelectionCell. Its control remains
 * visible and follows the existing stickyHeader contract.
 */
function TableSelectionHead({
  className,
  children,
  ...props
}: TableSelectionHeadProps) {
  const { variant, density, stickyHeader } = useTableContext();
  return (
    <TableHead
      data-slot="table-selection-head"
      {...props}
      data-table-selection-part="head"
      className={cn(
        tableSelectionCellClassName,
        variant === 'grid' &&
          'nx:[--table-selection-column-border:var(--nx-borderwidth-default)]',
        density === 'compact'
          ? 'nx:py-[max(0px,calc(var(--nx-spacing-2_5)-var(--table-selection-gutter,0px)))]'
          : 'nx:py-[max(0px,calc(var(--nx-spacing-3)-var(--table-selection-gutter,0px)))]',
        stickyHeader && 'nx:sticky',
        className
      )}
    >
      <div
        className={cn(
          tableSelectionControlClassName,
          stickyHeader && 'nx:bg-container'
        )}
      >
        {children}
      </div>
    </TableHead>
  );
}

interface TableSelectionCellProps extends TableCellProps {}

/**
 * A semantic cell for a consumer-owned row Checkbox. Set the containing row's
 * data-state="selected" from the same selection state. Roomy gutter controls
 * reveal on hover/focus and stay visible for selected, touch, or hybrid input.
 * Without the named query container or platform support they remain in-flow.
 */
function TableSelectionCell({
  className,
  children,
  ...props
}: TableSelectionCellProps) {
  const { variant, density } = useTableContext();
  return (
    <TableCell
      data-slot="table-selection-cell"
      {...props}
      data-table-selection-part="cell"
      className={cn(
        tableSelectionCellClassName,
        variant === 'grid' &&
          'nx:[--table-selection-column-border:var(--nx-borderwidth-default)]',
        density === 'compact'
          ? 'nx:py-[max(0px,calc(var(--nx-spacing-2)-var(--table-selection-gutter,0px)))]'
          : 'nx:py-[max(0px,calc(var(--nx-spacing-3)-var(--table-selection-gutter,0px)))]',
        className
      )}
    >
      <div
        className={cn(
          tableSelectionControlClassName,
          'nx:transition-opacity nx:motion-reduce:transition-none nx:motion-reduce:duration-0 nx:group-focus-within/table-row:transition-none nx:group-focus-within/table-row:duration-0',
          'nx:supports-[selector(:has(*))]:@min-[48rem]/table-selection:[@media(hover:hover)_and_(pointer:fine)_and_(not_(any-pointer:coarse))]:group-[:not(:hover):not(:focus-within):not([data-state=selected])]/table-row:not-has-[>[aria-checked=true],>[aria-checked=mixed],>input:checked,>input:indeterminate]:opacity-0'
        )}
      >
        {children}
      </div>
    </TableCell>
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
        'nx:typography-label-default',
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
  TableSelectionCell,
  type TableSelectionCellProps,
  TableSelectionHead,
  type TableSelectionHeadProps,
};
