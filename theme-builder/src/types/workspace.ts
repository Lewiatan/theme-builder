import type { PageData, ComponentDefinition, PageType } from './api';
import type { ZodSchema } from 'zod';

// Main workspace state
export interface WorkspaceState {
  pages: PageData[]; // All pages data
  currentPageType: PageType; // Currently selected page
  currentLayout: ComponentDefinition[]; // Working copy of layout
  originalLayout: ComponentDefinition[]; // Last saved layout
  hasUnsavedChanges: boolean; // Computed: currentLayout !== originalLayout
  isLoading: boolean; // API request in progress
  error: string | null; // Error message if API failed
  isSaving: boolean; // Save request in progress
  isResetting: boolean; // Reset request in progress
}

// Theme settings state (independent from page layout)
export interface ThemeState {
  settings: ThemeSettings;
  originalSettings: ThemeSettings;
  hasUnsavedThemeChanges: boolean;
  isSavingTheme: boolean;
  isThemeSidebarOpen: boolean;
}

// Theme configuration
export interface ThemeSettings {
  primaryColor: string; // Hex color
  secondaryColor: string; // Hex color
  accentColor: string; // Hex color
  headingFont: string; // Font family name
  bodyFont: string; // Font family name
}

// Component category
export type ComponentCategory = 'Content' | 'Navigation' | 'Products' | 'Forms' | 'Media';

// Variant definition
export interface VariantDefinition {
  id: string; // Variant identifier
  name: string; // Display name
  description: string;
  previewImage?: string; // Optional preview thumbnail
}

// Component metadata from shared components
export interface ComponentMetadata {
  id: string; // Component type identifier
  name: string; // Display name
  description: string; // Brief description
  icon: string; // Icon name or path
  category: ComponentCategory;
  variants: VariantDefinition[];
  propsSchema: ZodSchema; // Zod schema for validation
}

// Component registry entry
export interface ComponentRegistryEntry {
  meta: ComponentMetadata; // From shared component's meta.ts
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>; // Default props for new instances
}

// Component registry map
export type ComponentRegistry = Record<string, ComponentRegistryEntry>;

// Drag-and-drop state
export interface DragState {
  isDragging: boolean;
  draggedItemType: 'new-component' | 'canvas-component' | null;
  draggedComponentType: string | null; // Component type if dragging new component
  draggedComponentId: string | null; // Component ID if reordering
  dropIndicatorIndex: number | null; // Where component will drop
}

// Confirmation dialog state
export interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

// Workspace context value
export interface WorkspaceContextValue {
  // State
  pages: PageData[];
  currentPageType: PageType;
  currentLayout: ComponentDefinition[];
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  isResetting: boolean;

  // Operations
  setCurrentPageType: (type: PageType) => void;
  addComponent: (componentType: string, atIndex: number) => void;
  reorderComponent: (fromIndex: number, toIndex: number) => void;
  deleteComponent: (componentId: string) => void;
  saveLayout: () => Promise<void>;
  resetLayout: () => Promise<void>;
  refreshPages: () => Promise<void>;
}
