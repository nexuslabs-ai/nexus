import * as React from 'react';
import {
  type DayButton,
  DayPicker,
  getDefaultClassNames,
} from 'react-day-picker';

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, buttonVariants } from '../button';

type DatePickerCellSize = 'default' | 'large' | 'xlarge';

type DatePickerDayButtonProps = React.ComponentProps<typeof DayButton>;

type DatePickerDayContentProps = {
  date: Date;
  day: DatePickerDayButtonProps['day'];
  modifiers: DatePickerDayButtonProps['modifiers'];
};

type DatePickerDayContent = (
  props: DatePickerDayContentProps
) => React.ReactNode;

const cellSizeClassNames: Record<DatePickerCellSize, string> = {
  default:
    'nx:[--cell-size:var(--nx-spacing-8)] nx:[--today-marker-size:var(--nx-spacing-6)]',
  large:
    'nx:[--cell-size:var(--nx-spacing-12)] nx:[--today-marker-size:var(--nx-spacing-10)]',
  xlarge:
    'nx:[--cell-size:var(--nx-spacing-14)] nx:[--today-marker-size:var(--nx-spacing-12)]',
};

const DatePickerDayContentContext =
  React.createContext<DatePickerDayContent | null>(null);

// react-day-picker's default class names are static — compute once at module load.
const defaultClassNames = getDefaultClassNames();

// Prop-independent slot class names — merged once at module load, not per render.
// `satisfies` keeps the slot-key typo-checking the inline `classNames` literal
// had: a misspelled key would otherwise spread in silently and ship its default.
// The four prop-dependent slots (button_previous/next, caption_label, day) stay
// inline in the component because they read buttonVariant / captionLayout /
// showWeekNumber.
const staticDayPickerClassNames = {
  root: cn('nx:w-fit', defaultClassNames.root),
  // Row layout so numberOfMonths > 1 sits side by side; a single month
  // is unaffected. The absolute nav positions against this `relative`.
  months: cn(
    'nx:relative nx:flex nx:flex-row nx:gap-4',
    defaultClassNames.months
  ),
  month: cn('nx:flex nx:w-full nx:flex-col nx:gap-4', defaultClassNames.month),
  nav: cn(
    'nx:absolute nx:inset-x-0 nx:top-0 nx:flex nx:w-full nx:items-center nx:justify-between nx:gap-1',
    defaultClassNames.nav
  ),
  month_caption: cn(
    'nx:flex nx:h-(--cell-size) nx:w-full nx:items-center nx:justify-center nx:px-(--cell-size)',
    defaultClassNames.month_caption
  ),
  dropdowns: cn(
    'nx:flex nx:h-(--cell-size) nx:w-full nx:items-center nx:justify-center nx:gap-1.5 nx:typography-label-default',
    defaultClassNames.dropdowns
  ),
  dropdown_root: cn(
    'nx:relative nx:rounded-md nx:border-default nx:border-border-default nx:shadow-xs nx:has-focus:border-border-active',
    defaultClassNames.dropdown_root
  ),
  dropdown: cn(
    'nx:absolute nx:inset-0 nx:bg-popover nx:opacity-0',
    defaultClassNames.dropdown
  ),
  table: 'nx:w-full nx:border-collapse',
  weekdays: cn('nx:flex', defaultClassNames.weekdays),
  weekday: cn(
    'nx:flex-1 nx:rounded-md nx:typography-body-default nx:text-muted-foreground-subtle nx:select-none',
    defaultClassNames.weekday
  ),
  week: cn('nx:mt-2 nx:flex nx:w-full', defaultClassNames.week),
  week_number_header: cn(
    'nx:w-(--cell-size) nx:select-none',
    defaultClassNames.week_number_header
  ),
  week_number: cn(
    'nx:typography-label-small nx:text-muted-foreground-subtle nx:select-none',
    defaultClassNames.week_number
  ),
  range_start: cn(
    'nx:rounded-l-md nx:bg-primary-subtle',
    defaultClassNames.range_start
  ),
  range_middle: cn(
    'nx:rounded-none nx:bg-primary-subtle',
    defaultClassNames.range_middle
  ),
  range_end: cn(
    'nx:rounded-r-md nx:bg-primary-subtle',
    defaultClassNames.range_end
  ),
  today: defaultClassNames.today,
  outside: cn(
    'nx:text-muted-foreground-subtle nx:aria-selected:text-muted-foreground-subtle',
    defaultClassNames.outside
  ),
  disabled: cn('nx:text-disabled-foreground', defaultClassNames.disabled),
  hidden: cn('nx:invisible', defaultClassNames.hidden),
} satisfies NonNullable<React.ComponentProps<typeof DayPicker>['classNames']>;

