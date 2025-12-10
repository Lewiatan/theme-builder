import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { ComponentRegistry } from '../../types/workspace';
import { DraggableComponentCard } from './DraggableComponentCard';

export interface ComponentLibrarySidebarProps {
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  componentRegistry: ComponentRegistry;
  onComponentDragStart?: (componentType: string) => void;
}

export function ComponentLibrarySidebar({
  isCollapsed,
  onCollapseToggle,
  componentRegistry,
}: ComponentLibrarySidebarProps) {
  // Track if we've loaded from localStorage to prevent infinite loops
  const hasLoadedFromStorage = useRef(false);

  // Load collapsed state from localStorage once on mount
  useEffect(() => {
    if (!hasLoadedFromStorage.current) {
      const saved = localStorage.getItem('componentLibrary:collapsed');
      if (saved !== null) {
        const savedCollapsed = JSON.parse(saved);
        if (savedCollapsed !== isCollapsed) {
          onCollapseToggle();
        }
      }
      hasLoadedFromStorage.current = true;
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('componentLibrary:collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Get all components as a flat list
  const allComponents = Object.entries(componentRegistry)
    .map(([type, entry]) => ({
      type,
      meta: entry.meta,
    }));

  if (isCollapsed) {
    return (
      <aside className="w-16 border-r bg-gray-50 p-2" role="complementary" aria-label="Component library (collapsed)">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapseToggle}
          className="w-full"
          title="Expand component library"
        >
          →
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r bg-gray-50 p-4" role="complementary" aria-label="Component library" data-testid="component-library">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapseToggle}
          title="Collapse component library"
        >
          ←
        </Button>
      </div>

      {/* All components in a simple list */}
      <div className="space-y-2">
        {allComponents.map(({ type, meta }) => (
          <DraggableComponentCard
            key={type}
            componentType={type}
            metadata={meta}
          />
        ))}
      </div>
    </aside>
  );
}
