import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

export interface DragState {
  isDragging: boolean;
  draggedComponentType: string | null;
  draggedId: string | null;
  isReordering: boolean;
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
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // Dropped outside valid drop zone
      setDragState({
        isDragging: false,
        draggedComponentType: null,
        draggedId: null,
        isReordering: false
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
      isReordering: false
    });
  };

  const handleDragCancel = () => {
    setDragState({
      isDragging: false,
      draggedComponentType: null,
      draggedId: null,
      isReordering: false
    });
  };

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
