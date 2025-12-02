/**
 * Calculates the insertion index for a dragged component based on cursor position
 * and the layout of existing components.
 */

export interface InsertionCalculationParams {
  /**
   * Current Y position of the cursor relative to the viewport
   */
  cursorY: number;

  /**
   * Array of component IDs in the current layout
   */
  componentIds: string[];

  /**
   * ID of the component currently being dragged (if reordering)
   */
  draggedComponentId?: string | null;

  /**
   * Container element that holds all canvas components
   */
  containerElement?: HTMLElement | null;
}

export interface InsertionCalculationResult {
  /**
   * The index where the component should be inserted (0 to N)
   */
  insertionIndex: number;

  /**
   * ID of the component currently being hovered over
   */
  hoveredComponentId: string | null;
}

/**
 * Calculates where a dragged component should be inserted based on cursor position.
 *
 * Algorithm:
 * 1. Get bounding rectangles for all components in the layout
 * 2. Find which component the cursor is currently over
 * 3. Determine if cursor is in top half or bottom half of that component
 * 4. Return appropriate insertion index (before or after the component)
 *
 * Edge cases handled:
 * - Empty canvas: Returns index 0
 * - Above first component: Returns index 0
 * - Below last component: Returns index N (after last)
 * - Between components: Calculates based on cursor position relative to component center
 * - Dragging component itself: Accounts for collapsed height in calculation
 */
export function calculateInsertionPoint(
  params: InsertionCalculationParams
): InsertionCalculationResult {
  const { cursorY, componentIds, draggedComponentId } = params;

  // Edge case: Empty canvas
  if (componentIds.length === 0) {
    return {
      insertionIndex: 0,
      hoveredComponentId: null,
    };
  }

  // Get bounding rectangles for all components
  const componentRects = componentIds
    .map((id) => {
      const element = document.querySelector(`[data-component-id="${id}"]`);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      return {
        id,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        centerY: rect.top + rect.height / 2,
      };
    })
    .filter((rect): rect is NonNullable<typeof rect> => rect !== null);

  // If no valid rectangles found, default to index 0
  if (componentRects.length === 0) {
    return {
      insertionIndex: 0,
      hoveredComponentId: null,
    };
  }

  // Edge case: Cursor is above the first component
  const firstComponent = componentRects[0];
  if (cursorY < firstComponent.top) {
    return {
      insertionIndex: 0,
      hoveredComponentId: null,
    };
  }

  // Edge case: Cursor is below the last component
  const lastComponent = componentRects[componentRects.length - 1];
  if (cursorY > lastComponent.bottom) {
    return {
      insertionIndex: componentIds.length,
      hoveredComponentId: null,
    };
  }

  // Find which component the cursor is over
  for (let i = 0; i < componentRects.length; i++) {
    const component = componentRects[i];

    if (cursorY >= component.top && cursorY <= component.bottom) {
      const isInTopHalf = cursorY < component.centerY;

      // If dragging the component itself, prevent self-insertion
      if (component.id === draggedComponentId) {
        // Continue to next component or use adjacent position
        if (isInTopHalf && i > 0) {
          // Cursor in top half of dragged component - insert before it
          return {
            insertionIndex: i,
            hoveredComponentId: component.id,
          };
        } else if (!isInTopHalf && i < componentRects.length - 1) {
          // Cursor in bottom half of dragged component - insert after it
          return {
            insertionIndex: i + 1,
            hoveredComponentId: component.id,
          };
        }
        // If at edges, continue searching
        continue;
      }

      // Normal case: cursor over a different component
      if (isInTopHalf) {
        // Cursor in top half - insert before this component
        return {
          insertionIndex: i,
          hoveredComponentId: component.id,
        };
      } else {
        // Cursor in bottom half - insert after this component
        return {
          insertionIndex: i + 1,
          hoveredComponentId: component.id,
        };
      }
    }
  }

  // Fallback: Default to end of list
  return {
    insertionIndex: componentIds.length,
    hoveredComponentId: null,
  };
}
