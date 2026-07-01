import * as React from 'react';

/** Size shared from a ButtonGroup to its members. */
type ButtonGroupSize = 'sm' | 'default' | 'lg';

/**
 * A ButtonGroup broadcasts its `size` through this context; `Button` and
 * `ButtonGroupText` consume it. Context (not a `cloneElement` walk over direct
 * children) is what lets a grouped Button inherit the group size even when it
 * is nested inside a trigger wrapper — e.g. a split button's
 * `<DropdownMenuTrigger asChild>` — that the group cannot reach directly. An
 * explicit `size` on the child wins over the group's.
 */
const ButtonGroupSizeContext = React.createContext<ButtonGroupSize | undefined>(
  undefined
);

export { type ButtonGroupSize, ButtonGroupSizeContext };