/**
 * DatePickerProps
 *
 * Props for the DatePicker component — the full `react-day-picker` prop surface
 * plus `buttonVariant` for the nav arrows.
 */
type DatePickerProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Button variant for the previous / next navigation arrows.
   * @default 'ghost'
   */
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  /**
   * Day-cell size preset: `default` (32px), `large` (48px), `xlarge` (56px).
   * For an arbitrary size, override `--cell-size` via `className`.
   * @default 'default'
   */
  cellSize?: DatePickerCellSize;
  /**
   * Custom content rendered inside each day button while preserving
   * react-day-picker's native button semantics and keyboard behavior.
   *
   * A render callback (not a `children` slot) because react-day-picker owns
   * the per-day render loop, so per-day content cannot be passed as children.
   */
  // eslint-disable-next-line @nexus_ds/no-render-prop-types -- react-day-picker owns the per-day render loop; per-day content can't be a children slot
  renderDayContent?: (props: DatePickerDayContentProps) => React.ReactNode;
};

/**
 * DatePicker
 *
 * Date-grid date picker (react-day-picker). Supports single / range / multiple
 * selection. `react-day-picker` is an optional peer dependency — install it
 * in the consuming app.
 *
 * @example
 * ```tsx
 * const [date, setDate] = React.useState<Date>();
 * <DatePicker mode="single" selected={date} onSelect={setDate} />
 * ```
 */
function DatePicker({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  cellSize = 'default',
  renderDayContent,
  formatters,
  modifiersClassNames,
  components,
  ...props
}: DatePickerProps) {
  return (
    <DatePickerDayContentContext.Provider value={renderDayContent ?? null}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          'nx:group/date-picker nx:bg-background nx:p-3',
          cellSizeClassNames[cellSize],
          'nx:in-data-[slot=card-content]:bg-transparent nx:in-data-[slot=popover-content]:bg-transparent',
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString('default', { month: 'short' }),
          ...formatters,
        }}
        // Cell-level modifiers a consumer opts into. `unavailable` (pair with
        // `disabled`) strikes booked/blackout days; `preview` paints a tentative
        // range rail while a range is half-selected (wire via onDayMouseEnter).
        modifiersClassNames={{
          unavailable: 'nx:text-muted-foreground nx:line-through',
          preview: 'nx:bg-container-hover',
          ...modifiersClassNames,
        }}
        classNames={{
          ...staticDayPickerClassNames,
          button_previous: cn(
            buttonVariants({ variant: buttonVariant, size: 'icon' }),
            'nx:size-(--cell-size) nx:p-0 nx:select-none nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant, size: 'icon' }),
            'nx:size-(--cell-size) nx:p-0 nx:select-none nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
            defaultClassNames.button_next
          ),
          caption_label: cn(
            'nx:typography-label-default nx:select-none',
            captionLayout !== 'label' &&
              'nx:flex nx:h-8 nx:items-center nx:gap-1 nx:rounded-md nx:pr-1 nx:pl-2 nx:[&>svg]:size-3.5 nx:[&>svg]:text-muted-foreground',
            defaultClassNames.caption_label
          ),
          day: cn(
            'nx:group/day nx:relative nx:flex nx:aspect-square nx:h-full nx:w-full nx:items-center nx:justify-center nx:p-0 nx:text-center nx:select-none nx:[&:last-child[data-selected=true]_button]:rounded-r-md',
            props.showWeekNumber
              ? 'nx:[&:nth-child(2)[data-selected=true]_button]:rounded-l-md'
              : 'nx:[&:first-child[data-selected=true]_button]:rounded-l-md',
            defaultClassNames.day
          ),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="date-picker"
                data-cell-size={cellSize}
                ref={rootRef}
                className={className}
                {...props}
              />
            );
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === 'left') {
              return (
                <IconChevronLeft
                  className={cn(
                    'nx:size-4 nx:text-muted-foreground',
                    className
                  )}
                  {...props}
                />
              );
            }

            if (orientation === 'right') {
              return (
                <IconChevronRight
                  className={cn(
                    'nx:size-4 nx:text-muted-foreground',
                    className
                  )}
                  {...props}
                />
              );
            }

            return (
              <IconChevronDown
                className={cn('nx:size-4', className)}
                {...props}
              />
            );
          },
          DayButton: DatePickerDayButton,
          // react-day-picker passes `scope="row"` / `role="rowheader"`, valid
          // only on a <th> — match its default element (and drop the non-DOM
          // `week` prop) so the cell stays accessible.
          WeekNumber: ({ week: _week, children, ...props }) => {
            return (
              <th {...props}>
                <div className="nx:flex nx:size-(--cell-size) nx:items-center nx:justify-center nx:text-center">
                  {children}
                </div>
              </th>
            );
          },
          ...components,
        }}
        {...props}
      />
    </DatePickerDayContentContext.Provider>
  );
}

