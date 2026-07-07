import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronDown, IconSearch, IconX } from '../../lib/icons';
import {
  getNodeText,
  normalizeSelectionGroups,
  type SelectionOption,
  type SelectionOptionGroup,
  type SelectionOptionInput,
} from '../../lib/selection';
import { cn } from '../../lib/utils';
import {
  Popover,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
} from '../popover';

const multiSelectTriggerVariants = cva(
  [
    'nx:group/multi-select-trigger',
    'nx:flex',
    'nx:box-border',
    'nx:w-full',
    'nx:min-w-0',
    'nx:items-center',
    'nx:justify-between',
    'nx:gap-2',
    'nx:overflow-hidden',
    'nx:rounded-md',
    'nx:border-0',
    'nx:transition-colors',
    'nx:outline-none',
    'nx:focus-visible:outline-2',
    'nx:focus-visible:outline-focus-default',
    'nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error',
    'nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed',
    'nx:disabled:bg-disabled',
    'nx:disabled:text-disabled-foreground',
    'nx:data-[placeholder=true]:text-muted-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:min-h-8 nx:px-2 nx:py-1 nx:typography-body-small',
        default: 'nx:min-h-10 nx:px-2.5 nx:py-1.5 nx:typography-body-default',
        lg: 'nx:min-h-12 nx:px-3 nx:py-2 nx:typography-body-default',
      },
      variant: {
        default:
          'nx:border-border-default nx:bg-background nx:enabled:hover:bg-background-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const multiSelectValueChipClassName = [
  'nx:inline-flex',
  'nx:min-w-0',
  'nx:shrink-0',
  'nx:items-center',
  'nx:rounded-sm',
  'nx:bg-secondary-subtle',
  'nx:text-secondary-subtle-foreground',
  'nx:transition-colors',
  'nx:group-data-[size=sm]/multi-select-trigger:max-w-36',
  'nx:group-data-[size=sm]/multi-select-trigger:gap-1',
  'nx:group-data-[size=sm]/multi-select-trigger:px-1.5',
  'nx:group-data-[size=sm]/multi-select-trigger:py-0.5',
  'nx:group-data-[size=sm]/multi-select-trigger:typography-label-small',
  'nx:group-data-[size=default]/multi-select-trigger:max-w-40',
  'nx:group-data-[size=default]/multi-select-trigger:gap-1',
  'nx:group-data-[size=default]/multi-select-trigger:px-2',
  'nx:group-data-[size=default]/multi-select-trigger:py-1',
  'nx:group-data-[size=default]/multi-select-trigger:typography-label-default',
  'nx:group-data-[size=lg]/multi-select-trigger:max-w-48',
  'nx:group-data-[size=lg]/multi-select-trigger:gap-1.5',
  'nx:group-data-[size=lg]/multi-select-trigger:px-2.5',
  'nx:group-data-[size=lg]/multi-select-trigger:py-1',
  'nx:group-data-[size=lg]/multi-select-trigger:typography-label-default',
].join(' ');

type MultiSelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: readonly string[];
  selectedValueSet: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, MultiSelectItemRecord>;
  single: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: React.AriaAttributes['aria-invalid'] | undefined;
  onItemAdded: (value: string, item: MultiSelectItemRecord) => void;
  onItemRemoved: (value: string) => void;
};

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(
  null
);
const MultiSelectRegistrationContext = React.createContext(false);
type MultiSelectContentContextValue = {
  activeValue: string | undefined;
  listboxId: string;
  searchValue: string;
  setActiveValue: (value: string | undefined) => void;
};

const MultiSelectContentContext =
  React.createContext<MultiSelectContentContextValue | null>(null);

type MultiSelectItemRecord = {
  label: React.ReactNode;
  searchText: string;
  disabled?: boolean;
};

type MultiSelectSearchConfig =
  | boolean
  | { placeholder?: string; emptyMessage?: React.ReactNode };

function useMultiSelectContext(component: string) {
  const context = React.useContext(MultiSelectContext);

  if (!context) {
    throw new Error(`${component} must be used inside <MultiSelect>.`);
  }

  return context;
}

