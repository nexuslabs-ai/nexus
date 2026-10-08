'use client';

import * as React from 'react';

/** Text-button size a container can broadcast to the Buttons inside it. */
type ButtonContextSize = 'xs' | 'sm' | 'default' | 'lg';

/**
 * A container — ButtonGroup, AlertActions — broadcasts a default Button `size`
 * through this context. Context (not a `cloneElement` walk over direct
 * children) is what lets a Button inherit the size even when it is nested
 * inside a trigger wrapper — e.g. a split button's
 * `<DropdownMenuTrigger asChild>` — that the container cannot reach directly.
 * An explicit `size` on the Button wins over the context's.
 */
const ButtonSizeContext = React.createContext<ButtonContextSize | undefined>(
  undefined
);

export { type ButtonContextSize, ButtonSizeContext };
