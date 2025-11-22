import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';

export interface DropZoneProps {
  index: number;
  isActive?: boolean;
}

export const DropZone = memo(function DropZone({ index, isActive = false }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `dropzone-${index}`,
    data: {
      index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${
        isActive
          ? isOver
            ? 'h-24 border-2 border-dashed border-blue-500 bg-blue-50'
            : 'h-12 border-2 border-dashed border-gray-300 bg-gray-50'
          : 'h-4'
      } rounded-lg`}
    >
      {isActive && isOver && (
        <div className="flex h-full items-center justify-center text-sm text-blue-600">
          Drop component here
        </div>
      )}
    </div>
  );
});
