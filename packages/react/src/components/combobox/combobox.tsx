import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { IconCheck, IconChevronDown, IconSearch, IconX } from '../../lib/icons';
import {
  filterSelectionGroups,
  findSelectionOption,
  flattenSelectionOptions,
  getFirstEnabledValue,
  getNextEnabledValue,
  getSelectionOptionDomId,
  normalizeSelectionGroups,
  type SelectionOption,
  type SelectionOptionGroup,
  type SelectionOptionInput,
} from '../../lib/selection';
import { cn } from '../../lib/utils';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../input-group';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

const comboboxContentClassName = [
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

const comboboxOptionClassName = [
  'nx:group/combobox-option',
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
 * ComboboxProps
 *
 * Props for a searchable single-value selection field.
 */
interface ComboboxProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'id' | 'onChange' | 'onSelect'
> {
  /**
   * Input id used by labels and form libraries.
   */
  id?: string;
  /**
   * Options rendered in the popup. Pass grouped entries to create list sections.
   */
  options: readonly SelectionOptionInput[];
  /**
   * Controlled selected value. An empty string represents no selection.
   */
  value?: string;
  /**
   * Initial selected value for uncontrolled usage.
   */
  defaultValue?: string;
  /**
   * Called when a new option is selected or cleared.
   */
  onValueChange?: (value: string) => void;
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
   * Placeholder shown when no option is selected.
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
   * Whether to render a clear button when a value is selected.
   *
   * @default true
   */
  clearable?: boolean;
  /**
   * Form field name. The selected value is mirrored into a hidden input.
   */
  name?: string;
  /**
   * Whether the hidden form input is required.
   */
  required?: boolean;
  /**
   * Highlight the first enabled option whenever the filter changes.
   *
   * @default true
   */
  autoHighlight?: boolean;
  /**
   * Visual treatment for the input frame.
   *
   * @default 'default'
   */
  variant?: 'default' | 'borderless';
  /**
   * Field size. `default` is Nexus's medium control size.
   *
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg';
}

function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  prop: T | undefined;
  defaultProp: T;
  onChange?: (value: T) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: T) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue] as const;
}

/**
 * Combobox
 *
 * Editable single-value selection field. It uses Radix Popover for the floating
 * layer and Nexus-owned listbox semantics for filtering and selection.
 *
 * @example
 * ```tsx
 * <Combobox
 *   aria-label="Framework"
 *   options={[
 *     { value: 'next', label: 'Next.js' },
 *     { value: 'remix', label: 'Remix' },
 *   ]}
 * />
 * ```
 */
function Combobox({
  id,
  className,
  options,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = 'Select an option',
  loadingText = 'Loading options...',
  emptyText = 'No options found.',
  loading = false,
  disabled = false,
  readOnly = false,
  clearable = true,
  name,
  required,
  autoHighlight = true,
  variant,
  size = 'default',
  onKeyDown,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: ComboboxProps) {
  const generatedId = React.useId();
  const inputId = id ?? `${generatedId}-input`;
  const popupId = `${generatedId}-popup`;
  const listboxId = `${generatedId}-listbox`;
  const groups = React.useMemo(
    () => normalizeSelectionGroups(options),
    [options]
  );
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });
  const selectedOption = findSelectionOption(groups, value);
  const [inputValue, setInputValue] = React.useState(
    selectedOption?.label ?? ''
  );
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
  const activeId = activeValue
    ? getSelectionOptionDomId(listboxId, activeValue)
    : undefined;
  const hasValue = value !== '';
  const hasListbox = !loading && visibleOptions.length > 0;
  const interactionDisabled = disabled || readOnly;

  const resetInputValue = React.useCallback(() => {
    const option = findSelectionOption(groups, value);
    setInputValue(option?.label ?? '');
  }, [groups, value]);

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setOpenState(nextOpen);
      if (!nextOpen) resetInputValue();
    },
    [resetInputValue, setOpenState]
  );

  const updateActiveValue = React.useCallback(
    (nextGroups = visibleGroups) => {
      const firstValue = getFirstEnabledValue(nextGroups);
      setActiveValue(autoHighlight ? firstValue : undefined);
    },
    [autoHighlight, visibleGroups]
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

  const selectOption = React.useCallback(
    (option: SelectionOption) => {
      if (option.disabled || interactionDisabled) return;

      setValue(option.value);
      setInputValue(option.label);
      setOpenState(false);
    },
    [interactionDisabled, setOpenState, setValue]
  );

  const selectActiveOption = React.useCallback(() => {
    const option = visibleOptions.find((item) => item.value === activeValue);
    if (option) selectOption(option);
  }, [activeValue, selectOption, visibleOptions]);

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

  const clearValue = React.useCallback(() => {
    if (interactionDisabled) return;

    setValue('');
    setInputValue('');
    setOpenState(true);
    updateActiveValue(groups);
  }, [groups, interactionDisabled, setOpenState, setValue, updateActiveValue]);

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
        selectActiveOption();
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
      selectActiveOption,
      setOpen,
      setOpenState,
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

  React.useEffect(() => {
    if (!open) resetInputValue();
  }, [open, resetInputValue, value]);

  React.useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div
        data-slot="combobox"
        data-disabled={disabled ? 'true' : undefined}
        data-readonly={readOnly ? 'true' : undefined}
        data-empty={hasValue ? undefined : 'true'}
        data-size={size}
        className={cn('nx:w-full', className)}
        {...props}
      >
        <PopoverPrimitive.Anchor asChild>
          <InputGroup
            data-slot="combobox-control"
            data-disabled={disabled ? 'true' : undefined}
            data-size={size}
            variant={variant}
          >
            <InputGroupAddon>
              <IconSearch aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id={inputId}
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
              data-slot="input-group-control"
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              size={size}
              placeholder={placeholder}
              value={inputValue}
              onBlur={handleInputBlur}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
            />
            {clearable && hasValue ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Clear selection"
                  disabled={interactionDisabled}
                  size="icon-xs"
                  onClick={clearValue}
                >
                  <IconX aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label={open ? 'Close options' : 'Open options'}
                  aria-expanded={open}
                  disabled={interactionDisabled}
                  size="icon-xs"
                  onClick={() => setOpen(!open)}
                >
                  <IconChevronDown aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </PopoverPrimitive.Anchor>
        {name ? (
          <input
            type="hidden"
            name={name}
            value={value}
            required={required}
            disabled={disabled}
          />
        ) : null}
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          id={popupId}
          data-slot="combobox-content"
          aria-label={`${ariaLabel ?? placeholder} options`}
          align="start"
          sideOffset={4}
          className={comboboxContentClassName}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {loading ? (
            <div
              data-slot="combobox-loading"
              role="status"
              className="nx:px-3 nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground"
            >
              {loadingText}
            </div>
          ) : visibleOptions.length === 0 ? (
            <div
              data-slot="combobox-empty"
              className="nx:px-3 nx:py-6 nx:text-center nx:typography-body-default nx:text-muted-foreground"
            >
              {emptyText}
            </div>
          ) : (
            <div
              id={listboxId}
              data-slot="combobox-list"
              role="listbox"
              aria-label={ariaLabel ?? placeholder}
              className="nx:max-h-72 nx:overflow-y-auto nx:overflow-x-hidden nx:scroll-py-2"
            >
              {visibleGroups.map((group) => (
                <ComboboxOptionGroup
                  key={group.label || 'ungrouped'}
                  group={group}
                  listboxId={listboxId}
                  activeValue={activeValue}
                  selectedValue={value}
                  onActiveValueChange={setActiveValue}
                  onSelectOption={selectOption}
                />
              ))}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function ComboboxOptionGroup({
  group,
  listboxId,
  activeValue,
  selectedValue,
  onActiveValueChange,
  onSelectOption,
}: {
  group: ReturnType<typeof normalizeSelectionGroups>[number];
  listboxId: string;
  activeValue: string | undefined;
  selectedValue: string;
  onActiveValueChange: (value: string) => void;
  onSelectOption: (option: SelectionOption) => void;
}) {
  return (
    <div
      data-slot="combobox-group"
      role={group.label ? 'group' : undefined}
      aria-label={group.label || undefined}
      className="nx:p-1"
    >
      {group.label ? (
        <div
          data-slot="combobox-group-label"
          className="nx:px-2 nx:py-1.5 nx:typography-label-small nx:text-muted-foreground"
        >
          {group.label}
        </div>
      ) : null}
      {group.options.map((option) => {
        const selected = selectedValue === option.value;
        const highlighted = activeValue === option.value;

        return (
          <div
            key={option.value}
            id={getSelectionOptionDomId(listboxId, option.value)}
            data-slot="combobox-option"
            data-highlighted={highlighted ? 'true' : undefined}
            data-selected={selected ? 'true' : undefined}
            data-disabled={option.disabled ? 'true' : undefined}
            role="option"
            aria-disabled={option.disabled || undefined}
            aria-selected={selected}
            tabIndex={-1}
            className={comboboxOptionClassName}
            onPointerDown={(event) => {
              event.preventDefault();
              onSelectOption(option);
            }}
            onPointerMove={() => {
              if (!option.disabled) onActiveValueChange(option.value);
            }}
          >
            <span
              data-slot="combobox-option-indicator"
              aria-hidden="true"
              className="nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:pt-0.5"
            >
              {selected ? <IconCheck className="nx:size-4" /> : null}
            </span>
            <span className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5">
              <span data-slot="combobox-option-label">{option.label}</span>
              {option.description ? (
                <span
                  data-slot="combobox-option-description"
                  className="nx:typography-body-small nx:text-muted-foreground nx:group-data-[highlighted=true]/combobox-option:text-popover-foreground"
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
  Combobox,
  type SelectionOption as ComboboxOption,
  type SelectionOptionGroup as ComboboxOptionGroup,
  type SelectionOptionInput as ComboboxOptionInput,
  type ComboboxProps,
};
