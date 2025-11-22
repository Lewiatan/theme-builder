# Theme Builder Workspace View Implementation Plan

## 1. Overview

The Theme Builder Workspace is the main interface of the theme-builder application where authenticated users design and customize their shop pages. This view enables users to visually compose page layouts by dragging components from a library sidebar, arranging them on a canvas, and managing their page content through an intuitive drag-and-drop interface.

The workspace follows a three-panel layout: a collapsible left sidebar containing draggable component cards, a central canvas for live preview and component arrangement, and a collapsible right sidebar for theme customization. This implementation focuses on core component manipulation functionality: adding components via drag-and-drop, reordering existing components, and deleting components with confirmation.

## 2. View Routing

**Path**: `/` (root route, default view after authentication)

**Authentication**: Required - JWT Bearer token must be present in request headers

**Initial Load Behavior**:
- On mount, fetch all pages via `GET /api/pages`
- Default to "home" page type if no page is selected
- Display first page's layout on canvas
- Show error boundary if authentication fails or pages cannot be loaded

## 3. Component Structure

```
WorkspaceView (Main Container)
├── TopNavigationBar
│   ├── PageTypeSelector (Dropdown)
│   ├── UnsavedChangesIndicator
│   └── ActionButtonGroup
│       ├── ResetPageButton
│       ├── SavePageButton
│       ├── DemoButton
│       └── ThemeSettingsToggle
├── WorkspaceLayout (3-column grid)
│   ├── ComponentLibrarySidebar (280px, collapsible)
│   │   ├── SidebarHeader
│   │   │   └── CollapseToggle
│   │   └── ComponentAccordion
│   │       └── ComponentCategorySection[]
│   │           └── DraggableComponentCard[]
│   ├── Canvas (fluid width, DndContext)
│   │   ├── EmptyCanvasPlaceholder (when layout.length === 0)
│   │   ├── DropZone (SortableContext)
│   │   │   └── SortableCanvasComponent[]
│   │   │       ├── HoverControlsOverlay
│   │   │       │   ├── DragHandle
│   │   │       │   ├── SettingsButton
│   │   │       │   └── DeleteButton
│   │   │       └── RenderedSharedComponent (from @shared/components)
│   │   └── DropIndicator (visual feedback during drag)
│   └── ThemeSettingsSidebar (320px, collapsed by default, collapsible)
│       ├── SidebarHeader
│       │   └── CloseButton
│       └── ThemeSettingsPanel
│           ├── ColorPickers
│           ├── FontSelectors
│           ├── ResetThemeButton
│           └── SaveThemeButton
└── ConfirmationDialog (Modal, portal-rendered)
    ├── DialogTitle
    ├── DialogMessage
    └── DialogActions
        ├── CancelButton
        └── ConfirmButton
```

## 4. Component Details

### WorkspaceView (Main Container)

**Component description**: Top-level orchestrator for the entire workspace. Manages authentication, page data fetching, global workspace state, and coordinates interactions between all child components. Implements the DndContext for drag-and-drop functionality.

**Main elements**:
- `<div className="workspace-container">` - Full viewport height container with flex column layout
- `<TopNavigationBar />` - Fixed header component
- `<div className="workspace-body">` - Flex row container for three-panel layout
- `<DndContext>` from @dnd-kit/core - Wraps the canvas for drag-and-drop
- `<ConfirmationDialog />` - Portal-rendered modal for confirmations

**Handled events**:
- `onDragStart`: Track which component is being dragged (from library or canvas)
- `onDragOver`: Update drop indicator position
- `onDragEnd`: Handle drop logic (add new component or reorder existing)
- `useEffect` on mount: Fetch pages data via API
- `useEffect` on page type change: Update current layout state
- `useEffect` for beforeunload: Warn user of unsaved changes

**Validation conditions**:
- JWT token must be present in localStorage/context (redirect to login if missing)
- Selected page type must be one of: "home", "catalog", "product", "contact"
- Current layout must be valid JSON array matching ComponentDefinition schema
- API responses must match expected shape (validated via Zod schemas)

**Types**:
- `WorkspaceState` (view model)
- `PageData` (DTO from API)
- `ComponentDefinition` (DTO)
- `DragEvent` (from @dnd-kit)

**Props**: None (root component)

---

### TopNavigationBar

**Component description**: Fixed header bar spanning full width, containing page navigation controls, unsaved changes indicator, and action buttons for workspace operations.

**Main elements**:
- `<header className="top-nav">` - Fixed positioning, z-index above sidebars
- `<Select>` from shadcn/ui - Page type dropdown selector
- `<Badge>` - Unsaved changes indicator (conditional rendering)
- `<Button>` group - Reset, Save, Demo, Theme Settings toggle buttons

**Handled events**:
- `onPageTypeChange`: Switch active page type, show unsaved changes warning if needed
- `onResetClick`: Show confirmation dialog, call reset API
- `onSaveClick`: Call update layout API, clear unsaved flag
- `onDemoClick`: Open demo shop in new tab
- `onThemeToggle`: Toggle right sidebar visibility

**Validation conditions**:
- Reset button enabled only when `hasUnsavedChanges === true`
- Save button enabled only when `hasUnsavedChanges === true`
- Demo button always enabled (opens saved state)
- Page switching blocked if unsaved changes exist (show dialog first)

**Types**:
- `TopNavigationBarProps` - Receives state and callbacks from WorkspaceView
- `PageType` - Union type: "home" | "catalog" | "product" | "contact"

