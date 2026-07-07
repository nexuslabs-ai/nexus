import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  type PopoverContentProps,
} from '../popover';

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  keywords?: string[];
}

interface ComboboxContextValue {
  activeValue: string;
  disabled: boolean;
  inputValue: string;
  invalid: boolean;
  items: ComboboxOption[];
  listId: string;
  open: boolean;
  readOnly: boolean;
  required: boolean;
  selectedLabel: string;
  selectedValue: string;
  setActiveValue: (value: string) => void;
  setInputElement: (input: HTMLInputElement | null) => void;
  setInputValue: (value: string) => void;
  setOpenFromField: () => void;
  setOpenState: (open: boolean) => void;
  setSelectedValue: (value: string) => void;
  stepActiveValue: (direction: 1 | -1) => void;
  visibleOptions: ComboboxOption[];
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useComboboxContext(componentName: string) {
  const context = React.useContext(ComboboxContext);

  if (!context)
    throw new Error(`${componentName} must be used inside Combobox.`);

  return context;
}

function useControllableStringState({
  value,
  defaultValue = '',
  onValueChange,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setCurrentValue = React.useCallback(
    (nextValue: string) => {
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

function getOptionSearchText(option: ComboboxOption) {
  return [option.label, option.value, ...(option.keywords ?? [])]
    .join(' ')
    .toLowerCase();
}

function filterOptions(options: ComboboxOption[], filterValue: string) {
  const query = filterValue.trim().toLowerCase();

  if (!query) return options;

  return options.filter((option) =>
    getOptionSearchText(option).includes(query)
  );
}

function getFirstEnabledValue(options: ComboboxOption[]) {
  return options.find((option) => !option.disabled)?.value ?? '';
}

function getLastEnabledValue(options: ComboboxOption[]) {
  return [...options].reverse().find((option) => !option.disabled)?.value ?? '';
}

function getSteppedValue(
  options: ComboboxOption[],
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

const comboboxFieldVariants = cva(
  [
    'nx:group/combobox nx:relative nx:flex nx:box-border nx:w-full nx:min-w-0 nx:items-center nx:rounded-md nx:border-0 nx:transition-colors nx:outline-none',
    'nx:has-[[data-slot=combobox-input]:focus-visible]:outline-2 nx:has-[[data-slot=combobox-input]:focus-visible]:outline-focus-default nx:has-[[data-slot=combobox-input]:focus-visible]:outline-offset-(--focus-offset)',
    'nx:data-[invalid=true]:border-border-error nx:has-[[data-slot=combobox-input][aria-invalid=true]:focus-visible]:outline-focus-error',
    'nx:data-[disabled=true]:cursor-not-allowed nx:data-[disabled=true]:bg-disabled nx:data-[disabled=true]:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:typography-body-small',
        default: 'nx:h-10 nx:px-3 nx:typography-body-default',
        lg: 'nx:h-12 nx:px-3.5 nx:typography-body-default',
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

interface ComboboxProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  /**
   * Items rendered by `ComboboxList` when its children are omitted.
   */
  items: ComboboxOption[];
  /**
   * Controlled selected option value.
   */
  value?: string;
  /**
   * Initial selected option value for uncontrolled usage.
   * @default ''
   */
  defaultValue?: string;
  /**
   * Called when the selected option value changes.
   */
  onValueChange?: (value: string) => void;
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
   * Native form field name. The submitted value is the selected option value.
   */
  name?: string;
  /**
   * Disables the combobox and omits its form value.
   * @default false
   */
  disabled?: boolean;
  /**
   * Prevents editing and selection while keeping the value readable.
   * @default false
   */
  readOnly?: boolean;
  /**
   * Marks the combobox as required for forms and assistive technology.
   * @default false
   */
  required?: boolean;
  /**
   * Marks the combobox invalid.
   * @default false
   */
  invalid?: boolean;
}

function Combobox({
  children,
  className,
  defaultOpen,
  defaultValue,
  disabled = false,
  invalid = false,
  items,
  name,
  onOpenChange,
  onValueChange,
  open: openProp,
  readOnly = false,
  required = false,
  value: valueProp,
  ...props
}: ComboboxProps) {
  const reactListId = React.useId();
  const listId = `${reactListId}-listbox`;
  const [selectedValue, setSelectedValue, setUncontrolledSelectedValue] =
    useControllableStringState({
      value: valueProp,
      defaultValue,
      onValueChange,
    });
  const [open, setOpen] = useControllableBooleanState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const [inputValue, setInputValue] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [activeValue, setActiveValue] = React.useState('');
  const [inputElement, setInputElement] =
    React.useState<HTMLInputElement | null>(null);
  const hiddenInputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = React.useMemo(
    () => items.find((option) => option.value === selectedValue),
    [items, selectedValue]
  );
  const selectedLabel = selectedOption?.label ?? '';
  const visibleOptions = React.useMemo(
    () => filterOptions(items, filterValue),
    [filterValue, items]
  );

  const setOpenState = React.useCallback(
    (nextOpen: boolean) => {
      if ((disabled || readOnly) && nextOpen) return;

      setOpen(nextOpen);

      if (nextOpen) {
        setInputValue(selectedLabel);
        setFilterValue('');
        setActiveValue(selectedValue || getFirstEnabledValue(items));
      } else {
        setInputValue('');
        setFilterValue('');
        setActiveValue('');
      }
    },
    [disabled, items, readOnly, selectedLabel, selectedValue, setOpen]
  );

  const setOpenFromField = React.useCallback(() => {
    setOpenState(true);
  }, [setOpenState]);

  const handleInputValueChange = React.useCallback(
    (nextValue: string) => {
      if (disabled || readOnly) return;

      const nextVisibleOptions = filterOptions(items, nextValue);

      setInputValue(nextValue);
      setFilterValue(nextValue);
      setActiveValue(getFirstEnabledValue(nextVisibleOptions));
      setOpen(true);

      if (selectedValue && nextValue !== selectedLabel) {
        setSelectedValue('');
      }
    },
    [
      disabled,
      items,
      readOnly,
      selectedLabel,
      selectedValue,
      setOpen,
      setSelectedValue,
    ]
  );

  const handleSelectedValueChange = React.useCallback(
    (nextValue: string) => {
      if (!nextValue) {
        setSelectedValue('');
        setInputValue('');
        setFilterValue('');
        setActiveValue(getFirstEnabledValue(items));
        return;
      }

      const option = items.find((item) => item.value === nextValue);

      if (!option || option.disabled || disabled || readOnly) return;

      setSelectedValue(nextValue);
      setInputValue(option.label);
      setFilterValue('');
      setActiveValue(nextValue);
      setOpen(false);
    },
    [disabled, items, readOnly, setOpen, setSelectedValue]
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
    if (!inputElement) return;

    const validityMessage =
      required && !disabled && !selectedValue ? 'Please select an option.' : '';

    inputElement.setCustomValidity(validityMessage);
  }, [disabled, inputElement, required, selectedValue]);

  React.useEffect(() => {
    const form = hiddenInputRef.current?.form;

    if (!form) return;

    const handleReset = () => {
      window.setTimeout(() => {
        if (valueProp === undefined)
          setUncontrolledSelectedValue(defaultValue ?? '');

        setInputValue('');
        setFilterValue('');
        setActiveValue('');
        setOpen(false);
      });
    };

    form.addEventListener('reset', handleReset);

    return () => form.removeEventListener('reset', handleReset);
  }, [defaultValue, setOpen, setUncontrolledSelectedValue, valueProp]);

  const contextValue = React.useMemo<ComboboxContextValue>(
    () => ({
      activeValue,
      disabled,
      inputValue,
      invalid,
      items,
      listId,
      open,
      readOnly,
      required,
      selectedLabel,
      selectedValue,
      setActiveValue,
      setInputElement,
      setInputValue: handleInputValueChange,
      setOpenFromField,
      setOpenState,
      setSelectedValue: handleSelectedValueChange,
      stepActiveValue,
      visibleOptions,
    }),
    [
      activeValue,
      disabled,
      handleInputValueChange,
      handleSelectedValueChange,
      inputValue,
      invalid,
      items,
      listId,
      open,
      readOnly,
      required,
      selectedLabel,
      selectedValue,
      setOpenFromField,
      setOpenState,
      stepActiveValue,
      visibleOptions,
    ]
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <div
        data-slot="combobox"
        className={cn('nx:contents', className)}
        {...props}
      >
        <Popover open={open} onOpenChange={setOpenState}>
          {children}
        </Popover>
        {name ? (
          <input
            ref={hiddenInputRef}
            type="hidden"
            name={name}
            value={selectedValue}
            disabled={disabled}
            readOnly
          />
        ) : null}
      </div>
    </ComboboxContext.Provider>
  );
}

interface ComboboxInputProps
  extends
    Omit<
      React.ComponentProps<'input'>,
      'disabled' | 'readOnly' | 'required' | 'size' | 'value'
    >,
    VariantProps<typeof comboboxFieldVariants> {
  /**
   * Shows an in-field clear button when a value is selected.
   * @default false
   */
  showClear?: boolean;
}

function ComboboxInput({
  className,
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  showClear = false,
  size,
  variant,
  ...props
}: ComboboxInputProps) {
  const context = useComboboxContext('ComboboxInput');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const skipNextFocusOpenRef = React.useRef(false);
  const displayValue = context.open
    ? context.inputValue
    : context.selectedLabel;
  const showClearButton =
    showClear && Boolean(context.selectedValue) && !context.disabled;
  const activeOptionId =
    context.open && context.activeValue
      ? getOptionId(context.listId, context.activeValue)
      : undefined;

  const handleInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      context.setInputElement(node);
    },
    [context]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    context.setInputValue(event.target.value);
    onChange?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (skipNextFocusOpenRef.current) {
      skipNextFocusOpenRef.current = false;
      onFocus?.(event);
      return;
    }

    context.setOpenFromField();
    onFocus?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      context.setOpenState(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!context.open) context.setOpenFromField();
      context.stepActiveValue(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!context.open) context.setOpenFromField();
      context.stepActiveValue(-1);
    } else if (event.key === 'Home' && context.open) {
      event.preventDefault();
      context.setActiveValue(getFirstEnabledValue(context.visibleOptions));
    } else if (event.key === 'End' && context.open) {
      event.preventDefault();
      context.setActiveValue(getLastEnabledValue(context.visibleOptions));
    } else if (event.key === 'Enter' && context.open) {
      event.preventDefault();
      context.setSelectedValue(context.activeValue);
    }

    onKeyDown?.(event);
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    skipNextFocusOpenRef.current = true;
    context.setSelectedValue('');
    context.setInputValue('');
    inputRef.current?.focus();
  };

  const stopClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <PopoverAnchor asChild>
      <div
        data-slot="combobox-field"
        data-size={size ?? 'default'}
        data-variant={variant ?? 'default'}
        data-disabled={context.disabled || undefined}
        data-invalid={context.invalid || undefined}
        className={cn(comboboxFieldVariants({ size, variant }), className)}
      >
        <input
          ref={handleInputRef}
          data-slot="combobox-input"
          value={displayValue}
          onChange={handleChange}
          onClick={onClick}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={context.disabled}
          readOnly={context.readOnly}
          required={context.required}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-controls={context.open ? context.listId : undefined}
          aria-expanded={context.open}
          aria-invalid={context.invalid || undefined}
          aria-required={context.required || undefined}
          role="combobox"
          className={cn(
            'nx:min-w-0 nx:flex-1 nx:bg-transparent nx:py-0 nx:text-foreground nx:outline-none',
            'nx:placeholder:text-muted-foreground',
            'nx:disabled:cursor-not-allowed nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground'
          )}
          {...props}
        />
        {showClearButton ? (
          <button
            type="button"
            data-slot="combobox-clear"
            aria-label="Clear selection"
            className="nx:-mr-1 nx:flex nx:size-6 nx:items-center nx:justify-center nx:rounded-sm nx:text-muted-foreground nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
            onClick={stopClearClick}
            onMouseDown={handleClear}
          >
            <IconX aria-hidden="true" className="nx:size-4" />
          </button>
        ) : null}
        <IconChevronDown
          aria-hidden="true"
          data-slot="combobox-chevron"
          className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:group-data-[disabled=true]/combobox:text-disabled-foreground"
        />
      </div>
    </PopoverAnchor>
  );
}

interface ComboboxContentProps extends PopoverContentProps {}

function ComboboxContent({
  align = 'start',
  className,
  sideOffset = 6,
  ...props
}: ComboboxContentProps) {
  return (
    <PopoverContent
      data-slot="combobox-content"
      align={align}
      role="presentation"
      sideOffset={sideOffset}
      className={cn(
        'nx:w-(--radix-popper-anchor-width) nx:min-w-48 nx:p-0',
        className
      )}
      onOpenAutoFocus={(event) => event.preventDefault()}
      {...props}
    />
  );
}

interface ComboboxListProps extends React.ComponentProps<'div'> {}

function renderComboboxOption(option: ComboboxOption) {
  return (
    <ComboboxItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
    >
      {option.label}
    </ComboboxItem>
  );
}

function ComboboxList({
  'aria-label': ariaLabel = 'Combobox options',
  children,
  className,
  ...props
}: ComboboxListProps) {
  const context = useComboboxContext('ComboboxList');
  const hasGroups = context.visibleOptions.some((option) => option.group);

  if (children)
    return (
      <div
        id={context.listId}
        role="listbox"
        aria-label={ariaLabel}
        data-slot="combobox-list"
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
        data-slot="combobox-list"
        className={cn(
          'nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:p-1',
          className
        )}
        {...props}
      >
        {context.visibleOptions.map(renderComboboxOption)}
      </div>
    );

  const groupedOptions = new Map<string, ComboboxOption[]>();

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
      data-slot="combobox-list"
      className={cn(
        'nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:p-1',
        className
      )}
      {...props}
    >
      {[...groupedOptions.entries()].map(([group, options]) => (
        <ComboboxGroup key={group} heading={group}>
          {options.map(renderComboboxOption)}
        </ComboboxGroup>
      ))}
    </div>
  );
}

interface ComboboxEmptyProps extends React.ComponentProps<'div'> {}

function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  const context = useComboboxContext('ComboboxEmpty');

