import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  WorkspaceContextValue,
  WorkspaceState,
} from '../types/workspace';
import type { PageData, PageType, ComponentDefinition } from '../types/api';
import {
  fetchAllPages,
  updatePageLayout,
  resetPageToDefault,
} from '../lib/api/pages';
import { componentRegistry } from '../lib/componentRegistry';

// Action types
type WorkspaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGES'; payload: PageData[] }
  | { type: 'SET_CURRENT_PAGE_TYPE'; payload: PageType }
  | { type: 'SET_CURRENT_LAYOUT'; payload: ComponentDefinition[] }
  | { type: 'SET_ORIGINAL_LAYOUT'; payload: ComponentDefinition[] }
  | { type: 'ADD_COMPONENT'; payload: { componentType: string; atIndex: number } }
  | { type: 'REORDER_COMPONENT'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'DELETE_COMPONENT'; payload: string }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_RESETTING'; payload: boolean }
  | { type: 'SAVE_SUCCESS'; payload: PageData }
  | { type: 'RESET_SUCCESS'; payload: PageData };

// Initial state
const initialState: WorkspaceState = {
  pages: [],
  currentPageType: 'home',
  currentLayout: [],
  originalLayout: [],
  hasUnsavedChanges: false,
  isLoading: true,
  error: null,
  isSaving: false,
  isResetting: false,
};

// Reducer function
function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_PAGES': {
      const pages = action.payload;
      const currentPage = pages.find((p) => p.type === state.currentPageType);
      return {
        ...state,
        pages,
        currentLayout: currentPage?.layout || [],
        originalLayout: currentPage?.layout || [],
        isLoading: false,
        error: null,
      };
    }

    case 'SET_CURRENT_PAGE_TYPE': {
      const newPage = state.pages.find((p) => p.type === action.payload);
      return {
        ...state,
        currentPageType: action.payload,
        currentLayout: newPage?.layout || [],
        originalLayout: newPage?.layout || [],
        hasUnsavedChanges: false,
      };
    }

    case 'SET_CURRENT_LAYOUT': {
      const hasChanges = JSON.stringify(action.payload) !== JSON.stringify(state.originalLayout);
      return {
        ...state,
        currentLayout: action.payload,
        hasUnsavedChanges: hasChanges,
      };
    }

    case 'SET_ORIGINAL_LAYOUT':
      return { ...state, originalLayout: action.payload };

    case 'ADD_COMPONENT': {
      const { componentType, atIndex } = action.payload;
      const componentEntry = componentRegistry[componentType];

      if (!componentEntry) {
        console.error(`Component type "${componentType}" not found in registry`);
        return state;
      }

      // Generate UUID for new component
      const id = crypto.randomUUID();
      const defaultVariant = componentEntry.meta.variants[0]?.id || 'default';

      const newComponent: ComponentDefinition = {
        id,
        type: componentType,
        variant: defaultVariant,
        props: { ...componentEntry.defaultProps },
      };

      const newLayout = [...state.currentLayout];
      newLayout.splice(atIndex, 0, newComponent);

      return {
        ...state,
        currentLayout: newLayout,
        hasUnsavedChanges: true,
      };
    }

    case 'REORDER_COMPONENT': {
      const { fromIndex, toIndex } = action.payload;

      if (fromIndex === toIndex) {
        return state;
      }

      const newLayout = [...state.currentLayout];
      const [movedComponent] = newLayout.splice(fromIndex, 1);
      newLayout.splice(toIndex, 0, movedComponent);

      return {
        ...state,
        currentLayout: newLayout,
        hasUnsavedChanges: true,
      };
    }

    case 'DELETE_COMPONENT': {
      const componentId = action.payload;
      const newLayout = state.currentLayout.filter((c) => c.id !== componentId);

      return {
        ...state,
        currentLayout: newLayout,
        hasUnsavedChanges: true,
      };
    }

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_RESETTING':
      return { ...state, isResetting: action.payload };

    case 'SAVE_SUCCESS': {
      const savedPage = action.payload;
      const updatedPages = state.pages.map((p) =>
        p.type === savedPage.type ? savedPage : p
      );

      return {
        ...state,
        pages: updatedPages,
        originalLayout: savedPage.layout,
        currentLayout: savedPage.layout,
        hasUnsavedChanges: false,
        isSaving: false,
      };
    }

    case 'RESET_SUCCESS': {
      const resetPage = action.payload;
      const updatedPages = state.pages.map((p) =>
        p.type === resetPage.type ? resetPage : p
      );

      return {
        ...state,
        pages: updatedPages,
        originalLayout: resetPage.layout,
        currentLayout: resetPage.layout,
        hasUnsavedChanges: false,
        isResetting: false,
      };
    }

    default:
      return state;
  }
}