function getMultiSelectItemDomId(baseId: string, value: string) {
  return `${baseId}-option-${encodeURIComponent(value)}`;
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function getMultiSelectSearchText({
  value,
  children,
  badgeLabel,
  keywords,
}: {
  value: string;
  children: React.ReactNode;
  badgeLabel?: React.ReactNode;
  keywords?: readonly string[];
}) {
  return normalizeSearchText(
    [value, getNodeText(children), getNodeText(badgeLabel), ...(keywords ?? [])]
      .filter(Boolean)
      .join(' ')
  );
}

function getVisibleItems(
  items: Map<string, MultiSelectItemRecord>,
  searchValue: string
) {
  const normalizedSearchValue = normalizeSearchText(searchValue);

  return [...items.entries()].filter(
    ([, item]) =>
      !normalizedSearchValue || item.searchText.includes(normalizedSearchValue)
  );
}

function getEnabledItems(items: Array<[string, MultiSelectItemRecord]>) {
  return items.filter(([, item]) => !item.disabled);
}

function isAriaStateTruthy(
  value:
    | React.AriaAttributes['aria-invalid']
    | React.AriaAttributes['aria-required']
) {
  return (
    value === true ||
    value === 'true' ||
    value === 'grammar' ||
    value === 'spelling'
  );
}

function useControllableArrayState({
  prop,
  defaultProp,
  onChange,
}: {
  prop: readonly string[] | undefined;
  defaultProp: readonly string[];
  onChange?: (value: string[]) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>([
    ...defaultProp,
  ]);
  const isControlled = prop !== undefined;
  const value = isControlled ? [...prop] : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: string[]) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue] as const;
}

function useControllableBooleanState({
  prop,
  defaultProp,
  onChange,
}: {
  prop: boolean | undefined;
  defaultProp: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: boolean) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue] as const;
}

function renderMultiSelectOptions(options: readonly SelectionOptionInput[]) {
  return normalizeSelectionGroups(options).map((group, groupIndex) => (
    <MultiSelectGroup
      key={group.label || `group-${groupIndex}`}
      heading={group.label || undefined}
    >
      {group.options.map((option) => (
        <MultiSelectItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </MultiSelectItem>
      ))}
    </MultiSelectGroup>
  ));
}

/**
 * MultiSelectProps
 *
 * Props for the WDS-style MultiSelect root. Prefer the compositional API:
 * render `MultiSelectTrigger`, `MultiSelectValue`, `MultiSelectContent`,
 * `MultiSelectGroup`, and `MultiSelectItem` as children.
 */
interface MultiSelectProps {
  /**
   * MultiSelect subcomponents. When omitted, pass `options` to render the
   * default trigger/content structure.
   */
  children?: React.ReactNode;
  /**
   * Options rendered by the default trigger/content structure.
   */
  options?: readonly SelectionOptionInput[];
  /**
   * Accessible label for the default trigger when using `options`.
   */
  'aria-label'?: string;
  /**
   * Placeholder shown by the default selected-value renderer.
   */
  placeholder?: React.ReactNode;
  /**
   * Search configuration for the default content when using `options`.
   */
  search?: MultiSelectSearchConfig;
  /**
   * Field size for the default trigger when using `options`.
   */
  size?: VariantProps<typeof multiSelectTriggerVariants>['size'];
  /**
   * Visual treatment for the default trigger when using `options`.
   */
  variant?: VariantProps<typeof multiSelectTriggerVariants>['variant'];
  /**
   * Controlled selected values.
   */
  values?: readonly string[];
  /**
   * Initial selected values for uncontrolled usage.
   */
  defaultValues?: readonly string[];
  /**
   * Called when selected values change.
   */
  onValuesChange?: (values: string[]) => void;
  /**
   * Controlled popup state.
   */
  open?: boolean;
  /**
   * Initial popup state for uncontrolled usage.
   */
  defaultOpen?: boolean;
  /**
   * Called when the popup opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether selecting an item should replace the current value and close the
   * popup, matching single-select behavior.
   * @default false
   */
  single?: boolean;
  /**
   * Disables value changes and trigger interaction for the whole component.
   */
  disabled?: boolean;
  /**
   * Allows focus and reading selected values while preventing edits.
   */
  readOnly?: boolean;
  /**
   * Form field name. Each selected value is mirrored into a hidden input.
   */
  name?: string;
  /**
   * Whether at least one value is required.
   */
  required?: boolean;
  /**
   * Marks the field invalid for assistive technology and styling.
   */
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
}

