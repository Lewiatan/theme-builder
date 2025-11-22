import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ComponentMetadata } from '../../types/workspace';

export interface DraggableComponentCardProps {
  componentType: string;
  metadata: ComponentMetadata;
}

export const DraggableComponentCard = memo(function DraggableComponentCard({
  componentType,
  metadata,
}: DraggableComponentCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${componentType}`,
    data: {
      componentType,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-move rounded-lg border bg-white p-3 transition-all hover:border-blue-500 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon placeholder */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          <span className="text-xs font-semibold">{metadata.icon.slice(0, 2)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{metadata.name}</h4>
          <p className="mt-1 text-xs text-gray-600 line-clamp-2">{metadata.description}</p>
        </div>
      </div>
    </div>
  );
});