**Props**:
```typescript
interface TopNavigationBarProps {
  currentPageType: PageType;
  pageTypes: PageType[];
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isResetting: boolean;
  onPageTypeChange: (type: PageType) => void;
  onReset: () => void;
  onSave: () => void;
  onDemo: () => void;
  onThemeToggle: () => void;
  isThemeSidebarOpen: boolean;
}
```

---

### ComponentLibrarySidebar

**Component description**: Left sidebar containing categorized library of draggable component cards. Components are organized in accordion sections by category (Content, Navigation, Products, etc.). Sidebar can collapse to provide more canvas space.

**Main elements**:
- `<aside className="component-library-sidebar">` - Fixed width 280px, transitions on collapse
- `<div className="sidebar-header">` - Contains title and collapse toggle
- `<Accordion>` from shadcn/ui - Collapsible category sections
- `<AccordionItem>` per category - Navigation, Content, Products, Forms, Media
- `<DraggableComponentCard>` array - One card per component in registry

**Handled events**:
- `onCollapseToggle`: Toggle sidebar visibility, persist state to localStorage
- `onDragStart` (bubbled from cards): Handled by parent DndContext
- `onAccordionChange`: Track which category sections are expanded

**Validation conditions**:
- Component registry must be loaded and available
- Each component must have valid metadata (name, icon, category, default settings)
- Sidebar collapse state must be boolean (default: false)

**Types**:
- `ComponentLibrarySidebarProps`
- `ComponentRegistry` - Map of component types to metadata
- `ComponentCategory` - Union type for category names

**Props**:
```typescript
interface ComponentLibrarySidebarProps {
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  componentRegistry: ComponentRegistry;
  onComponentDragStart?: (componentType: string) => void;
}
```

---

### DraggableComponentCard

**Component description**: Individual component card within the library sidebar. Displays component icon, name, and description. Implements useDraggable hook from @dnd-kit for drag functionality.

**Main elements**:
- `<div className="component-card">` - Card container with hover effects
- `<div className="component-icon">` - Icon or thumbnail for component
- `<h4>` - Component display name
- `<p>` - Brief description of component purpose

**Handled events**:
- `useDraggable` hook: Provides drag handlers and state
- `onMouseEnter`: Show tooltip with full description
- `onMouseLeave`: Hide tooltip

**Validation conditions**:
- Component type must exist in registry
- Metadata must include: name, icon, category, defaultSettings
- defaultSettings must match component's props schema

**Types**:
- `DraggableComponentCardProps`
- `ComponentMetadata` - From shared components meta.ts files

**Props**:
```typescript
interface DraggableComponentCardProps {
  componentType: string;
  metadata: ComponentMetadata;
  isDragging?: boolean;
}
```

---

### Canvas

**Component description**: Central workspace area where components are arranged vertically. Implements SortableContext from @dnd-kit for reordering. Renders the current page layout with live preview of all components. Shows drop indicators during drag operations.

**Main elements**:
- `<main className="canvas">` - Fluid width, scrollable vertical container
- `<SortableContext>` from @dnd-kit/sortable - Wraps sortable component list
- `<EmptyCanvasPlaceholder>` - Shown when layout array is empty
- `<SortableCanvasComponent>` array - Rendered components with hover controls
- `<DropIndicator>` - Visual line showing drop position during drag

**Handled events**:
- `onDragOver`: Calculate and update drop indicator position
- `onDrop`: Handled by parent WorkspaceView DndContext
- `onComponentDelete`: Remove component from layout, show confirmation
- `onComponentSettings`: Open settings modal for component (future US-007)

**Validation conditions**:
- Current layout must be array of ComponentDefinition objects
- Each ComponentDefinition must have: id (UUID), type, variant, settings
- Component type must exist in component registry
- Settings must validate against component's Zod schema

**Types**:
- `CanvasProps`
- `ComponentDefinition` (DTO)
- `CanvasLayout` - Array of ComponentDefinition

**Props**:
```typescript
interface CanvasProps {
  layout: ComponentDefinition[];
  componentRegistry: ComponentRegistry;
  onComponentDelete: (componentId: string) => void;
  onComponentReorder: (oldIndex: number, newIndex: number) => void;
  isDragging: boolean;
  draggedComponentType?: string | null;
}
```

---

### SortableCanvasComponent

**Component description**: Wrapper for each rendered component on the canvas. Implements useSortable hook for drag-to-reorder functionality. Shows hover controls (drag handle, settings, delete) when user hovers over component. Renders the actual shared component with its settings.

**Main elements**:
- `<div className="canvas-component-wrapper">` - Sortable container with transform styles
- `<div className="hover-controls-overlay">` - Absolutely positioned control buttons (visible on hover)
- `<Button>` - Drag handle icon (grip-vertical from lucide-react)
- `<Button>` - Settings icon (cogwheel) - Future US-007
- `<Button>` - Delete icon (trash-2)
- Dynamic component render - Resolved from componentRegistry based on type

**Handled events**:
- `useSortable` hook: Provides drag handlers, listeners, and transform styles
- `onMouseEnter`: Show hover controls overlay
- `onMouseLeave`: Hide hover controls overlay
- `onDragHandleMouseDown`: Initiate drag operation
- `onDeleteClick`: Trigger delete confirmation dialog

**Validation conditions**:
- Component ID must be valid UUID v4 format
- Component type must exist in registry
- Component settings must pass Zod validation for component type
- Variant must be one of the component's allowed variants

**Types**:
- `SortableCanvasComponentProps`
- `ComponentDefinition` (DTO)
- `SortableData` - From @dnd-kit

**Props**:
```typescript
interface SortableCanvasComponentProps {
  componentDefinition: ComponentDefinition;
  onDelete: (id: string) => void;
  onSettings?: (id: string) => void; // Future US-007
  index: number;
  componentRegistry: ComponentRegistry;
}
```