/**
 * MultiSelect
 *
 * Searchable multi-value selection primitive adapted from the WDS shadcn
 * registry pattern. It composes a Popover trigger/content with Nexus-owned
 * listbox semantics, search filtering, and chip-style selected values.
 *
 * @example
 * ```tsx
 * <MultiSelect defaultValues={['next']}>
 *   <MultiSelectTrigger aria-label="Frameworks">
 *     <MultiSelectValue placeholder="Select frameworks..." />
 *   </MultiSelectTrigger>
 *   <MultiSelectContent>
 *     <MultiSelectGroup>
 *       <MultiSelectItem value="next">Next.js</MultiSelectItem>
 *       <MultiSelectItem value="remix">Remix</MultiSelectItem>
 *     </MultiSelectGroup>
 *   </MultiSelectContent>
 * </MultiSelect>
 * ```
 */
function MultiSelect({
  children,
  options,
  placeholder = 'Select options...',
  search = true,
  size,
  variant,
  values,
  defaultValues,
  onValuesChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  single = false,
  disabled = false,
  readOnly = false,
  name,
  required = false,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = useControllableArrayState({
    prop: values,
    defaultProp: defaultValues ?? [],
    onChange: onValuesChange,
  });
  const [open, setOpen] = useControllableBooleanState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });
  const selectedValueSet = React.useMemo(
    () => new Set(selectedValues),
    [selectedValues]
  );
  const [items, setItems] = React.useState<Map<string, MultiSelectItemRecord>>(
    () => new Map()
  );

  const toggleValue = React.useCallback(
    (nextValue: string) => {
      if (disabled || readOnly) return;

      const nextValues = single
        ? selectedValueSet.has(nextValue)
          ? []
          : [nextValue]
        : selectedValueSet.has(nextValue)
          ? selectedValues.filter((item) => item !== nextValue)
          : [...selectedValues, nextValue];

      setSelectedValues(nextValues);
      if (single) setOpen(false);
    },
    [
      disabled,
      readOnly,
      selectedValueSet,
      selectedValues,
      setOpen,
      setSelectedValues,
      single,
    ]
  );

  const onItemAdded = React.useCallback(
    (itemValue: string, item: MultiSelectItemRecord) => {
      setItems((currentItems) => {
        const currentItem = currentItems.get(itemValue);
        if (
          currentItem &&
          currentItem.label === item.label &&
          currentItem.searchText === item.searchText &&
          currentItem.disabled === item.disabled
        ) {
          return currentItems;
        }

        const nextItems = new Map(currentItems);
        nextItems.set(itemValue, item);
        return nextItems;
      });
    },
    []
  );

  const onItemRemoved = React.useCallback((itemValue: string) => {
    setItems((currentItems) => {
      if (!currentItems.has(itemValue)) return currentItems;

      const nextItems = new Map(currentItems);
      nextItems.delete(itemValue);
      return nextItems;
    });
  }, []);

  const renderedChildren =
    children ??
    (options ? (
      <>
        <MultiSelectTrigger
          aria-label={ariaLabel ?? 'Options'}
          size={size}
          variant={variant}
        >
          <MultiSelectValue placeholder={placeholder} />
        </MultiSelectTrigger>
        <MultiSelectContent search={search}>
          {renderMultiSelectOptions(options)}
        </MultiSelectContent>
      </>
    ) : null);

  const contextValue = React.useMemo<MultiSelectContextValue>(
    () => ({
      open,
      setOpen,
      selectedValues,
      selectedValueSet,
      toggleValue,
      items,
      single,
      disabled,
      readOnly,
      required,
      invalid: ariaInvalid,
      onItemAdded,
      onItemRemoved,
    }),
    [
      ariaInvalid,
      disabled,
      items,
      onItemAdded,
      onItemRemoved,
      open,
      readOnly,
      required,
      selectedValueSet,
      selectedValues,
      setOpen,
      single,
      toggleValue,
    ]
  );

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen} modal>
        {renderedChildren}
      </Popover>
      {name
        ? selectedValues.map((item) => (
            <input
              key={item}
              type="hidden"
              name={name}
              value={item}
              disabled={disabled}
            />
          ))
        : null}
      {required ? (
        <input
          key={selectedValues.length > 0 ? 'selected' : 'empty'}
          data-slot="multi-select-required-input"
          aria-hidden="true"
          className="nx:sr-only"
          tabIndex={-1}
          defaultValue={selectedValues.length > 0 ? 'selected' : ''}
          required
          disabled={disabled}
        />
      ) : null}
    </MultiSelectContext.Provider>
  );
}