// Context
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// Provider component
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Fetch pages on mount (only if authenticated)
  useEffect(() => {
    async function loadPages() {
      // Check if user has a token
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        // No token, set error state (API client will handle redirect)
        dispatch({ type: 'SET_ERROR', payload: 'Not authenticated. Please log in.' });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await fetchAllPages();
        dispatch({ type: 'SET_PAGES', payload: response.pages });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load pages';
        dispatch({ type: 'SET_ERROR', payload: message });
        console.error('Error loading pages:', error);

        // If authentication error, the API client will redirect to login
        // No need to do it here
      }
    }

    loadPages();
  }, []);

  // Set current page type
  const setCurrentPageType = useCallback((type: PageType) => {
    dispatch({ type: 'SET_CURRENT_PAGE_TYPE', payload: type });
  }, []);

  // Add component
  const addComponent = useCallback((componentType: string, atIndex: number) => {
    dispatch({ type: 'ADD_COMPONENT', payload: { componentType, atIndex } });
  }, []);

  // Reorder component
  const reorderComponent = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_COMPONENT', payload: { fromIndex, toIndex } });
  }, []);

  // Delete component
  const deleteComponent = useCallback((componentId: string) => {
    dispatch({ type: 'DELETE_COMPONENT', payload: componentId });
  }, []);

  // Save layout
  const saveLayout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      const updatedPage = await updatePageLayout(
        state.currentPageType,
        state.currentLayout
      );
      dispatch({ type: 'SAVE_SUCCESS', payload: updatedPage });
    } catch (error) {
      dispatch({ type: 'SET_SAVING', payload: false });
      const message = error instanceof Error ? error.message : 'Failed to save layout';
      throw new Error(message);
    }
  }, [state.currentPageType, state.currentLayout]);

  // Reset layout
  const resetLayout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_RESETTING', payload: true });
      const resetPage = await resetPageToDefault(state.currentPageType);
      dispatch({ type: 'RESET_SUCCESS', payload: resetPage });
    } catch (error) {
      dispatch({ type: 'SET_RESETTING', payload: false });
      const message = error instanceof Error ? error.message : 'Failed to reset layout';
      throw new Error(message);
    }
  }, [state.currentPageType]);

  // Refresh pages
  const refreshPages = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetchAllPages();
      dispatch({ type: 'SET_PAGES', payload: response.pages });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh pages';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  }, []);

  const value: WorkspaceContextValue = useMemo(
    () => ({
      pages: state.pages,
      currentPageType: state.currentPageType,
      currentLayout: state.currentLayout,
      hasUnsavedChanges: state.hasUnsavedChanges,
      isLoading: state.isLoading,
      error: state.error,
      isSaving: state.isSaving,
      isResetting: state.isResetting,
      setCurrentPageType,
      addComponent,
      reorderComponent,
      deleteComponent,
      saveLayout,
      resetLayout,
      refreshPages,
    }),
    [
      state,
      setCurrentPageType,
      addComponent,
      reorderComponent,
      deleteComponent,
      saveLayout,
      resetLayout,
      refreshPages,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Custom hook to use workspace context
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