  if (context.visibleOptions.length > 0) return null;

  return (
    <div
      data-slot="combobox-empty"
      className={cn(
        'nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

interface ComboboxGroupProps extends React.ComponentProps<'div'> {
  heading?: string;
}

function ComboboxGroup({
  children,
  className,
  heading,
  ...props
}: ComboboxGroupProps) {
  return (
    <div
      role="group"
      aria-label={heading}
      data-slot="combobox-group"
      className={cn('nx:p-1', className)}
      {...props}
    >
      {heading ? (
        <div
          data-slot="combobox-group-heading"
          className="nx:px-2 nx:py-1.5 nx:typography-label-small nx:text-muted-foreground"
        >
          {heading}
        </div>
      ) : null}
      {children}
    </div>
  );
}

interface ComboboxSeparatorProps extends React.ComponentProps<'div'> {}

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <div
      role="presentation"
      data-slot="combobox-separator"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

interface ComboboxItemProps extends Omit<
  React.ComponentProps<'div'>,
  'onSelect'
> {
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

function ComboboxItem({
  children,
  className,
  disabled = false,
  onMouseDown,
  onMouseMove,
  onSelect,
  value,
  ...props
}: ComboboxItemProps) {
  const context = useComboboxContext('ComboboxItem');
  const selected = context.selectedValue === value;
  const active = context.activeValue === value;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!disabled) {
      context.setSelectedValue(value);
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
      data-slot="combobox-item"
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
      <span data-slot="combobox-item-label" className="nx:min-w-0 nx:flex-1">
        {children}
      </span>
      <IconCheck
        aria-hidden="true"
        data-slot="combobox-item-indicator"
        className={cn(
          'nx:ml-auto nx:size-4 nx:transition-opacity',
          selected ? 'nx:opacity-100' : 'nx:opacity-0'
        )}
      />
    </div>
  );
}

export {
  Combobox,
  ComboboxContent,
  type ComboboxContentProps,
  ComboboxEmpty,
  type ComboboxEmptyProps,
  comboboxFieldVariants,
  ComboboxGroup,
  type ComboboxGroupProps,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxItem,
  type ComboboxItemProps,
  ComboboxList,
  type ComboboxListProps,
  type ComboboxOption,
  type ComboboxProps,
  ComboboxSeparator,
  type ComboboxSeparatorProps,
};
