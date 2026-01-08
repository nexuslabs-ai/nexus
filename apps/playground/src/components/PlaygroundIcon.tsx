import type { SVGProps } from 'react';

import { type IconName,useIcon } from '../store/iconStore';

/**
 * PlaygroundIcon props
 */
interface PlaygroundIconProps extends SVGProps<SVGSVGElement> {
  /** Icon name from the DS internal icon set */
  name: IconName;
  /** Icon size (width and height) */
  size?: number | string;
}

/**
 * PlaygroundIcon
 *
 * Renders an icon from the currently selected icon library.
 * Automatically switches between Tabler, Lucide, and Phosphor based on store state.
 *
 * @example
 * ```tsx
 * <PlaygroundIcon name="check" size={16} />
 * <PlaygroundIcon name="loader" className="nx:animate-spin" />
 * ```
 */
export function PlaygroundIcon({ name, size = 24, ...props }: PlaygroundIconProps) {
  const Icon = useIcon(name);

  return <Icon width={size} height={size} {...props} />;
}

export type { IconName,PlaygroundIconProps };