/**
 * MultiSelectTriggerProps
 *
 * Props for the MultiSelect trigger button.
 */
interface MultiSelectTriggerProps
  extends
    React.ComponentProps<'button'>,
    VariantProps<typeof multiSelectTriggerVariants> {}

/**
 * MultiSelectTrigger
 *
 * Button-like field surface that opens the multi-select popover. It mirrors the
 * Select trigger's default and borderless field treatments.
 */
function MultiSelectTrigger({
  className,
  children,
  variant,
  size,
  disabled,
  onKeyDown,
  type = 'button',
  role = 'combobox',
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...props
}: MultiSelectTriggerProps) {
  const {
    open,
    selectedValues,
    disabled: contextDisabled,
    readOnly,
    required,
    invalid,
    toggleValue,
  } = useMultiSelectContext('MultiSelectTrigger');
  const semanticSize = size ?? 'default';
  const isDisabled = contextDisabled || disabled;
  const resolvedAriaInvalid = invalid ?? ariaInvalid;
  const resolvedAriaRequired =
    required || ariaRequired === true || ariaRequired === 'true';

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || isDisabled || readOnly) return;

      if (
        selectedValues.length > 0 &&
        (event.key === 'Backspace' || event.key === 'Delete')
      ) {
        event.preventDefault();
        toggleValue(selectedValues[selectedValues.length - 1] ?? '');
      }
    },
    [isDisabled, onKeyDown, readOnly, selectedValues, toggleValue]
  );

  return (
    <PopoverTrigger asChild>
      <button
        data-slot="multi-select-trigger"
        data-state={open ? 'open' : 'closed'}
        data-empty={selectedValues.length === 0 ? 'true' : undefined}
        data-invalid={
          isAriaStateTruthy(resolvedAriaInvalid) ? 'true' : undefined
        }
        data-placeholder={selectedValues.length === 0 ? 'true' : undefined}
        data-required={resolvedAriaRequired ? 'true' : undefined}
        data-size={semanticSize}
        data-variant={variant ?? 'default'}
        type={type}
        role={role}
        aria-expanded={open}
        aria-invalid={resolvedAriaInvalid}
        aria-required={resolvedAriaRequired || undefined}
        disabled={isDisabled}
        className={cn(
          multiSelectTriggerVariants({
            size: semanticSize,
            variant,
            className,
          })
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        <IconChevronDown
          data-slot="multi-select-trigger-icon"
          aria-hidden="true"
          className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:transition-transform nx:group-data-[state=open]/multi-select-trigger:rotate-180 nx:group-disabled/multi-select-trigger:text-disabled-foreground"
        />
      </button>
    </PopoverTrigger>
  );
}

/**
 * MultiSelectValueProps
 *
 * Props for the selected-value renderer.
 */
interface MultiSelectValueProps extends Omit<
  React.ComponentProps<'span'>,
  'children'
> {
  /**
   * Placeholder shown when no values are selected.
   */
  placeholder?: React.ReactNode;
  /**
   * Whether clicking a selected chip removes it.
   * @default true
   */
  clickToRemove?: boolean;
  /**
   * How selected chips behave when they exceed the trigger width.
   * @default 'wrap-when-open'
   */
  overflowBehavior?: 'wrap' | 'wrap-when-open' | 'cutoff';
}

/**
 * MultiSelectValue
 *
 * Displays selected values as chips. In the default `wrap-when-open` mode,
 * chips collapse into a `+N` counter while closed and wrap when the popup opens.
 */
function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  overflowBehavior = 'wrap-when-open',
  className,
  ...props
}: MultiSelectValueProps) {
  const {
    open,
    selectedValues,
    items,
    toggleValue,
    disabled,
    readOnly,
    selectedValueSet,
  } = useMultiSelectContext('MultiSelectValue');
  const [overflowAmount, setOverflowAmount] = React.useState(0);
  const valueRef = React.useRef<HTMLSpanElement>(null);
  const overflowRef = React.useRef<HTMLSpanElement>(null);
  const shouldWrap =
    overflowBehavior === 'wrap' ||
    (overflowBehavior === 'wrap-when-open' && open);

  const checkOverflow = React.useCallback(() => {
    const containerElement = valueRef.current;
    if (!containerElement) return;

    const overflowElement = overflowRef.current;
    const selectedItems = containerElement.querySelectorAll<HTMLElement>(
      '[data-selected-item]'
    );

    selectedItems.forEach((item) => item.style.removeProperty('display'));
    overflowElement?.style.setProperty('display', 'none');

    if (shouldWrap) {
      setOverflowAmount(0);
      return;
    }

    let nextOverflowAmount = 0;

    for (let index = selectedItems.length - 1; index >= 0; index -= 1) {
      if (containerElement.scrollWidth <= containerElement.clientWidth) break;

      selectedItems[index]?.style.setProperty('display', 'none');
      overflowElement?.style.removeProperty('display');
      nextOverflowAmount = selectedItems.length - index;
    }

    setOverflowAmount(nextOverflowAmount);
  }, [shouldWrap]);

  React.useLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow, items, open, selectedValueSet, selectedValues]);

  React.useLayoutEffect(() => {
    const containerElement = valueRef.current;
    if (!containerElement) return;

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(containerElement);

    return () => observer.disconnect();
  }, [checkOverflow]);

  const handleChipPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLSpanElement>, selectedValue: string) => {
      if (!clickToRemove || disabled || readOnly) return;

      event.preventDefault();
      event.stopPropagation();
      toggleValue(selectedValue);
    },
    [clickToRemove, disabled, readOnly, toggleValue]
  );

  if (selectedValues.length === 0) {
    return (
      <span
        data-slot="multi-select-value"
        data-placeholder="true"
        className={cn(
          'nx:min-w-0 nx:flex-1 nx:truncate nx:text-left nx:text-muted-foreground',
          className
        )}
        {...props}
      >
        {placeholder}
      </span>
    );
  }

  return (
    <span
      ref={valueRef}
      data-slot="multi-select-value"
      data-overflow-behavior={overflowBehavior}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:items-center nx:gap-1 nx:text-left',
        shouldWrap
          ? 'nx:flex-wrap nx:overflow-visible'
          : 'nx:flex-nowrap nx:overflow-hidden',
        className
      )}
      {...props}
    >
      {selectedValues.map((selectedValue) => {
        const label = items.get(selectedValue)?.label ?? selectedValue;

        return (
          <span
            key={selectedValue}
            data-slot="multi-select-value-chip"
            data-selected-item=""
            className={multiSelectValueChipClassName}
            onPointerDown={(event) =>
              handleChipPointerDown(event, selectedValue)
            }
          >
            <span
              data-slot="multi-select-value-chip-label"
              className="nx:min-w-0 nx:truncate"
            >
              {label}
            </span>
            {clickToRemove ? (
              <IconX
                data-slot="multi-select-value-chip-remove-icon"
                aria-hidden="true"
                className="nx:size-3 nx:shrink-0 nx:text-muted-foreground"
              />
            ) : null}
          </span>
        );
      })}
      <span
        ref={overflowRef}
        data-slot="multi-select-value-overflow"
        className={cn(multiSelectValueChipClassName, 'nx:hidden')}
      >
        +{overflowAmount}
      </span>
    </span>
  );
}

