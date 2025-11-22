import React, { useState } from 'react';
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
import { DropZone } from './DropZone';
import { ComponentDefinition } from '@/types/api';

export interface CanvasProps {
  layout: ComponentDefinition[];
  componentRegistry: ComponentRegistry;
  onComponentDelete: (id: string) => void;
  onRestoreDefault?: () => void;
  isDragging?: boolean;
}

export function Canvas({
  layout,
  componentRegistry,
  onComponentDelete,
  onRestoreDefault,
  isDragging = false,
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
      <div className="space-y-2">
        {/* Drop zone at the beginning */}
        <DropZone index={0} isActive={isDragging} />

        {/* Render each component with drop zone after it */}
        {layout.map((componentDef, index) => (
          <React.Fragment key={componentDef.id}>
            <CanvasComponent
              componentDefinition={componentDef}
              componentRegistry={componentRegistry}
              onDelete={handleDeleteClick}
              index={index}
            />
            <DropZone index={index + 1} isActive={isDragging} />
          </React.Fragment>
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
