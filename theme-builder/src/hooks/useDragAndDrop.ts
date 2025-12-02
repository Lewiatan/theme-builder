import { useState } from 'react';
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { toast } from 'sonner';
import { calculateInsertionPoint } from '../utils/insertionCalculator';

export interface DragState {
  isDragging: boolean;
  draggedComponentType: string | null;
  draggedId: string | null;
  isReordering: boolean;
  isOverCanvas: boolean;
  insertionIndex: number | null;
  hoveredComponentId: string | null;
}

export function useDragAndDrop(
  onComponentAdd: (componentType: string, atIndex: number) => void,
  onComponentReorder: (fromIndex: number, toIndex: number) => void,
  layout: Array<{ id: string }>
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedComponentType: null,
    draggedId: null,
    isReordering: false,
    isOverCanvas: false,
    insertionIndex: null,
    hoveredComponentId: null,
  });

  const handleDragStart = (event: DragStartEvent) => {
    const componentType = event.active.data.current?.componentType as string;
    const dragType = event.active.data.current?.type as string;
    const activeId = event.active.id as string;
    const isReordering = dragType === 'canvas-component';

    setDragState({
      isDragging: true,
      draggedComponentType: componentType || dragType,
      draggedId: activeId,
      isReordering,
      isOverCanvas: false,
      insertionIndex: null,
      hoveredComponentId: null,
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, active } = event;

    // Determine if currently over canvas component
    const overType = over?.data.current?.type as string | undefined;
    const isOverCanvasComponent = overType === 'canvas-component';
    const isOverCanvas = isOverCanvasComponent;

    // Calculate insertion point based on cursor position
    let insertionIndex: number | null = null;
    let hoveredComponentId: string | null = null;

    if (isOverCanvas && event.delta) {
      // Get cursor Y position from the active draggable element
      const activeRect = active.rect.current.translated;
      if (activeRect) {
        const cursorY = activeRect.top + activeRect.height / 2;

        // Get component IDs for calculation
        const componentIds = layout.map((comp) => comp.id);
        const draggedComponentId = active.id as string;

        // Calculate insertion point
        const result = calculateInsertionPoint({
          cursorY,
          componentIds,
          draggedComponentId: dragState.isReordering ? draggedComponentId : null,
        });

        insertionIndex = result.insertionIndex;
        hoveredComponentId = result.hoveredComponentId;
      }
    }

    // Only update state if collision status changed
    setDragState((prev) => {
      if (
        prev.isOverCanvas !== isOverCanvas ||
        prev.insertionIndex !== insertionIndex ||
        prev.hoveredComponentId !== hoveredComponentId
      ) {
        return {
          ...prev,
          isOverCanvas,
          insertionIndex,
          hoveredComponentId,
        };
      }
      return prev;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // Dropped outside valid drop zone
      const activeType = active.data.current?.type as string;
      const isLibraryComponent = activeType !== 'canvas-component';

      // Show toast feedback for library components dropped outside canvas
      if (isLibraryComponent) {
        toast.info('Drop component on the canvas to add it');
      }

      setDragState({
        isDragging: false,
        draggedComponentType: null,
        draggedId: null,
        isReordering: false,
        isOverCanvas: false,
        insertionIndex: null,
        hoveredComponentId: null,
      });
      return;
    }

    const activeType = active.data.current?.type as string;

    // Use the calculated insertion index from drag state
    const { insertionIndex } = dragState;

    // Handle reordering existing components on canvas
    if (activeType === 'canvas-component') {
      const oldIndex = layout.findIndex((item) => item.id === active.id);

      // Use insertion index if available, otherwise fall back to over.id lookup
      let newIndex: number;
      if (insertionIndex !== null) {
        // Adjust insertion index if moving down (account for removal of dragged item)
        newIndex = insertionIndex > oldIndex ? insertionIndex - 1 : insertionIndex;
      } else {
        // Fallback to old behavior
        newIndex = layout.findIndex((item) => item.id === over.id);
      }

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onComponentReorder(oldIndex, newIndex);
      }
    } else {
      // Handle adding new component from library
      const componentType = active.data.current?.componentType as string;

      // Use insertion index if available, otherwise fall back to index from drop data
      const dropIndex = insertionIndex !== null
        ? insertionIndex
        : (over.data.current?.index as number);

      if (componentType && dropIndex !== undefined) {
        onComponentAdd(componentType, dropIndex);
      }
    }

    setDragState({
      isDragging: false,
      draggedComponentType: null,
      draggedId: null,
      isReordering: false,
      isOverCanvas: false,
      insertionIndex: null,
      hoveredComponentId: null,
    });
  };

  const handleDragCancel = () => {
    setDragState({
      isDragging: false,
      draggedComponentType: null,
      draggedId: null,
      isReordering: false,
      isOverCanvas: false,
      insertionIndex: null,
      hoveredComponentId: null,
    });
  };

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
  };
}
