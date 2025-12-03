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
  isAnyDragging?: boolean;
}

export function CanvasComponent({
  componentDefinition,
  componentRegistry,
  onDelete,
  onSettings,
  index,
  isAnyDragging = false,
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

  // When any drag is active, disable transforms to freeze components in place
  // Only the dropbar moves, components stay still until drop
  const style = {
    transform: isAnyDragging ? 'none' : CSS.Transform.toString(transform),
    transition: isAnyDragging ? 'opacity 150ms ease-in-out' : transition,
    opacity: isDragging ? 0.5 : 1,
    pointerEvents: isDragging ? ('none' as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
      data-component-id={componentDefinition.id}
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
