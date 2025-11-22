import { Suspense, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import type { ComponentRegistry } from '../../types/workspace';
import { ComponentDefinition } from '@/types/api';
import { getShopIdFromToken } from '@/lib/auth';

export interface CanvasComponentProps {
  componentDefinition: ComponentDefinition;
  componentRegistry: ComponentRegistry;
  onDelete: (id: string) => void;
  onSettings?: (id: string) => void;
  index: number;
}

export function CanvasComponent({
  componentDefinition,
  componentRegistry,
  onDelete,
  onSettings,
  index,
}: CanvasComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: componentDefinition.id,
    data: {
      type: 'canvas-component',
      componentDefinition,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const componentEntry = componentRegistry[componentDefinition.type];

  if (!componentEntry) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          Component type "{componentDefinition.type}" not found in registry
        </p>
      </div>
    );
  }

  const Component = componentEntry.Component;

  // Get shopId from JWT token
  const shopId = getShopIdFromToken();

  if (!shopId) {
    return (
      <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800 font-semibold">Invalid Token</p>
        <p className="text-xs text-yellow-700 mt-1">
          Shop ID not found in JWT token. Please log in again with a valid token.
        </p>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            localStorage.removeItem('jwt_token');
            window.location.href = '/';
          }}
          className="mt-3"
        >
          Re-login
        </Button>
      </div>
    );
  }

  // Merge defaultProps from registry with saved props from database
  // This ensures components have all required runtime props (like categories, products)
  // even if the database only has the editable configuration props
  const mergedProps = {
    shopId,
    isLoading: false,
    error: null,
    ...componentEntry.defaultProps, // Default props from componentRegistry
    ...componentDefinition.props,    // Saved props from database (overrides defaults)
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover controls overlay */}
      {isHovered && (
        <div className="absolute right-2 top-2 z-10 flex gap-2">
          {/* Drag handle */}
          <Button
            variant="secondary"
            size="icon"
            {...attributes}
            {...listeners}
            className="cursor-move"
            title="Drag to reorder"
          >
            ⋮⋮
          </Button>
          {/* Settings button (future US-007) */}
          {onSettings && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onSettings(componentDefinition.id)}
              title="Component settings"
            >
              ⚙️
            </Button>
          )}

          {/* Delete button */}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(componentDefinition.id)}
            title="Delete component"
          >
            🗑️
          </Button>
        </div>
      )}

      {/* Render component with suspense boundary */}
      <Suspense
        fallback={
          <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-gray-300 bg-gray-50">
            <div className="text-sm text-gray-500">Loading component...</div>
          </div>
        }
      >
        <div className="rounded-lg border border-transparent transition-colors group-hover:border-blue-300">
          <Component
            {...mergedProps}
            variant={componentDefinition.variant}
          />
        </div>
      </Suspense>
    </div>
  );
}
