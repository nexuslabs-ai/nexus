/**
 * Generic Component Fixture
 *
 * Component with TypeScript generics.
 * Used for testing extraction of:
 * - Generic type parameters
 * - Generic constraints
 * - Complex type inference
 */

import * as React from 'react';

/**
 * Props for the List component with generic item type.
 */
interface ListProps<T> {
  /**
   * Array of items to render.
   */
  items: T[];

  /**
   * Render function for each item.
   */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Key extraction function.
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Component to render when items array is empty.
   */
  emptyState?: React.ReactNode;

  /**
   * Whether to show loading skeleton.
   * @default false
   */
  loading?: boolean;

  /**
   * CSS class name for the list container.
   */
  className?: string;
}

/**
 * A generic list component that renders items of any type.
 */
function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyState,
  loading = false,
  className,
}: ListProps<T>) {
  if (loading) {
    return (
      <div data-slot="list" data-loading="true" className={className}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return (
      <div data-slot="list" data-empty="true" className={className}>
        {emptyState}
      </div>
    );
  }

  return (
    <ul data-slot="list" className={className}>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)} data-slot="list-item">
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

export { List, type ListProps };