---

### ConfirmationDialog

**Component description**: Reusable modal dialog for confirming destructive actions (delete component, reset page, discard unsaved changes). Rendered via portal to body element. Prevents clicks outside to close (requires explicit Cancel or Confirm).

**Main elements**:
- `<Dialog>` from shadcn/ui - Modal container
- `<DialogContent>` - Card with title, message, and actions
- `<DialogHeader>` with `<DialogTitle>` - Action description
- `<DialogDescription>` - Detailed warning message
- `<DialogFooter>` - Cancel and Confirm buttons

**Handled events**:
- `onCancelClick`: Call onCancel callback, close dialog
- `onConfirmClick`: Call onConfirm callback, close dialog
- `onEscapeKey`: Treat as cancel action
- Click outside: Disabled (via closeOnClickOutside={false})

**Validation conditions**:
- isOpen must be boolean
- title and message must be non-empty strings
- onConfirm and onCancel must be functions
- confirmButtonText and cancelButtonText optional (defaults: "Confirm", "Cancel")

**Types**:
- `ConfirmationDialogProps`

**Props**:
```typescript
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

### ThemeSettingsSidebar

**Component description**: Right sidebar for global theme customization (colors, fonts). Collapsed by default, opens when user clicks Theme Settings toggle in top nav. Changes in this panel are immediately reflected in canvas. Has separate save mechanism from page layout.

**Main elements**:
- `<aside className="theme-settings-sidebar">` - Fixed width 320px, slides in from right
- `<div className="sidebar-header">` - Title and close button
- `<ThemeSettingsPanel>` - Form with color pickers and font selectors
- `<ColorPicker>` components for primary, secondary, accent colors
- `<Select>` components for heading and body font families
- `<Button>` - Reset theme button
- `<Button>` - Save theme button

**Handled events**:
- `onColorChange`: Update theme state immediately, reflect in canvas
- `onFontChange`: Update theme state immediately, reflect in canvas
- `onResetClick`: Show confirmation, call reset theme API
- `onSaveClick`: Call save theme API, clear theme unsaved flag
- `onClose`: Close sidebar, warn if unsaved theme changes exist

**Validation conditions**:
- Color values must be valid hex format (#RRGGBB)
- Font families must be from allowed list (web-safe fonts)
- At least primary color and heading font must be selected
- Theme save is independent of page layout save

**Types**:
- `ThemeSettingsSidebarProps`
- `ThemeSettings` (DTO)
- `ColorValue` - Hex string with validation

**Props**:
```typescript
interface ThemeSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  themeSettings: ThemeSettings;
  hasUnsavedThemeChanges: boolean;
  onThemeChange: (settings: Partial<ThemeSettings>) => void;
  onThemeSave: () => void;
  onThemeReset: () => void;
  isSavingTheme: boolean;
}
```

---

### UnsavedChangesIndicator

**Component description**: Badge component in top navigation showing unsaved changes status. Displays context-aware messaging (e.g., "3 components added", "Layout modified", "Theme changes pending"). Only visible when hasUnsavedChanges or hasUnsavedThemeChanges is true.

**Main elements**:
- `<Badge>` from shadcn/ui - Warning variant styling
- `<span>` - Dynamic message text based on change type
- Icon from lucide-react (alert-circle)

**Handled events**:
- None (pure presentation component)

**Validation conditions**:
- Must receive hasUnsavedChanges and/or hasUnsavedThemeChanges booleans
- Change count must be non-negative integer
- Message must accurately describe what changed

**Types**:
- `UnsavedChangesIndicatorProps`
- `ChangeType` - Enum: "page" | "theme" | "both"

**Props**:
```typescript
interface UnsavedChangesIndicatorProps {
  hasUnsavedPageChanges: boolean;
  hasUnsavedThemeChanges: boolean;
  changeCount?: number;
  message?: string;
}
```

---

## 5. Types

### DTOs (Data Transfer Objects from API)

```typescript
// Response from GET /api/pages
interface PagesResponse {
  pages: PageData[];
}

