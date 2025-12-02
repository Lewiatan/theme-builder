import { useEffect, useState } from 'react';
import type { ComponentDefinition } from '@/types/api';

export interface InsertionIndicatorProps {
  /**
   * The index where the component will be inserted (0 to N)
   */
  insertionIndex: number | null;

  /**
   * Current layout of components
   */
  layout: ComponentDefinition[];

  /**
   * Whether a drag operation is currently active
   */
  isDragging: boolean;

  /**
   * ID of the component being dragged (for collapsed height calculation)
   */
  draggedComponentId?: string | null;
}

/**
 * InsertionIndicator displays a horizontal bar showing where a dragged component
 * will be inserted when dropped.
 *
 * Features:
 * - Calculates pixel position based on insertion index
 * - Accounts for collapsed dragged component
 * - Smooth transitions between positions
 * - Only visible during active drag operations
 */
export function InsertionIndicator({
  insertionIndex,
  layout,
  isDragging,
  draggedComponentId,
}: InsertionIndicatorProps) {
  const [indicatorY, setIndicatorY] = useState<number | null>(null);

  useEffect(() => {
    // Don't show indicator if not dragging or no insertion index
    if (!isDragging || insertionIndex === null) {
      setIndicatorY(null);
      return;
    }

    // Calculate pixel position based on insertion index
    const calculatePosition = () => {
      // Edge case: Empty canvas or insert at beginning
      if (layout.length === 0 || insertionIndex === 0) {
        // Position at top of canvas (first component or placeholder position)
        const firstElement = document.querySelector('[data-component-id]');
        if (firstElement) {
          const rect = firstElement.getBoundingClientRect();
          const container = firstElement.parentElement?.parentElement;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            return rect.top - containerRect.top - 8; // 8px spacing
          }
        }
        return 0;
      }

      // Get the component before the insertion point
      const componentBeforeIndex = insertionIndex - 1;
      if (componentBeforeIndex >= 0 && componentBeforeIndex < layout.length) {
        const componentBefore = layout[componentBeforeIndex];
        const element = document.querySelector(
          `[data-component-id="${componentBefore.id}"]`
        );

        if (element) {
          const rect = element.getBoundingClientRect();
          const container = element.parentElement?.parentElement;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            // Position after the component (bottom + gap)
            return rect.bottom - containerRect.top + 4; // 4px = half of 8px gap
          }
        }
      }

      // Edge case: Insert at end
      if (insertionIndex >= layout.length && layout.length > 0) {
        const lastComponent = layout[layout.length - 1];
        const element = document.querySelector(
          `[data-component-id="${lastComponent.id}"]`
        );

        if (element) {
          const rect = element.getBoundingClientRect();
          const container = element.parentElement?.parentElement;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            // Position after last component
            return rect.bottom - containerRect.top + 4;
          }
        }
      }

      return null;
    };

    const position = calculatePosition();
    setIndicatorY(position);
  }, [insertionIndex, layout, isDragging, draggedComponentId]);

  // Don't render if not dragging or no position calculated
  if (!isDragging || indicatorY === null) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-50"
      style={{
        top: `${indicatorY}px`,
        transition: 'top 200ms ease-out, opacity 150ms ease-in',
      }}
      role="presentation"
      aria-live="polite"
      aria-label={`Insert position: ${insertionIndex}`}
    >
      <div
        className="mx-4 h-1 rounded-full bg-blue-500 shadow-lg"
        style={{
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
        }}
      />
    </div>
  );
}
