import * as React from 'react';

/**
 * SelectionOption
 *
 * Shared option model for searchable field controls.
 */
interface SelectionOption {
  /**
   * Stable submitted value.
   */
  value: string;
  /**
   * Human-readable option label used for display and filtering.
   */
  label: string;
  /**
   * Optional secondary copy rendered below the label.
   */
  description?: React.ReactNode;
  /**
   * Whether this option can be selected.
   */
  disabled?: boolean;
}

/**
 * SelectionOptionGroup
 *
 * Groups related options under an optional label.
 */
interface SelectionOptionGroup {
  /**
   * Group label announced by the listbox.
   */
  label: string;
  /**
   * Options in this group.
   */
  options: readonly SelectionOption[];
}

type SelectionOptionInput = SelectionOption | SelectionOptionGroup;

function isSelectionOptionGroup(
  option: SelectionOptionInput
): option is SelectionOptionGroup {
  return 'options' in option;
}

function normalizeSelectionGroups(
  options: readonly SelectionOptionInput[]
): SelectionOptionGroup[] {
  const groups: SelectionOptionGroup[] = [];
  let ungrouped: SelectionOption[] = [];

  for (const option of options) {
    if (isSelectionOptionGroup(option)) {
      if (ungrouped.length > 0) {
        groups.push({ label: '', options: ungrouped });
        ungrouped = [];
      }
      groups.push(option);
    } else {
      ungrouped.push(option);
    }
  }

  if (ungrouped.length > 0) groups.push({ label: '', options: ungrouped });

  return groups;
}

function flattenSelectionOptions(
  groups: readonly SelectionOptionGroup[]
): SelectionOption[] {
  return groups.flatMap((group) => group.options);
}

function filterSelectionGroups(
  groups: readonly SelectionOptionGroup[],
  query: string
): SelectionOptionGroup[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...groups];

  return groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) =>
        option.label.toLocaleLowerCase().includes(normalizedQuery)
      ),
    }))
    .filter((group) => group.options.length > 0);
}

function findSelectionOption(
  groups: readonly SelectionOptionGroup[],
  value: string
): SelectionOption | undefined {
  return flattenSelectionOptions(groups).find(
    (option) => option.value === value
  );
}

function getEnabledSelectionOptions(
  groups: readonly SelectionOptionGroup[]
): SelectionOption[] {
  return flattenSelectionOptions(groups).filter((option) => !option.disabled);
}

function getFirstEnabledValue(
  groups: readonly SelectionOptionGroup[]
): string | undefined {
  return getEnabledSelectionOptions(groups)[0]?.value;
}

function getLastEnabledValue(
  groups: readonly SelectionOptionGroup[]
): string | undefined {
  const enabledOptions = getEnabledSelectionOptions(groups);

  return enabledOptions[enabledOptions.length - 1]?.value;
}

function getNextEnabledValue(
  groups: readonly SelectionOptionGroup[],
  activeValue: string | undefined,
  direction: 1 | -1
): string | undefined {
  const enabledOptions = getEnabledSelectionOptions(groups);
  if (enabledOptions.length === 0) return undefined;

  const activeIndex = enabledOptions.findIndex(
    (option) => option.value === activeValue
  );
  const fallbackIndex = direction === 1 ? 0 : enabledOptions.length - 1;
  const nextIndex =
    activeIndex === -1
      ? fallbackIndex
      : (activeIndex + direction + enabledOptions.length) %
        enabledOptions.length;

  return enabledOptions[nextIndex]?.value;
}

function getSelectionOptionDomId(baseId: string, value: string) {
  return `${baseId}-option-${encodeURIComponent(value)}`;
}

function getNodeText(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }

      if (React.isValidElement(child)) {
        return getNodeText(
          (child.props as { children?: React.ReactNode }).children
        );
      }

      return '';
    })
    .join('');
}

export {
  filterSelectionGroups,
  findSelectionOption,
  flattenSelectionOptions,
  getFirstEnabledValue,
  getLastEnabledValue,
  getNextEnabledValue,
  getNodeText,
  getSelectionOptionDomId,
  isSelectionOptionGroup,
  normalizeSelectionGroups,
  type SelectionOption,
  type SelectionOptionGroup,
  type SelectionOptionInput,
};
