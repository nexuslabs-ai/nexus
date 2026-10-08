'use client';

import * as React from 'react';

import type { ButtonProps } from './button';

/**
 * A container broadcasts a default Button `variant` through this context, the
 * way ButtonSizeContext broadcasts size. An explicit `variant` on the
 * Button wins over the context's.
 */
const ButtonVariantContext =
  React.createContext<ButtonProps['variant']>(undefined);

export { ButtonVariantContext };
