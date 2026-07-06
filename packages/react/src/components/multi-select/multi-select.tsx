import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronDown, IconSearch, IconX } from '../../lib/icons';
import {
  filterSelectionGroups,
  findSelectionOption,
  flattenSelectionOptions,
  getFirstEnabledValue,
  getNextEnabledValue,
  getSelectionOptionDomId,
  includesSelectionValue,
  normalizeSelectionGroups,
  removeSelectionValue,
  type SelectionOption,
  type SelectionOptionGroup,
  type SelectionOptionInput,
  toggleSelectionValue,
} from '../../lib/selection';
import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

const multiSelectControlVariants = cva(
  [
    'nx:group/multi-select-control',
    'nx:flex',
    'nx:w-full',
    'nx:min-w-0',
    'nx:flex-wrap',
    'nx:items-center',
    'nx:rounded-md',
    'nx:border-0',
    'nx:transition-colors',
    'nx:outline-none',
    'nx:focus-within:outline-2',
    'nx:focus-within:outline-focus-default',
    'nx:focus-within:outline-offset-(--focus-offset)',
    'nx:has-[[aria-invalid=true]:focus-visible]:outline-focus-error',
    'nx:data-[invalid=true]:border-border-error',
    'nx:data-[disabled=true]:cursor-not-allowed',
    'nx:data-[disabled=true]:bg-disabled',
    'nx:data-[disabled=true]:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:min-h-8 nx:gap-1 nx:px-1.5 nx:py-1',
        default: 'nx:min-h-10 nx:gap-1.5 nx:px-2 nx:py-1.5',
        lg: 'nx:min-h-12 nx:gap-1.5 nx:px-2.5 nx:py-2',
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

const multiSelectInputVariants = cva(
  [
    'nx:flex-1',
    'nx:bg-transparent',
    'nx:text-foreground',
    'nx:outline-none',
    'nx:placeholder:text-muted-foreground',
    'nx:disabled:cursor-not-allowed',
    'nx:disabled:text-disabled-foreground',
    'nx:disabled:placeholder:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:min-w-20 nx:py-0.5 nx:typography-body-small',
        default: 'nx:min-w-28 nx:py-1 nx:typography-body-default',
        lg: 'nx:min-w-32 nx:py-1.5 nx:typography-body-default',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const multiSelectChipVariants = cva(
  [
    'nx:inline-flex',
    'nx:min-w-0',
    'nx:items-center',
    'nx:rounded-sm',
    'nx:bg-secondary-subtle',
    'nx:text-secondary-subtle-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:max-w-36 nx:gap-1 nx:px-1.5 nx:py-0.5 nx:typography-label-small',
        default:
          'nx:max-w-40 nx:gap-1 nx:px-2 nx:py-1 nx:typography-label-default',
        lg: 'nx:max-w-48 nx:gap-1.5 nx:px-2.5 nx:py-1 nx:typography-label-default',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const multiSelectChipRemoveVariants = cva(
  [
    'nx:-mr-1',
    'nx:inline-flex',
    'nx:items-center',
    'nx:justify-center',
    'nx:rounded-sm',
    'nx:text-muted-foreground',
    'nx:hover:bg-background-hover',
    'nx:hover:text-foreground',
    'nx:focus-visible:outline-2',
    'nx:focus-visible:outline-focus-default',
    'nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:disabled:pointer-events-none',
    'nx:disabled:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:size-4 nx:[&>svg]:size-3',
        default: 'nx:size-5 nx:[&>svg]:size-3.5',
        lg: 'nx:size-5 nx:[&>svg]:size-3.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const multiSelectInlineButtonVariants = cva(
  [
    'nx:inline-flex',
    'nx:shrink-0',
    'nx:items-center',
    'nx:justify-center',
    'nx:rounded-sm',
    'nx:text-muted-foreground',
    'nx:hover:bg-background-hover',
    'nx:hover:text-foreground',
    'nx:focus-visible:outline-2',
    'nx:focus-visible:outline-focus-default',
    'nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:disabled:pointer-events-none',
    'nx:disabled:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        sm: 'nx:size-6 nx:[&>svg]:size-4',
        default: 'nx:size-6 nx:[&>svg]:size-4',
        lg: 'nx:size-8 nx:[&>svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const multiSelectContentClassName = [
  'nx:z-popover',
  'nx:max-h-80',
  'nx:w-(--radix-popover-trigger-width)',
  'nx:min-w-(--radix-popover-trigger-width)',
  'nx:overflow-hidden',
  'nx:p-1',
  'nx:outline-none',
  popoverSurfaceClassName,
  overlayFloatingTransitionClassName,
].join(' ');

const multiSelectOptionClassName = [
  'nx:group/multi-select-option',
  'nx:relative',
  'nx:flex',
  'nx:w-full',
  'nx:cursor-default',
  'nx:select-none',
  'nx:items-start',
  'nx:gap-3',
  'nx:rounded-sm',
  'nx:px-3',
  'nx:py-2.5',
  'nx:typography-body-default',
  'nx:outline-none',
  'nx:data-[highlighted=true]:bg-popover-hover',
  'nx:data-[highlighted=true]:text-popover-foreground',
  'nx:data-[disabled=true]:pointer-events-none',
  'nx:data-[disabled=true]:text-disabled-foreground',
].join(' ');

/**
 * MultiSelectProps
 *
 * Props for a searchable multiple-value selection field.
 */
interface MultiSelectProps
  extends
    Omit<
      React.ComponentProps<'div'>,
      'defaultValue' | 'id' | 'onChange' | 'onSelect'
    >,
    VariantProps<typeof multiSelectControlVariants> {
  /**
   * Input id used by labels and form libraries.
   */
  id?: string;
  /**
   * Options rendered in the popup. Pass grouped entries to create list sections.
   */
  options: readonly SelectionOptionInput[];
  /**
   * Controlled selected values.
   */
  value?: readonly string[];
  /**
   * Initial selected values for uncontrolled usage.
   */
  defaultValue?: readonly string[];
  /**
   * Called when selected values change.
   */
  onValueChange?: (value: string[]) => void;
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
   * Placeholder shown when no values are selected and the search input is empty.
   */
  placeholder?: string;
  /**
   * Text rendered while async options are loading.
   */
  loadingText?: React.ReactNode;
  /**
   * Text rendered when filtering returns no options.
   */
  emptyText?: React.ReactNode;
  /**
   * Whether async options are loading.
   */
  loading?: boolean;
  /**
   * Whether the field ignores interaction and is omitted from tab order.
   */
  disabled?: boolean;
  /**
   * Whether the field can receive focus but ignores edits.
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
   * Maximum number of chips shown before the rest collapse into a count.
   *
   * @default 3
   */
  maxVisibleValues?: number;
  /**
   * Highlight the first enabled option whenever the filter changes.
   *
   * @default true
   */
  autoHighlight?: boolean;
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

/**
 * MultiSelect
 *
 * Searchable multi-value field with removable chips and listbox-style option
 * toggling. It keeps selection and focus distinct so keyboard users can move
 * through options without replacing the current selection.
 */
function MultiSelect({
  id,
  className,
  options,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = 'Select options',
  loadingText = 'Loading options...',
  emptyText = 'No options found.',
  loading = false,
  disabled = false,
  readOnly = false,
  name,
  required,
  maxVisibleValues = 3,
  autoHighlight = true,
  size = 'default',
  variant,
  onKeyDown,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: MultiSelectProps) {
  const generatedId = React.useId();
  const inputId = id ?? `${generatedId}-input`;
  const popupId = `${generatedId}-popup`;
  const listboxId = `${generatedId}-listbox`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const groups = React.useMemo(
    () => normalizeSelectionGroups(options),
    [options]
  );
  const [value, setValue] = useControllableArrayState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableBooleanState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });
  const [inputValue, setInputValue] = React.useState('');
  const visibleGroups = React.useMemo(
    () => filterSelectionGroups(groups, inputValue),
    [groups, inputValue]
  );
  const visibleOptions = React.useMemo(
    () => flattenSelectionOptions(visibleGroups),
    [visibleGroups]
  );
  const [activeValue, setActiveValue] = React.useState<string | undefined>(() =>
    getFirstEnabledValue(visibleGroups)
  );
  const selectedOptions = value
    .map((item) => findSelectionOption(groups, item))
    .filter((option): option is SelectionOption => Boolean(option));
  const visibleSelectedOptions = selectedOptions.slice(0, maxVisibleValues);
  const overflowCount = Math.max(0, selectedOptions.length - maxVisibleValues);
  const activeId = activeValue
    ? getSelectionOptionDomId(listboxId, activeValue)
    : undefined;
  const hasListbox = !loading && visibleOptions.length > 0;
  const interactionDisabled = disabled || readOnly;

  const updateActiveValue = React.useCallback(
    (nextGroups = visibleGroups) => {
      const firstValue = getFirstEnabledValue(nextGroups);
      setActiveValue(autoHighlight ? firstValue : undefined);
    },
    [autoHighlight, visibleGroups]
  );

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setOpenState(nextOpen);
      if (!nextOpen) setInputValue('');
    },
    [setOpenState]
  );

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextInputValue = event.currentTarget.value;
      const nextGroups = filterSelectionGroups(groups, nextInputValue);

      setInputValue(nextInputValue);
      if (!interactionDisabled) setOpenState(true);
      updateActiveValue(nextGroups);
    },
    [groups, interactionDisabled, setOpenState, updateActiveValue]
  );

  const toggleOption = React.useCallback(
    (option: SelectionOption) => {
      if (option.disabled || interactionDisabled) return;

      setValue(toggleSelectionValue(value, option.value));
      setInputValue('');
      setOpenState(true);
      updateActiveValue(groups);
    },
    [
      groups,
      interactionDisabled,
      setOpenState,
      setValue,
      updateActiveValue,
      value,
    ]
  );

  const removeOption = React.useCallback(
    (optionValue: string) => {
      if (interactionDisabled) return;
      setValue(removeSelectionValue(value, optionValue));
    },
    [interactionDisabled, setValue, value]
  );

  const clearValues = React.useCallback(() => {
    if (interactionDisabled) return;
    setValue([]);
    setInputValue('');
    setOpenState(true);
    updateActiveValue(groups);
  }, [groups, interactionDisabled, setOpenState, setValue, updateActiveValue]);

  const toggleActiveOption = React.useCallback(() => {
    const option = visibleOptions.find((item) => item.value === activeValue);
    if (option) toggleOption(option);
  }, [activeValue, toggleOption, visibleOptions]);

  const moveActiveOption = React.useCallback(
    (direction: 1 | -1) => {
      const nextValue = getNextEnabledValue(
        visibleGroups,
        activeValue,
        direction
      );
      setActiveValue(nextValue);
    },
    [activeValue, visibleGroups]
  );

  const removeLastValue = React.useCallback(() => {
    if (value.length === 0 || inputValue !== '') return;
    setValue(value.slice(0, -1));
  }, [inputValue, setValue, value]);

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || interactionDisabled) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!open) setOpenState(true);
        moveActiveOption(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open) setOpenState(true);
        moveActiveOption(-1);
      } else if (event.key === 'Enter' && open && activeValue) {
        event.preventDefault();
        toggleActiveOption();
      } else if (event.key === 'Backspace') {
        removeLastValue();
      } else if (event.key === 'Escape' && open) {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === 'Tab' && open) {
        setOpen(false);
      }
    },
    [
      activeValue,
      interactionDisabled,
      moveActiveOption,
      onKeyDown,
      open,
      removeLastValue,
      setOpen,
      setOpenState,
      toggleActiveOption,
    ]
  );

  const handleInputFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      if (!event.defaultPrevented && !interactionDisabled) {
        setOpenState(true);
        updateActiveValue();
      }
    },
    [interactionDisabled, onFocus, setOpenState, updateActiveValue]
  );

  const handleInputBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
    },
    [onBlur]
  );

  const handleControlPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || interactionDisabled) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('button,input')) return;

      event.preventDefault();
      inputRef.current?.focus();
      setOpenState(true);
      updateActiveValue();
    },
    [interactionDisabled, setOpenState, updateActiveValue]
  );

  const handleContentInteractOutside = React.useCallback<
    NonNullable<
      React.ComponentProps<typeof PopoverPrimitive.Content>['onInteractOutside']
    >
  >((event) => {
    const target = event.target;

    if (target instanceof Node && rootRef.current?.contains(target)) {
      event.preventDefault();
    }
  }, []);

  React.useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div
        data-slot="multi-select"
        data-disabled={disabled ? 'true' : undefined}
        data-readonly={readOnly ? 'true' : undefined}
        data-empty={value.length === 0 ? 'true' : undefined}
        data-size={size}
        className={cn('nx:w-full', className)}
        {...props}
        ref={rootRef}
      >
        <PopoverPrimitive.Anchor asChild>
          <div
            data-slot="multi-select-control"
            data-disabled={disabled ? 'true' : undefined}
            data-invalid={ariaInvalid ? 'true' : undefined}
            data-size={size}
            data-variant={variant ?? 'default'}
            className={cn(multiSelectControlVariants({ size, variant }))}
            onPointerDown={handleControlPointerDown}
          >
            <IconSearch
              data-slot="multi-select-search-icon"
              aria-hidden="true"
              className="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:group-data-[disabled=true]/multi-select-control:text-disabled-foreground"
            />
            {visibleSelectedOptions.map((option) => (
              <span
                key={option.value}
                data-slot="multi-select-chip"
                className={cn(multiSelectChipVariants({ size }))}
              >
                <span className="nx:truncate">{option.label}</span>
                <button
                  type="button"
                  data-slot="multi-select-chip-remove"
                  aria-label={`Remove ${option.label}`}
                  disabled={interactionDisabled}
                  className={cn(multiSelectChipRemoveVariants({ size }))}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeOption(option.value);
                  }}
                >
                  <IconX aria-hidden="true" />
                </button>
              </span>
            ))}
            {overflowCount > 0 ? (
              <span
                data-slot="multi-select-overflow"
                className="nx:inline-flex nx:items-center nx:rounded-sm nx:bg-container nx:px-2 nx:py-1 nx:typography-label-default nx:text-muted-foreground"
              >
                +{overflowCount}
              </span>
            ) : null}
            <input
              ref={inputRef}
              id={inputId}
              data-slot="multi-select-input"
              role="combobox"
              type="text"
              autoComplete="off"
              aria-autocomplete="list"
              aria-activedescendant={open && hasListbox ? activeId : undefined}
              aria-controls={open ? popupId : undefined}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-invalid={ariaInvalid}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              disabled={disabled}
              readOnly={readOnly}
              required={required && value.length === 0}
              placeholder={value.length === 0 ? placeholder : undefined}
              value={inputValue}
              className={cn(multiSelectInputVariants({ size }))}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
            />
            {value.length > 0 ? (
              <button
                type="button"
                data-slot="multi-select-clear"
                aria-label="Clear selections"
                disabled={interactionDisabled}
                className={cn(multiSelectInlineButtonVariants({ size }))}
                onClick={(event) => {
                  event.stopPropagation();
                  clearValues();
                }}
              >
                <IconX aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                data-slot="multi-select-toggle"
                aria-label={open ? 'Close options' : 'Open options'}
                aria-expanded={open}
                disabled={interactionDisabled}
                className={cn(multiSelectInlineButtonVariants({ size }))}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(!open);
                }}
              >
                <IconChevronDown aria-hidden="true" />
              </button>
            )}
          </div>
        </PopoverPrimitive.Anchor>
        {name
          ? value.map((item) => (
              <input
                key={item}
                type="hidden"
                name={name}
                value={item}
                disabled={disabled}
              />
            ))
          : null}
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          id={popupId}
          data-slot="multi-select-content"
          aria-label={`${ariaLabel ?? placeholder} options`}
          align="start"
          sideOffset={4}
          className={multiSelectContentClassName}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={handleContentInteractOutside}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {loading ? (
            <div
              data-slot="multi-select-loading"
              role="status"
              className="nx:px-3 nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground"
            >
              {loadingText}
            </div>
          ) : visibleOptions.length === 0 ? (
            <div
              data-slot="multi-select-empty"
              className="nx:px-3 nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground"
            >
              {emptyText}
            </div>
          ) : (
            <div
              id={listboxId}
              data-slot="multi-select-list"
              role="listbox"
              aria-label={ariaLabel ?? placeholder}
              aria-multiselectable="true"
              className="nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:scroll-py-2"
            >
              {visibleGroups.map((group) => (
                <MultiSelectOptionGroup
                  key={group.label || 'ungrouped'}
                  group={group}
                  listboxId={listboxId}
                  activeValue={activeValue}
                  selectedValues={value}
                  onActiveValueChange={setActiveValue}
                  onToggleOption={toggleOption}
                />
              ))}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function MultiSelectOptionGroup({
  group,
  listboxId,
  activeValue,
  selectedValues,
  onActiveValueChange,
  onToggleOption,
}: {
  group: ReturnType<typeof normalizeSelectionGroups>[number];
  listboxId: string;
  activeValue: string | undefined;
  selectedValues: readonly string[];
  onActiveValueChange: (value: string) => void;
  onToggleOption: (option: SelectionOption) => void;
}) {
  return (
    <div
      data-slot="multi-select-group"
      role={group.label ? 'group' : undefined}
      aria-label={group.label || undefined}
      className="nx:p-1"
    >
      {group.label ? (
        <div
          data-slot="multi-select-group-label"
          className="nx:px-2 nx:py-1.5 nx:typography-label-small nx:text-muted-foreground"
        >
          {group.label}
        </div>
      ) : null}
      {group.options.map((option) => {
        const selected = includesSelectionValue(selectedValues, option.value);
        const highlighted = activeValue === option.value;

        return (
          <div
            key={option.value}
            id={getSelectionOptionDomId(listboxId, option.value)}
            data-slot="multi-select-option"
            data-highlighted={highlighted ? 'true' : undefined}
            data-selected={selected ? 'true' : undefined}
            data-disabled={option.disabled ? 'true' : undefined}
            role="option"
            aria-disabled={option.disabled || undefined}
            aria-selected={selected}
            tabIndex={-1}
            className={multiSelectOptionClassName}
            onPointerDown={(event) => {
              event.preventDefault();
              onToggleOption(option);
            }}
            onPointerMove={() => {
              if (!option.disabled) onActiveValueChange(option.value);
            }}
          >
            <span
              data-slot="multi-select-option-indicator"
              aria-hidden="true"
              className={cn(
                'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default nx:pt-0.5',
                selected &&
                  'nx:border-primary-background nx:bg-primary-background nx:text-primary-foreground'
              )}
            >
              {selected ? <IconCheck className="nx:size-3.5" /> : null}
            </span>
            <span className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5">
              <span data-slot="multi-select-option-label">{option.label}</span>
              {option.description ? (
                <span
                  data-slot="multi-select-option-description"
                  className="nx:typography-body-small nx:text-muted-foreground nx:group-data-[highlighted=true]/multi-select-option:text-popover-foreground"
                >
                  {option.description}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export {
  MultiSelect,
  type SelectionOption as MultiSelectOption,
  type SelectionOptionGroup as MultiSelectOptionGroup,
  type SelectionOptionInput as MultiSelectOptionInput,
  type MultiSelectProps,
};