/**
 * DatePickerDayButton
 *
 * The button rendered for each day. Reflects range / selected modifiers via
 * `data-*` attributes and shows the keyboard-focus ring on the focused day.
 */
function DatePickerDayButton({
  className,
  day,
  modifiers,
  children,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const renderDayContent = React.useContext(DatePickerDayContentContext);

  const ref = React.useRef<HTMLButtonElement>(null);
  // Sync DOM focus to react-day-picker's roving-focus model (external system).
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected =
    modifiers.selected ||
    modifiers.range_start ||
    modifiers.range_middle ||
    modifiers.range_end;
  const isToday = modifiers.today && !isSelected && !modifiers.disabled;
  const isOutside =
    modifiers.outside && !isSelected && !isToday && !modifiers.disabled;
  const content = renderDayContent
    ? renderDayContent({ date: day.date, day, modifiers })
    : children;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.isoDate}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={isToday}
      data-outside={isOutside || undefined}
      className={cn(
        'nx:flex nx:aspect-square nx:size-(--cell-size) nx:min-w-(--cell-size) nx:typography-body-default',
        'nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        isOutside && 'nx:text-muted-foreground-subtle',
        // Keyboard-focus ring on the focused day (modality-independent — paints above neighbours).
        'nx:group-data-[focused=true]/day:relative nx:group-data-[focused=true]/day:z-10 nx:group-data-[focused=true]/day:outline-2 nx:group-data-[focused=true]/day:outline-focus-default nx:group-data-[focused=true]/day:outline-offset-(--focus-offset)',
        // Today → inner error circle while keeping the button target at cell size.
        'nx:data-[today=true]:relative nx:data-[today=true]:bg-transparent nx:data-[today=true]:typography-label-default nx:data-[today=true]:text-error-foreground nx:data-[today=true]:hover:bg-transparent nx:data-[today=true]:hover:text-error-foreground',
        'nx:data-[today=true]:before:absolute nx:data-[today=true]:before:top-1/2 nx:data-[today=true]:before:left-1/2 nx:data-[today=true]:before:size-(--today-marker-size) nx:data-[today=true]:before:-translate-x-1/2 nx:data-[today=true]:before:-translate-y-1/2 nx:data-[today=true]:before:rounded-full nx:data-[today=true]:before:bg-error-background nx:data-[today=true]:hover:before:bg-error-background-hover',
        "nx:data-[today=true]:before:content-['']",
        // Selected single + range endpoints → solid primary fill.
        'nx:data-[selected-single=true]:bg-primary-background nx:data-[selected-single=true]:text-primary-foreground',
        'nx:data-[range-start=true]:rounded-md nx:data-[range-start=true]:bg-primary-background nx:data-[range-start=true]:text-primary-foreground',
        'nx:data-[range-end=true]:rounded-md nx:data-[range-end=true]:bg-primary-background nx:data-[range-end=true]:text-primary-foreground',
        // Range middle → subtle primary fill (continuous with the cell rail).
        'nx:data-[range-middle=true]:rounded-none nx:data-[range-middle=true]:bg-primary-subtle nx:data-[range-middle=true]:text-primary-subtle-foreground',
        defaultClassNames.day_button,
        className
      )}
      {...props}
    >
      <span
        data-slot="date-picker-day-content"
        className="nx:relative nx:z-10 nx:flex nx:flex-col nx:items-center nx:justify-center nx:gap-1"
      >
        {content}
      </span>
    </Button>
  );
}

export {
  DatePicker,
  type DatePickerCellSize,
  DatePickerDayButton,
  type DatePickerDayContent,
  type DatePickerDayContentProps,
  type DatePickerProps,
};
