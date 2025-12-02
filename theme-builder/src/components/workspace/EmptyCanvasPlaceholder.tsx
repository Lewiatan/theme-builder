import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';

export interface EmptyCanvasPlaceholderProps {
  onRestoreDefault?: () => void;
}

export const EmptyCanvasPlaceholder = memo(function EmptyCanvasPlaceholder({ onRestoreDefault }: EmptyCanvasPlaceholderProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'empty-canvas',
    data: {
      type: 'canvas-placeholder',
      index: 0,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Canvas is empty</h3>
        <p className="mb-6 text-sm text-gray-600">
          Drag components from the library to start building your page
        </p>
        {onRestoreDefault && (
          <Button onClick={onRestoreDefault}>
            Restore Default Layout
          </Button>
        )}
      </div>
    </div>
  );
});
