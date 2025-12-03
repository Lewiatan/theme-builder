import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ComponentRegistry } from '../../types/workspace';
import { CanvasComponent } from './CanvasComponent';
import { EmptyCanvasPlaceholder } from './EmptyCanvasPlaceholder';
import { InsertionIndicator } from './InsertionIndicator';
import { ComponentDefinition } from '@/types/api';
import type { DragState } from '../../hooks/useDragAndDrop';

export interface CanvasProps {
  layout: ComponentDefinition[];
  componentRegistry: ComponentRegistry;
  onComponentDelete: (id: string) => void;
  onRestoreDefault?: () => void;
  dragState?: DragState;
}

export function Canvas({
  layout,
  componentRegistry,
  onComponentDelete,
  onRestoreDefault,
  dragState,
}: CanvasProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onComponentDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Show empty state when no components
  if (layout.length === 0) {
    return <EmptyCanvasPlaceholder onRestoreDefault={onRestoreDefault} />;
  }

  // Get array of component IDs for sortable context
  const componentIds = layout.map((comp) => comp.id);

  return (
    <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
      <div className="relative space-y-2">
        {/* Insertion indicator - shows where component will be dropped */}
        {dragState && (
          <InsertionIndicator
            insertionIndex={dragState.insertionIndex}
            layout={layout}
            isDragging={dragState.isDragging}
            draggedComponentId={dragState.draggedId}
          />
        )}

        {/* Render canvas components */}
        {layout.map((componentDef, index) => (
          <CanvasComponent
            key={componentDef.id}
            componentDefinition={componentDef}
            componentRegistry={componentRegistry}
            onDelete={handleDeleteClick}
            index={index}
            isAnyDragging={dragState?.isDragging || false}
          />
        ))}

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && handleCancelDelete()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Component</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this component? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SortableContext>
  );
}