/**
 * MultiSelectContentProps
 *
 * Props for the MultiSelect popover content.
 */
interface MultiSelectContentProps extends Omit<
  PopoverContentProps,
  'children'
> {
  /**
   * Whether to render the search input, or search copy overrides.
   * @default true
   */
  search?: MultiSelectSearchConfig;
  /**
   * MultiSelect groups and items.
   */
  children: React.ReactNode;
}

/**
 * MultiSelectContent
 *
 * Popover content with a searchable listbox.
 */
function MultiSelectContent({
  search = true,
  children,
  className,
  align = 'start',
  sideOffset = 4,
  'aria-label': ariaLabel,
  ...props
}: MultiSelectContentProps) {
  const canSearch = typeof search === 'object' ? true : search;
  const searchPlaceholder =
    typeof search === 'object' ? search.placeholder : undefined;
  const emptyMessage =
    typeof search === 'object' ? search.emptyMessage : 'No options found.';
  const listboxId = React.useId();
  const { items, setOpen, single, toggleValue } =
    useMultiSelectContext('MultiSelectContent');
  const [searchValue, setSearchValue] = React.useState('');
  const [activeValue, setActiveValue] = React.useState<string | undefined>();
  const visibleItems = React.useMemo(
    () => getVisibleItems(items, searchValue),
    [items, searchValue]
  );
  const enabledVisibleItems = React.useMemo(
    () => getEnabledItems(visibleItems),
    [visibleItems]
  );
  const activeValueForRender = enabledVisibleItems.some(
    ([itemValue]) => itemValue === activeValue
  )
    ? activeValue
    : enabledVisibleItems[0]?.[0];
  const activeId = activeValueForRender
    ? getMultiSelectItemDomId(listboxId, activeValueForRender)
    : undefined;

  const moveActiveItem = React.useCallback(
    (direction: 1 | -1) => {
      if (enabledVisibleItems.length === 0) {
        setActiveValue(undefined);
        return;
      }

      const activeIndex = enabledVisibleItems.findIndex(
        ([itemValue]) => itemValue === activeValueForRender
      );
      const fallbackIndex =
        direction === 1 ? 0 : enabledVisibleItems.length - 1;
      const nextIndex =
        activeIndex === -1
          ? fallbackIndex
          : (activeIndex + direction + enabledVisibleItems.length) %
            enabledVisibleItems.length;

      setActiveValue(enabledVisibleItems[nextIndex]?.[0]);
    },
    [activeValueForRender, enabledVisibleItems]
  );

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextSearchValue = event.currentTarget.value;
      const nextEnabledItems = getEnabledItems(
        getVisibleItems(items, nextSearchValue)
      );

      setSearchValue(nextSearchValue);
      setActiveValue(nextEnabledItems[0]?.[0]);
    },
    [items]
  );

  const handleListKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;

      const isSearchInputEvent =
        event.currentTarget instanceof HTMLInputElement;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveActiveItem(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveActiveItem(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveValue(enabledVisibleItems[0]?.[0]);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveValue(
          enabledVisibleItems[enabledVisibleItems.length - 1]?.[0]
        );
      } else if (
        event.key === 'Enter' ||
        (event.key === ' ' && !isSearchInputEvent)
      ) {
        event.preventDefault();
        if (activeValueForRender) toggleValue(activeValueForRender);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    },
    [
      activeValueForRender,
      enabledVisibleItems,
      moveActiveItem,
      setOpen,
      toggleValue,
    ]
  );
  const contentContextValue = React.useMemo<MultiSelectContentContextValue>(
    () => ({
      activeValue: activeValueForRender,
      listboxId,
      searchValue: normalizeSearchText(searchValue),
      setActiveValue,
    }),
    [activeValueForRender, listboxId, searchValue]
  );

  return (
    <>
      <MultiSelectRegistrationContext.Provider value>
        {children}
      </MultiSelectRegistrationContext.Provider>
      <PopoverContent
        data-slot="multi-select-content"
        aria-label={ariaLabel ?? 'Multi-select options'}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'nx:w-(--radix-popover-trigger-width) nx:min-w-(--radix-popover-trigger-width) nx:overflow-hidden nx:p-0',
          className
        )}
        {...props}
      >
        <div
          data-slot="multi-select-command"
          className="nx:flex nx:min-h-0 nx:flex-col"
        >
          {canSearch ? (
            <div
              data-slot="multi-select-search-wrapper"
              className="nx:flex nx:h-10 nx:items-center nx:gap-2 nx:border-border-default nx:border-b nx:px-3"
            >
              <IconSearch
                aria-hidden="true"
                className="nx:size-4 nx:shrink-0 nx:text-muted-foreground"
              />
              <input
                data-slot="multi-select-search"
                aria-activedescendant={activeId}
                aria-controls={listboxId}
                aria-label={searchPlaceholder ?? 'Search options'}
                autoComplete="off"
                className="nx:min-w-0 nx:flex-1 nx:bg-transparent nx:typography-body-default nx:outline-none nx:placeholder:text-muted-foreground nx:disabled:cursor-not-allowed nx:disabled:opacity-50"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleListKeyDown}
              />
            </div>
          ) : null}
          <div
            id={listboxId}
            data-slot="multi-select-list"
            role="listbox"
            aria-label={ariaLabel ?? 'Multi-select options'}
            aria-activedescendant={canSearch ? undefined : activeId}
            aria-multiselectable={single ? undefined : true}
            tabIndex={canSearch ? -1 : 0}
            className="nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:p-1 nx:scroll-py-2 nx:outline-none"
            onKeyDown={handleListKeyDown}
          >
            {canSearch && visibleItems.length === 0 ? (
              <div
                data-slot="multi-select-empty"
                className="nx:px-3 nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground"
              >
                {emptyMessage}
              </div>
            ) : (
              <MultiSelectContentContext.Provider value={contentContextValue}>
                {children}
              </MultiSelectContentContext.Provider>
            )}
          </div>
        </div>
      </PopoverContent>
    </>
  );
}

