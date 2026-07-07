import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Badge } from '../badge';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  type PopoverContentProps,
} from '../popover';

interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  keywords?: string[];
}

interface MultiSelectContextValue {
  activeValue: string;
  disabled: boolean;
  invalid: boolean;
  listId: string;
  open: boolean;
  options: MultiSelectOption[];
  readOnly: boolean;
  required: boolean;
  searchValue: string;
  selectedValues: string[];
  setActiveValue: (value: string) => void;
  setOpenFromTrigger: () => void;
  setOpenState: (open: boolean) => void;
  setSearchValue: (value: string) => void;
  stepActiveValue: (direction: 1 | -1) => void;
  toggleValue: (value: string) => void;
  visibleOptions: MultiSelectOption[];
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(
  null
);

function useMultiSelectContext(componentName: string) {
  const context = React.useContext(MultiSelectContext);

  if (!context)
    throw new Error(`${componentName} must be used inside MultiSelect.`);

  return context;
}

function useControllableArrayState({
  value,
  defaultValue = [],
  onValueChange,
}: {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setCurrentValue = React.useCallback(
    (nextValue: string[]) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  return [currentValue, setCurrentValue, setUncontrolledValue] as const;
}

function useControllableBooleanState({
  value,
  defaultValue = false,
  onValueChange,
}: {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setCurrentValue = React.useCallback(
    (nextValue: boolean) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  return [currentValue, setCurrentValue] as const;
}

function getOptionSearchText(option: MultiSelectOption) {
  return [option.label, option.value, ...(option.keywords ?? [])]
    .join(' ')
    .toLowerCase();
}

function filterOptions(options: MultiSelectOption[], searchValue: string) {
  const query = searchValue.trim().toLowerCase();

  if (!query) return options;

  return options.filter((option) =>
    getOptionSearchText(option).includes(query)
  );
}

function getFirstEnabledValue(options: MultiSelectOption[]) {
  return options.find((option) => !option.disabled)?.value ?? '';
}

function getLastEnabledValue(options: MultiSelectOption[]) {
  return [...options].reverse().find((option) => !option.disabled)?.value ?? '';
}

function getSteppedValue(
  options: MultiSelectOption[],
  currentValue: string,
  direction: 1 | -1
) {
  const enabledOptions = options.filter((option) => !option.disabled);

  if (enabledOptions.length === 0) return '';

  const currentIndex = enabledOptions.findIndex(
    (option) => option.value === currentValue
  );
  const fallbackIndex = direction === 1 ? 0 : enabledOptions.length - 1;

  if (currentIndex === -1) return enabledOptions[fallbackIndex]?.value ?? '';

  const nextIndex =
    (currentIndex + direction + enabledOptions.length) % enabledOptions.length;

  return enabledOptions[nextIndex]?.value ?? '';
}

function getOptionId(listId: string, value: string) {
  return `${listId}-option-${value.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function labelsForValues(options: MultiSelectOption[], values: string[]) {
  const optionByValue = new Map(
    options.map((option) => [option.value, option])
  );

  return values.map((value) => ({
    value,
    label: optionByValue.get(value)?.label ?? value,
    disabled: optionByValue.get(value)?.disabled ?? false,
  }));
}

const multiSelectFieldVariants = cva(
  [
    'nx:group/multi-select nx:relative nx:flex nx:box-border nx:w-full nx:min-w-0 nx:items-center nx:gap-1.5 nx:rounded-md nx:border-default nx:transition-colors nx:outline-none',
    'nx:has-[[data-slot=multi-select-trigger]:focus-visible]:outline-2 nx:has-[[data-slot=multi-select-trigger]:focus-visible]:outline-focus-default nx:has-[[data-slot=multi-select-trigger]:focus-visible]:outline-offset-(--focus-offset)',
    'nx:data-[invalid=true]:border-border-error nx:has-[[data-slot=multi-select-trigger][aria-invalid=true]:focus-visible]:outline-focus-error',
    'nx:data-[disabled=true]:cursor-not-allowed nx:data-[disabled=true]:bg-disabled nx:data-[disabled=true]:text-disabled-foreground',
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
          'nx:border-border-default nx:bg-background nx:not-data-[disabled=true]:hover:bg-background-hover nx:data-[disabled=true]:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:not-data-[disabled=true]:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

interface MultiSelectProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  /**
   * Options available in the multi-select listbox.
   */
  options: MultiSelectOption[];
  /**
   * Controlled selected option values.
   */
  value?: string[];
  /**
   * Initial selected option values for uncontrolled usage.
   * @default []
   */
  defaultValue?: string[];
  /**
   * Called when selected option values change.
   */
  onValueChange?: (value: string[]) => void;
  /**
   * Controlled popover state.
   */
  open?: boolean;
  /**
   * Initial popover state for uncontrolled usage.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called when the popover opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Native form field name. One hidden input is rendered per selected value.
   */
  name?: string;
  /**
   * Disables the multi-select and omits submitted values.
   * @default false
   */
  disabled?: boolean;
  /**
   * Prevents editing while keeping selected values readable.
   * @default false
   */
  readOnly?: boolean;
  /**
   * Marks the multi-select as required for forms and assistive technology.
   * @default false
   */
  required?: boolean;
  /**
   * Marks the multi-select invalid.
   * @default false
   */
  invalid?: boolean;
}

function MultiSelect({
  children,
  className,
  defaultOpen,
  defaultValue,
  disabled = false,
  invalid = false,
  name,
  onOpenChange,
  onValueChange,
  open: openProp,
  options,
  readOnly = false,
  required = false,
  value: valueProp,
  ...props
}: MultiSelectProps) {
  const reactListId = React.useId();
  const listId = `${reactListId}-listbox`;
  const [selectedValues, setSelectedValues, setUncontrolledSelectedValues] =
    useControllableArrayState({
      value: valueProp,
      defaultValue,
      onValueChange,
    });
  const [open, setOpen] = useControllableBooleanState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const [searchValue, setSearchValue] = React.useState('');
  const [activeValue, setActiveValue] = React.useState('');
  const validationInputRef = React.useRef<HTMLInputElement>(null);

  const visibleOptions = React.useMemo(
    () => filterOptions(options, searchValue),
    [options, searchValue]
  );

  const setOpenState = React.useCallback(
    (nextOpen: boolean) => {
      if ((disabled || readOnly) && nextOpen) return;

      setOpen(nextOpen);

      if (nextOpen) {
        setSearchValue('');
        setActiveValue(getFirstEnabledValue(options));
      } else {
        setSearchValue('');
        setActiveValue('');
      }
    },
    [disabled, options, readOnly, setOpen]
  );

  const setOpenFromTrigger = React.useCallback(() => {
    setOpenState(true);
  }, [setOpenState]);

  const toggleValue = React.useCallback(
    (nextValue: string) => {
      const option = options.find((item) => item.value === nextValue);

      if (!option || option.disabled || disabled || readOnly) return;

      const nextValues = selectedValues.includes(nextValue)
        ? selectedValues.filter((value) => value !== nextValue)
        : [...selectedValues, nextValue];

      setSelectedValues(nextValues);
    },
    [disabled, options, readOnly, selectedValues, setSelectedValues]
  );

  const handleSearchValueChange = React.useCallback(
    (nextValue: string) => {
      const nextVisibleOptions = filterOptions(options, nextValue);

      setSearchValue(nextValue);
      setActiveValue(getFirstEnabledValue(nextVisibleOptions));
    },
    [options]
  );

  const stepActiveValue = React.useCallback(
    (direction: 1 | -1) => {
      setActiveValue((currentValue) =>
        getSteppedValue(visibleOptions, currentValue, direction)
      );
    },
    [visibleOptions]
  );

  React.useEffect(() => {
    const validationInput = validationInputRef.current;

    if (!validationInput) return;

    const validityMessage =
      required && !disabled && selectedValues.length === 0
        ? 'Please select at least one option.'
        : '';

    validationInput.setCustomValidity(validityMessage);
  }, [disabled, required, selectedValues.length]);

  React.useEffect(() => {
    const form = validationInputRef.current?.form;

    if (!form) return;

    const handleReset = () => {
      window.setTimeout(() => {
        if (valueProp === undefined)
          setUncontrolledSelectedValues(defaultValue ?? []);

        setSearchValue('');
        setActiveValue('');
        setOpen(false);
      });
    };

    form.addEventListener('reset', handleReset);

    return () => form.removeEventListener('reset', handleReset);
  }, [defaultValue, setOpen, setUncontrolledSelectedValues, valueProp]);

  const contextValue = React.useMemo<MultiSelectContextValue>(
    () => ({
      activeValue,
      disabled,
      invalid,
      listId,
      open,
      options,
      readOnly,
      required,
      searchValue,
      selectedValues,
      setActiveValue,
      setOpenFromTrigger,
      setOpenState,
      setSearchValue: handleSearchValueChange,
      stepActiveValue,
      toggleValue,
      visibleOptions,
    }),
    [
      activeValue,
      disabled,
      handleSearchValueChange,
      invalid,
      listId,
      open,
      options,
      readOnly,
      required,
      searchValue,
      selectedValues,
      setOpenFromTrigger,
      setOpenState,
      stepActiveValue,
      toggleValue,
      visibleOptions,
    ]
  );

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <div
        data-slot="multi-select"
        className={cn('nx:contents', className)}
        {...props}
      >
        <Popover open={open} onOpenChange={setOpenState}>
          {children}
        </Popover>
        {name
          ? selectedValues.map((value) => (
              <input
                key={value}
                type="hidden"
                name={name}
                value={value}
                disabled={disabled}
                readOnly
              />
            ))
          : null}
        <input
          ref={validationInputRef}
          tabIndex={-1}
          aria-hidden="true"
          className="nx:sr-only"
          value={selectedValues.length > 0 ? 'selected' : ''}
          required={required}
          disabled={disabled}
          onChange={() => undefined}
        />
      </div>
    </MultiSelectContext.Provider>
  );
}

interface MultiSelectTriggerProps
  extends
    Omit<React.ComponentProps<'div'>, 'defaultValue'>,
    VariantProps<typeof multiSelectFieldVariants> {}

function MultiSelectTrigger({
  'aria-label': ariaLabel = 'Select options',
  children,
  className,
  size,
  variant,
  ...props
}: MultiSelectTriggerProps) {
  const context = useMultiSelectContext('MultiSelectTrigger');

  const handleTriggerClick = () => {
    if (context.open) {
      context.setOpenState(false);
      return;
    }

    context.setOpenFromTrigger();
  };

  return (
    <PopoverAnchor asChild>
      <div
        data-slot="multi-select-field"
        data-size={size ?? 'default'}
        data-variant={variant ?? 'default'}
        data-disabled={context.disabled || undefined}
        data-invalid={context.invalid || undefined}
        className={cn(multiSelectFieldVariants({ size, variant }), className)}
        {...props}
      >
        {children ?? <MultiSelectValue />}
        <button
          type="button"
          data-slot="multi-select-trigger"
          aria-controls={context.open ? context.listId : undefined}
          aria-expanded={context.open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          disabled={context.disabled}
          className="nx:absolute nx:inset-0 nx:z-0 nx:flex nx:items-center nx:justify-end nx:rounded-md nx:px-2.5 nx:text-muted-foreground nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:cursor-not-allowed nx:disabled:text-disabled-foreground"
          onClick={handleTriggerClick}
        >
          <span className="nx:sr-only">
            {context.open ? 'Close options' : 'Open options'}
          </span>
          <IconChevronDown aria-hidden="true" className="nx:size-4" />
        </button>
      </div>
    </PopoverAnchor>
  );
}

interface MultiSelectValueProps extends React.ComponentProps<'div'> {
  /**
   * Placeholder shown when nothing is selected.
   * @default 'Select options'
   */
  placeholder?: React.ReactNode;
  /**
   * Maximum number of selected value chips to show before collapsing the rest.
   * @default 3
   */
  maxVisibleValues?: number;
}

function MultiSelectValue({
  className,
  maxVisibleValues = 3,
  placeholder = 'Select options',
  ...props
}: MultiSelectValueProps) {
  const context = useMultiSelectContext('MultiSelectValue');
  const selectedItems = labelsForValues(
    context.options,
    context.selectedValues
  );
  const visibleSelectedItems = selectedItems.slice(0, maxVisibleValues);
  const overflowCount = Math.max(0, selectedItems.length - maxVisibleValues);

  const handleRemoveValue = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    context.toggleValue(value);
  };

  return (
    <div
      data-slot="multi-select-value"
      className={cn(
        'nx:pointer-events-none nx:relative nx:z-10 nx:flex nx:min-w-0 nx:flex-1 nx:flex-wrap nx:items-center nx:gap-1.5 nx:pr-8',
        className
      )}
      {...props}
    >
      {visibleSelectedItems.map((item) => (
        <Badge
          key={item.value}
          data-slot="multi-select-value-chip"
          variant="secondary"
          fill="outline"
          isCaps={false}
          className="nx:max-w-40 nx:pr-1"
        >
          <span className="nx:truncate">{item.label}</span>
          {!context.disabled && !context.readOnly ? (
            <button
              type="button"
              aria-label={`Remove ${item.label}`}
              data-slot="multi-select-value-remove"
              className="nx:pointer-events-auto nx:-mr-0.5 nx:flex nx:size-4 nx:items-center nx:justify-center nx:rounded-sm nx:text-muted-foreground nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
              onClick={(event) => handleRemoveValue(event, item.value)}
            >
              <IconX aria-hidden="true" className="nx:size-3" />
            </button>
          ) : null}
        </Badge>
      ))}
      {overflowCount > 0 ? (
        <Badge
          data-slot="multi-select-overflow"
          variant="secondary"
          fill="light"
          isCaps={false}
        >
          +{overflowCount}
        </Badge>
      ) : null}
      {selectedItems.length === 0 ? (
        <span
          data-slot="multi-select-placeholder"
          className="nx:text-muted-foreground"
        >
          {placeholder}
        </span>
      ) : null}
    </div>
  );
}

interface MultiSelectContentProps extends PopoverContentProps {}

function MultiSelectContent({
  align = 'start',
  className,
  sideOffset = 6,
  ...props
}: MultiSelectContentProps) {
  return (
    <PopoverContent
      data-slot="multi-select-content"
      role="presentation"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'nx:w-(--radix-popper-anchor-width) nx:min-w-56 nx:p-0',
        className
      )}
      onOpenAutoFocus={(event) => event.preventDefault()}
      {...props}
    />
  );
}

interface MultiSelectSearchProps extends Omit<
  React.ComponentProps<'input'>,
  'disabled' | 'readOnly' | 'value'
> {}

function MultiSelectSearch({
  className,
  onChange,
  onKeyDown,
  placeholder = 'Search options',
  ...props
}: MultiSelectSearchProps) {
  const context = useMultiSelectContext('MultiSelectSearch');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!context.open) return;

    window.setTimeout(() => inputRef.current?.focus());
  }, [context.open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    context.setSearchValue(event.target.value);
    onChange?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      context.setOpenState(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      context.stepActiveValue(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      context.stepActiveValue(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      context.setActiveValue(getFirstEnabledValue(context.visibleOptions));
    } else if (event.key === 'End') {
      event.preventDefault();
      context.setActiveValue(getLastEnabledValue(context.visibleOptions));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      context.toggleValue(context.activeValue);
    }

    onKeyDown?.(event);
  };

  return (
    <div
      data-slot="multi-select-search-wrapper"
      className="nx:flex nx:items-center nx:border-b-default nx:border-border-default nx:px-3 nx:focus-within:border-border-active"
    >
      <input
        ref={inputRef}
        data-slot="multi-select-search"
        value={context.searchValue}
        placeholder={placeholder}
        disabled={context.disabled}
        readOnly={context.readOnly}
        className={cn(
          'nx:flex nx:w-full nx:bg-transparent nx:py-2 nx:typography-body-default nx:text-foreground nx:outline-none',
          'nx:placeholder:text-muted-foreground',
          'nx:disabled:cursor-not-allowed nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
          className
        )}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
}

interface MultiSelectListProps extends React.ComponentProps<'div'> {}

function renderMultiSelectOption(option: MultiSelectOption) {
  return (
    <MultiSelectItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
    >
      {option.label}
    </MultiSelectItem>
  );
}

function MultiSelectList({
  'aria-label': ariaLabel = 'Multi-select options',
  children,
  className,
  ...props
}: MultiSelectListProps) {
  const context = useMultiSelectContext('MultiSelectList');
  const hasGroups = context.visibleOptions.some((option) => option.group);

  if (children)
    return (
      <div
        id={context.listId}
        role="listbox"
        aria-label={ariaLabel}
        aria-multiselectable="true"
        data-slot="multi-select-list"
        className={cn(
          'nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:p-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

  if (!hasGroups)
    return (
      <div
        id={context.listId}
        role="listbox"
        aria-label={ariaLabel}
        aria-multiselectable="true"
        data-slot="multi-select-list"
        className={cn(
          'nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:p-1',
          className
        )}
        {...props}
      >
        {context.visibleOptions.map(renderMultiSelectOption)}
      </div>
    );

  const groupedOptions = new Map<string, MultiSelectOption[]>();

  for (const option of context.visibleOptions) {
    const group = option.group ?? 'Options';
    const groupOptions = groupedOptions.get(group) ?? [];

    groupOptions.push(option);
    groupedOptions.set(group, groupOptions);
  }

  return (
    <div
      id={context.listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable="true"
      data-slot="multi-select-list"
      className={cn(
        'nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:p-1',
        className
      )}
      {...props}
    >
      {[...groupedOptions.entries()].map(([group, options]) => (
        <MultiSelectGroup key={group} heading={group}>
          {options.map(renderMultiSelectOption)}
        </MultiSelectGroup>
      ))}
    </div>
  );
}

interface MultiSelectEmptyProps extends React.ComponentProps<'div'> {}

function MultiSelectEmpty({ className, ...props }: MultiSelectEmptyProps) {
  const context = useMultiSelectContext('MultiSelectEmpty');

  if (context.visibleOptions.length > 0) return null;

  return (
    <div
      data-slot="multi-select-empty"
      className={cn(
        'nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

interface MultiSelectGroupProps extends React.ComponentProps<'div'> {
  heading?: string;
}

function MultiSelectGroup({
  children,
  className,
  heading,
  ...props
}: MultiSelectGroupProps) {
  return (
    <div
      role="group"
      aria-label={heading}
      data-slot="multi-select-group"
      className={cn('nx:p-1', className)}
      {...props}
    >
      {heading ? (
        <div
          data-slot="multi-select-group-heading"
          className="nx:px-2 nx:py-1.5 nx:typography-label-small nx:text-muted-foreground"
        >
          {heading}
        </div>
      ) : null}
      {children}
    </div>
  );
}

interface MultiSelectSeparatorProps extends React.ComponentProps<'div'> {}

function MultiSelectSeparator({
  className,
  ...props
}: MultiSelectSeparatorProps) {
  return (
    <div
      role="presentation"
      data-slot="multi-select-separator"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

interface MultiSelectItemProps extends Omit<
  React.ComponentProps<'div'>,
  'onSelect'
> {
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

function MultiSelectItem({
  children,
  className,
  disabled = false,
  onMouseDown,
  onMouseMove,
  onSelect,
  value,
  ...props
}: MultiSelectItemProps) {
  const context = useMultiSelectContext('MultiSelectItem');
  const selected = context.selectedValues.includes(value);
  const active = context.activeValue === value;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!disabled) {
      context.toggleValue(value);
      onSelect?.(value);
    }

    onMouseDown?.(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) context.setActiveValue(value);
    onMouseMove?.(event);
  };

  return (
    <div
      id={getOptionId(context.listId, value)}
      role="option"
      aria-disabled={disabled || undefined}
      aria-selected={selected}
      tabIndex={-1}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
      data-slot="multi-select-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:rounded-sm nx:typography-body-default nx:outline-none',
        'nx:gap-3 nx:px-3 nx:py-2.5',
        'nx:data-[active=true]:bg-popover-hover nx:data-[active=true]:text-popover-foreground',
        'nx:data-[disabled=true]:pointer-events-none nx:data-[disabled=true]:text-disabled-foreground',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <span
        data-slot="multi-select-item-indicator"
        aria-hidden="true"
        className={cn(
          'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default',
          selected
            ? 'nx:bg-primary-background nx:text-primary-foreground'
            : 'nx:bg-background'
        )}
      >
        {selected ? <IconCheck className="nx:size-3" /> : null}
      </span>
      <span
        data-slot="multi-select-item-label"
        className="nx:min-w-0 nx:flex-1"
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
  MultiSelectEmpty,
  type MultiSelectEmptyProps,
  multiSelectFieldVariants,
  MultiSelectGroup,
  type MultiSelectGroupProps,
  MultiSelectItem,
  type MultiSelectItemProps,
  MultiSelectList,
  type MultiSelectListProps,
  type MultiSelectOption,
  type MultiSelectProps,
  MultiSelectSearch,
  type MultiSelectSearchProps,
  MultiSelectSeparator,
  type MultiSelectSeparatorProps,
  MultiSelectTrigger,
  type MultiSelectTriggerProps,
  MultiSelectValue,
  type MultiSelectValueProps,
};