// Response from GET /api/pages/{type}
// Also response from PUT and POST operations
interface PageData {
  type: PageType;
  layout: ComponentDefinition[];
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// Component definition in layout array
interface ComponentDefinition {
  id: string; // UUID v4
  type: string; // e.g., "hero", "text-section", "featured-products"
  variant: string; // e.g., "with-image", "grid-3", "2-column"
  settings: Record<string, unknown>; // Component-specific settings object
}

// Request body for PUT /api/pages/{type}
interface UpdatePageLayoutRequest {
  layout: ComponentDefinition[];
}

// Union type for page types
type PageType = "home" | "catalog" | "product" | "contact";
```

### View Models (Frontend-specific types)

```typescript
// Main workspace state
interface WorkspaceState {
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
interface ThemeState {
  settings: ThemeSettings;
  originalSettings: ThemeSettings;
  hasUnsavedThemeChanges: boolean;
  isSavingTheme: boolean;
  isThemeSidebarOpen: boolean;
}

// Theme configuration
interface ThemeSettings {
  primaryColor: string; // Hex color
  secondaryColor: string; // Hex color
  accentColor: string; // Hex color
  headingFont: string; // Font family name
  bodyFont: string; // Font family name
}

// Component registry entry
interface ComponentRegistryEntry {
  meta: ComponentMetadata; // From shared component's meta.ts
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: ComponentCategory;
  defaultSettings: Record<string, unknown>; // Default settings for new instances
}

// Component registry map
type ComponentRegistry = Record<string, ComponentRegistryEntry>;

// Component metadata from shared components
interface ComponentMetadata {
  id: string; // Component type identifier
  name: string; // Display name
  description: string; // Brief description
  icon: string; // Icon name or path
  category: ComponentCategory;
  variants: VariantDefinition[];
  propsSchema: ZodSchema; // Zod schema for validation
}

// Variant definition
interface VariantDefinition {
  id: string; // Variant identifier
  name: string; // Display name
  description: string;
  previewImage?: string; // Optional preview thumbnail
}

// Component category
type ComponentCategory = "Content" | "Navigation" | "Products" | "Forms" | "Media";

// Drag-and-drop state
interface DragState {
  isDragging: boolean;
  draggedItemType: "new-component" | "canvas-component" | null;
  draggedComponentType: string | null; // Component type if dragging new component
  draggedComponentId: string | null; // Component ID if reordering
  dropIndicatorIndex: number | null; // Where component will drop
}

// Confirmation dialog state
interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: "danger" | "warning" | "info";
  onConfirm: () => void;
}
```

## 6. State Management

### Strategy Overview

The workspace view uses a combination of local state, Context API, and custom hooks to manage complexity:

1. **WorkspaceContext**: Global workspace state (pages, current page, layout, unsaved changes)
2. **ThemeContext**: Theme settings state (separate from workspace)
3. **AuthContext**: JWT token and user info (assumed to exist)
4. **Local state**: UI-specific state (sidebar collapse, drag state, dialog visibility)
5. **Custom hooks**: Business logic encapsulation (useDragAndDrop, useUnsavedChanges, usePageManager)

### WorkspaceContext

**Purpose**: Provide workspace state and operations to all child components

**State Shape**:
```typescript
interface WorkspaceContextValue {
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
```

**Implementation Notes**:
- Use `useReducer` for complex state updates
- Implement optimistic updates with rollback on API failure
- Debounce hasUnsavedChanges computation to avoid excess re-renders
- Memoize expensive selectors with `useMemo`

### Custom Hook: useDragAndDrop

**Purpose**: Encapsulate drag-and-drop logic for adding and reordering components

**Interface**:
```typescript
function useDragAndDrop(
  currentLayout: ComponentDefinition[],
  onLayoutChange: (newLayout: ComponentDefinition[]) => void,
  componentRegistry: ComponentRegistry
) {
  return {
    sensors: SensorDescriptor[]; // For DndContext
    handleDragStart: (event: DragStartEvent) => void;
    handleDragOver: (event: DragOverEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    dragState: DragState;
  };
}
```

**Responsibilities**:
- Track drag state (what's being dragged, where it will drop)
- Generate UUIDs for new component instances
- Apply default settings from component registry
- Calculate drop index from pointer position
- Update layout array immutably
- Provide visual feedback data for drop indicators

### Custom Hook: useUnsavedChanges

**Purpose**: Detect unsaved changes and warn user before navigation

**Interface**:
```typescript
function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  hasUnsavedThemeChanges: boolean
) {
  return {
    shouldWarnBeforeLeaving: boolean;
    warningMessage: string;
    confirmNavigation: () => void;
    cancelNavigation: () => void;
  };
}
```

**Responsibilities**:
- Install beforeunload event listener when changes exist
- Show browser confirmation dialog on tab close/refresh
- Provide custom dialog for page switching within app
- Generate context-aware warning messages
- Track navigation intent and resume after save/discard decision

### Custom Hook: usePageManager

**Purpose**: Manage page switching with unsaved changes protection

**Interface**:
```typescript
function usePageManager(
  currentPageType: PageType,
  pages: PageData[],
  hasUnsavedChanges: boolean,
  onSave: () => Promise<void>
) {
  return {
    requestPageSwitch: (newType: PageType) => void;
    confirmSwitch: () => void;
    cancelSwitch: () => void;
    saveAndSwitch: () => Promise<void>;
    pendingPageType: PageType | null;
    showSwitchDialog: boolean;
  };
}
```

**Responsibilities**:
- Intercept page type changes
- Show confirmation dialog if unsaved changes exist
- Provide "Save & Switch" or "Discard & Switch" options
- Execute page switch after user decision
- Update currentLayout from pages array after switch

## 7. API Integration

### API Client Setup

Create a dedicated API client module with proper error handling and authentication:

**File**: `theme-builder/src/lib/api/client.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jwt_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login on auth failure
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.statusText}`);
  }

  return response.json();
}
```

### API Functions

**File**: `theme-builder/src/lib/api/pages.ts`

```typescript
// GET /api/pages
export async function fetchAllPages(): Promise<PagesResponse> {
  return apiRequest<PagesResponse>('/api/pages', {
    method: 'GET',
  });
}

// GET /api/pages/{type}
export async function fetchPageByType(type: PageType): Promise<PageData> {
  return apiRequest<PageData>(`/api/pages/${type}`, {
    method: 'GET',
  });
}

// PUT /api/pages/{type}
export async function updatePageLayout(
  type: PageType,
  layout: ComponentDefinition[]
): Promise<PageData> {
  return apiRequest<PageData>(`/api/pages/${type}`, {
    method: 'PUT',
    body: JSON.stringify({ layout }),
  });
}

// POST /api/pages/{type}/reset
export async function resetPageToDefault(type: PageType): Promise<PageData> {
  return apiRequest<PageData>(`/api/pages/${type}/reset`, {
    method: 'POST',
  });
}
```

### Request & Response Type Mapping

| API Endpoint | Request Type | Response Type | Success Status |
|--------------|-------------|---------------|----------------|
| GET /api/pages | None | `PagesResponse` | 200 OK |
| GET /api/pages/{type} | None | `PageData` | 200 OK |
| PUT /api/pages/{type} | `UpdatePageLayoutRequest` | `PageData` | 200 OK |
| POST /api/pages/{type}/reset | None | `PageData` | 200 OK |

### Error Handling Strategy

**Error Types**:
1. **401 Unauthorized**: Token expired or invalid → Redirect to login
2. **404 Not Found**: Page not found (edge case) → Show error message, load default
3. **400 Bad Request**: Invalid layout data → Show validation errors to user
4. **500 Internal Server Error**: Backend failure → Show generic error, allow retry

**Implementation**:
- Wrap all API calls in try-catch blocks
- Display user-friendly error messages (no technical details)
- Log full error details to console for debugging
- Provide "Retry" action for transient errors
- Rollback optimistic updates on failure

### Loading States

- **Initial load**: Show full-page skeleton with sidebar and canvas placeholders
- **Page switch**: Show canvas skeleton while fetching new page data
- **Save operation**: Show spinner on Save button, disable button during request
- **Reset operation**: Show confirmation dialog first, then spinner on Confirm button

## 8. User Interactions

### Adding a Component (US-004)

**Trigger**: User drags a component card from the library sidebar and drops it onto the canvas

**Flow**:
1. User clicks and holds on a `DraggableComponentCard` in the library sidebar
2. `onDragStart` fires → Update `dragState.isDragging = true`, store component type
3. As user drags over canvas, `onDragOver` fires repeatedly
4. Calculate drop index based on pointer Y position relative to existing components
5. Display `<DropIndicator>` (colored line) at the calculated index position
6. User releases mouse → `onDragEnd` fires
7. Generate new UUID for component instance
8. Fetch default settings from component registry
9. Create new `ComponentDefinition` object: `{ id, type, variant, settings }`
10. Insert into `currentLayout` array at drop index
11. Update workspace state → `hasUnsavedChanges = true`
12. Re-render canvas with new component
13. Scroll to new component if needed

**Visual Feedback**:
- Component card shows "drag cursor" while being dragged
- Drop indicator (blue horizontal line, 2px height) shows insertion point
- Canvas components shift down to make space for drop indicator
- New component animates into position (fade-in + slide-down, 200ms)

**Edge Cases**:
- Drop outside canvas → No action, component card returns to sidebar
- Drop on empty canvas → Insert at index 0
- Drop between two components → Insert at calculated index
- Drag cancelled (ESC key) → No action, component card returns to sidebar

---

### Reordering Components (US-005)

**Trigger**: User drags an existing component on the canvas to a new position

**Flow**:
1. User hovers over a `SortableCanvasComponent` → Hover controls overlay appears
2. User clicks and holds on drag handle icon (grip-vertical) → `onDragStart` fires
3. Update `dragState.isDragging = true`, store component ID and current index
4. Component being dragged gets dimmed opacity (0.4) and slight scale (0.98)
5. As user drags, `onDragOver` fires repeatedly
6. Calculate new index based on pointer Y position
7. Update drop indicator position
8. Other components animate to new positions (CSS transitions)
9. User releases mouse → `onDragEnd` fires
10. Remove component from old index in `currentLayout` array
11. Insert component at new index
12. Update workspace state → `hasUnsavedChanges = true`
13. Components animate to final positions (200ms ease-out)

**Visual Feedback**:
- Drag handle cursor changes to "grab" on hover, "grabbing" while dragging
- Dragged component: opacity 0.4, scale 0.98, z-index increased
- Drop indicator (blue line) shows where component will be placed
- Other components smoothly transition to make space
- Hover controls remain visible during drag

**Edge Cases**:
- Drag to same position → No layout change, no unsaved flag
- Drag to top (index 0) → Component becomes first
- Drag to bottom (index = length - 1) → Component becomes last
- Drag cancelled (ESC key) → Component returns to original position
- Only one component on canvas → Drag handle disabled (can't reorder)

---

### Deleting a Component (US-006)

**Trigger**: User clicks the delete icon in a component's hover controls

**Flow**:
1. User hovers over a `SortableCanvasComponent` → Hover controls overlay appears
2. User clicks trash icon → `onDeleteClick` fires
3. Show `<ConfirmationDialog>` with:
   - Title: "Delete Component"
   - Message: "Are you sure you want to delete this [component name]? This action cannot be undone."
   - Confirm button: "Delete" (danger variant, red background)
   - Cancel button: "Cancel" (secondary variant)
4. If user clicks "Cancel" → Close dialog, no action
5. If user clicks "Delete":
   - Remove component from `currentLayout` array by ID
   - Update workspace state → `hasUnsavedChanges = true`
   - Component fades out (200ms) then removed from DOM
   - Remaining components animate to fill gap (slide-up transition)
   - Show toast notification: "Component deleted" (optional)
6. Dialog closes

**Visual Feedback**:
- Delete icon shows danger color (red) on hover
- Delete icon has tooltip: "Delete component"
- Confirmation dialog uses warning/danger styling
- Deleted component fades out before removal
- Remaining components smoothly slide up to fill space

**Edge Cases**:
- Last component deleted → Show `<EmptyCanvasPlaceholder>` with "Restore Default Layout" button
- Multiple rapid deletes → Each triggers confirmation dialog (queue dialogs if needed)
- Delete while dragging → Drag operation cancelled first, then show dialog
- Component has unsaved settings changes → Warning message includes this info (future enhancement)

---

### Saving Layout (US-009)

**Trigger**: User clicks "Save" button in top navigation bar

**Flow**:
1. User clicks "Save" button (enabled only when `hasUnsavedChanges === true`)
2. Button shows loading spinner, text changes to "Saving...", button disabled
3. Call `updatePageLayout(currentPageType, currentLayout)` API
4. On success:
   - Update `originalLayout` to match `currentLayout`
   - Set `hasUnsavedChanges = false`
   - Update page data in `pages` array with new `updated_at` timestamp
   - Show success toast: "Page saved successfully"
   - Re-enable Save button (will be disabled due to no unsaved changes)
5. On error:
   - Show error toast: "Failed to save page. Please try again."
   - Keep `hasUnsavedChanges = true`
   - Re-enable Save button for retry
   - Log full error to console

**Visual Feedback**:
- Save button: Primary blue when enabled, gray when disabled
- Loading spinner replaces button icon during save
- Toast notification slides in from top-right corner
- Unsaved changes indicator badge disappears on success

---

### Resetting Layout (US-010)

**Trigger**: User clicks "Reset" button in top navigation bar

**Flow**:
1. User clicks "Reset" button (enabled only when `hasUnsavedChanges === true`)
2. Show `<ConfirmationDialog>` with:
   - Title: "Reset Page Layout"
   - Message: "Are you sure you want to reset this page to its default layout? All unsaved changes will be lost."
   - Confirm button: "Reset" (warning variant, yellow)
   - Cancel button: "Cancel"
3. If user clicks "Cancel" → Close dialog, no action
4. If user clicks "Reset":
   - Show loading spinner on Confirm button
   - Call `resetPageToDefault(currentPageType)` API
   - On success:
     - Update `currentLayout` with default layout from API response
     - Update `originalLayout` with same data
     - Set `hasUnsavedChanges = false`
     - Show success toast: "Page reset to default layout"
     - Close dialog
   - On error:
     - Show error message in dialog
     - Provide "Try Again" button

**Visual Feedback**:
- Reset button: Warning color (orange/yellow)
- Confirmation dialog uses warning styling
- Canvas components fade out (100ms) then fade in with new layout (300ms)
- Toast notification confirms success

---

### Switching Pages (with Unsaved Changes)

**Trigger**: User selects a different page type from the dropdown while having unsaved changes

**Flow**:
1. User clicks page selector dropdown, chooses different page type
2. `onPageTypeChange` handler checks `hasUnsavedChanges`
3. If no unsaved changes:
   - Fetch new page data (or use cached from `pages` array)
   - Update `currentPageType` and `currentLayout`
   - Canvas re-renders with new page's layout
4. If unsaved changes exist:
   - Prevent page switch
   - Show `<ConfirmationDialog>` with:
     - Title: "Unsaved Changes"
     - Message: "You have unsaved changes on the [current page] page. What would you like to do?"
     - Three buttons:
       - "Save & Switch" (primary, blue) → Save then switch
       - "Discard & Switch" (secondary) → Switch without saving
       - "Cancel" → Stay on current page
5. Handle user choice:
   - Save & Switch: Call save API, wait for success, then switch
   - Discard & Switch: Update `originalLayout = currentLayout` (reset unsaved flag), then switch
   - Cancel: Close dialog, stay on current page

**Visual Feedback**:
- Page selector dropdown shows checkmark next to current page
- Loading spinner in dropdown during page data fetch
- Canvas shows skeleton loader during page switch
- Unsaved changes badge pulses when blocking navigation

## 9. Conditions and Validation

### API Response Validation

All API responses must be validated using Zod schemas before use:

```typescript
// Zod schema for PageData
const PageDataSchema = z.object({
  type: z.enum(["home", "catalog", "product", "contact"]),
  layout: z.array(ComponentDefinitionSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Zod schema for ComponentDefinition
const ComponentDefinitionSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  variant: z.string().min(1),
  settings: z.record(z.unknown()),
});

// Validation in API client
const data = await response.json();
const validatedData = PageDataSchema.parse(data); // Throws if invalid
```

**Validation Points**:
- After every API response (in API client functions)
- Before saving layout to backend (client-side pre-validation)
- When loading component from registry (ensure type exists)
- When rendering component (pass settings to component's own Zod schema)

### Component-Level Validation

Each shared component has its own Zod schema for props validation. The workspace must ensure settings match:

```typescript
// Before rendering a component
const ComponentClass = componentRegistry[definition.type].Component;
const propsSchema = componentRegistry[definition.type].meta.propsSchema;

try {
  const validatedProps = propsSchema.parse({
    ...definition.settings,
    variant: definition.variant,
  });
  return <ComponentClass {...validatedProps} />;
} catch (error) {
  console.error(`Invalid props for ${definition.type}:`, error);
  return <ErrorBoundary componentName={definition.type} />;
}
```

### UI State Validation

**Save Button Enabled When**:
- `hasUnsavedChanges === true`
- Not currently saving (`isSaving === false`)
- No validation errors in current layout

**Reset Button Enabled When**:
- `hasUnsavedChanges === true`
- Not currently resetting (`isResetting === false`)

**Page Switching Allowed When**:
- `hasUnsavedChanges === false` OR user confirms discard
- Target page type is valid (one of: home, catalog, product, contact)
- Not currently loading or saving

**Component Drag Allowed When**:
- Component type exists in registry
- Not currently saving or resetting
- No modal dialogs are open

**Component Delete Allowed When**:
- Component ID exists in current layout
- Not currently saving or resetting

### Unsaved Changes Detection

```typescript
function detectUnsavedChanges(
  currentLayout: ComponentDefinition[],
  originalLayout: ComponentDefinition[]
): boolean {
  if (currentLayout.length !== originalLayout.length) {
    return true;
  }

  return currentLayout.some((current, index) => {
    const original = originalLayout[index];
    return (
      current.id !== original.id ||
      current.type !== original.type ||
      current.variant !== original.variant ||
      JSON.stringify(current.settings) !== JSON.stringify(original.settings)
    );
  });
}
```

## 10. Error Handling

### Error Boundary Implementation

Wrap the entire workspace in an error boundary to catch React errors:

```typescript
<ErrorBoundary
  fallback={
    <WorkspaceErrorFallback
      onReset={() => window.location.reload()}
      onReturnToLogin={() => window.location.href = '/login'}
    />
  }
>
  <WorkspaceView />
</ErrorBoundary>
```

### API Error Scenarios

**Authentication Errors (401)**:
- Clear JWT token from storage
- Redirect to login page: `window.location.href = '/login'`
- Show toast: "Session expired. Please log in again."

**Not Found Errors (404)**:
- Page not found: Show error message, offer to load default page
- Shop not found: Redirect to onboarding flow (shop creation)

**Validation Errors (400)**:
- Display specific validation messages from API response
- Highlight invalid fields in UI (if component settings validation fails)
- Prevent save until validation passes
- Example: "Component settings are invalid: imageUrl must be a valid HTTPS URL"

**Server Errors (500)**:
- Show user-friendly message: "Something went wrong. Please try again."
- Provide "Retry" button for the failed operation
- Log full error details to console (or error tracking service)
- Do not expose technical details to user

**Network Errors**:
- Detect offline status: `!navigator.onLine`
- Show offline indicator: "You are offline. Changes will not be saved."
- Queue operations for retry when connection restored (future enhancement)
- Prevent save/reset operations while offline

### Drag-and-Drop Error Scenarios

**Component Registry Not Loaded**:
- Show loading skeleton until registry is available
- If registry fails to load: Show error message, disable drag functionality
- Fallback: Load minimal registry with core components only

**Invalid Component Type**:
- User drags component with type not in registry
- Log warning to console
- Show error toast: "This component is not available"
- Do not add component to layout

**Corrupted Layout Data**:
- Layout array from API contains invalid ComponentDefinition objects
- Filter out invalid items, log warnings
- Show warning toast: "Some components could not be loaded"
- Render valid components only, show placeholders for invalid ones

**UUID Generation Failure**:
- Extremely rare, but handle gracefully
- Retry UUID generation (use crypto.randomUUID() or fallback library)
- If still fails: Show error, prevent component addition
- Log error for investigation

### User-Facing Error Messages

**Tone**: Friendly, non-technical, actionable

**Examples**:
- ✅ "We couldn't save your changes. Please check your internet connection and try again."
- ❌ "Error: 500 Internal Server Error at POST /api/pages/home"

- ✅ "This component couldn't be loaded. Try refreshing the page."
- ❌ "Component 'hero' failed validation: settings.imageUrl is required"

- ✅ "Your session has expired. Please log in again to continue."
- ❌ "JWT token invalid: signature verification failed"

### Recovery Actions

**For Failed Saves**:
1. Keep current layout in memory (don't lose user work)
2. Keep `hasUnsavedChanges = true`
3. Show "Retry" button in error toast
4. Optionally: Save to localStorage as backup

**For Failed Page Loads**:
1. Show skeleton loader with retry button
2. If retry fails 3 times: Show "Load Default Layout" button
3. Log errors for debugging

**For Corrupted State**:
1. Attempt to recover from localStorage backup
2. If no backup: Offer to load last saved state from API
3. As last resort: Load default layout and show warning

## 11. Implementation Steps

### Step 1: Project Setup and Dependencies
1. Install required dependencies:
   ```bash
   cd theme-builder
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   npm install lucide-react # Icons
   npm install zod # Runtime validation
   ```
2. Verify shadcn/ui components are available (Dialog, Button, Select, Badge, Accordion)
3. Create directory structure:
   ```
   src/
   ├── components/
   │   ├── workspace/
   │   │   ├── WorkspaceView.tsx
   │   │   ├── TopNavigationBar.tsx
   │   │   ├── ComponentLibrarySidebar.tsx
   │   │   ├── Canvas.tsx
   │   │   ├── ThemeSettingsSidebar.tsx
   │   │   └── ... (other components)
   │   └── shared/
   │       ├── ConfirmationDialog.tsx
   │       └── ErrorBoundary.tsx
   ├── contexts/
   │   ├── WorkspaceContext.tsx
   │   └── ThemeContext.tsx
   ├── hooks/
   │   ├── useDragAndDrop.ts
   │   ├── useUnsavedChanges.ts
   │   └── usePageManager.ts
   ├── lib/
   │   ├── api/
   │   │   ├── client.ts
   │   │   └── pages.ts
   │   ├── componentRegistry.ts
   │   └── utils.ts
   └── types/
       ├── api.ts
       └── workspace.ts
   ```

### Step 2: Type Definitions
1. Create `src/types/api.ts` with all DTO types (PageData, ComponentDefinition, etc.)
2. Create `src/types/workspace.ts` with all view model types
3. Create Zod schemas for API response validation
4. Export types for use across the application

### Step 3: API Client
1. Implement `src/lib/api/client.ts` with authentication and error handling
2. Implement `src/lib/api/pages.ts` with all four API functions
3. Add request/response logging for debugging (remove in production)
4. Test API functions manually with curl or Postman

### Step 4: Component Registry
1. Create `src/lib/componentRegistry.ts`
2. Import all shared components with `React.lazy()`
3. Import metadata from each component's `meta.ts` file
4. Define component categories and organize components
5. Add default settings for each component type
6. Export registry and type utilities

### Step 5: Workspace Context and Provider
1. Implement `src/contexts/WorkspaceContext.tsx`
2. Create reducer for workspace state management
3. Implement CRUD operations: add, reorder, delete, save, reset
4. Add optimistic updates with rollback on error
5. Implement unsaved changes detection logic
6. Create `useWorkspace` custom hook for consuming context

### Step 6: Base Layout and TopNavigationBar
1. Create `src/components/workspace/WorkspaceView.tsx` as main container
2. Implement three-panel grid layout (left sidebar, canvas, right sidebar)
3. Create `TopNavigationBar.tsx` with page selector dropdown
4. Add action buttons (Reset, Save, Demo, Theme Toggle)
5. Implement `UnsavedChangesIndicator.tsx` badge component
6. Wire up page switching logic (without unsaved changes protection yet)

### Step 7: Component Library Sidebar
1. Create `ComponentLibrarySidebar.tsx` with collapse toggle
2. Implement Accordion with category sections
3. Create `DraggableComponentCard.tsx` for each component
4. Add `useDraggable` hook from @dnd-kit to cards
5. Display component icon, name, and description
6. Add tooltip on hover with full description
7. Implement sidebar collapse state persistence to localStorage

### Step 8: Canvas (Static Rendering)
1. Create `Canvas.tsx` component
2. Implement `EmptyCanvasPlaceholder` for empty layouts
3. Create `SortableCanvasComponent.tsx` wrapper
4. Implement dynamic component rendering from registry
5. Add error boundaries for individual component errors
6. Style canvas with proper spacing and alignment
7. Test with mock layout data (hardcode a few components)

### Step 9: Drag-and-Drop (Add Components)
1. Wrap Canvas in `DndContext` from @dnd-kit/core
2. Implement `useDragAndDrop` custom hook
3. Handle `onDragStart`: Track dragged component type
4. Handle `onDragOver`: Calculate drop index, show indicator
5. Handle `onDragEnd`: Add new component to layout
6. Generate UUID for new component instances
7. Apply default settings from registry
8. Create `DropIndicator.tsx` visual component
9. Add animations for new component insertion

### Step 10: Drag-and-Drop (Reorder Components)
1. Wrap Canvas in `SortableContext` from @dnd-kit/sortable
2. Add `useSortable` hook to `SortableCanvasComponent`
3. Create `HoverControlsOverlay.tsx` with drag handle
4. Implement drag handle mouse/touch handlers
5. Handle reordering logic in `onDragEnd`
6. Add CSS transforms for smooth animations
7. Test edge cases: drag to top, bottom, same position

### Step 11: Component Deletion
1. Add delete button to `HoverControlsOverlay`
2. Create `ConfirmationDialog.tsx` reusable component
3. Implement delete handler: show confirmation, remove from layout
4. Add fade-out animation for deleted components
5. Handle empty canvas state: show placeholder with "Restore Default Layout"
6. Test edge cases: delete last component, rapid deletes

### Step 12: Save and Reset Operations
1. Wire up Save button to `saveLayout` function
2. Implement loading state on Save button during API request
3. Show success/error toast notifications
4. Wire up Reset button to `resetLayout` function
5. Show confirmation dialog before reset
6. Update canvas with default layout from API response
7. Handle API errors gracefully with retry option

### Step 13: Unsaved Changes Protection
1. Implement `useUnsavedChanges` custom hook
2. Add `beforeunload` event listener when changes exist
3. Implement `usePageManager` for page switching protection
4. Show confirmation dialog when switching pages with unsaved changes
5. Add "Save & Switch" and "Discard & Switch" options
6. Test browser warning on tab close/refresh

### Step 14: Theme Settings Sidebar (Basic)
1. Create `ThemeSettingsSidebar.tsx` component
2. Implement slide-in/out animation from right
3. Add close button and collapse toggle from top nav
4. Create `ThemeContext` for theme state management
5. Add placeholder for color pickers and font selectors (full implementation is separate feature)
6. Implement sidebar visibility state persistence

### Step 15: Polish and Optimization
1. Add `React.memo` to frequently re-rendered components
2. Use `useCallback` for event handlers passed to children
3. Use `useMemo` for expensive computations (e.g., hasUnsavedChanges)
4. Optimize Canvas rendering: virtualization if needed (unlikely in MVP)
5. Add smooth CSS transitions for all animations
6. Improve accessibility: aria-labels, keyboard navigation
7. Test responsive behavior on tablet and mobile
8. Add tooltips for all icon buttons
9. Implement Demo button (opens demo shop in new tab with demo URL)
10. Clean up console.log statements

### Step 16: Testing
1. Write unit tests for custom hooks (useDragAndDrop, useUnsavedChanges, usePageManager)
2. Write component tests for ConfirmationDialog, UnsavedChangesIndicator
3. Write integration tests for Canvas (add, reorder, delete)
4. Write integration test for full workspace flow (load → modify → save)
5. Test API client error handling scenarios
6. Test error boundaries with simulated errors
7. Run accessibility audit with Lighthouse
8. Test on different browsers (Chrome, Firefox, Safari)

### Step 17: Documentation and Cleanup
1. Add JSDoc comments to all public functions and components
2. Document props interfaces with descriptions
3. Create README for workspace implementation
4. Document known limitations and future enhancements
5. Remove debug logging and console statements
6. Run ESLint and fix all warnings
7. Run TypeScript compiler in strict mode, fix all errors
8. Final code review and cleanup