/**
 * MultiSelectGroupProps
 *
 * Props for a group of related MultiSelect items.
 */
interface MultiSelectGroupProps extends React.ComponentProps<'div'> {
  /**
   * Optional label for this group of options.
   */
  heading?: React.ReactNode;
}

/**
 * MultiSelectGroup
 *
 * Groups related MultiSelect items. Items should be wrapped in a group for
 * consistent list spacing.
 */
function MultiSelectGroup({
  className,
  heading,
  children,
  ...props
}: MultiSelectGroupProps) {
  const registrationOnly = React.useContext(MultiSelectRegistrationContext);

  if (registrationOnly) return <>{children}</>;

  return (
    <div
      data-slot="multi-select-group"
      role={heading ? 'group' : undefined}
      aria-label={typeof heading === 'string' ? heading : undefined}
      className={cn('nx:p-1', className)}
      {...props}
    >
      {heading ? (
        <div
          data-slot="multi-select-group-label"
          className="nx:px-2 nx:py-1.5 nx:typography-label-small nx:text-muted-foreground"
        >
          {heading}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/**
 * MultiSelectSeparatorProps
 *
 * Props for the decorative separator between groups.
 */
interface MultiSelectSeparatorProps extends React.ComponentProps<'div'> {}

/**
 * MultiSelectSeparator
 *
 * Decorative separator between MultiSelect groups.
 */
function MultiSelectSeparator({
  className,
  ...props
}: MultiSelectSeparatorProps) {
  const registrationOnly = React.useContext(MultiSelectRegistrationContext);

  if (registrationOnly) return null;

  return (
    <div
      data-slot="multi-select-separator"
      aria-hidden="true"
      className={cn('nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default', className)}
      {...props}
    />
  );
}

/**
 * MultiSelectItemProps
 *
 * Props for a selectable MultiSelect option.
 */
interface MultiSelectItemProps extends Omit<
  React.ComponentProps<'div'>,
  'onSelect'
> {
  /**
   * Submitted value for this option.
   */
  value: string;
  /**
   * Optional label rendered in the selected-value chip. Defaults to children.
   */
  badgeLabel?: React.ReactNode;
  /**
   * Additional search terms for this option.
   */
  keywords?: readonly string[];
  /**
   * Whether this option can be selected.
   */
  disabled?: boolean;
  /**
   * Called after the item is selected.
   */
  onSelect?: (value: string) => void;
}

/**
 * MultiSelectItem
 *
 * Selectable listbox item with a persistent check indicator.
 */
function MultiSelectItem({
  value,
  children,
  badgeLabel,
  className,
  onSelect,
  disabled,
  keywords,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  ...props
}: MultiSelectItemProps) {
  const { selectedValueSet, toggleValue, onItemAdded, onItemRemoved } =
    useMultiSelectContext('MultiSelectItem');
  const registrationOnly = React.useContext(MultiSelectRegistrationContext);
  const contentContext = React.useContext(MultiSelectContentContext);
  const isSelected = selectedValueSet.has(value);
  const searchText = getMultiSelectSearchText({
    value,
    children,
    badgeLabel,
    keywords,
  });
  const isHighlighted = contentContext?.activeValue === value;
  const isVisible =
    !contentContext?.searchValue ||
    searchText.includes(contentContext.searchValue);

  React.useEffect(() => {
    if (!registrationOnly) return;

    onItemAdded(value, {
      label: badgeLabel ?? children,
      searchText,
      disabled,
    });

    return () => onItemRemoved(value);
  }, [
    badgeLabel,
    children,
    disabled,
    onItemAdded,
    onItemRemoved,
    registrationOnly,
    searchText,
    value,
  ]);

  if (registrationOnly) return null;
  if (!isVisible) return null;

  const handleSelect = () => {
    if (disabled) return;

    onSelect?.(value);
    toggleValue(value);
  };

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  const handleItemPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    handleSelect();
  };

  const handleItemPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (!disabled) contentContext?.setActiveValue(value);
  };

  return (
    <div
      id={
        contentContext
          ? getMultiSelectItemDomId(contentContext.listboxId, value)
          : undefined
      }
      data-slot="multi-select-item"
      data-selected={isSelected ? 'true' : undefined}
      data-highlighted={isHighlighted ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      role="option"
      tabIndex={-1}
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:rounded-sm nx:typography-body-default nx:outline-none',
        'nx:gap-3 nx:px-3 nx:py-2.5',
        'nx:data-[highlighted=true]:bg-popover-hover nx:data-[highlighted=true]:text-popover-foreground',
        'nx:data-[disabled=true]:pointer-events-none nx:data-[disabled=true]:text-disabled-foreground',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      onKeyDown={handleItemKeyDown}
      onPointerDown={handleItemPointerDown}
      onPointerMove={handleItemPointerMove}
      {...props}
    >
      <span
        data-slot="multi-select-item-indicator"
        aria-hidden="true"
        className={cn(
          'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default',
          isSelected &&
            'nx:border-primary-background nx:bg-primary-background nx:text-primary-foreground'
        )}
      >
        {isSelected ? (
          <IconCheck
            data-slot="multi-select-item-indicator-icon"
            className="nx:size-3.5"
          />
        ) : null}
      </span>
      <span
        data-slot="multi-select-item-label"
        className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5"
      >
        {children}
      </span>
    </div>
  );
}

export {
  MultiSelect,
  MultiSelectContent,
  type MultiSelectContentProps,
  MultiSelectGroup,
  type MultiSelectGroupProps,
  MultiSelectItem,
  type MultiSelectItemProps,
  type SelectionOption as MultiSelectOption,
  type SelectionOptionGroup as MultiSelectOptionGroup,
  type SelectionOptionInput as MultiSelectOptionInput,
  type MultiSelectProps,
  MultiSelectSeparator,
  type MultiSelectSeparatorProps,
  MultiSelectTrigger,
  type MultiSelectTriggerProps,
  MultiSelectValue,
  type MultiSelectValueProps,
};
