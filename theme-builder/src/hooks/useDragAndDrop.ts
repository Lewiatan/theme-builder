import { useState } from 'react';
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { toast } from 'sonner';

export interface DragState {
  isDragging: boolean;
  draggedComponentType: string | null;
  draggedId: string | null;
  isReordering: boolean;
  isOverDropZone: boolean;
  isOverCanvas: boolean;
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
    isOverDropZone: false,
    isOverCanvas: false,
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
      isOverDropZone: false,
      isOverCanvas: false,
    });
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over } = event;

    // Determine if currently over a dropzone or canvas component
    const overType = over?.data.current?.type as string | undefined;
    const isOverDropZone = overType === 'dropzone';
    const isOverCanvasComponent = overType === 'canvas-component';
    const isOverCanvas = isOverDropZone || isOverCanvasComponent;

    // Only update state if collision status changed
    setDragState((prev) => {
      if (prev.isOverDropZone !== isOverDropZone || prev.isOverCanvas !== isOverCanvas) {
        return {
          ...prev,
          isOverDropZone,
          isOverCanvas,
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
        isOverDropZone: false,
        isOverCanvas: false,
      });
      return;
    }

    const activeType = active.data.current?.type as string;

    // Handle reordering existing components on canvas
    if (activeType === 'canvas-component') {
      const oldIndex = layout.findIndex((item) => item.id === active.id);
      const newIndex = layout.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onComponentReorder(oldIndex, newIndex);
      }
    } else {
      // Handle adding new component from library
      const componentType = active.data.current?.componentType as string;
      const dropIndex = over.data.current?.index as number;

      if (componentType && dropIndex !== undefined) {
        onComponentAdd(componentType, dropIndex);
      }
    }

    setDragState({
      isDragging: false,
      draggedComponentType: null,
      draggedId: null,
      isReordering: false,
      isOverDropZone: false,
      isOverCanvas: false,
    });
  };

  const handleDragCancel = () => {
    setDragState({
      isDragging: false,
      draggedComponentType: null,
      draggedId: null,
      isReordering: false,
      isOverDropZone: false,
      isOverCanvas: false,
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
