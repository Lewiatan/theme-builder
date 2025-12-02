import { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';
import { toast } from 'sonner';
import { conditionalAxisRestriction } from '../../utils/dragModifiers';
import { Button } from '@/components/ui/button';
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
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { TopNavigationBar } from './TopNavigationBar';
import { ComponentLibrarySidebar } from './ComponentLibrarySidebar';
import { ThemeSettingsSidebar } from './ThemeSettingsSidebar';
import { Canvas } from './Canvas';
import { componentRegistry } from '../../lib/componentRegistry';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { getShopIdFromToken } from '../../lib/auth';
import type { PageType } from '../../types/api';

export function WorkspaceView() {
  const {
    currentPageType,
    currentLayout,
    hasUnsavedChanges,
    isSaving,
    isResetting,
    isLoading,
    error,
    setCurrentPageType,
    addComponent,
    reorderComponent,
    deleteComponent,
    saveLayout,
    resetLayout,
  } = useWorkspace();

  const [isThemeSidebarOpen, setIsThemeSidebarOpen] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [pageChangeDialog, setPageChangeDialog] = useState<{
    open: boolean;
    targetPageType: PageType | null;
  }>({ open: false, targetPageType: null });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Set up drag and drop
  const { dragState, handleDragStart, handleDragMove, handleDragEnd, handleDragCancel } = useDragAndDrop(
    addComponent,
    reorderComponent,
    currentLayout
  );

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Measure canvas width for DragOverlay
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.offsetWidth;
        setCanvasWidth(width);
      }
    };

    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, [isLibraryCollapsed, isThemeSidebarOpen]);

  // Configure sensors for drag operations
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const pageTypes: PageType[] = ['home', 'catalog', 'product', 'contact'];

  const handlePageTypeChange = useCallback((type: PageType) => {
    if (hasUnsavedChanges) {
      setPageChangeDialog({ open: true, targetPageType: type });
    } else {
      setCurrentPageType(type);
    }
  }, [hasUnsavedChanges, setCurrentPageType]);

  const handleConfirmPageChange = useCallback(() => {
    if (pageChangeDialog.targetPageType) {
      setCurrentPageType(pageChangeDialog.targetPageType);
    }
    setPageChangeDialog({ open: false, targetPageType: null });
  }, [pageChangeDialog.targetPageType, setCurrentPageType]);

  const handleCancelPageChange = useCallback(() => {
    setPageChangeDialog({ open: false, targetPageType: null });
  }, []);

  const handleReset = useCallback(() => {
    setResetDialogOpen(true);
  }, []);

  const handleConfirmReset = useCallback(async () => {
    setResetDialogOpen(false);
    try {
      await resetLayout();
      toast.success('Page reset to default layout successfully');
    } catch (err) {
      toast.error('Failed to reset page. Please try again.');
      console.error('Reset error:', err);
    }
  }, [resetLayout]);

  const handleSave = useCallback(async () => {
    try {
      await saveLayout();
      toast.success('Page layout saved successfully');
    } catch (err) {
      toast.error('Failed to save page. Please try again.');
      console.error('Save error:', err);
    }
  }, [saveLayout]);

  const handleDemo = useCallback(() => {
    const shopId = getShopIdFromToken();
    if (shopId) {
      const demoShopUrl = import.meta.env.VITE_DEMO_SHOP_URL || 'http://localhost:5174';
      window.open(`${demoShopUrl}/shop/${shopId}`, '_blank');
    } else {
      toast.error('Unable to open demo: Shop ID not found');
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    setIsThemeSidebarOpen((prev) => !prev);
  }, []);

  const handleLibraryToggle = useCallback(() => {
    setIsLibraryCollapsed((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading workspace...</div>
      </div>
    );
  }

  if (error) {
    // If authentication error, show login prompt
    if (error.includes('authenticated') || error.includes('Authentication')) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Not Authenticated</p>
            <p className="mt-2 text-gray-600">Please log in to access the workspace.</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4">
              Go to Login
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Error</p>
          <p className="mt-2 text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render drag overlay preview
  const renderDragOverlay = () => {
    if (!dragState.isDragging) return null;

    let metadata = null;

    // Dragging from library
    if (dragState.draggedComponentType && componentRegistry[dragState.draggedComponentType]) {
      metadata = componentRegistry[dragState.draggedComponentType].meta;
    }
    // Reordering from canvas
    else if (dragState.isReordering && dragState.draggedId) {
      const component = currentLayout.find((item) => item.id === dragState.draggedId);
      if (component) {
        const componentEntry = componentRegistry[component.type];
        if (componentEntry) {
          metadata = componentEntry.meta;
        }
      }
    }

    if (!metadata) return null;

    // Use full canvas width when over canvas or when reordering, otherwise auto width
    const shouldUseFullWidth = dragState.isOverCanvas || dragState.isReordering;

    return (
      <div
        style={{
          cursor: 'grabbing',
          borderRadius: '0.5rem',
          border: shouldUseFullWidth
            ? '2px solid rgb(34, 197, 94)' // Green border when over canvas
            : '2px solid rgb(59, 130, 246)', // Blue border when free dragging
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '1rem',
          width: shouldUseFullWidth && canvasWidth ? `${canvasWidth}px` : 'auto',
          transition: 'width 0.2s ease-in-out, border-color 0.2s ease-in-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Icon section */}
          <div
            style={{
              width: '3rem',
              height: '3rem',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.375rem',
              backgroundColor: 'rgb(219, 234, 254)',
              color: 'rgb(37, 99, 235)',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            {metadata.icon.slice(0, 2)}
          </div>
          {/* Content section */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(17, 24, 39)' }}>
              {metadata.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgb(107, 114, 128)', marginTop: '0.25rem' }}>
              {metadata.description}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      modifiers={[conditionalAxisRestriction]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DragOverlay dropAnimation={null} style={{ pointerEvents: 'none' }}>
        {renderDragOverlay()}
      </DragOverlay>

      <div className="flex h-screen flex-col" role="application" aria-label="Theme Builder Workspace">
        <TopNavigationBar
          currentPageType={currentPageType}
          pageTypes={pageTypes}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          isResetting={isResetting}
          onPageTypeChange={handlePageTypeChange}
          onReset={handleReset}
          onSave={handleSave}
          onDemo={handleDemo}
          onThemeToggle={handleThemeToggle}
          isThemeSidebarOpen={isThemeSidebarOpen}
        />

        {/* Main workspace body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <ComponentLibrarySidebar
            isCollapsed={isLibraryCollapsed}
            onCollapseToggle={handleLibraryToggle}
            componentRegistry={componentRegistry}
          />

          {/* Center Canvas */}
          <main
            className="flex-1 overflow-auto bg-gray-100 p-8"
            role="main"
            aria-label="Page canvas"
          >
            <div ref={canvasRef} className="w-full">
              <Canvas
                layout={currentLayout}
                componentRegistry={componentRegistry}
                onComponentDelete={deleteComponent}
                onRestoreDefault={resetLayout}
                isDragging={dragState.isDragging}
              />
            </div>
          </main>

          {/* Right Sidebar - Theme Settings */}
          {isThemeSidebarOpen && <ThemeSettingsSidebar onClose={handleThemeToggle} />}
        </div>
      </div>

      {/* Page change confirmation dialog */}
      <AlertDialog open={pageChangeDialog.open} onOpenChange={(open) => !open && handleCancelPageChange()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to discard them and switch pages?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPageChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPageChange} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirmation dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this page to its default layout? All unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-red-600 hover:bg-red-700">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
