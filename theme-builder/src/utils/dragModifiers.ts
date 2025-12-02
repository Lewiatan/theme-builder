import type { Modifier } from '@dnd-kit/core';

/**
 * Custom drag modifier that conditionally restricts movement based on drag context.
 *
 * Behavior:
 * - Reordering canvas components: Vertical-only restriction (prevents ghost components)
 * - Library components NOT over dropzone: Free X/Y movement
 * - Library components over dropzone: Vertical-only restriction
 */
export const conditionalAxisRestriction: Modifier = ({ transform, active }) => {
  // Safety check: ensure active and active.data exist
  if (!active || !active.data || !active.data.current) {
    return transform;
  }

  const activeData = active.data.current;
  const activeType = activeData.type as string | undefined;
  const isReordering = activeType === 'canvas-component';

  // State A: Reordering existing canvas components
  // Always restrict to vertical axis to prevent ghost components
  if (isReordering) {
    return {
      ...transform,
      x: 0,
    };
  }

  // State B & C: Dragging from library
  // For library items, we DON'T restrict movement - they should follow the cursor freely
  // The visual restriction (DragOverlay width expansion) is handled separately in the UI
  // This allows natural drag behavior where the item follows the mouse cursor
  return transform;
};
